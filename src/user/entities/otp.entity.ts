import { BeforeInsert, Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entity";
import { createOTP } from "src/utils/ids";
@Entity()
export class OTP{
    @PrimaryGeneratedColumn()
    id : number;
    @Column()
    code : string;
    @Column()
    is_used : boolean
    @ManyToOne(() => User , (user) => user.otps)
    user : User  
    @BeforeInsert()
    async save() {
        this.code = createOTP();
    }
}