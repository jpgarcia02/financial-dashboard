import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>
  ){}
  
  
 async create(createUserDto: CreateUserDto) {
  const { email, password, ...rest } = createUserDto;

  // 1. Verificar si el correo ya existe
  const existingUser = await this.userRepository.findOne({ where: { email } });
  if (existingUser) {
    throw new ConflictException('El correo ya está registrado');
  }

  // 2. Hashear la contraseña
  const passwordHash = await bcrypt.hash(password, 10);

  const newUser = {
    ...rest,
    email,
    password: passwordHash, 
  };

  
  const savedUser = await this.userRepository.save(newUser);

  const { password: _, ...noPassword } = savedUser;
  return noPassword;
}

  async findAll() {
    return await this.userRepository.find() ;
  }

   async findOneById(id: string) {
    // Buscar el usuario por id
    const user = await this.userRepository.findOne({ where: { id } });
 
    if (!user) {
      throw new NotFoundException(`Usuario con id ${id} no encontrado`);
    }
    const { password, ...noPassword } = user;

    return noPassword;
  }

   async findOneByEmail(email: string) {
    // Buscar el usuario por email
    const user = await this.userRepository.findOne({ where: { email } });

    
    if (!user) {
      throw new NotFoundException(`Usuario con email ${email} no encontrado`);
    }

    
    const { password, ...noPassword } = user;

    return noPassword;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    // Buscar usuario
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`Usuario con id ${id} no encontrado`);
    }

    // Si viene contraseña, hashearla
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    // Actualizar campos permitidos
    const updatedUser = { ...user, ...updateUserDto };

    // Guardar cambios
    const savedUser = await this.userRepository.save(updatedUser);

    
    const { password, ...noPassword } = savedUser;
    return noPassword;
  }

 
  async remove(id: string) {
    // Buscar usuario
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`Usuario con id ${id} no encontrado`);
    }

    // Eliminar usuario
    await this.userRepository.remove(user);

    
    
    return "Usuaario eliminado exitosamente";
  }
}
