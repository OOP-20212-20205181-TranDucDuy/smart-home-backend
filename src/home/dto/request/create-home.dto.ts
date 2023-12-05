import { Home } from "src/home/entities/home.entity";
import { CreateRoomDto } from "src/room/dto/create-room.dto";
import { Room } from "src/room/entities/room.entity";

export class CreateHomeDto {
    name : string;
    num_of_floor : number;
    rooms : CreateRoomDto[];

}
