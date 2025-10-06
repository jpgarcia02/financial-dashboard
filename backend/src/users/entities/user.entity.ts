import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class User {

    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column({unique: true})
    email: string

    @Column({nullable: true})
    name:string 

    @Column({select: false})
    password:string 

    @CreateDateColumn()
    createdAt: Date
}
