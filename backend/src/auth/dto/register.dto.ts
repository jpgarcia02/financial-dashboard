import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from "class-validator";

export class RegisterDto {

    @IsEmail()
    @IsString()
    email:string 

    
    @MinLength(8)
    @IsString()
    @IsNotEmpty()
    password:string 

    @IsOptional()
    @IsString()
    name:string 

}
