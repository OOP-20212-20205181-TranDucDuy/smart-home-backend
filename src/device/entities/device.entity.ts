import { UUID } from "crypto";
import { Home } from "src/home/entities/home.entity";
import { Room } from "src/room/entities/room.entity";
import { Column, CreateDateColumn, Entity, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Status } from "./status.entity";

@Entity()
export class Device {
    @PrimaryGeneratedColumn("uuid")
    id: UUID;
    @Column()
    name: string;x
    @Column({nullable : true})
    biz_type: number;
    @Column({nullable : true})
    time_zone: String;
    @Column({nullable : true})
    ip : string;
    @Column({nullable : true})
    local_key : string;
    @Column({nullable : true})
    sub : boolean;
    @Column({nullable : true})
    model : string;
    @CreateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)" })
    created_at: Date;
    @UpdateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)", onUpdate: "CURRENT_TIMESTAMP(6)" })
    updated_at: Date;
    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)" })
    active_time : Date;
    @Column({nullable: true})
    product_id : string;
    @Column({nullable: true})
    product_name : string;
    @Column({nullable: true})
    product_category : string;
    @Column({default: false})
    online : boolean;
    @Column({nullable: true})
    icon : string;
    @OneToMany(() => Device, (device) => device.sub_device,{nullable : true})
    sub_device : Device[];
    @ManyToMany(() => Status ,(status) => status.devices)
    @JoinTable()
    status : Status[]
    @ManyToOne(() => Room, (room) => room.devices,{nullable : true ,onDelete : 'CASCADE'})
    room : Room;
}
