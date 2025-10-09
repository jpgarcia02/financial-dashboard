import { ApiProperty } from "@nestjs/swagger";
import { IsDateString, IsOptional } from "class-validator";

export class ComparePeriodDto {

    
    @IsDateString()
   @ApiProperty({ example: '2025-01-01', description: 'Fecha de inicio del período actual' })
    currentStart

    
    @IsDateString()
    @ApiProperty({ example: '2025-01-31', description: 'Fecha de fin del período actual' })
    currentEnd


}