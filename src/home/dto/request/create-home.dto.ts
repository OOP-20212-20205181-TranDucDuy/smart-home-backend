import { CreateRoomDto } from "src/room/dto/create-room.dto";

export class CreateHomeDto {
    address : string;
    rooms : CreateRoomDto[];
}
