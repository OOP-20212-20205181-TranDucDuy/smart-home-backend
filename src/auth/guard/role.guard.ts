import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from 'src/constant/enum';
import { User } from 'src/user/entities/user.entity';
import { Request } from 'express';
import { AuthService } from '../auth.service';
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector,
    private authService : AuthService) {}

  private extractTokenFromHeader(request: Request): string {
    const [type, accessToken] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? accessToken : undefined;
  }
  
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) {
      return true;
    }
    const request = context.switchToHttp().getRequest<Request>();
    const accessToken = this.extractTokenFromHeader(request);
    if (!accessToken) {
      throw new UnauthorizedException();
    }

    try {
      const payload = await this.authService.verifyAccessToken(accessToken);
      const user : User = payload
      return requiredRoles.some((role) => user.roles?.includes(role));
    } catch {
      throw new UnauthorizedException();
    }
    return true;
  }
}