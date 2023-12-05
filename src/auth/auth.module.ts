import { Global, Module, UseInterceptors } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from '../user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Auth } from './entity/auth.entity';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { DeviceToken } from './entity/deviceToken.entity';
import { NotificationModule } from 'src/notification/notification.module';
@Global()
@UseInterceptors(CacheInterceptor)
@Module({
  imports: [
    TypeOrmModule.forFeature([Auth,DeviceToken]),
    JwtModule.registerAsync({
      useFactory: () => ({
        global: true,
        secret: process.env.JWT_ACCESS_TOKEN_SECRET,
        signOptions: { expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRATION_TIME },
      }),
    }),UserModule, NotificationModule],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService]
})
export class AuthModule {}
