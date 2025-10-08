import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository
  
} from 'typeorm';
import { Category } from 'src/categories/entities/category.entity';
import { Transaction } from './entities/transaction.entity';
import { FilterTransactionDto } from './dto/filter-transaction.dto';
import { isNull } from 'util';


@Injectable()
export class TransactionsService {

  constructor(
    @InjectRepository(Transaction) private readonly transactionRepository: Repository<Transaction>,
    @InjectRepository(Category) private readonly categoryRepository: Repository<Category>
  ){

  }
  async create(userId: string, createTransactionDto: CreateTransactionDto) {
  //  Si viene categoryId, validar la categoría
  if (createTransactionDto.categoryId) {
    const category = await this.categoryRepository.findOne({
      where: { id: createTransactionDto.categoryId }
    });

    // Verificar que existe
    if (!category) {
      throw new NotFoundException('Categoría no encontrada');
    }

    // Verificar que pertenece al usuario
    if (category.userId !== userId) {
      throw new BadRequestException('Esta categoría no te pertenece');
    }

    // Verificar que el tipo coincide
    if (category.type !== createTransactionDto.type) {
      throw new BadRequestException(
        `No puedes usar una categoría de tipo ${category.type} para una transacción de tipo ${createTransactionDto.type}`
      );
    }
  }

  
  const transactionDate = new Date(createTransactionDto.date);
  const today = new Date();
  
  if (transactionDate > today) {
    throw new BadRequestException('La fecha no puede ser futura');
  }

  // 3️⃣ Si es recurrente, validar que tenga recurringType
  if (createTransactionDto.isRecurring && !createTransactionDto.recurringType) {
    throw new BadRequestException('Las transacciones recurrentes deben tener un tipo de recurrencia');
  }

  // 4️⃣ Crear la transacción
  const transaction = this.transactionRepository.create({
    ...createTransactionDto,
    userId,
    date: transactionDate
  });

  // 5️⃣ Guardar en base de datos
  const savedTransaction = await this.transactionRepository.save(transaction);

  // 6️⃣ Retornar con la categoría incluida
  return this.transactionRepository.findOne({
    where: { id: savedTransaction.id },
    relations: ['category']
  });
}

   
  async findAll(userId: string, filters: FilterTransactionDto) {
  const page = filters.page ?? 1;
  let limit = filters.limit ?? 20;
  const maxLimit = 100;
  if (limit > maxLimit) limit = maxLimit;
  if (page < 1 || limit < 1) throw new BadRequestException("Page y limit deben de ser mayores a 1");

  const skip = (page - 1) * limit;

  let startDateObj: Date | undefined;
  let endDateObj: Date | undefined;

  if (filters.startDate) {
    startDateObj = new Date(filters.startDate);
    if (isNaN(startDateObj.getTime())) throw new BadRequestException('startDate inválida');
    startDateObj.setHours(0, 0, 0, 0);
  }

  if (filters.endDate) {
    endDateObj = new Date(filters.endDate);
    if (isNaN(endDateObj.getTime())) throw new BadRequestException('endDate inválida');
    endDateObj.setHours(23, 59, 59, 999);
  }

  if (startDateObj && endDateObj && startDateObj > endDateObj) {
    throw new BadRequestException('La fecha inicial no puede ser posterior a la fecha final');
  }

  const categoryIdVar = filters.categoryId ?? undefined;
  const typeVar = filters.type ?? undefined;

  let searchParam: string | undefined;
  const searchValue = filters.search?.trim();
  if (searchValue && searchValue.length > 0) {
    const escapedSearch = searchValue.replace(/[%_]/g, '\\$&');
    searchParam = `%${escapedSearch}%`;
  }

  const qb = this.transactionRepository.createQueryBuilder('transaction');
  qb.leftJoinAndSelect('transaction.category', 'category')
    .where('transaction.userId = :userId', { userId })
    .andWhere('transaction.deletedAt IS NULL');

  if (startDateObj) qb.andWhere('transaction.date >= :startDate', { startDate: startDateObj });
  if (endDateObj) qb.andWhere('transaction.date <= :endDate', { endDate: endDateObj });
  if (categoryIdVar) qb.andWhere('transaction.categoryId = :categoryId', { categoryId: categoryIdVar });
  if (typeVar) qb.andWhere('transaction.type = :type', { type: typeVar });
  if (searchParam) qb.andWhere('transaction.description ILIKE :search', { search: searchParam });

  qb.orderBy('transaction.date', 'DESC')
    .skip(skip)
    .take(limit);

  const [data, total] = await qb.getManyAndCount();

  return {
    data,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
  }


  

  async findOne(id: string,userId:string) {
      const qb = this.transactionRepository.createQueryBuilder('transaction')
      .where('transaction.id = :id',{id})
      .andWhere('transaction.userId = :userId', { userId })  
      .andWhere('transaction.deletedAt IS NULL')
      .leftJoinAndSelect('transaction.category','category')

      const transaction = await qb.getOne()

      if(!transaction){
        throw new NotFoundException('Transacción no encontrada')
      }
      return transaction
  }

  async update(id: string, updateTransactionDto: UpdateTransactionDto, userId: string) {
  const transaction = await this.findOne(id, userId);

  if (updateTransactionDto.categoryId) {
    const category = await this.categoryRepository.findOne({
      where: { id: updateTransactionDto.categoryId, userId }
    });

    if (!category) {
      throw new NotFoundException('Categoría no encontrada');
    }

    transaction.category = category;
  }

  if (updateTransactionDto.date) {
    const newDate = new Date(updateTransactionDto.date);
    if (isNaN(newDate.getTime())) {
      throw new BadRequestException('Fecha inválida');
    }
    if (newDate > new Date()) {
      throw new BadRequestException('La fecha no puede ser futura');
    }

    transaction.date = newDate;
  }

  Object.assign(transaction, updateTransactionDto);

  const updatedTransaction = await this.transactionRepository.save(transaction);
  return updatedTransaction;
}

  async remove(id: string,userId:string) {
    const transaction = await this.findOne(id, userId);
    transaction.deletedAt = new Date()
     await this.transactionRepository.save(transaction)
     return { message: 'Transacción eliminada correctamente' };
    
  }
}
