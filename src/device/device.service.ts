import { BadRequestException, Inject, Injectable, InternalServerErrorException, OnModuleInit } from '@nestjs/common';
import { Device } from './entities/device.entity';
import { TypeOrmCrudService } from '@dataui/crud-typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClientProxy, Ctx, MessagePattern, MqttContext, Payload } from '@nestjs/microservices';
import { HomeService } from 'src/home/home.service';
import { NotificationService } from 'src/notification/notification.service';
import { Transactional } from 'typeorm-transactional';
import { UUID } from 'crypto';
import * as mqtt from 'mqtt';
import { UserService } from 'src/user/user.service';
import { deviceCode } from './type/enum';
import { TemperatureSensor } from './type/device.type';
import { CreateDeviceDto } from './dto/create-device.dto';

@Injectable()
export class DeviceService extends TypeOrmCrudService<Device>{
  constructor(@InjectRepository(Device) public readonly deviceRepositoty : Repository<Device>,
  private readonly notificationService : NotificationService,
  private readonly userService : UserService,
  @Inject("DEVICE_SERVICE") private deviceClient: ClientProxy) {
    super(deviceRepositoty);
  }
  async sendMessage(topic : string, message : string) {
    console.log("Topic: "+ topic);
    console.log("Message: "+ message);
    return this.deviceClient.emit(topic, message);
  }
  async createDevice(createDeviceDto : CreateDeviceDto){
    const device = await this.deviceRepositoty.create({
      ...createDeviceDto,
    })
    return await this.deviceRepositoty.save(device);
  }
  async deleteDevice(deviceId : UUID){
    await this.deviceRepositoty.delete({id : deviceId});
    return {
      result : true
    }
  }
  @Transactional()
  async connectDevice(deviceId : UUID,data : string) {
    const device = await this.deviceRepositoty.findOne({where : {id : deviceId, online : false},relations : ['room', 'room.home' , 'room.home.owner']});
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
    const title = "connection success";
    const body = device.name;
    const notification = await this.notificationService.notificationRepository.create({
      title : title,
      body : body
    })
    const tokens = await this.userService.queryUserDeviceLogin(device.room.home.owner.id);
    if(tokens){
      await this.notificationService.sendNotificationToMutilToken(tokens.deviceTokens,title,body);
    }
    await this.notificationService.notificationRepository.save(notification);
    await this.deviceRepositoty.save(device);
    return {
      message : "Connected"
    }
  }
  async saveData(deviceId : UUID , data : string){
    const device = await this.deviceRepositoty.findOne({where : {id : deviceId, online : true},relations : ['room', 'room.home' , 'room.home.owner']});
    if(!device){
      return {
        message : "Device doesn't connect"
      }
    }
    const current_value = device.value;
    device.value = data;
    console.log(data);
    if(device.code === deviceCode.TEMPERATURE_SENSOR){
      const typedData : TemperatureSensor = JSON.parse(JSON.stringify(data));
      
      if(typedData.temperature > 40 && current_value != data){
        const title = "Warning!!! Temperature are very high. \n Temperature :"+ typedData.temperature;
        const body = device.name;
        const notification = await this.notificationService.notificationRepository.create({
          title : title,
          body : body
        })
        const tokens = await this.userService.queryUserDeviceLogin(device.room.home.owner.id);
        if(tokens){
          await this.notificationService.sendNotificationToMutilToken(tokens.deviceTokens,title,body);
        }
        await this.notificationService.notificationRepository.save(notification);
      }
    }
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
    // await this.wssClient.publish(topic,device.value);
    return{
      result : true,
      value : device
    }
  }
}
