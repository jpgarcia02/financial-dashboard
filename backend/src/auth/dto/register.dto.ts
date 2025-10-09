import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterDto {

    @ApiProperty({ example: 'user@example.com', description: 'Email del nuevo usuario' })
    @IsEmail()
    @IsString()
    email: string;

    @ApiProperty({ example: 'strongPassword123', minLength: 8, description: 'Contraseña del usuario', writeOnly: true })
    @MinLength(8)
    @IsString()
    @IsNotEmpty()
    password: string;

    @ApiPropertyOptional({ example: 'Juan Pérez', description: 'Nombre completo del usuario' })
    @IsOptional()
    @IsString()
    name: string;

}
