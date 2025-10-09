import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { CategoriesService } from 'src/categories/categories.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly categoriesService: CategoriesService
  ) {}

  /**
   * Registro de usuario
   */
  async register(registerDto: RegisterDto) {
    // Verificar si ya existe el email
    const existingUser = await this.usersService
      .findOneByEmail(registerDto.email)
      .catch(() => null);

    if (existingUser) {
      throw new ConflictException('El email ya está registrado');
    }

    // Crear el usuario (UsersService ya hashea la contraseña)
    const user = await this.usersService.create(registerDto);

    await this.categoriesService.createDefaults(user.id);

    // Generar tokens
    const tokens = await this.getTokens(user.id, user.email);

    // Retornar tokens + datos del usuario
    return {
      user,
      ...tokens,
    };
  }

  /**
   * Inicio de sesión - CORREGIDO
   */
  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // ✅ Usar el nuevo método que retorna el usuario CON password
    const user = await this.usersService
      .findOneByEmailWithPassword(email)
      .catch(() => null);

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Comparar contraseña
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Generar tokens
    const tokens = await this.getTokens(user.id, user.email);

    // Retornar sin contraseña
    const { password: _, ...userData } = user;
    
    return { 
      user: userData, 
      ...tokens 
    };
  }

  /**
   * Refrescar el access token
   */
  async refreshToken(refreshTokenDto: RefreshTokenDto) {
    const { refreshToken } = refreshTokenDto;

    try {
      // Verificar el refresh token
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      // Verificar que el usuario aún existe
      const user = await this.usersService
        .findOneById(payload.sub)
        .catch(() => null);

      if (!user) {
        throw new UnauthorizedException('Usuario no encontrado');
      }

      // Generar nuevos tokens
      const tokens = await this.getTokens(payload.sub, payload.email);

      return tokens;
    } catch (error) {
      throw new UnauthorizedException('Refresh token inválido o expirado');
    }
  }

  /**
   * Genera un access token y un refresh token
   */
  private async getTokens(userId: string, email: string) {
    const payload = { sub: userId, email };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_SECRET'),
        expiresIn: this.configService.get<string>('JWT_EXPIRES_IN') || '15m',
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') || '7d',
      }),
    ]);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }
}