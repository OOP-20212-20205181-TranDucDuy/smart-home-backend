import { IsNull } from "typeorm";

export class UpdateProfileDto {

    name : string;
    birth : Date;
    address :  string;
}