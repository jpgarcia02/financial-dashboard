import { ConflictException, Injectable } from '@nestjs/common';
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

  findAll() {
    return `This action returns all users`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
