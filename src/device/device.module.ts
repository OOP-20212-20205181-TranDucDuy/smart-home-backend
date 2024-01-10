import { Module } from '@nestjs/common';
import { DeviceService } from './device.service';
import { DeviceController } from './device.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Device } from './entities/device.entity';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { DeviceGateway } from './device.gateway';
import { NotificationModule } from 'src/notification/notification.module';
import { UserModule } from 'src/user/user.module';

@Module({
  imports : [TypeOrmModule.forFeature([Device]),ClientsModule.register([
    {
      name: 'DEVICE_SERVICE',
      transport: Transport.MQTT,
      options: {
        url: 'mqtt://broker.hivemq.com:1883',
      },
    }
  ]), NotificationModule , UserModule],
  controllers: [DeviceController],
  providers: [DeviceService, DeviceGateway],
  exports:[DeviceService],
})
export class DeviceModule {}
