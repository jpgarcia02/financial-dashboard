import { Module } from '@nestjs/common';
import { StatisticsController } from './statistics.controller';
import { StatisticsService } from './statistics.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from 'src/categories/entities/category.entity';
import { Transaction } from 'src/transactions/entities/transaction.entity';

@Module({
  imports:[TypeOrmModule.forFeature([Category,Transaction])],
  controllers: [StatisticsController],
  providers: [StatisticsService],
  exports:[StatisticsService]
})
export class StatisticsModule {}
