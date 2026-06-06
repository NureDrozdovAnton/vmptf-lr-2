import {
    Column,
    CreateDateColumn,
    Entity,
    JoinTable,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from "typeorm";
import Course from "./Course";

@Entity()
export default class Chapter {
    @PrimaryGeneratedColumn("uuid")
    declare id: string;

    @Column({ type: "uuid" })
    declare courseId: string;

    @ManyToOne(() => Course)
    @JoinTable({ joinColumn: { name: "courseId", referencedColumnName: "id" } })
    declare course: Course;

    @Column({ type: "text" })
    declare title: string;

    @Column({ type: "text" })
    declare description: string;

    @Column({ type: "text" })
    declare image: string;

    @CreateDateColumn({
        type: "timestamp",
        default: () => "CURRENT_TIMESTAMP(6)",
    })
    declare createdAt: Date;

    @UpdateDateColumn({
        type: "timestamp",
        default: () => "CURRENT_TIMESTAMP(6)",
        onUpdate: "CURRENT_TIMESTAMP(6)",
    })
    declare updatedAt: Date;
}
