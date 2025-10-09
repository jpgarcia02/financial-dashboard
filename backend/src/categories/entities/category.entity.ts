import { Budget } from '../../budgets/entities/budget.entity';
import { Transaction, TransactionType } from '../../transactions/entities/transaction.entity';
import { User } from '../../users/entities/user.entity';
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";



@Entity()
export class Category {

            @PrimaryGeneratedColumn('uuid')
            id: string
        
            
        
            @Column({ type: 'varchar', length: 100 })
            name: string;
            
            @Column({ type: 'enum', enum: TransactionType })
            type: TransactionType;
        
            @Column({ type: 'varchar', length: 7 })
            color: string;

    
            @Column({ type: 'varchar', length: 50 })
            icon: string;

    
            @Column({ default: false })
            isDefault: boolean;

    
            @Column()
            userId: string;

            @ManyToOne(() => User, (user) => user.categories, { onDelete: 'CASCADE' })
            @JoinColumn({ name: 'userId' })
            user: User;

            @OneToMany(() => Transaction, (transaction) => transaction.category)
            transactions: Transaction[];

            @OneToMany(() => Budget, (budget) => budget.category)
            budgets: Budget[];

            @CreateDateColumn()
            createdAt: Date;

            @UpdateDateColumn()
            updatedAt: Date;

            
}
