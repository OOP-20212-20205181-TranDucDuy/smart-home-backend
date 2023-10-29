import { Module } from '@nestjs/common';
import { HomeService } from './home.service';
import { HomeController } from './home.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Home } from './entities/home.entity';
import { UserModule } from 'src/user/user.module';
import { RoomModule } from 'src/room/room.module';

@Module({
  imports : [TypeOrmModule.forFeature([Home]), UserModule, RoomModule],
  controllers: [HomeController],
  providers: [HomeService],
  exports : [HomeService],
})
export class HomeModule {}
