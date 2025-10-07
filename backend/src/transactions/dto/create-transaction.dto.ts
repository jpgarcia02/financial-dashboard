import { IsEnum, IsNumber, IsOptional, IsString, IsUUID, Min } from "class-validator";
import { TransactionType } from "../entities/transaction.entity";

export class CreateTransactionDto {

    @IsNumber()
    @Min(0.001)
    amount: number

    @IsString()
    @IsOptional()
    description:string

    @IsEnum(TransactionType)
    type: TransactionType

    @IsUUID()
    @IsOptional()
    categoryId
}
