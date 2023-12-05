import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { MailerService } from '@nestjs-modules/mailer';
import { verificationEmail, verificationPassWordEmail } from '../constant/email-template.constant';
import { WRONG_EMAIL_OR_PASSWORD, UNVERIFIED_ACCOUNT, WRONG_VERIFICATION_LINK, USER_NOT_FOUND } from '../constant/error.constant';
// import { verifyPassword } from 'src/utils/bcrypts.utils';
import { UserService } from '../user/user.service';
import { LogInDto } from './dto/log-in.dto';
import { SignUpDto } from './dto/sign-up.dto';
import { v4 } from "uuid"
import { UserStatus } from '../constant/enum';
import { User } from '../user/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Auth } from './entity/auth.entity';
import { FindOptionsWhereProperty, Repository } from 'typeorm';
import { UUID } from 'node:crypto';
import { createPassword } from 'src/utils/ids';
import { NotificationService } from 'src/notification/notification.service';
import { DeviceToken } from './entity/deviceToken.entity';
import { LogOutDto } from './dto/log-out.dto';

@Injectable()
export class AuthService {
    constructor(
      @InjectRepository(Auth) private readonly authRepository : Repository<Auth>,
      @InjectRepository(DeviceToken) private readonly deviceTokenRepository : Repository<DeviceToken>,
      private readonly userService: UserService,
      private readonly jwtService: JwtService,
      private readonly configService: ConfigService,
      private readonly mailerService: MailerService,
      private readonly notificationService: NotificationService,
    ) {}
    
    async createToken(user : User){
      const payload = { ...user };
      const accessToken = await this.jwtService.signAsync(payload);
      const refreshToken = await this.jwtService.sign(payload, {
        secret : process.env.JWT_REFRESH_TOKEN_SECRET || 'refresh_token',
        expiresIn: process.env.JWT_REFRESH_TOKEN__EXPIRATION_TIME
      });
      const refresh = await this.authRepository.create({
        refresh_token : refreshToken,
        is_used : false,
        user : user,
      });
      await this.authRepository.save(refresh);
      return {
        accessToken,
        refreshToken
      }
    }
      
    async logIn(logInDto: LogInDto) {
      const user = await this.userService.findOne(logInDto.email);
      
        if (!user) {
          throw new UnauthorizedException({ ...WRONG_EMAIL_OR_PASSWORD });
        }
        // const isMatched = await verifyPassword(logInDto.password, user.password);
        if(logInDto.password != user.password) {
        // if (!isMatched) {
          throw new UnauthorizedException({ ...WRONG_EMAIL_OR_PASSWORD });
        }
        if (!user.isActive) {
          throw new BadRequestException({ ...UNVERIFIED_ACCOUNT });
        }
        // if (user.status === UserStatus.OFF){
        //   throw new Error("Account is logged")
        // }
        const token = await this.createToken(user);
        const lastDeviceLogin = await this.deviceTokenRepository.find({
          where : {
            deviceToken : logInDto.deviceTokenString,
            isDelete : false
          }
        })
        lastDeviceLogin.forEach( async (device) => {
          device.isDelete = true
          await this.deviceTokenRepository.save(device);
        });
        const deviceLogin = await this.deviceTokenRepository.create({
          deviceToken : logInDto.deviceTokenString,
          user : user,
        })
        await this.deviceTokenRepository.save(deviceLogin);
        const notReadedNotifications = await this.notificationService.notificationRepository.find({where : {user_receive : user as FindOptionsWhereProperty<User>, isReaded : false}})
        await this.notificationService.sendMultiMessageToMutilToken(notReadedNotifications, deviceLogin.deviceToken);
        return {...user,
          ...token
        }
    }
  
    async signUp(signUpDto: SignUpDto) {
      const exist_user = await this.userService.userRepository.findOne({where :{email : signUpDto.email}});
      if(exist_user){
        throw new BadRequestException("Email exist");
      }
      const user = await this.userService.createUser(signUpDto);
      const otp = await this.userService.findOTPbyUser(user);
      return { email : user.email, otp : otp}
    }
    
    async resertPassword(email: string){
      const user = await this.userService.findOne(email);
      const newPassword = createPassword();
      const otp = await this.userService.createOTP(user)
      if(user){  
        await this.mailerService.sendMail({
          from: 'noreply@chatnow.com',
          to: user.email,
          subject: '[ChatNow] Return Your New Password',
          html: verificationPassWordEmail(user.email, otp.code, newPassword),
        })
        await this.userService.updatePassword(user.id,newPassword);
        return user;
      }
      else{
        throw new Error(...USER_NOT_FOUND);
      }
    }

    async resendEmail(email: string) {
      const user = await this.userService.findOne(email);
      const otp = await this.userService.findOTPbyUser(user)
      if (user && !user.isActive) {
        await this.mailerService.sendMail({
          from: 'noreply@chatnow.com',
          to: user.email,
          subject: '[ChatNow] Activate Your Account',
          html: verificationEmail(user.email, otp.code),
        });
      }
    }
  
    async verifyAccessToken(accessToken: string) {
      try {
        const payload = await this.jwtService.verifyAsync(accessToken, {
          secret: this.configService.get<string>('JWT_ACCESS_TOKEN_SECRET'),
        });
        return payload;
      } catch {
        throw new UnauthorizedException();
      }
    }
  
    async verifyEmail(email : string, otp : string) {
      try {
        const user = await this.userService.findOne(email);
        const otp_code = await this.userService.findOTPbyUser(user);
        if (!user || otp_code.code !== otp) {
          throw new BadRequestException({ ...WRONG_VERIFICATION_LINK });
        }
        user.isActive = true;
        const new_user = await this.userService.userRepository.create({...user});
        await this.userService.updateOTP(otp_code);
        return this.userService.userRepository.save(new_user);
      } catch {
        throw new BadRequestException();
      }
    }

    async refresh(refresh_token : string){
      try {
        const is_used = await this.authRepository.findOneBy({refresh_token : refresh_token , is_used : false});
        if(!is_used){
          throw new Error("Refresh not available");
        }
        else{
          const payload = await this.jwtService.verify(refresh_token, {
            secret: process.env.JWT_REFRESH_TOKEN_SECRET,
          });
          if(!payload){
            throw new Error("Invalid RefreshToken")
          }
          else
          {
            const user = await this.userService.findOne(payload.email);
            await this.updateRefreshToken(user);
            const token = await this.createToken(user);
            return {
              ...payload,
              ...token
            }
          }
        }
      } catch {
        throw new UnauthorizedException();
      }
    }

    async logout(userId : UUID, logoutDto : LogOutDto){
      const user = await this.userService.findById(userId);
      await this.updateRefreshToken(user);
      const deviceLogin = await this.deviceTokenRepository.findOne({where : {user : user as FindOptionsWhereProperty<User>,deviceToken : logoutDto.deviceToken}});
      deviceLogin.isDelete = true;
      await this.deviceTokenRepository.save(deviceLogin);
      return await this.userService.updateUserStatus(userId,UserStatus.OFF);
    }
    async updateRefreshToken(user : User){
      // const user = await this.userService.findById(userId);
      const current_refreshToken = await this.authRepository.findOne({where :{user : user as FindOptionsWhereProperty<User>, is_used : false}})
      current_refreshToken.is_used = true
      const updateToken = this.authRepository.create(current_refreshToken)
      return await this.authRepository.save(updateToken);
    }
   
}
