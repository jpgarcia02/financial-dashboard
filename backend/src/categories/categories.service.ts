import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { IsNull, Not, Repository } from 'typeorm';
import { Transaction, TransactionType } from 'src/transactions/entities/transaction.entity';
import { ALLOWED_ICONS } from 'src/common/constants/material-icons.constant';
import { NotFoundError } from 'rxjs';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category) private readonly categoryRepository: Repository<Category>,
    @InjectRepository(Transaction) private readonly transactionRepository: Repository<Transaction>
  ){}
  async createDefaults(userId: string) {
  const defaultCategories = [
    { name: "SALARIO", type: TransactionType.INCOME, color: "#4CAF50", icon: "attach_money" },
    { name: "INVERSIONES", type: TransactionType.INCOME, color: "#2196F3", icon: "trending_up" },
    { name: "ALIMENTACION", type: TransactionType.EXPENSE, color: "#FF9800", icon: "restaurant" },
    { name: "TRANSPORTE", type: TransactionType.EXPENSE, color: "#9C27B0", icon: "directions_car" },
    { name: "SALUD", type: TransactionType.EXPENSE, color: "#F44336", icon: "local_hospital" },
    { name: "ENTRETENIMIENTO", type: TransactionType.EXPENSE, color: "#E91E63", icon: "movie" },
    { name: "SERVICIOS", type: TransactionType.EXPENSE, color: "#607D8B", icon: "home" },
    { name: "OTROS", type: TransactionType.EXPENSE, color: "#9E9E9E", icon: "more_horiz" },
  ];

  const categoriesWithUser = defaultCategories.map(category => ({
    ...category,
    userId: userId,
  }));

  await this.categoryRepository.save(categoriesWithUser);

  return { message: 'Categorías por defecto creadas correctamente' };
}

  async create(userId: string, dto: CreateCategoryDto) {
  // 1️⃣ Verificar nombre único
  const verifyName = await this.categoryRepository.findOne({
    where: { userId, name: dto.name }
  });

  if (verifyName) {
    throw new ConflictException('Ya tienes una categoría con ese nombre');
  }

  // 2️⃣ Validar formato del color
  const colorRegex = /^#[0-9A-Fa-f]{6}$/;
  
  if (!colorRegex.test(dto.color)) {
    throw new BadRequestException(
      'Color debe ser formato hexadecimal (#RRGGBB)',
    );
  }

  // 3️⃣ Validar ícono permitido
  if (!ALLOWED_ICONS.includes(dto.icon)) {
    throw new BadRequestException('Ícono no válido');
  }

  // 4️⃣ Crear la categoría
  const category = this.categoryRepository.create({
    ...dto,
    userId,
    isDefault: false, // Las creadas por usuario no son predefinidas
  });

  // 5️⃣ Guardar y retornar
  return await this.categoryRepository.save(category);
}


  async findAll(userId:string) {
    const searchCategory = await this.categoryRepository.find({where:{userId},order:{type:'ASC',name:'ASC'}})
    const income = searchCategory.filter(cat => cat.type === 'INCOME');
    const expense = searchCategory.filter(cat => cat.type === 'EXPENSE');

    return { income, expense };
  }

  async findOne(id: string,userId:string) {
    const searchCategory = await this.categoryRepository.findOne({where:{id,userId}})
     if (!searchCategory) {
    throw new NotFoundException('Categoria no encontrada');
  }
  return searchCategory

    
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto,userId:string) {
    const searchCategory = await this.categoryRepository.findOne({where:{id,userId}})
     if (!searchCategory) {
    throw new NotFoundException('Categoria no encontrada');
    
  }
  if(searchCategory?.isDefault === true){
    throw new ForbiddenException('No puedes editar categorías predefinidas')
      
    }

    if(updateCategoryDto.name){
     const duplicatedCategory= await this.categoryRepository.findOne({ where: { userId, name: updateCategoryDto.name, id: Not(id) } })

     if(duplicatedCategory){
      throw new ConflictException('Ya tienes otra categoría con ese nombre');
     }
    }
    if(updateCategoryDto.color){
      const colorRegex = /^#[0-9A-Fa-f]{6}$/;
  
  if (!colorRegex.test(updateCategoryDto.color)) {
    throw new BadRequestException(
      'Color debe ser formato hexadecimal (#RRGGBB)',
    );
  }


    }

    Object.assign(searchCategory, updateCategoryDto);
    await this.categoryRepository.save(searchCategory);
    return searchCategory;
    
  }

  async remove(id: string, userId:string) {

     const searchCategory = await this.categoryRepository.findOne({where:{id,userId}})
     if (!searchCategory) {
    throw new NotFoundException('Categoria no encontrada');}

    if(searchCategory?.isDefault === true){
    throw new ForbiddenException('No puedes eliminar categorías predefinidas')
    }

    const count = await this.transactionRepository.count({ where: { category:{id}, deletedAt: IsNull() } })

    if(count>0){
      throw new BadRequestException('No puedes eliminar una categoría que tiene transacciones asociadas. Elimina las transacciones primero.')
    }
    await this.categoryRepository.remove(searchCategory)
    return { message: 'Categoría eliminada con éxito' };
  }
}
