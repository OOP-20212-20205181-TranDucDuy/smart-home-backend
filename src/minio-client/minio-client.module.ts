import { Module } from '@nestjs/common';
import { MinioClientService } from './minio-client.service';
import { MinioModule } from 'nestjs-minio-client';
import { config } from '../config/minio';
import { MinioClientController } from './minio-client.controller';
import { FileSchema } from './entity/minio-client.entity';
import { MongooseModule } from '@nestjs/mongoose';
import { File } from './entity/minio-client.entity';
@Module({
  imports: [
    MinioModule.register({
      endPoint: config.MINIO_ENDPOINT,
      port: config.MINIO_PORT,
      useSSL: false,
      accessKey: config.MINIO_ACCESSKEY,
      secretKey: config.MINIO_SECRETKEY,
    }),
    MongooseModule.forFeature([{ name: File.name, schema: FileSchema }]),
  ],
  controllers:[MinioClientController],
  providers: [MinioClientService],
  exports: [MinioClientService]
})
export class MinioClientModule {}
