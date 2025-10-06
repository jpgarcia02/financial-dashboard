import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from "class-validator";

export class CreateUserDto {

    @IsEmail()
    @IsString()
    @IsNotEmpty()
    email:string 

    @IsOptional()
    @IsString()
    name:string 


    @MinLength(6)
    @IsString()
    @IsNotEmpty()
    password: string


}
