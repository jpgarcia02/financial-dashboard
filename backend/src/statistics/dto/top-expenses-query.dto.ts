import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsDateString, IsInt, IsOptional, Max, Min } from "class-validator";

export class TopExpensesqueryDto {

    @IsOptional()
    @IsInt()
    @Min(1)
    @Max(50)
    @Type(() => Number)
    @ApiProperty({ example: 5, description: 'Cantidad de gastos a retornar', default: 5 })
    limit?: number = 5

    @IsOptional()
    @IsDateString()
    @ApiProperty({ example: '2025-01-01', description: 'Fecha de inicio (formato ISO)', required: false })
    startDate

    @IsOptional()
    @IsDateString()
    @ApiProperty({ example: '2025-01-31', description: 'Fecha de fin (formato ISO)', required: false })
    endDate



}