import { UUID } from "crypto";

export class RegisterDeviceDto {
    roomId : UUID;
    deviceId : UUID;
}
