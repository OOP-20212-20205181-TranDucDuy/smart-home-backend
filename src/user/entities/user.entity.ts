import { Auth } from "../../auth/entity/auth.entity";
import { Role, UserStatus } from "../../constant/enum";
// import { hashPassword } from "src/utils/bcrypts.utils";
import { AfterInsert, BeforeInsert, Column, Entity, ManyToMany, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { OTP } from "./otp.entity";
import { Profile } from "./profile.entity";
import { profile } from "console";
import { Home } from "src/home/entities/home.entity";


@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id : number;
    @Column({unique : true})
    email : string;
    @Column()
    password : string
    @Column({default : false})
    isActive : boolean;
    @Column({default : UserStatus.OFF})
    status : UserStatus
    @Column()
    roles : Role

    // @BeforeInsert()
    // async hash() {
    //     this.password = await hashPassword(this.password);
    // }
    
    @OneToMany(() => OTP, (otp) => otp.user)
    otps : OTP[]
    @OneToMany(() => Auth, (auth) => auth.user)
    auths : Auth[];
    @OneToOne(() => Profile , (profile) => profile.user)
    profile : Profile
    @ManyToMany(() => Home, (home) => home.guests)
    homes : Home[]
    @OneToMany(() => Home,(home) => home.owner)
    owner_homes : Home[]
}
