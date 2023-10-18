import { IsEmail, IsEnum, IsNotEmpty } from "class-validator";
import { Role } from "src/constant/enum";

export class CreateUserDto {
    @IsEmail()
    email : string;
    @IsNotEmpty()
    password : string;
    @IsEnum({
        each : true,
        eachCustomValue: (value: Role) => value !== Role.ADMIN,
    })
    roles : Role;
}
