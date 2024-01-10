import { INestApplicationContext, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { Server, ServerOptions, Socket } from 'socket.io';
import { AuthService } from './auth/auth.service';
import { JwtService } from '@nestjs/jwt';

export class SocketIOAdapter extends IoAdapter {
  private readonly logger = new Logger(SocketIOAdapter.name);
  constructor(
    private app: INestApplicationContext,
    private configService: ConfigService,
  ) {
    super(app);
  }

  createIOServer(port: number, options?: ServerOptions) {
    const cors = {
      origin: '*',
    };

    this.logger.log('Configuring SocketIO server with custom CORS options', {
      cors,
    });

    const optionsWithCORS: ServerOptions = {
      ...options,
      cors,
    };

    const jwtService = this.app.get(JwtService);
    const configService = this.app.get(ConfigService);
    const server: Server = super.createIOServer(port, optionsWithCORS);
    // server.use(createTokenMiddleware(jwtService, configService, this.logger));

    return server;
  }
}
const createTokenMiddleware =
  (jwtService: JwtService, configService: ConfigService, logger: Logger) =>
  async (socket: Socket, next) => {
    const token = socket.handshake.auth.token || socket.handshake.headers['token'];
    if (!token) {
      logger.warn('No token provided');
      return next(new Error('Authentication token not found'));
    }

    try {
      const secret = configService.get<string>('JWT_ACCESS_TOKEN_SECRET');
      if (!secret) {
        logger.error('JWT secret key is undefined');
        return next(new Error('Internal server error'));
      }
      logger.debug(secret);
      logger.debug(token);
      const payload = await jwtService.verifyAsync(token, { secret });
      socket.data = payload;
      next();
    } catch (error) {
      logger.error('Token verification failed', error);
      next(new Error('FORBIDDEN'));
    }
  };
