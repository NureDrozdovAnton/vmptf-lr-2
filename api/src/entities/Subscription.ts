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
export default class Subscription {
    @PrimaryGeneratedColumn("uuid")
    declare id: string;

    @Column("uuid", { nullable: false })
    declare userId: string;

    @Column("uuid", { nullable: false })
    declare courseId: string;

    @ManyToOne(() => User)
    @JoinTable({ joinColumn: { name: "userId", referencedColumnName: "id" } })
    declare user: User;

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
