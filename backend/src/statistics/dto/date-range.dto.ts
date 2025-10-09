import { ApiProperty } from "@nestjs/swagger";
import { IsDateString, IsOptional } from "class-validator";

export class DateRangeDto {

    @IsOptional()
    @IsDateString()
    @ApiProperty({ example: '2025-01-01', description: 'Fecha de inicio (formato ISO)', required: false })
    startDate

    @IsOptional()
    @IsDateString()
    @ApiProperty({ example: '2025-01-31', description: 'Fecha de fin (formato ISO)', required: false })
    endDate



}