import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from "typeorm";

@Entity()
export default class User {
    @PrimaryGeneratedColumn("uuid")
    declare id: string;

    @Column("text", { nullable: false, unique: true })
    declare email: string;

    @Column("text", { nullable: false })
    declare name: string;

    @Column("text", { nullable: false })
    declare password: string;

    @Column("text", { nullable: false })
    declare salt: string;

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
