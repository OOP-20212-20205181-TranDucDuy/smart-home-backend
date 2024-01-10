import { TypeOrmCrudService } from "@dataui/crud-typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { Home } from "./entities/home.entity";
import { FindOptionsWhere, FindOptionsWhereProperty, In, Repository } from "typeorm";
import { User } from "src/user/entities/user.entity";
import { UserService } from "src/user/user.service";
import { BadRequestException, InternalServerErrorException, Logger } from "@nestjs/common";
import { CreateHomeDto } from "./dto/request/create-home.dto";
import { UUID } from "crypto";
import { UpdateHomeDto } from "./dto/request/update-home.dto";
import { Device } from "src/device/entities/device.entity";
import { CreateRoomDto } from "src/room/dto/create-room.dto";
import { RoomService } from "src/room/room.service";
import { UpdateRoomDto } from "src/room/dto/update-room.dto";
import { AddDeviceToRoomDto } from "src/room/dto/add-device.dto";
import { Room } from "src/room/entities/room.entity";
import { HomeMember } from "./entities/home_member.entity";
import { NotificationService } from "src/notification/notification.service";
import { Transactional } from "typeorm-transactional";
import { title } from "process";
import { MessagePattern } from "@nestjs/microservices";
import { RegisterDeviceDto } from "./dto/request/register-device.dto";
import { ControlDto } from "./dto/control.dto";
import { convertValue } from "src/device/type/device.type";
import { deviceCode } from "src/device/type/enum";
import { DeviceGateway } from "src/device/device.gateway";

export class HomeService extends TypeOrmCrudService<Home> {
  private logger: Logger = new Logger(HomeService.name);
  constructor(@InjectRepository(Home) public readonly homeRepositoty : Repository<Home>,
  @InjectRepository(HomeMember) public readonly homeMemberRepositoty : Repository<HomeMember>,
  public userService : UserService,
  public roomService : RoomService,
  public notificationService : NotificationService) {
    super(homeRepositoty);
  }
  async retriveOwnerHome(userId : UUID,page : number){
    const user = await this.userService.findById(userId);
    if(!user) {
      throw new InternalServerErrorException('user is not available')
    }
    return await this.homeRepositoty.find({relations : ['owner'], where : {owner : user as FindOptionsWhereProperty<User>},take : 10, skip : 10*(page -1)}) 
  }
  async createHome(createHomeDto: CreateHomeDto, user : User) {
    
    const newHome = this.homeRepositoty.create({
      ...createHomeDto,
      owner: user,
    })
    await this.homeRepositoty.save(newHome);
    return {
      result : newHome,
      success :"ok"
    }
  }
  // async addUserToHome(hostId : number,userId : number, homeId : number) {
  //   const user = await this.userService.findById(userId);
  //   const home = await this.homeRepositoty.findOne({relations : ['owner'],where : { id : homeId }});
  //   if(userId == hostId){
  //     throw new BadRequestException("can not add owner to guest")
  //   }
  //   if(!user) {
  //     throw new InternalServerErrorException('user is not available')
  //   }
  //   if(!home) {
  //     throw new InternalServerErrorException('home is not available')
  //   }
  //   if(home.guests.filter((user) => user.id === userId).length > 0) {
  //     throw new InternalServerErrorException('user is already added')
  //   }
  //   if(home.owner.id != hostId) {
  //     throw new InternalServerErrorException('user is not a host')
  //   }
  //   if(home.isActive == false){
  //     throw new BadRequestException('home is not active')
  //   }
  //   home.guests.push(user);
  //   return await this.homeRepositoty.save(home);
  // }
  // async removeUserFromHome(hostId : number,userId : number, homeId : number) { 
  //   const user = await this.userService.findById(userId);
  //   const home = await this.homeRepositoty.findOne({relations : ['owner'],where : { id : homeId }});
  //   if(userId == hostId){
  //     throw new BadRequestException("can not remove owner")
  //   }
  //   if(!user) {
  //     throw new InternalServerErrorException('user is not available')
  //   }
  //   if(!home) {
  //     throw new InternalServerErrorException('home is not available')
  //   }
  //   if(home.guests.filter((user) => user.id === userId).length > 0) {
  //     throw new InternalServerErrorException('user is not a member')
  //   }
  //   if(home.owner.id != hostId) {
  //     throw new InternalServerErrorException('user is not a host')
  //   }
  //   if(home.isActive == false){
  //     throw new BadRequestException('home is not active')
  //   }
  //   home.guests = home.guests.filter((user) => user.id !== userId);
  //   return await this.homeRepositoty.save(home);
  // }
  // async activateHome(homeId : number) {
  //   const home = await this.homeRepositoty.findOne({where : { id : homeId }});
  //   if(!home) {
  //     throw new InternalServerErrorException('home is not available')
  //   }
  //   if(home.isActive == true){  
  //     throw new BadRequestException('home is already active');
  //   }
  //   else {
  //     home.isActive = true;
  //     return await this.homeRepositoty.save(home);
  //   }
  // }
  async searchFamily(homeId : UUID) {
    const home = await this.homeRepositoty.findOne({where : { id : homeId }});
    if(!home){
      return {
        result : false,
        message  : "home is not found"
      }
    }
    return {
      result : {
        lon : home.lon !== null ? home.lon : '',
        name : home.name || null,
        home_id : home.id || null,
        lat : home.lat || null,
        geo_name : home.geo_name || null,
      }
    }
  }
  async modifyFamily(user_id :UUID, homeId : UUID, updateHomeDto : UpdateHomeDto){
    const isHomeOwner = await this.isHomeOwner(user_id,homeId);
    if(isHomeOwner.result = true){
      await this.homeRepositoty.update({id: homeId}, {
        ...updateHomeDto
      })
      return {
        result : true
      }
    }
    return isHomeOwner;
  }
  async deleteHome(homeId : UUID, user_id : UUID){
    const home = await this.homeRepositoty.findOne({where : {id :homeId, owner : (await this.userService.findById(user_id)) as FindOptionsWhere<User>},
      relations : ['rooms','rooms.devices','members']})
    if(home){
      await this.homeRepositoty.remove(home);
      return {
        result : true
      }
    }
    return {
      result : false
    };
  }
  async isHomeOwner(user_id : UUID, home_id : UUID){
    const home = await this.homeRepositoty.findOne({where : { id : home_id }, relations : ['owner']});
    if(!home){
      return {
        result : false,
        message : "home doesn't exist"
      };
    }
    if(user_id != home.owner.id){
      return {
        result : false,
        message : "home doesn't belong to user"
      };
    }
    return {
      result : true,
    }
  }
  async queryDevicesUnderHome(user_id : UUID, home_id : UUID){
    const isHomeOwner = await this.isHomeOwner(user_id,home_id);
    if(isHomeOwner.result == true){
      const home = await this.homeRepositoty.findOne({where : {id : home_id}, relations : ['rooms.devices.status']});
      let devicesList : Device[];
      home.rooms.forEach(room => {  
        room.devices.forEach(device => {
          devicesList.push(device);
        });
      });
      return {
        result : devicesList
      }
    }
  }
  async queryHomeMembers(home_id :UUID){
    const homeMember = await this.homeRepositoty.findOne({where : {id : home_id}, relations : ['owner','members.user']});
    const not_joined_member = [];
    const joined_member = [];
    homeMember.members.forEach((member) => {
      if(member.is_joined === true){
        joined_member.push(member.user);
      }
      else{
        not_joined_member.push(member.user);
      }
    });
    return {
      result : true,
      not_joined_member,
      joined_member,
      owner : homeMember.owner
    }
  }
  async addHomeMember(user_id : UUID, home_id : UUID,member_id : UUID){
    const home = await this.homeRepositoty.findOne({where : {id : home_id}, relations : ['owner','members']});
    if(user_id != home.owner.id){
      return {
        result : false,
        message : "home doesn't belong to user"
      };
    }
    const new_member = await this.userService.findById(member_id);
    if(!new_member){
      return {
        result : false,
        message : "user doesn't exist"
      };
    }
    const member_request = await this.homeMemberRepositoty.findOne({where : {user : new_member as FindOptionsWhere<User> , 
    home : home as FindOptionsWhere<Home>}})
    if(!member_request){
      return {
        result : false,
        message : "user hasn't requested yet "
      };
    }
    member_request.is_joined = true;
    await this.homeMemberRepositoty.save(member_request);
    return {
      result : true
    }
  }
  @Transactional()
  async removeHomeMember(user_id : UUID, home_id : UUID,member_id : UUID){
    const home = await this.homeRepositoty.findOne({where : {id : home_id}, relations : ['owner']});
    if(!home){
      return {
        result : false,
        message : "home doesn't exist"
      };
    }
    if(user_id != home.owner.id){
      return {
        result : false,
        message : "home doesn't belong to user"
      };
    }
    const member = await this.userService.queryUserDeviceLogin(member_id);
    if(member.result === false){
      return {
        result : false,
        message : member.error_message,
      }
    }
    const homeMember = await this.homeMemberRepositoty.findOne({where:{user : member.user as FindOptionsWhere<User>, home : home as FindOptionsWhere<Home>}});
    if(!homeMember){
      return {
        result : false,
        message : "member doesn't exist"
      }
    }
    const title = "remove from home";
    const body = JSON.stringify(home.owner);
    const notification = await this.notificationService.notificationRepository.create({
      title,
      body,
      type : "remove_from_home",
      user_receive : member.user,

    })
    await this.notificationService.notificationRepository.save(notification);
    if(member.deviceTokens){
      await this.notificationService.sendNotificationToMutilToken(member.deviceTokens,title,body);
      notification.isReaded = true;
      await this.notificationService.notificationRepository.save(notification);
    }
    
    return {
      result : true,
      ...(await this.homeMemberRepositoty.delete(homeMember.id))
    }
  }
  @Transactional()
  async joinHome(user_id : UUID, home_id : UUID){
    const home = await this.homeRepositoty.findOne({where : {id : home_id}, relations : {
      owner : true,
    }});
    if(!home){
      return {
        result : false,
        message : "home doesn't exist"
      };
    }
    if(home.owner.id === user_id){
      return {
        result : false,
        message : "You are owner of this home"
      };
    }
    const member = await this.userService.findById(user_id);
    if(!member){
      return {
        result : false,
        message : "user doesn't exist "
      }
    }
    const response = await this.userService.queryUserDeviceLogin(home.owner.id);
    if(response.result == false){
      return {
        result : false,
        message : response.error_message
      };
    }
    const homeMember = await this.homeMemberRepositoty.findOne({where:{user : member as FindOptionsWhere<User>, home : home as FindOptionsWhere<Home>}});
    if(homeMember){
      return {
        result : false,
        message : "user has been member"
      }
    }
    const new_home_member = await this.homeMemberRepositoty.create({
      user : response.user,
      home : home
    })
    await this.homeMemberRepositoty.save(new_home_member);
    const deviceTokens = response.deviceTokens; 
    const title = "join home";
    const body = JSON.stringify(home.owner); 

    const notification = await this.notificationService.notificationRepository.create({
      title,
      body,
      type : "join_home",
      user_receive : home.owner
    });

    await this.notificationService.notificationRepository.save(notification);
    if(deviceTokens){
      await this.notificationService.sendNotificationToMutilToken(deviceTokens,title,body);
      notification.isReaded = true;
      await this.notificationService.notificationRepository.save(notification);
    }
    
    return {
      result : true,
    }
  }
  @Transactional()
  async acceptHomeMember(user_id : UUID,member_id : UUID,home_id : UUID){
    const home = await this.homeRepositoty.findOne({where : {id : home_id,owner : (await this.userService.findById(user_id)) as FindOptionsWhere<User>}})
    if(!home){
      return {
        result : false,
        message : "home doesn't exist"
      }
    }
    const member = await this.userService.queryUserDeviceLogin(member_id);
    if(member.result === false){
      return {
        result : false,
        message : "member doesn't exist"
      }
    }
    const home_member = await this.homeMemberRepositoty.findOne({where : {home : home as FindOptionsWhere<Home>,user : member as FindOptionsWhere<User>}});
    if(!home_member){
      const new_home_member = await this.homeMemberRepositoty.create({
        user : member.user,
        home: home,
        is_joined : true,
      })
    const title = "accept_to_home";
    const body = JSON.stringify(home.owner);
    const notification = await this.notificationService.notificationRepository.create({
      title,
      body,
      type : "accept to home",
      user_receive : member.user,

    })
    await this.notificationService.notificationRepository.save(notification);
    if(member.deviceTokens){
      await this.notificationService.sendNotificationToMutilToken(member.deviceTokens,title,body)
    }
    return {
        result : true,
        ...(await this.homeMemberRepositoty.save(new_home_member))
      }
    }
    home_member.is_joined  = true
    await this.homeMemberRepositoty.save(home_member);
    return {
      result : true,
      message : "Updated member"
    }
  }
  async createRoom(user_id : UUID, home_id : UUID ,createRoomDto : CreateRoomDto){
    const home = await this.homeRepositoty.findOne({where : {id : home_id},relations : ['owner','rooms']});
    if(!home){
      return {
        result : false,
        message : "home doesn't exist"
      };
    }
    if(user_id != home.owner.id){
      return {
        result : false,
        message : "home doesn't belong to user"
      };
    }
    const room = await this.roomService.roomRepository.create({
      ...createRoomDto,
      home
    })
    await this.roomService.roomRepository.save(room);
    return {
      result : true
    }
  }
  async queryRoomList(user_id : UUID, home_id : UUID){
    const isHomeOwner = await this.isHomeOwner(user_id,home_id);
    if(isHomeOwner.result == true){
      const home = await this.homeRepositoty.findOne({where : {id : home_id},relations : ['rooms']})
      return {
        result : home.rooms
      }
    }
    return isHomeOwner;
  }
  async deleteRoom(user_id : UUID, home_id : UUID,room_id : UUID){
    const home = await this.homeRepositoty.findOne({where : {id : home_id}, relations : ['owner','rooms']});
    if(!home){
      return {
        result : false,
        message : "home doesn't exist"
      };
    }
    if(user_id != home.owner.id){
      return {
        result : false,
        message : "home doesn't belong to user"
      };
    }
    if( home.rooms.filter((room) => room.id === room_id).length === 0){
      return {
        result : false,
        message : "room doesn't exist"
      };
    }
    await this.roomService.roomRepository.delete(room_id);
    return {
      result : true
    }
  }
  async modifyRoom(user_id : UUID, home_id : UUID,room_id : UUID,updateRoomDto : UpdateRoomDto){
    const home = await this.homeRepositoty.findOne({where : {id : home_id}, relations : ['owner','rooms']});
    if(!home){
      return {
        result : false,
        message : "home doesn't exist"
      };
    }
    if(user_id != home.owner.id){
      return {
        result : false,
        message : "home doesn't belong to user"
      };
    }
    if( home.rooms.filter((room) => room.id === room_id).length === 0){
      return {
        result : false,
        message : "room doesn't exist"
      };
    }
    await this.roomService.roomRepository.update({id: home_id}, {
      ...updateRoomDto
    })
    await this.homeRepositoty.save(home);
    return {
      result : true
    }
  }
  async queryRoomDevices(home_id : UUID,room_id : UUID){
    const room = await this.roomService.roomRepository.findOne({where : {id : room_id}, relations : ["devices"]});
      return {
        result : room.devices.filter((device) => device.online === true)
      }
  }
  async deleteRoomDevice(user_id: UUID,home_id :UUID,room_id : UUID,device_id : UUID){
    const isHomeOwner = await this.isHomeOwner(user_id, home_id );
    if(isHomeOwner.result == true){
      const room = await this.roomService.roomRepository.findOne({where : {id : room_id}, relations : ["devices"]});
      room.devices = room.devices.filter((device) => device.id != device_id);
      const device = await this.roomService.deviceService.deviceRepositoty.findOne({where :{id :device_id}});
      device.online = false;
      await this.roomService.deviceService.deviceRepositoty.save(device);
      await this.roomService.roomRepository.save(room);
      return {
        result : true
      }
    }
    return isHomeOwner;
  }
  @Transactional()
  async registerDevice(registerDeviceDto : RegisterDeviceDto){
    this.logger.debug(registerDeviceDto.roomId);
    const device = await this.roomService.deviceService.deviceRepositoty.findOne({where : {id : registerDeviceDto.deviceId}});
    if(!device){
      return {
        result : "false",
        message : "device doesn't exist"
      }
    }
    const room = await this.roomService.roomRepository.findOne({where : {id : registerDeviceDto.roomId}, relations : ['home.owner']});
    if(!room){
      return {
        result : "false",
        message : "room doesn't exist"
      }
    }
    device.room = room;
    await this.roomService.deviceService.deviceRepositoty.save(device);
    const user_id = room.home.owner.id;
    const tokens = await this.userService.queryUserDeviceLogin(user_id);
    const title = "add device";
    const body = device.id;
    const notification = await this.notificationService.notificationRepository.create({
      title : title,
      body : body
    })
    await this.notificationService.notificationRepository.save(notification);
    await this.roomService.deviceService.sendMessage(registerDeviceDto.deviceId,registerDeviceDto.roomId);
    
    // if(tokens.deviceTokens){
    //   await this.notificationService.sendNotificationToMutilToken(tokens.deviceTokens,title,body);
    // }
    return {
      result : true
    }
  }
  @Transactional()
  async controlMutilDevices(controlDtos : ControlDto[], userId : UUID){
    try {
      controlDtos.forEach(controlDto => { 
        this.controlDevice(controlDto,userId);
      });
      return {
        result : true,
      }
    } catch (error) {
      return {
        result : false,
        message : error,
      }
    }
  }
  @Transactional()
  async controlDevice(controlDto : ControlDto, userId : UUID){
    const device = await this.roomService.deviceService.deviceRepositoty.findOne({where : {id : controlDto.deviceId, online : true},relations : ['room.home.owner','room.home.members.user']});
    console.log(device.room);
    const owner = device.room.home.owner;
    const members = device.room.home.members;
    if(userId != owner.id){
      members.forEach(member => {
        if(userId != member.user.id){
          return {
            result : false,
            message : "You must be a member in home",
          }
        }
      });
    }
    // try {
      let topic = "roomId/"+device.room.id.toString() + "/deviceId/"+device.id.toString()+"/control";
      let value = convertValue(device.code,controlDto.value).toString();
      await this.roomService.deviceService.sendMessage(topic,value);
      device.value = controlDto.value;
      console.log(device.value);
      await this.roomService.deviceService.deviceRepositoty.save(device);
      return {
        result : true,
      }
    // } catch (error) {
    //   return {
    //     result : false,
    //     message : error
    //   };
    // }
  }
}