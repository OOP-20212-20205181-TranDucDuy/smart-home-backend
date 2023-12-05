import { UUID } from "crypto";
import { Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from "typeorm";
import { Device } from "./device.entity";

@Entity()
export class Status {
    @PrimaryGeneratedColumn('uuid')
    id : UUID;
    @Column()
    code : string;
    @Column()
    value : string;

    @ManyToMany(()=>Device, (devices) => devices.status)
    devices : Device[]
    

}