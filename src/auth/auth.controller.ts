import { Controller, Get, Post, Body, Patch, Param, Delete, HttpStatus,HttpCode, Query, UseGuards, Req, Logger } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LogInDto } from './dto/log-in.dto';
import { SignUpDto } from './dto/sign-up.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { HttpAuthGuard } from './guard/auth.guard';
import { ApiTags } from '@nestjs/swagger';
@ApiTags("auth")
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name)
  constructor(private readonly authService: AuthService) {}
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async loginIn(@Body() logInDto: LogInDto) {
    this.logger.log("Calling log in api");
    return await this.authService.logIn(logInDto)
  }
  @Post('signup')
  async signUp(@Body() signUpDto : SignUpDto){
    this.logger.log("Calling sign up api");
    return await this.authService.signUp(signUpDto);
  }
  @HttpCode(HttpStatus.OK)
  @Get('verify-email')
  async verifyEmail(@Query('email') email : string ,
  @Query('otp') otp : string) {
    this.logger.log("Calling verify email api");
    return await this.authService.verifyEmail(email,otp);
  }

  @HttpCode(HttpStatus.OK)
  @Post('resend-email')
  async resendEmail(@Body('email') email: string) {
    this.logger.log("Calling resend email api");
    return await this.authService.resendEmail(email);
  }
  @HttpCode(HttpStatus.OK)
  @Post('forgot-password')
  async forgotPassword(@Body('email') email: string) {
    this.logger.log("Calling forgot passwoed api");
    return await this.authService.resertPassword(email);
  }
  @HttpCode(HttpStatus.OK)
  @Get('refresh')
  async refresh(@Body('refreshToken') refreshToken : string){
    this.logger.log("Calling refersh api");
    return await this.authService.refresh(refreshToken);
  }
  @UseGuards(HttpAuthGuard)
  @Get('logout')
  async logout(@Req() request : Request){
    this.logger.log("Calling log out api");
    const userId = request['user'].id;
    return await this.authService.logout(userId);
  }
}
