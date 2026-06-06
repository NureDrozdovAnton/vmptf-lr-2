import {
    Column,
    CreateDateColumn,
    Entity,
    JoinTable,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from "typeorm";
import Chapter from "./Chapter";
import User from "./User";

@Entity()
export default class UserProgress {
    @PrimaryGeneratedColumn("uuid")
    declare id: string;

    @Column({ type: "uuid" })
    declare userId: string;

    @Column({ type: "uuid" })
    declare chapterId: string;

    @ManyToOne(() => User)
    @JoinTable({ joinColumn: { name: "userId", referencedColumnName: "id" } })
    declare user: User;

    @ManyToOne(() => Chapter)
    @JoinTable({
        joinColumn: { name: "chapterId", referencedColumnName: "id" },
    })
    declare chapter: Chapter;

    @Column({ type: "timestamp" })
    declare startedAt: Date;

    @Column({ type: "timestamp", nullable: true })
    declare completedAt: Date | null;
}
