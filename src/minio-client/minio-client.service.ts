import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { MinioService } from 'nestjs-minio-client';
import * as crypto from 'crypto'
import { config } from '../config/minio';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { File } from './entity/minio-client.entity';
@Injectable()
export class MinioClientService {
    private readonly logger: Logger;
    private readonly baseBucket = config.MINIO_BUCKET

  public get client() {
    return this.minio.client;
  }

  constructor(
    private readonly minio: MinioService,
    @InjectModel(File.name) private fileModel: Model<File>
  ) {
    this.logger = new Logger('MinioStorageService');
  }
  public async upload(file: Express.Multer.File, baseBucket: string = this.baseBucket) {
    let temp_filename = Date.now().toString()
    let hashedFileName = crypto.createHash('md5').update(temp_filename).digest("hex");
    let ext = file.originalname.substring(file.originalname.lastIndexOf('.'), file.originalname.length);
    const metaData = {
      'Content-Type': file.mimetype,
      'X-Amz-Meta-Testing': 1234,
    };
    let filename = hashedFileName + ext
    const fileName: string = `${filename}`;
    const fileBuffer = file.buffer;
    this.client.putObject(baseBucket,fileName,fileBuffer, function(err: any, res: any) {
      if(err) throw new HttpException('Error uploading file', HttpStatus.BAD_REQUEST)
    })

    return {
      url: `${config.MINIO_ENDPOINT}:${config.MINIO_PORT}/${config.MINIO_BUCKET}/${filename}` 
    }
  }

  async delete(objetName: string, baseBucket: string = this.baseBucket) {
    this.client.removeObject(baseBucket, objetName)
  }
  async uploadFile(file : Express.Multer.File){
    let uploaded_image = await this.upload(file);
    await this.fileModel.create({
      name : file.filename,
      url : uploaded_image.url
    })
    return {
      image_url: uploaded_image.url,
      message: "Successfully uploaded to MinIO"
    }
  }
  async getFile(objetName: string, baseBucket: string = this.baseBucket){
    const file = await this.client.getObject(baseBucket,objetName,function(err: any, res: any) {
      if(err) throw new HttpException("Oops Something wrong happend", HttpStatus.BAD_REQUEST)
    })
    return file;
  }
  
}
