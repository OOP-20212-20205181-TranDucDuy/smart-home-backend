import { Home } from "src/home/entities/home.entity";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Device {
    @PrimaryGeneratedColumn()
    id: number;
    @Column()
    name: string;
    @Column()
    description: string;
    @Column()
    status: boolean;
    @Column()
    isConnecting : boolean;
    @ManyToOne(() => Home, (home) => home.devices,{nullable : true})
    home : Home;
}
