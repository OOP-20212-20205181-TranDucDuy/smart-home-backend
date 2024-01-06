import { Module } from '@nestjs/common';
import { HomeService } from './home.service';
import { HomeController } from './home.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Home } from './entities/home.entity';
import { UserModule } from 'src/user/user.module';
import { RoomModule } from 'src/room/room.module';
import { HomeMember } from './entities/home_member.entity';
import { NotificationModule } from 'src/notification/notification.module';
import { DeviceModule } from 'src/device/device.module';

@Module({
  imports : [TypeOrmModule.forFeature([Home,HomeMember]), UserModule, RoomModule , NotificationModule , DeviceModule],
  controllers: [HomeController],
  providers: [HomeService],
  exports : [HomeService],
})
export class HomeModule {}
