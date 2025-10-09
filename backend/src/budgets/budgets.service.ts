import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from 'src/categories/entities/category.entity';
import { Repository} from 'typeorm';
import { Budget } from './entities/budget.entity';
import { Transaction } from 'src/transactions/entities/transaction.entity';

@Injectable()
export class BudgetsService {

  constructor(
    @InjectRepository(Category) private readonly categoryRepository: Repository<Category>,
    @InjectRepository(Budget) private readonly budgetRepository: Repository<Budget>,
    
    @InjectRepository(Transaction) private readonly transactionRepository: Repository<Transaction>
  ){}
  
  
  async create(userId: string, createBudgetDto: CreateBudgetDto) {
  
  const category = await this.categoryRepository.findOne({ 
    where: { id: createBudgetDto.categoryId, userId } 
  });
  if (!category) {
    throw new NotFoundException('Categoría no encontrada');
  }

  //  Verificar que no haya presupuesto activo en esa categoría
  const existingBudget = await this.budgetRepository.findOne({ 
    where: { userId, categoryId: createBudgetDto.categoryId } 
  });
  if (existingBudget) {
    throw new ConflictException('Ya tienes un presupuesto activo para esta categoría');
  }

  //  Calcular fechas según el periodo
  const now = new Date();
  let startDate: Date;
  let endDate: Date;

  if (createBudgetDto.period === "WEEKLY") {
    const dayOfWeek = now.getDay(); // 0 = domingo
    startDate = new Date(now);
    startDate.setDate(now.getDate() - dayOfWeek);
    endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);
  } else if (createBudgetDto.period === "MONTHLY") {
    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  } else if (createBudgetDto.period === "YEARLY") {
    startDate = new Date(now.getFullYear(), 0, 1);
    endDate = new Date(now.getFullYear(), 11, 31);
  } else {
    throw new BadRequestException('Periodo inválido');
  }

  //  Crear y guardar el presupuesto
  const budget = this.budgetRepository.create({
    userId,
    categoryId: createBudgetDto.categoryId,
    amount: createBudgetDto.amount,
    period: createBudgetDto.period,
    startDate,
    endDate,
  });

  await this.budgetRepository.save(budget);

  //  Retornar presupuesto con categoría incluida
  return this.budgetRepository.findOne({
    where: { id: budget.id },
    relations: ['category'],
  });
}

  async findAll(userId: string) {
  //  Traer todos los presupuestos del usuario con categoría incluida
  const searchBudget = await this.budgetRepository.find({
    where: { userId },
    relations: ['category']
  });

  type BudgetWithStats = Budget & {
  spent: number;
  percentage: number;
  isAlert: boolean;
  remaining: number;
};

  const budgetsWithData: BudgetWithStats[] = [];

  //  Recorrer cada presupuesto
  for (const budget of searchBudget) {
    // 3️⃣ Calcular spent usando QueryBuilder
    const qb = this.transactionRepository.createQueryBuilder('t')
      .where('t.userId = :userId', { userId })
      .andWhere('t.categoryId = :categoryId', { categoryId: budget.categoryId })
      .andWhere('t.type = :type', { type: 'EXPENSE' })
      .andWhere('t.date >= :startDate', { startDate: budget.startDate })
      .andWhere('t.date <= :endDate', { endDate: budget.endDate })
      .andWhere('t.deletedAt IS NULL')
      .select('SUM(t.amount)', 'total');

    const result = await qb.getRawOne();
    const spent = parseFloat(result.total) || 0;

    //  Calcular porcentaje gastado y determinar alerta
    const percentage = parseFloat(((spent / budget.amount) * 100).toFixed(2));
    const isAlert = percentage >= 80;

    //  Guardar presupuesto enriquecido en el array
    budgetsWithData.push({
      ...budget,
      spent,
      percentage,
      isAlert,
      remaining: budget.amount - spent
    });
  }

  //  Retornar array completo
  return budgetsWithData;
}

  async findOne(id: string,userId:string) {

     const searchBudget = await this.budgetRepository.findOne({
    where: { id,userId },
    relations: ['category']
  });

  if(!searchBudget){
    throw new NotFoundException('Presupuesto no encontrado')
  }

  const qb = this.transactionRepository.createQueryBuilder('t')
      .where('t.userId = :userId', { userId })
      .andWhere('t.categoryId = :categoryId', { categoryId: searchBudget.categoryId })
      .andWhere('t.type = :type', { type: 'EXPENSE' })
      .andWhere('t.date >= :startDate', { startDate: searchBudget.startDate })
      .andWhere('t.date <= :endDate', { endDate: searchBudget.endDate })
      .andWhere('t.deletedAt IS NULL')
      .select('SUM(t.amount)', 'total');

    const result = await qb.getRawOne();
    const spent = parseFloat(result.total) || 0;

    const percentage = parseFloat(((spent / searchBudget.amount) * 100).toFixed(2));
    const isAlert = percentage >= 80;
    const remaining = searchBudget.amount - spent;

    return {
  ...searchBudget,
  spent,
  percentage,
  isAlert,
  remaining
};

  }

  update(id: number, updateBudgetDto: UpdateBudgetDto) {
    return `This action updates a #${id} budget`;
  }

  remove(id: number) {
    return `This action removes a #${id} budget`;
  }
}
