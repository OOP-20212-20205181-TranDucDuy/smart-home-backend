import { User } from "src/user/entities/user.entity";
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class Notification {
    @PrimaryGeneratedColumn('increment')
    id : number;
    @Column({nullable : true})
    title : string;
    @Column({nullable : true})
    body : string
    @Column({default : false})
    isReaded : boolean;
    @Column({nullable : true})
    type : string;
    @CreateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)" })
    created_at: Date;
    @UpdateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)", onUpdate: "CURRENT_TIMESTAMP(6)" })
    updated_at: Date;
    @ManyToOne(() => User, (user) => user.notifications)
    user_receive : User;
}
