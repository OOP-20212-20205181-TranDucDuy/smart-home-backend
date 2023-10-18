import { Device } from "src/device/entities/device.entity";
import { Room } from "src/room/entities/room.entity";
import { User } from "src/user/entities/user.entity";
import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
@Entity()
export class Home {
    @PrimaryGeneratedColumn()
    id : number;
    @Column()
    address : string;
    @Column()
    isActive : boolean;
    @Column({nullable: true})
    wifi : string;
    @ManyToOne(() => User, user=> user.owner_homes ,{nullable : true})
    @JoinColumn({name : "owner_id"})
    owner : User;
    @ManyToMany(()=>User, user=>user.homes)
    @JoinTable({name : "guest_home"})
    guests : User[];
    @OneToMany(()=>Device, (device)=>device.home)
    devices : Device[];
    // @OneToMany(() => Room , room => room.home)
    // rooms : Room[]
}

