import { Controller, Get, Post, Body, Patch, Param, Delete, UploadedFile, UseInterceptors } from '@nestjs/common';
import { MinioClientService } from './minio-client.service';
import { CreateMinioClientDto } from './dto/create-minio-client.dto';
import { UpdateMinioClientDto } from './dto/update-minio-client.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags } from '@nestjs/swagger';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { File } from './entity/minio-client.entity';
@ApiTags("fileload")
@UseInterceptors(CacheInterceptor)
@Controller('minio-client')
export class MinioClientController {
  constructor(private readonly minioClientService: MinioClientService) {}
  @Post('single')
  @UseInterceptors(FileInterceptor('file'))
  async uploadSingle(
    @UploadedFile() file: Express.Multer.File
  ) {
    return await this.minioClientService.uploadFile(file);
  }
  @Get()
  async getFile(@Body('objectName') objectName : string){
    return await this.minioClientService.getFile(objectName);
  }
}
