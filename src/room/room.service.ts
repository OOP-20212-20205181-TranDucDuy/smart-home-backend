import { Injectable } from '@nestjs/common';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Home } from 'src/home/entities/home.entity';
import { Room } from './entities/room.entity';
import { UUID } from 'crypto';
import { DeviceService } from 'src/device/device.service';

@Injectable()
export class RoomService {
  constructor(@InjectRepository(Room) public readonly roomRepository : Repository<Room>,
  public deviceService : DeviceService){
  }
}
