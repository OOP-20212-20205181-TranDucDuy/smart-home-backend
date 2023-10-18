import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UploadedFile, UseInterceptors, SetMetadata, UseGuards, Logger, Query } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags } from '@nestjs/swagger';
import { Role } from '../constant/enum';
import { Roles } from './entities/roles.decorater';
import { HttpAuthGuard } from '../auth/guard/auth.guard';
import { UpdateProfileDto } from './dto/update-profile.dto';
@ApiTags("user")
@Controller('user')
@UseGuards(HttpAuthGuard)
export class UserController {
  constructor(private readonly userService: UserService,
    ) {}
  private readonly logger = new Logger(UserController.name);
  @Get('/:id')
  @Roles(Role.ADMIN)
  async findById(@Param('id') id : number) {
    this.logger.log("Calling get id request");
    return await this.userService.findById(id);
  }
  @Get()
  @Roles(Role.ADMIN)
  async findAll(@Query('page') page : number) {
    return await this.userService.findAllUser(page);
  }
  @Patch()
  async updateMyself(@Req() req : Request, @Body() updateProfileDto : UpdateProfileDto) {
    const userId = req['user'].id;
    return await this.userService.updateProfile(updateProfileDto,userId);
  }
  @Roles(Role.ADMIN)
  @Patch("/:id")
  async updateUserProfile(@Param('id') id : number, @Body() updateProfileDto : UpdateProfileDto) {
    return await this.userService.updateProfile(updateProfileDto,id);
  }
  @Roles(Role.USER)
  @Get("/owner/profile")
  async getProfile(@Req() request : Request){
    const user_id = request['user'].id;
    return await this.userService.findById(user_id);
  }
}
