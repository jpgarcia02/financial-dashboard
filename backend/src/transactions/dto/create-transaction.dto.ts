import { IsEnum, IsNumber, IsOptional, IsString, IsUUID, Min } from "class-validator";
import { TransactionType } from "../entities/transaction.entity";
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
}
