import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsDateString, IsInt, IsOptional, Max, Min } from "class-validator";

export class MonthsQueryDto {

    @IsOptional()
    @IsInt()
    @Min(1)
    @Max(24)
    @Type(() => Number)
    @ApiProperty({ example: 6, description: 'Número de meses a analizar', default: 6, minimum: 1, maximum: 24 })
    months?: number = 6



}