import { UUID } from "crypto";
import { Device } from "src/device/entities/device.entity";
import { Home } from "src/home/entities/home.entity";
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Room {
    @PrimaryGeneratedColumn("uuid")
    id : UUID;
    @Column({nullable : true})
    name : string;
    @Column({nullable : true})
    floor : number;
    @ManyToOne(() => Home,(home) => home.rooms, { cascade: true ,  onDelete: "CASCADE" })
    home : Home;
    @OneToMany(() => Device,(device) => device.room , { cascade: true })
    devices : Device[];
    
}
