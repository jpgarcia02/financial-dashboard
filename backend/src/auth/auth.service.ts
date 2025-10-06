import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Registro de usuario
   */
  async register(registerDto: RegisterDto) {
    // 1️⃣ Verificar si ya existe el email
    const existingUser = await this.usersService
      .findOneByEmail(registerDto.email)
      .catch(() => null);

    if (existingUser) {
      throw new ConflictException('El email que ingresaste ya existe');
    }

    // 2️⃣ Crear el usuario (UsersService ya hashea la contraseña)
    const user = await this.usersService.create(registerDto);

    // 3️⃣ Generar tokens
    const tokens = await this.getTokens(user.id, user.email);

    // 4️⃣ (Opcional) Guardar hash del refresh token
    // await this.usersService.updateRefreshTokenHash(user.id, tokens.refresh_token);

    // 5️⃣ Retornar tokens + datos del usuario
    return {
      user,
      ...tokens,
    };
  }

  /**
   * Inicio de sesión
   */
  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // 1️⃣ Buscar el usuario (sin lanzar error si no existe)
    const userRecord = await this.usersService
      .findOneByEmail(email)
      .catch(() => null);

    if (!userRecord) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // ⚠️ Necesitamos el password para comparar (ajuste si tu método lo oculta)
    const user = await (this.usersService as any).userRepository.findOne({
      where: { email },
    });

    // 2️⃣ Comparar contraseña
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // 3️⃣ Generar tokens
    const tokens = await this.getTokens(user.id, user.email);

    // 4️⃣ (Opcional) Guardar hash del refresh token
    // await this.usersService.updateRefreshTokenHash(user.id, tokens.refresh_token);

    // 5️⃣ Retornar
    const { password: _, ...userData } = user;
    return { user: userData, ...tokens };
  }

  /**
   * Refrescar el access token
   */
  async refreshToken(refreshTokenDto: RefreshTokenDto) {
    const { refreshToken } = refreshTokenDto;

    try {
      // 1️⃣ Verificar el refresh token
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      // 2️⃣ Generar nuevos tokens
      const tokens = await this.getTokens(payload.sub, payload.email);

      // 3️⃣ (Opcional) Guardar nuevo hash de refresh token
      // await this.usersService.updateRefreshTokenHash(payload.sub, tokens.refresh_token);

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
        expiresIn:
          this.configService.get<string>('JWT_EXPIRES_IN') || '15m',
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn:
          this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') || '7d',
      }),
    ]);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }
}
