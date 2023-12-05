import { UUID } from "crypto";
import { Device } from "src/device/entities/device.entity";
import { Room } from "src/room/entities/room.entity";
import { User } from "src/user/entities/user.entity";
import { BeforeInsert, Column, Double, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { HomeMember } from "./home_member.entity";
@Entity()
export class Home {
    @PrimaryGeneratedColumn("uuid")
    id : UUID;
    @Column()
    name : string;
    @Column({nullable : true})
    num_of_floor : number
    @Column({nullable: true})
    geo_name : string;
    @Column({nullable : true})
    lon : number;
    @Column({nullable:true})
    lat : number
    @ManyToOne(() => User, user=> user.owner_homes ,{nullable : true})
    @JoinColumn({name : "owner_id"})
    owner : User;
    @OneToMany(() => HomeMember, (home_member) => home_member.home)
    members : HomeMember[];
    @OneToMany(() => Room , room => room.home , { cascade: ['insert', 'update'] })
    rooms : Room[];
}

