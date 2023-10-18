import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateDeviceDto } from './dto/create-device.dto';
import { UpdateDeviceDto } from './dto/update-device.dto';
import { Device } from './entities/device.entity';
import { TypeOrmCrudService } from '@dataui/crud-typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { HomeService } from 'src/home/home.service';
import { HttpService } from '@nestjs/axios';
import { GetConnectionDto } from './dto/connection.dto';

@Injectable()
export class DeviceService extends TypeOrmCrudService<Device> {
  constructor(@InjectRepository(Device) public readonly deviceRepositoty : Repository<Device>,
  private readonly httpService: HttpService,
  private readonly homeService : HomeService) {
    super(deviceRepositoty);
  }
  async addDevice(createDeviceDto: CreateDeviceDto, homeId : number , hostId : number) {
    const home = await this.homeService.findOneByHomeId(homeId);
    if(!home) {
      throw new InternalServerErrorException('Home not found');
    }
    if(home.owner.id != hostId){
      throw new InternalServerErrorException('User is not a host');
    }
    const newdevice = await this.deviceRepositoty.create({
      ...createDeviceDto,
      status : false,
      isConnecting : false,
      home,
    });
    return this.deviceRepositoty.save(newdevice);
  }
  async updateInfoDevice(updateDeviceDto: UpdateDeviceDto, deviceId : number , hostId : number) {
    const device = await this.deviceRepositoty.findOne({relations : ['home','home.users'],where : {id : deviceId}});
    if(!device) {
      throw new InternalServerErrorException('Device not found');
    } 
    if (device.home.owner.id != hostId){
      throw new InternalServerErrorException('User is not a host');
    }
    else{
      return this.deviceRepositoty.save({...device, ...updateDeviceDto});
    }
  }
  async changeStatusDevice(deviceId : number , userId : number) {
    const device = await this.deviceRepositoty.findOne({relations : ['home','home.users'],where : {id : deviceId}});
    if(!device) {
      throw new InternalServerErrorException('Device not found');
    } 
    if (device.home.guests.filter((user) => user.id === userId).length === 0 || device.home.owner.id != userId){
      throw new InternalServerErrorException('User is not a host');
    }
    else{
      return this.deviceRepositoty.save({...device, status : !device.status});
    }
  }
  async getConnectionDevices(getConnection : GetConnectionDto) {
    const device = await this.deviceRepositoty.findOne({where : {name : getConnection.name}});
    if(!device){
      const newDevice = await this.deviceRepositoty.create({
        name : getConnection.name,
        description : "new device connected",
        status : false,
        home : await this.homeService.homeRepositoty.findOne({where : {wifi : getConnection.wifi}}),
        isConnecting : true,
      })
      return await this.deviceRepositoty.save(newDevice);
    }
    device.isConnecting = true
    return await this.deviceRepositoty.save(device);
  }
  async getAllStatus(wifi : string, name : string){
    const home = await this.homeService.homeRepositoty.findOne({relations : ['devices'],where : {wifi : wifi}});
    const device = await home.devices.filter((device) => device.name === name);
    return device[0].status;
  }
}
