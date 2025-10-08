import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsString, IsUUID, IsEnum, IsInt, Min } from 'class-validator';
import { TransactionType } from '../entities/transaction.entity';


export class FilterTransactionDto {
  @ApiPropertyOptional({ type: Number, default: 1, description: 'Page number (starts at 1)' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ type: Number, default: 20, description: 'Items per page' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;

  @ApiPropertyOptional({ type: String, description: 'Filter from this date (ISO string)' })
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiPropertyOptional({ type: String, description: 'Filter until this date (ISO string)' })
  @IsOptional()
  @IsString()
  endDate?: string;

  @ApiPropertyOptional({ type: String, format: 'uuid', description: 'Category UUID to filter' })
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @ApiPropertyOptional({ enum: TransactionType, description: 'Transaction type: INCOME or EXPENSE' })
  @IsOptional()
  @IsEnum(TransactionType)
  type?: TransactionType;

  @ApiPropertyOptional({ type: String, description: 'Search text to query description' })
  @IsOptional()
  @IsString()
  search?: string;
}
