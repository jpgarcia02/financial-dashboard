import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from "class-validator";

export class CreateUserDto {

    @IsEmail()
    @IsString()
    @IsNotEmpty()
    email:string 

    @IsOptional()
    @IsString()
    name:string 


    @MinLength(8)
    @IsString()
    @IsNotEmpty()
    password: string


}
