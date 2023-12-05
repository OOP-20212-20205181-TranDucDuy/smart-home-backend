import { Module } from '@nestjs/common';
import { DeviceService } from './device.service';
import { DeviceController } from './device.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Device } from './entities/device.entity';
import { HomeModule } from 'src/home/home.module';
import { HttpModule } from '@nestjs/axios';
import { Status } from './entities/status.entity';
import { ClientsModule, Transport } from '@nestjs/microservices';


@Module({
  imports : [TypeOrmModule.forFeature([Device,Status]),ClientsModule.register([
    {
      name: 'DEVICE_SERVICE',
      transport: Transport.MQTT,
      options: {
        url: 'mqtt://broker.hivemq.com:1883',
      },
    },
  ]),HomeModule, DeviceModule],
  controllers: [DeviceController],
  providers: [DeviceService],
  exports:[DeviceService],
})
export class DeviceModule {}
