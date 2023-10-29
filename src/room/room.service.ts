import { Injectable } from '@nestjs/common';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Home } from 'src/home/entities/home.entity';
import { Room } from './entities/room.entity';

@Injectable()
export class RoomService {
  constructor(@InjectRepository(Room) public readonly roomRepository : Repository<Room>){
  }
  async createRoom(createRoomsDto :CreateRoomDto[]){
    const listRoom : Room[]= [];
      createRoomsDto.forEach(async createRoomDto => {
         await listRoom.push(this.roomRepository.create(createRoomDto));
      });
      return listRoom;
  }
}
