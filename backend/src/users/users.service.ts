import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) 
    private readonly userRepository: Repository<User>
  ) {}

  async create(createUserDto: CreateUserDto) {
    const { email, password, ...rest } = createUserDto;

    // Verificar si el correo ya existe
    const existingUser = await this.userRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new ConflictException('El correo ya está registrado');
    }

    // Hashear la contraseña
    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = this.userRepository.create({
      ...rest,
      email,
      password: passwordHash,
    });

    const savedUser = await this.userRepository.save(newUser);

    // Retornar sin contraseña
    const { password: _, ...noPassword } = savedUser;
    return noPassword;
  }

  async findAll() {
    const users = await this.userRepository.find();
    
    // Remover contraseñas de todos los usuarios
    return users.map(user => {
      const { password, ...noPassword } = user;
      return noPassword;
    });
  }

  async findOneById(id: string) {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException(`Usuario con id ${id} no encontrado`);
    }

    const { password, ...noPassword } = user;
    return noPassword;
  }

  async findOneByEmail(email: string) {
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      throw new NotFoundException(`Usuario con email ${email} no encontrado`);
    }

    const { password, ...noPassword } = user;
    return noPassword;
  }

  // ✅ NUEVO: Método para obtener usuario CON contraseña (solo para auth)
  async findOneByEmailWithPassword(email: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      throw new NotFoundException(`Usuario con email ${email} no encontrado`);
    }

    return user; // Retorna con password para comparar en login
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.userRepository.findOne({ where: { id } });
    
    if (!user) {
      throw new NotFoundException(`Usuario con id ${id} no encontrado`);
    }

    // Si viene contraseña, hashearla
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    // Merge de cambios
    Object.assign(user, updateUserDto);

    const savedUser = await this.userRepository.save(user);

    const { password, ...noPassword } = savedUser;
    return noPassword;
  }

  async remove(id: string) {
    const user = await this.userRepository.findOne({ where: { id } });
    
    if (!user) {
      throw new NotFoundException(`Usuario con id ${id} no encontrado`);
    }

    await this.userRepository.remove(user);
    
    return { message: 'Usuario eliminado exitosamente' };
  }
}