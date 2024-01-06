import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Query } from '@nestjs/common';
import { DeviceService } from './device.service';
import { CreateDeviceDto } from './dto/create-device.dto';
import { UpdateDeviceDto } from './dto/update-device.dto';
import { Device } from './entities/device.entity';
import { Crud, CrudController, CrudRequest, GetManyDefaultResponse, Override, ParsedRequest } from '@dataui/crud';
import { Role } from 'src/constant/enum';
import { Roles } from 'src/user/entities/roles.decorater';
import { GetConnectionDto } from './dto/connection.dto';
import { HttpAuthGuard } from 'src/auth/guard/auth.guard';
import { Ctx, MessagePattern, MqttContext, Payload } from '@nestjs/microservices';
import { v4 as uuidv4, parse as uuidParse } from 'uuid';
import { UUID } from 'crypto';
@Crud({
  model: { 
    type: Device,
  },
  query : {
    alwaysPaginate : true,
    limit : 10,
    maxLimit : 50,
    join : {
      home : {
        eager : true
      },
      'home.users' : {
        eager : true
      }
    }
  },
  routes : {
    exclude : ['createManyBase', 'replaceOneBase', 'createOneBase', 'deleteOneBase' ,'updateOneBase' , 'getOneBase' ],
    
  }
})
@Controller('device')
export class DeviceController implements CrudController<Device> {
  constructor(public service: DeviceService) {}
  get base(): CrudController<Device> {
    return this;
  }
  @Override('getManyBase')
  @Roles(Role.ADMIN)
  async getMany(
    @ParsedRequest() req: CrudRequest,
  ){
    return await this.base.getManyBase(req);
  }

  @MessagePattern('add-device/+')
  async addDevice(@Payload() data: string) {
    console.log(data);
    return {
      message : `${data}`
    };
  }
  @MessagePattern('roomId/+/deviceId/+/connect')
  async getConnectFromDevice(@Payload() data: string, @Ctx() context: MqttContext){
    const topic = context.getTopic();
    const [roomId, deviceId] = topic.split('/').slice(2, 4);
    const id = uuidParse(deviceId);
    return await this.service.connectDevice(id, data);
  }
  @MessagePattern('roomId/+/deviceId/+/value')
  async getValue(@Payload() data: string, @Ctx() context: MqttContext){
    const topic = context.getTopic();
    const [roomId, deviceId] = topic.split('/').slice(2, 4);
    const id = uuidParse(deviceId);
    return await this.service.saveData(id,data);
  }
  @UseGuards(HttpAuthGuard)
  @Get('/:deviceId')
  async loadDevice(@Param('deviceId') device_id : UUID){
    return await this.service.loadDeviceData(device_id);
  }

  // @Roles(Role.USER)
  // @UseGuards(HttpAuthGuard)
  // @Patch(':deviceId')
  // async updateDeviceInformation(@Param('deviceId') deviceId : number,updateDeviceDto : UpdateDeviceDto,@Req() request : Request){
  //   const hostId = request['user'].id;
  //   return await this.service.updateInfoDevice(updateDeviceDto,deviceId,hostId);
  // }
  // @Roles(Role.USER)
  // @UseGuards(HttpAuthGuard)
  // @Post('changeStatus/:deviceId')
  // async changeStatusDevice(@Param('deviceId') deviceId : number,@Req() request : Request){
  //   const hostId = request['user'].id;
  //   return await this.service.changeStatusDevice(deviceId,hostId);
  // }
  // @Post('getConnection/all')
  // async getStatusDevice(@Body() getConnection : GetConnectionDto){
  //   return await this.service.getConnectionDevices(getConnection);
  // }
  // @Get('getButton/single')
  // async getButton(@Query("wifi") wifi : string,@Query("name") name : string){
  //   return await this.service.getAllStatus(wifi, name);
  // }
}