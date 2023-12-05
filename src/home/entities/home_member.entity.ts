import { UUID } from "crypto";
import { User } from "src/user/entities/user.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Home } from "./home.entity";

@Entity()
export class HomeMember {
    @PrimaryGeneratedColumn("uuid")
    id : UUID;
    @Column({default:false})
    is_joined : boolean;
    @ManyToOne(() => Home,(home) => home.members)
    @JoinColumn({name : "home_id"})
    home : Home
    @ManyToOne(() => User, (user) => user.joined_homes)
    @JoinColumn({name : "user_id"})
    user : User
}