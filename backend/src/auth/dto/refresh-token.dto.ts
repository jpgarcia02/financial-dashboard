
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RefreshTokenDto {

    @IsString()
    @IsNotEmpty()
    refreshToken:string 
}
