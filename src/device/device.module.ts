import { Module } from '@nestjs/common';
import { DeviceService } from './device.service';
import { DeviceController } from './device.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Device } from './entities/device.entity';
import { HomeModule } from 'src/home/home.module';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports : [TypeOrmModule.forFeature([Device]), HomeModule ,HttpModule.register({
    timeout: 5000,
    maxRedirects: 5,
  }),],
  controllers: [DeviceController],
  providers: [DeviceService]
})
export class DeviceModule {}
