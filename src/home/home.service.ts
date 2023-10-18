import { TypeOrmCrudService } from "@dataui/crud-typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { Home } from "./entities/home.entity";
import { FindOptionsWhere, FindOptionsWhereProperty, Repository } from "typeorm";
import { CreateHomeDto } from "./dto/create-home.dto";
import { User } from "src/user/entities/user.entity";
import { UserService } from "src/user/user.service";
import { BadRequestException, InternalServerErrorException } from "@nestjs/common";

export class HomeService extends TypeOrmCrudService<Home> {
  constructor(@InjectRepository(Home) public readonly homeRepositoty : Repository<Home>,
  private readonly userService : UserService) {
    super(homeRepositoty);
  }
  async retriveOwnerHome(userId : number,page : number){
    const user = await this.userService.findById(userId);
    if(!user) {
      throw new InternalServerErrorException('user is not available')
    }
    return await this.homeRepositoty.find({relations : ['owner'], where : {owner : user as FindOptionsWhereProperty<User>},take : 10, skip : 10*(page -1)}) 
  }
  async createHome(createHomeDto: CreateHomeDto, user : User) {
    const newHome = await this.homeRepositoty.create({
      ...createHomeDto,
      owner :user,
      isActive : false
    })
    return await this.homeRepositoty.save(newHome);
  }
  async addUserToHome(hostId : number,userId : number, homeId : number) {
    const user = await this.userService.findById(userId);
    const home = await this.homeRepositoty.findOne({relations : ['owner'],where : { id : homeId }});
    if(userId == hostId){
      throw new BadRequestException("can not add owner to guest")
    }
    if(!user) {
      throw new InternalServerErrorException('user is not available')
    }
    if(!home) {
      throw new InternalServerErrorException('home is not available')
    }
    if(home.guests.filter((user) => user.id === userId).length > 0) {
      throw new InternalServerErrorException('user is already added')
    }
    if(home.owner.id != hostId) {
      throw new InternalServerErrorException('user is not a host')
    }
    if(home.isActive == false){
      throw new BadRequestException('home is not active')
    }
    home.guests.push(user);
    return await this.homeRepositoty.save(home);
  }
  async removeUserFromHome(hostId : number,userId : number, homeId : number) { 
    const user = await this.userService.findById(userId);
    const home = await this.homeRepositoty.findOne({relations : ['owner'],where : { id : homeId }});
    if(userId == hostId){
      throw new BadRequestException("can not remove owner")
    }
    if(!user) {
      throw new InternalServerErrorException('user is not available')
    }
    if(!home) {
      throw new InternalServerErrorException('home is not available')
    }
    if(home.guests.filter((user) => user.id === userId).length > 0) {
      throw new InternalServerErrorException('user is not a member')
    }
    if(home.owner.id != hostId) {
      throw new InternalServerErrorException('user is not a host')
    }
    if(home.isActive == false){
      throw new BadRequestException('home is not active')
    }
    home.guests = home.guests.filter((user) => user.id !== userId);
    return await this.homeRepositoty.save(home);
  }
  async activateHome(homeId : number) {
    const home = await this.homeRepositoty.findOne({where : { id : homeId }});
    if(!home) {
      throw new InternalServerErrorException('home is not available')
    }
    if(home.isActive == true){  
      throw new BadRequestException('home is already active');
    }
    else {
      home.isActive = true;
      return await this.homeRepositoty.save(home);
    }
  }
  async findOneByHomeId(homeId : number) {
    return await this.homeRepositoty.findOne({relations : ['users'],where : { id : homeId }});
  }
}