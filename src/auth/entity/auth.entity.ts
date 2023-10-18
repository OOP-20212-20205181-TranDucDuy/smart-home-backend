import { User } from "../../user/entities/user.entity";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Auth{
    @PrimaryGeneratedColumn("increment")
    id : number;
    @Column()
    refresh_token : string;
    @Column()
    is_used : boolean;
    @ManyToOne(() => User , (user) => user.auths)
    user : User;
}