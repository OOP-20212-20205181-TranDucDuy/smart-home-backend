import { Module } from '@nestjs/common';
import { RoomService } from './room.service';
import { RoomController } from './room.controller';
import { Room } from './entities/room.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeviceModule } from 'src/device/device.module';

@Module({
  imports : [TypeOrmModule.forFeature([Room]), DeviceModule],
  controllers: [RoomController],
  providers: [RoomService],
  exports : [RoomService]
})
export class RoomModule {}
