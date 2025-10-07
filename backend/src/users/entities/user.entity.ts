import { Transaction } from "src/transactions/entities/transaction.entity";
import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn} from "typeorm";

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

    @OneToMany(() => Transaction, (transaction) => transaction.user)
    transactions: Transaction[];
}
