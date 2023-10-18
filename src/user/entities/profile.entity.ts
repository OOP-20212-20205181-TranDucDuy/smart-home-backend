import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entity";

@Entity()
export class Profile {
    @PrimaryGeneratedColumn()
    id : number;
    @Column({nullable : true})
    name : string
    @Column({nullable : true})
    birth : Date
    @Column({nullable : true})
    address : string
    @OneToOne(() => User , (user) => user.profile)
    @JoinColumn({name : "user_id"})
    user : User
}