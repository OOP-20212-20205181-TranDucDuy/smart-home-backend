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
import { RegisterDeviceDto } from './dto/register-device.dto';
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
    exclude : ['createManyBase', 'replaceOneBase', 'createOneBase', 'deleteOneBase' ,'updateOneBase' ],
    
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
  @Override('getOneBase')
  @Roles(Role.ADMIN)
  async getOne(
    @ParsedRequest() req: CrudRequest,
  ) {
    return this.base.getOneBase(req);
  }
  @MessagePattern('add-device/+')
  async addDevice(@Payload() data: string) {
    console.log(data);
    return {
      message : `${data}`
    };
  }
  @MessagePattern('register-device/+')
  async addDevcieToHome(@Payload() data: string, @Ctx() context: MqttContext){
    const topic = context.getTopic();
    const homeId = topic.split('/')[1]; 
    const deviceId = data;
  // Process device registration for the given homeId
  console.log(`Registering device ${deviceId} for homeId: ${homeId}`);
  }
  @Post()
  async registerDevice(@Body() registerDeviceDto : RegisterDeviceDto){
    return await this.service.registerDevice(registerDeviceDto);
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