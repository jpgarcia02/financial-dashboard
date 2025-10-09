import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';
import { Category } from './entities/category.entity';
import { Transaction } from 'src/transactions/entities/transaction.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Category,Transaction])],
  controllers: [CategoriesController],
  providers: [CategoriesService],
  exports:[TypeOrmModule,CategoriesService]
})
export class CategoriesModule {}