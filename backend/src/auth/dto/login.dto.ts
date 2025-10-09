
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {

    @ApiProperty({ example: 'user@example.com', description: 'Email del usuario' })
    @IsEmail()
    @IsString()
    email: string;

    @ApiProperty({ example: 'strongPassword123', minLength: 8, description: 'Contraseña del usuario', writeOnly: true })
    @MinLength(8)
    @IsString()
    @IsNotEmpty()
    password: string;
}
