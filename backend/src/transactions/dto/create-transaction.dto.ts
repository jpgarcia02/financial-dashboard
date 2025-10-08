import { IsBoolean, IsEnum, IsNumber, IsOptional, IsString, IsUUID, Min, IsDateString } from "class-validator";
import { RecurringType, TransactionType } from "../entities/transaction.entity";
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTransactionDto {

    @ApiProperty({ example: 12.5, description: 'Monto de la transacción' })
    @IsNumber()
    @Min(0.001)
    amount: number;

    @ApiPropertyOptional({ example: 'Compra en supermercado', description: 'Descripción opcional' })
    @IsString()
    @IsOptional()
    description: string;

    @ApiProperty({ enum: TransactionType, description: 'Tipo de transacción: INCOME o EXPENSE' })
    @IsEnum(TransactionType)
    type: TransactionType;

    @ApiPropertyOptional({ example: 'uuid-de-categoria', description: 'ID de la categoría asociada (opcional)' })
    @IsUUID()
    @IsOptional()
    categoryId?: string;

    @IsBoolean()
    @IsOptional()
    isRecurring: boolean;

    @IsEnum(RecurringType)
    @IsOptional()
    recurringType: RecurringType;

    @ApiProperty({ example: '2025-10-08T00:00:00Z', description: 'Fecha de la transacción en formato ISO 8601' })
    @IsDateString()
    date: string;
}

