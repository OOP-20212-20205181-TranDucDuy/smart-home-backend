import { Auth } from "../../auth/entity/auth.entity";
import { Role, UserStatus } from "../../constant/enum";
// import { hashPassword } from "src/utils/bcrypts.utils";
import { AfterInsert, BeforeInsert, Column, Entity, ManyToMany, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { OTP } from "./otp.entity";
import { Profile } from "./profile.entity";
import { profile } from "console";
import { Home } from "src/home/entities/home.entity";
import { UUID } from "crypto";
import { HomeMember } from "src/home/entities/home_member.entity";
import { DeviceToken } from "src/auth/entity/deviceToken.entity";
import { Notification} from "src/notification/entities/notification.entity";
@Entity()
export class User {
    @PrimaryGeneratedColumn("uuid")
    id : UUID;
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
    
    @OneToMany(() => OTP, (otp) => otp.user , { cascade: true, onDelete: 'CASCADE' })
    otps : OTP[]
    @OneToMany(() => Auth, (auth) => auth.user , { cascade: true, onDelete: 'CASCADE' })
    auths : Auth[];
    @OneToOne(() => Profile , (profile) => profile.user , { cascade: true, onDelete: 'CASCADE' })
    profile : Profile
    @OneToMany(() => HomeMember, (home_member) => home_member.user , { cascade: true, onDelete: 'CASCADE' })
    joined_homes : HomeMember[];
    @OneToMany(() => Home,(home) => home.owner , { cascade: true, onDelete: 'CASCADE' })
    owner_homes : Home[]
    @OneToMany(() => DeviceToken, (deviceToken) => deviceToken.user,{nullable : true  ,  cascade: true, onDelete: 'CASCADE' })
    deviceTokens : DeviceToken[];
    @OneToMany(() => Notification, (notification) => notification.user_receive)
    notifications : Notification[];
}
