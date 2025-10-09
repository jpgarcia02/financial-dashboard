import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { BudgetPeriod } from '../entities/budget.entity';

export class CreateBudgetDto {
	@ApiProperty({ example: 500, description: 'Cantidad presupuestada para la categoría' })
	@IsNumber()
	@Min(0.01)
	amount: number;

	@ApiProperty({ example: 'Ahorros', description: 'Nombre o título del presupuesto' })
	@IsString()
	name: string;

	@ApiProperty({ example: 'uuid-de-categoria-opcional', description: 'ID de la categoría asociada', required: false })
	@IsOptional()
	@IsString()
	categoryId?: string;


	@IsEnum(BudgetPeriod)
	@ApiProperty({ enum: BudgetPeriod, example: 'MONTHLY' })
	period
}
