import { type } from "os"
import { color, deviceCode, lightStatus } from "./enum"

export type LightDevice = {
    lightStatus : lightStatus,
}
export type TemperatureSensor = {
    temperature : number,
    humority : number
}
export type Rbg = {
    color : color
}
export function convertValue (code: deviceCode , value : string) {
    if(code === deviceCode.LIGHT_DEVICE){
        const data: any = JSON.parse(value);
        const typedData: LightDevice = data;
        return typedData.lightStatus;
    }
    if(code === deviceCode.TEMPERATURE_SENSOR){
        const data: any = JSON.parse(value);
        const typedData: TemperatureSensor = data;
        return typedData.temperature + "-" + typedData.humority;
    }
    if(code === deviceCode.RBG){
        const data: any = JSON.parse(value);
        const typedData: Rbg = data;
        return typedData.color;
    }
}