import { User } from "src/users/entities/user.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";


export enum TransactionType {
    INCOME = 'INCOME',
    EXPENSE = 'EXPENSE'
}

export enum RecurringType {
    DAILY = 'DAILY',
    WEEKLY = 'WEEKLY',
    MONTHLY = 'MONTHLY',
    YEARLY = 'YEARLY'


}



@Entity()
export class Transaction {

    @PrimaryGeneratedColumn('uuid')
        id: string
    
        
    
        @Column({type:'decimal',precision:10,scale:2})
        amount: number
        
        @Column({nullable: true,type:'text'})
        description?: string
    
        @Column({select: false})
        password:string 

        @Column({ type: 'timestamp' })
        date: Date

        @Column({type:'enum',enum:TransactionType})
        type: TransactionType

        @Column({default:false})
        isRecurring: boolean

        @Column({type:'enum',enum:RecurringType,nullable:true})
        recurringType: RecurringType|null

        @Column()
        userId: string;

        @ManyToOne(() => User, (user) => user.transactions, { onDelete: 'CASCADE' })
        @JoinColumn({ name: 'userId' })
        user: User;


    
        
}
