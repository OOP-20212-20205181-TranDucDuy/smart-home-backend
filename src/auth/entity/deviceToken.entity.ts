import { User } from "src/user/entities/user.entity";
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class DeviceToken {
    @PrimaryGeneratedColumn('increment')
    id : number;
    @Column({nullable : false})
    deviceToken : string
    @Column({default : false})
    isDelete : boolean;
    @ManyToOne(() => User,(user) => user.deviceTokens)
    user : User;    
}
