import { BadRequestException, Inject, Injectable, InternalServerErrorException } from '@nestjs/common';
import { Device } from './entities/device.entity';
import { TypeOrmCrudService } from '@dataui/crud-typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClientProxy, Ctx, MessagePattern, MqttContext, Payload } from '@nestjs/microservices';
import { RegisterDeviceDto } from './dto/register-device.dto';
import { HomeService } from 'src/home/home.service';
import { NotificationService } from 'src/notification/notification.service';
import { Transactional } from 'typeorm-transactional';

@Injectable()
export class DeviceService extends TypeOrmCrudService<Device> {
  constructor(@InjectRepository(Device) public readonly deviceRepositoty : Repository<Device>,
  @Inject("DEVICE_SERVICE") private deviceClient: ClientProxy,
  private readonly homeService : HomeService) {
    super(deviceRepositoty);
  }
  async sendMessage() {
    const message = "hello";
    this.deviceClient.emit('your_topic', message); // Replace 'your_topic' with your desired topic
  }
  @MessagePattern('register-device/+')
  async addDevcieToHome(@Payload() data: string, @Ctx() context: MqttContext){
    const topic = context.getTopic();
    const homeId = topic.split('/')[1]; 
    const deviceId = data;
  // Process device registration for the given homeId
  console.log(`Registering device ${deviceId} for homeId: ${homeId}`);
  }
  @Transactional()
  async registerDevice(registerDeviceDto : RegisterDeviceDto){
    const device = await this.deviceRepositoty.findOne({where : {id : registerDeviceDto.deviceId}});
    const room = await this.homeService.roomService.roomRepository.findOne({where : {id : registerDeviceDto.roomId}, relations : ['home.owner']});
    device.room = room;
    const user_id = room.home.owner.id;
    const tokens = await this.homeService.userService.queryUserDeviceLogin(user_id);
    const title = "add device";
    const body = device.toString();
    const notification = await this.homeService.notificationService.notificationRepository.create({
      title : title,
      body : body
    })
    await this.homeService.notificationService.notificationRepository.save(notification);
    if(tokens.deviceTokens){
      await this.homeService.notificationService.sendNotificationToMutilToken(tokens.deviceTokens,title,body);
    }
    await this.deviceRepositoty.save(device);
    return {
      result : true
    }
  }
}
