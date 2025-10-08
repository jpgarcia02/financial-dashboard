import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';
import { ALLOWED_ICONS } from 'src/common/constants/material-icons.constant';
import { TransactionType } from 'src/transactions/entities/transaction.entity';

export class CreateCategoryDto {
	@ApiProperty({ example: 'Alimentación' })
	@IsString()
	@MinLength(2)
	@MaxLength(50)
	name: string;

	@ApiProperty({ example: 'Gastos diarios de transporte', description: 'Descripción opcional', required: false })
	@IsOptional()
	@IsString()
	description?: string;

	@ApiProperty({ enum: TransactionType, example: 'EXPENSE' })
	@IsEnum(TransactionType)
	type: TransactionType


	@IsString()
	@Matches(/^#[0-9A-F]{6}$/i)
	@ApiProperty({ example: '#FF9800', description: 'Color en formato hexadecimal' })
	color

	@IsString()
	@ApiProperty({ example: 'restaurant', description: 'Nombre del ícono de Material Icons' ,enum: ALLOWED_ICONS,})
	
	icon

	
}
