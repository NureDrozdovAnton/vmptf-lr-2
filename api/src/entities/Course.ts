import {
    Column,
    CreateDateColumn,
    Entity,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from "typeorm";
import Review from "./Review";

@Entity()
export default class Course {
    @PrimaryGeneratedColumn("uuid")
    declare id: string;

    @Column({ type: "text" })
    declare title: string;

    @Column({ type: "text" })
    declare description: string;

    @Column({ type: "text" })
    declare image: string;

    @OneToMany(() => Review, (review) => review.course)
    declare reviews: Review[];

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
