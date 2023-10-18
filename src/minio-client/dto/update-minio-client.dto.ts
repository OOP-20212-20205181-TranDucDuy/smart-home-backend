import { PartialType } from '@nestjs/mapped-types';
import { CreateMinioClientDto } from './create-minio-client.dto';

export class UpdateMinioClientDto extends PartialType(CreateMinioClientDto) {}
