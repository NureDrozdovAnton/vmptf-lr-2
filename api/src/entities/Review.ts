import {
    Column,
    CreateDateColumn,
    Entity,
    JoinTable,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from "typeorm";
import User from "./User";
import Course from "./Course";

@Entity()
export default class Review {
    @PrimaryGeneratedColumn("uuid")
    declare id: string;

    @Column({ type: "int" })
    declare rating: number;

    @Column({ type: "text" })
    declare comment: string;

    @Column({ type: "uuid" })
    declare userId: string;

    @ManyToOne(() => User)
    @JoinTable({ joinColumn: { name: "userId", referencedColumnName: "id" } })
    declare user: User;

    @Column({ type: "uuid" })
    declare courseId: string;

    @ManyToOne(() => Course)
    @JoinTable({ joinColumn: { name: "courseId", referencedColumnName: "id" } })
    declare course: Course;

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
