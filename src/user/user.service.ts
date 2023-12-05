import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, FindOptionsUtils, FindOptionsWhere, FindOptionsWhereProperty, Repository } from 'typeorm';
import { v4 } from 'uuid';
import { SignUpDto } from '../auth/dto/sign-up.dto';
import { Role, UserStatus } from '../constant/enum';
import { OTP } from './entities/otp.entity';
import { User } from './entities/user.entity';
import { Profile } from './entities/profile.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { skip } from 'node:test';
import { MailerService } from '@nestjs-modules/mailer';
import { verificationEmail } from 'src/constant/email-template.constant';
import { UUID } from 'crypto';
import { Home } from 'src/home/entities/home.entity';

@Injectable()
export class UserService {
  constructor( @InjectDataSource() private  readonly connection : DataSource,
  @InjectRepository(User) public readonly userRepository : Repository<User>,
  @InjectRepository(OTP) private readonly otpRepository : Repository<OTP>,
  @InjectRepository(Profile) private readonly profileRepository : Repository<Profile>,
  private readonly mailerService: MailerService,
  
  ){}
  async createOTP(user : User){
    const otp = await this.otpRepository.create({
      is_used : false,
      user,
    })
    return await this.otpRepository.save(otp);
  }
  async findOTPbyUser(user : User){
    return await this.otpRepository.findOne({where : {user : user as FindOptionsWhere<User>, is_used : false}})
  }
  async updateOTP(otp : OTP){
    otp.is_used = true;
    const updateOTP = await this.otpRepository.create({...otp})
    return await this.otpRepository.save(updateOTP);
  }
  async findOne(email : string){
    return await this.userRepository.findOne({where : { email : email}, relations : {
      profile : true,
      otps : true,
    }})
  }
  async findById(userId : UUID) : Promise<User>{
    return await this.userRepository.findOne({where :{id : userId},
      relations : {
        profile : true,
        otps : true,
      }});
  }
  async createUser(createUserDto : SignUpDto){
    const queryRunner = this.connection.createQueryRunner();

    try {
      // Establish a new database transaction
      await queryRunner.startTransaction();

      const user = await queryRunner.manager.getRepository(User).create({
        ...createUserDto,
        isActive: false,
        roles: Role.USER,
      });
      await queryRunner.manager.getRepository(User).insert(user);
      const profile = await queryRunner.manager.getRepository(Profile).create({
        user,
      });
      const otp = await queryRunner.manager.getRepository(OTP).create({
        is_used : false,
        user,
      });
      await queryRunner.manager.getRepository(OTP).insert(otp);
      await queryRunner.manager.getRepository(Profile).insert(profile);
      await this.mailerService.sendMail({
        from: 'noreply@chatnow.com',
        to: user.email,
        subject: '[ChatNow] Activate Your Account',
        html: verificationEmail(user.email, otp.code),
      });
      // Commit the transaction if everything is successful
      await queryRunner.commitTransaction();

      return user;
    } catch (error) {
      // Roll back the transaction if an error occurs
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      // Release the query runner
      await queryRunner.release();
    }
  }
  
  async update(userId : UUID, user : User){
    return this.userRepository.update({id : userId},user);
  }
  async updatePassword(userId : UUID, password : string){
    return this.userRepository.update({id : userId},{password : password});
  }
  async updateUserStatus(userId : UUID , status : UserStatus){
    return this.userRepository.update({id : userId},{status : status});
  }
  async findAllUser(page : number){
    const users = await this.userRepository.find({relations : {
      profile : true,
      otps : true,
    },
    where : {
      roles : Role.USER,
    },
    take : 10,
    skip : 10*(page-1),
  });
    return users;
  }
  async updateProfile(updateProfileDto : UpdateProfileDto, userId : UUID){
    const user = await this.findById(userId);
    if(!user){
      throw new InternalServerErrorException("user not in database")
    }
    if(user.isActive == false){
      throw new BadRequestException("user account is not verified")
    }
    if (!user.profile){
      const profile = await this.profileRepository.create({
        user : user
      });
      await this.profileRepository.save(profile);
    }
    return await this.profileRepository.update({user: user as FindOptionsWhere<User>}, {
      ...updateProfileDto
    })
  }
  async queryUserHomeList(user_id : UUID){
    const user = await this.userRepository.findOne({where : {id : user_id}, relations : ["homes"]});
    let homeList : Home[];
    user.owner_homes.forEach(home => {
      homeList.push(home);
    });
    return {
      result : homeList
    }
  }
  async queryUserDeviceLogin(user_id : UUID){
    const user = await this.userRepository.findOne({where : {id : user_id}, relations : {deviceTokens :true}})
    if(!user){
      return {
        result : false,
        error_message : "User doesn't exist"
      }
    }

    const tokens : string[] = [];
    user.deviceTokens.forEach(deviceToken => {
      if(deviceToken.isDelete === false){
        tokens.push(deviceToken.deviceToken);
      }
    });
    return {
      result : true,
      user : user,
      deviceTokens :tokens,
    }
  }
}
