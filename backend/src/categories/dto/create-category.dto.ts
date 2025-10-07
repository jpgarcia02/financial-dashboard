import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreateCategoryDto {
	@ApiProperty({ example: 'Transporte', description: 'Nombre de la categoría' })
	@IsString()
	name: string;

	@ApiProperty({ example: 'Gastos diarios de transporte', description: 'Descripción opcional', required: false })
	@IsOptional()
	@IsString()
	description?: string;
}
