import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateBudgetDto {
	@ApiProperty({ example: 500, description: 'Cantidad presupuestada para la categoría' })
	@IsNumber()
	@Min(0)
	amount: number;

	@ApiProperty({ example: 'Ahorros', description: 'Nombre o título del presupuesto' })
	@IsString()
	name: string;

	@ApiProperty({ example: 'uuid-de-categoria-opcional', description: 'ID de la categoría asociada', required: false })
	@IsOptional()
	@IsString()
	categoryId?: string;
}
