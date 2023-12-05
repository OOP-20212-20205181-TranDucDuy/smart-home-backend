import { PartialType } from '@nestjs/swagger';
import { CreateHomeDto } from './create-home.dto';

export class UpdateHomeDto extends PartialType(CreateHomeDto) {
    name : string;
    geo_name : string;
    lon : number;
    lat : number;
}
