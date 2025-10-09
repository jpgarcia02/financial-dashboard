import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@ApiTags('Auth') // 📚 Agrupa los endpoints bajo la categoría "Auth"
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // 🟢 Registro
  @Post('register')
  @ApiOperation({ summary: 'Registrar un nuevo usuario' })
  @ApiResponse({ status: 201, description: 'Usuario registrado exitosamente.' })
  @ApiResponse({ status: 400, description: 'Datos inválidos o usuario ya existente.' })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  // 🔵 Login
  @Post('login')
  @ApiOperation({ summary: 'Iniciar sesión de usuario' })
  @ApiResponse({ status: 200, description: 'Login exitoso. Devuelve tokens de acceso.' })
  @ApiResponse({ status: 401, description: 'Credenciales inválidas.' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  // 🟣 Refrescar tokens
  @Post('refresh')
  @ApiOperation({ summary: 'Refrescar token de acceso usando un refresh token' })
  @ApiResponse({ status: 200, description: 'Nuevo token de acceso generado.' })
  @ApiResponse({ status: 401, description: 'Refresh token inválido o expirado.' })
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshToken(refreshTokenDto);
  }
}
