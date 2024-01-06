import { Body, Controller, Delete, Get, Param, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { Crud, CrudController, CrudRequest, Override, ParsedRequest } from '@dataui/crud';
import { Home } from './entities/home.entity';
import { HomeService } from './home.service';
import { HttpAuthGuard } from 'src/auth/guard/auth.guard';
import { Roles } from 'src/user/entities/roles.decorater';
import { Role } from 'src/constant/enum';
import { User } from 'src/user/entities/user.entity';
import { CreateHomeDto } from './dto/request/create-home.dto';
import { UUID } from 'crypto';
import { UpdateHomeDto } from './dto/request/update-home.dto';
import { CreateRoomDto } from 'src/room/dto/create-room.dto';
import { UpdateRoomDto } from 'src/room/dto/update-room.dto';
import { AddDeviceToRoomDto } from 'src/room/dto/add-device.dto';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { RegisterDeviceDto } from './dto/request/register-device.dto';
import { ControlDto } from './dto/control.dto';
@Crud({
  model: {
    type: Home,
  },
  query : {
    alwaysPaginate : true,
    limit : 10,
    maxLimit : 50,
    join : {
      device : {
        eager : true
      },
      owner : {
        eager : true,
      },
      ['owner.profile'] : {
        eager : true,
      }
    }
  },
  routes : {
    exclude : [
      'createManyBase', 'createOneBase','deleteOneBase','recoverOneBase','replaceOneBase','updateOneBase','getOneBase'
    ]
  }
})

@Controller('home')
export class HomeController implements CrudController<Home> {
  constructor(public service: HomeService) {}
  get base(): CrudController<Home> {
    return this;
  }
  @Override('getManyBase')
  @Roles(Role.ADMIN)
  async getMany(
    @ParsedRequest() req: CrudRequest,
  ){
    return await this.base.getManyBase(req);
  }
  @UseGuards(HttpAuthGuard)
  @Roles(Role.USER)
  @Post()
  async createHome(@Req() request : Request, @Body() createHomeDto : CreateHomeDto){
    const user : User = request['user'];
    return await this.service.createHome(createHomeDto, user);
  }
  @UseGuards(HttpAuthGuard)
  @Roles(Role.USER)
  @Get("/:home_id")
  async searchFamily(@Param("home_id") home_id : UUID){
    return await this.service.searchFamily(home_id);
  }
  @UseGuards(HttpAuthGuard)
  @Roles(Role.USER)
  @Get("owner/retriveHome")
  async getListOwnerHome(@Req() request : Request,@Query('page') page : number){
    const user_id = request['user'].id;
    return await this.service.retriveOwnerHome(user_id,page);
  }
  @UseGuards(HttpAuthGuard)
  @Roles(Role.USER)
  @Put("/:home_id")
  async modifyHome(@Req() request : Request, @Param("home_id") home_id : UUID, @Body() updateHomeDto : UpdateHomeDto ){
    const user_id = request['user'].id;
    return await this.service.modifyFamily(user_id,home_id,updateHomeDto);
  }
  @UseGuards(HttpAuthGuard)
  @Roles(Role.USER)
  @Delete("/:home_id")
  async deleteHome(@Req() request : Request, @Param("home_id") home_id : UUID){
    const user_id = request['user'].id;
    return await this.service.deleteHome(home_id,user_id);
  }
  @UseGuards(HttpAuthGuard)
  @Get("/:home_id/devices")
  async queryDevicesUnderHome(@Req() request : Request, @Param("home_id") home_id : UUID){
    const user_id = request['user'].id;
    return await this.service.queryDevicesUnderHome(user_id,home_id);
  }
  @UseGuards(HttpAuthGuard)
  @Get("/:home_id/members")
  async queryHomeMembers(@Param("home_id") home_id : UUID){
    return await this.service.queryHomeMembers(home_id);
  }
  @UseGuards(HttpAuthGuard)
  @Roles(Role.USER)
  @Post("/:home_id/members/:member_id")
  async addHomeMember(@Req() request : Request,@Param("home_id") home_id : UUID,@Param("member_id") member_id : UUID){
    const user_id = request['user'].id;
    return await this.service.addHomeMember(user_id,home_id,member_id);
  }
  @UseGuards(HttpAuthGuard)
  @Roles(Role.USER)
  @Post("/:home_id/members")
  async joinHome(@Req() request : Request,@Param("home_id") home_id : UUID){
    const user_id = request['user'].id;
    return await this.service.joinHome(user_id,home_id);
  }
  @UseGuards(HttpAuthGuard)
  @Roles(Role.USER)
  @Delete("/:home_id/members/:member_id")
  async removeHomeMember(@Req() request : Request,@Param("home_id") home_id : UUID,@Param("member_id") member_id : UUID){
    const user_id = request['user'].id;
    return await this.service.removeHomeMember(user_id,home_id,member_id);
  }
  @UseGuards(HttpAuthGuard)
  @Roles(Role.USER)
  @Post("/:home_id/room")
  async addRoom(@Req() request : Request,@Param("home_id") home_id : UUID, @Body() createRoomDto : CreateRoomDto){
    const user_id = request['user'].id;
    return await this.service.createRoom(user_id,home_id,createRoomDto);
  }
  @UseGuards(HttpAuthGuard)
  @Roles(Role.USER)
  @Get("/:home_id/room")
  async queryRoomList(@Req() request : Request,@Param("home_id") home_id : UUID){
    const user_id = request['user'].id;
    return await this.service.queryRoomList(user_id,home_id);
  }
  @UseGuards(HttpAuthGuard)
  @Roles(Role.USER)
  @Put("/:home_id/room/:room_id")
  async modifyRoom(@Req() request : Request,@Param("home_id") home_id : UUID,@Param("room_id") room_id : UUID,@Body() updateRoomDto : UpdateRoomDto){
    const user_id = request['user'].id;
    return await this.service.modifyRoom(user_id,home_id,room_id,updateRoomDto);
  }
  @UseGuards(HttpAuthGuard)
  @Get("/:home_id/room/:room_id/devices")
  async queryRoomDevices(@Param("home_id") home_id : UUID,@Param("room_id") room_id : UUID){
    return await this.service.queryRoomDevices(home_id,room_id);
  }
  @UseGuards(HttpAuthGuard)
  @Delete("/:home_id/room/:room_id/device/:device_id")
  async deleteDevice(@Req() request : Request,@Param("home_id") home_id : UUID,@Param("room_id") room_id : UUID,@Param("device_id") device_id : UUID){
    const user_id = request['user'].id;
    return await this.service.deleteRoomDevice(user_id,home_id,room_id,device_id);
  }
  @UseGuards(HttpAuthGuard)
  @Roles(Role.USER)
  @Delete("/:home_id/room/:room_id")
  async deleteRoom(@Req() request : Request,@Param("home_id") home_id : UUID,@Param("room_id") room_id : UUID){
    const user_id = request['user'].id;
    return await this.service.deleteRoom(user_id,home_id,room_id);
  }
  @UseGuards(HttpAuthGuard)
  @Post("/registerDevice")
  async registerDevice(@Body() registerDeviceDto : RegisterDeviceDto){
    return await this.service.registerDevice(registerDeviceDto);
  }
  @UseGuards(HttpAuthGuard)
  @Post("/controlDevice")
  async controlDevice(@Req() request :Request,@Body() controlDto : ControlDto){
    const user_id = request['user'].id;
    return await this.service.controlDevice(controlDto,user_id);
  }
  // @Post("add-user-to-home")
  // async addUserToHome(@Query('homeId') homeId : number,@Query('userId') userId : number, @Req() request : Request){
  //   const hostId = request['user'].id;
  //   return await this.service.addUserToHome(hostId, userId, homeId);
  // }
  // @Post("remove-user-from-home")
  // async removeUserFromHome(@Query('homeId') homeId : number,@Query('userId') userId : number, @Req() request : Request){
  //   const hostId = request['user'].id;
  //   return await this.service.removeUserFromHome(hostId, userId, homeId);
  //
}
