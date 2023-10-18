import { Body, Controller, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { Crud, CrudController, CrudRequest, Override, ParsedRequest } from '@dataui/crud';
import { Home } from './entities/home.entity';
import { HomeService } from './home.service';
import { HttpAuthGuard } from 'src/auth/guard/auth.guard';
import { Roles } from 'src/user/entities/roles.decorater';
import { Role } from 'src/constant/enum';
import { CreateHomeDto } from './dto/create-home.dto';
import { User } from 'src/user/entities/user.entity';
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
      'createManyBase', 'createOneBase','deleteOneBase','recoverOneBase','replaceOneBase','updateOneBase'
    ]
  }
})
@UseGuards(HttpAuthGuard)
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
  @Override('getOneBase')
  @Roles(Role.ADMIN)
  async getOne(
    @ParsedRequest() req: CrudRequest,
  ) {
    return this.base.getOneBase(req);
  }

  @Roles(Role.USER)
  @Post()
  async createHome(@Req() request : Request, @Body() createHomeDto : CreateHomeDto){
    const user : User = request['user'];
    return await this.service.createHome(createHomeDto, user);
  }
  @Roles(Role.ADMIN)
  @Post("active-smarthome/:homeId")
  async acceptHomeCreated(@Param('homeId') homeId : number){
    return await this.service.activateHome(homeId);
  }
  @Roles(Role.USER)
  @Get("owner/retriveHome")
  async getListOwnerHome(@Req() request : Request,@Query('page') page : number){
    const user_id = request['user'].id;
    return await this.service.retriveOwnerHome(user_id,page);
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
  // }
}
