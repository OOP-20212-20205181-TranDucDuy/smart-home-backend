import { BadRequestException, Inject, Injectable, InternalServerErrorException } from '@nestjs/common';
import { Device } from './entities/device.entity';
import { TypeOrmCrudService } from '@dataui/crud-typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClientProxy, Ctx, MessagePattern, MqttContext, Payload } from '@nestjs/microservices';
import { HomeService } from 'src/home/home.service';
import { NotificationService } from 'src/notification/notification.service';
import { Transactional } from 'typeorm-transactional';
import { UUID } from 'crypto';

@Injectable()
export class DeviceService extends TypeOrmCrudService<Device> {
  constructor(@InjectRepository(Device) public readonly deviceRepositoty : Repository<Device>,
  @Inject("DEVICE_SERVICE") private deviceClient: ClientProxy) {
    super(deviceRepositoty);
  }
  async sendMessage(topic : string, message : string) {
    console.log("Topic: "+ topic);
    console.log("Message: "+ message);
    return this.deviceClient.emit(topic, message); // Replace 'your _topic' with your desired topic
  }
  async connectDevice(deviceId : UUID,data : string) {
    const device = await this.deviceRepositoty.findOne({where : {id : deviceId, online : false}});
    if(!device){
      console.log(device);
      return {
        message : "Device doesn't exist"
      }
    }
    if (data.toString() !== "true") {
      console.log(data);
      console.log("hello")
      return {
        message: "data is not true",
      };
    }
    device.online = true;
    console.log(device);
    await this.deviceRepositoty.save(device);
    return {
      message : "Connected"
    }
  }
  async saveData(deviceId : UUID , data : string){
    const device = await this.deviceRepositoty.findOne({where : {id : deviceId, online : true}});
    if(!device){
      return {
        message : "Device doesn't connect"
      }
    }
    device.value = data;
    return await this.deviceRepositoty.save(device);
  }
  async loadDeviceData(device_id : UUID){
    const device = await this.deviceRepositoty.findOne({where : {id : device_id , online : true}});
    if(!device){
      return {
        result : false,
        message : "Device doesn't connect"
      }
    }
    return device;
  }
}
