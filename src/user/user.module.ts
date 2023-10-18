import { Logger, Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { MinioModule } from 'nestjs-minio-client';
import { OTP } from './entities/otp.entity';
import { JwtModule } from '@nestjs/jwt';
import { Profile } from './entities/profile.entity';

@Module({
  imports : [TypeOrmModule.forFeature([User,OTP,Profile]),JwtModule],
  controllers: [UserController],
  providers: [UserService,Logger],
  exports: [UserService]
})
export class UserModule {}
