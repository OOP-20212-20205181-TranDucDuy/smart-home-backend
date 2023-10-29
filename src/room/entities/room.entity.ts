import { Home } from "src/home/entities/home.entity";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Room {
    @PrimaryGeneratedColumn()
    id : number;
    @Column()
    floor : number;
    @Column()
    name : string;
    @ManyToOne(() => Home, (home) => home.devices,{nullable : true})
    home : Home;
}
