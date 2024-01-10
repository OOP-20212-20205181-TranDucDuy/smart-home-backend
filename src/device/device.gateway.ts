import {
  ConnectedSocket,
  MessageBody,
    OnGatewayConnection,
    OnGatewayDisconnect,
    OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { DeviceService } from './device.service';
import { UUID } from 'crypto';
import { Socket } from 'socket.io';
import { v4 as uuidv4, parse as uuidParse } from 'uuid';
import { Logger } from '@nestjs/common';

@WebSocketGateway()
export class DeviceGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
  @WebSocketServer() io;
  afterInit(): void {}
  private logger: Logger = new Logger(DeviceGateway.name);
  constructor(
    private readonly deviceService: DeviceService,
  ) {}
    handleConnection(client: any, ...args: any[]) {
        this.logger.debug("A socket connected")
    }
    handleDisconnect(client: any) {
        this.logger.debug("A socket disconnected")
    }
    @SubscribeMessage('join')
    async joinRoom(
        @MessageBody('deviceId') deviceId: string,
        @ConnectedSocket() client: Socket,
    ) {
      this.logger.debug("client is "+ client);
      this.logger.debug("join success "+ deviceId);
      await client.join(deviceId);
    }
    async loadValue(deviceId: string): Promise<void> {
      this.logger.debug("send message")
      const id = uuidParse(deviceId);      // You need to define or fetch `updateConversation` or replace it with the appropriate data
      const updateValue = await this.deviceService.loadDeviceData(id);
      this.io.to(deviceId).emit('receive', updateValue.value);
    }
}