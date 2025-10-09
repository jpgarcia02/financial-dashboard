import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from 'src/categories/entities/category.entity';
import { Transaction } from 'src/transactions/entities/transaction.entity';
import { Repository } from 'typeorm';
import { ExpenseByCategory, MonthlyTrendData, SavingsTrendData, TopExpense } from './interfaces/statistics.interface';

@Injectable()
export class StatisticsService {
    constructor(
        @InjectRepository(Transaction)private readonly transactionRepository: Repository<Transaction>,
        @InjectRepository(Category)private readonly categoryRepository: Repository<Category>
    ){}
    
    //Calcula gastos agrupados por categoría para gráfico circular
   async getExpensesByCategory(userId: string, startDate?: string, endDate?: string) {
  //  Construir el QueryBuilder
  const qb = this.transactionRepository.createQueryBuilder('t')
  qb.where('t.userId = :userId', { userId })
    .andWhere('t.type = :type', { type: 'EXPENSE' })
    .andWhere('t.deletedAt IS NULL')

  if (startDate) qb.andWhere('t.date >= :startDate', { startDate })
  if (endDate) qb.andWhere('t.date <= :endDate', { endDate })

  qb.leftJoinAndSelect('t.category', 'c')
    .select('c.id', 'categoryId')
    .addSelect('c.name', 'categoryName')
    .addSelect('c.color', 'categoryColor')
    .addSelect('c.icon', 'categoryIcon')
    .addSelect('SUM(t.amount)', 'total')
    .addSelect('COUNT(t.id)', 'transactionCount')
    .groupBy('c.id, c.name, c.color, c.icon')
    .orderBy('total', 'DESC')

  //  Ejecutar la query
  const results = await qb.getRawMany()

  // Calcular el total general
  let grandTotal = 0
  for (const result of results) {
    const total = parseFloat(result.total)
    if (!isNaN(total)) {
      grandTotal += total
    }
  }

  //  Procesar resultados con porcentajes
  const expensesByCategory: ExpenseByCategory[] = []

  for (const r of results) {
    const total = parseFloat(r.total)
    const transactionCount = parseInt(r.transactionCount)
    const percentage = grandTotal > 0 ? (total / grandTotal) * 100 : 0

    const expense: ExpenseByCategory = {
      categoryId: r.categoryId,
      categoryName: r.categoryName,
      categoryColor: r.categoryColor,
      categoryIcon: r.categoryIcon,
      total,
      transactionCount,
      percentage
    }

    expensesByCategory.push(expense)
  }

  return expensesByCategory
}

    //Obtiene ingresos, gastos y ahorros de últimos N meses para gráfico de barras
    async getMonthlyTrend(userId: string, months: number = 6){

        const startDate = new Date()
        startDate.setMonth(startDate.getMonth() - months)
        startDate.setDate(1)

        const qb = this.transactionRepository.createQueryBuilder('t')
        qb.where('t.userId = :userId', { userId })
        .andWhere('t.date >= :startDate', { startDate })
        .andWhere('t.deletedAt IS NULL')
        .select("TO_CHAR(t.date, 'YYYY-MM')",'month')
        .addSelect("SUM(CASE WHEN t.type = 'INCOME' THEN t.amount ELSE 0 END)", 'income')
        .addSelect("SUM(CASE WHEN t.type = 'EXPENSE' THEN t.amount ELSE 0 END)", 'expense')
        .groupBy('month')
        .orderBy('month', 'ASC')

        const results = await qb.getRawMany()

        const trendData: MonthlyTrendData[] = []

        for(const result of results){
            const income = parseFloat(result.income)
            const expense = parseFloat(result.expense)

            const savings = income - expense

            const trend: MonthlyTrendData = {

                month: result.month,
                income,
                expense,
                 savings
            }

            trendData.push(trend)
     
        }

        return trendData
    }


    //Calcula ahorro mensual para gráfico de línea
     async getSavingsTrend(userId: string, months: number = 12){
          
        const startDate = new Date()
        startDate.setMonth(startDate.getMonth() - months)
        startDate.setDate(1)

        const qb = this.transactionRepository.createQueryBuilder('t')
        qb.where('t.userId = :userId', { userId })
        .andWhere('t.date >= :startDate', { startDate })
        .andWhere('t.deletedAt IS NULL')
        .select("TO_CHAR(t.date, 'YYYY-MM')",'month')
        .addSelect(
  "SUM(CASE WHEN t.type = 'INCOME' THEN t.amount ELSE 0 END) - SUM(CASE WHEN t.type = 'EXPENSE' THEN t.amount ELSE 0 END)",
  'savings'
)
        .groupBy('month')
        .orderBy('month', 'ASC')

        const results = await qb.getRawMany()

        const savingsTrend: SavingsTrendData[] = []

        for (const result of results){

            const savings = parseFloat(result.savings)

            const trend: SavingsTrendData = {
                month: result.month,
                savings
            }

            savingsTrend.push(trend)
        }

        return savingsTrend


     }

     async getTopExpenses(userId: string, limit: number = 5, startDate?: string, endDate?: string){

        const qb = this.transactionRepository.createQueryBuilder('t')
        qb.where('t.userId = :userId', { userId })
         .andWhere('t.type = :type', { type: 'EXPENSE' })
         .andWhere('t.deletedAt IS NULL')


          if (startDate) qb.andWhere('t.date >= :startDate', { startDate })
         if (endDate) qb.andWhere('t.date <= :endDate', { endDate })

             qb.leftJoinAndSelect('t.category', 'c')
             .orderBy('t.amount', 'DESC')
             .limit(limit)


             const results = await qb.getMany()

             const topExpenses: TopExpense[] = []


             for (const r of results) {

                const category = r.category
                const expense: TopExpense = {
                id: r.id,
                amount: r.amount,
                description: r.description ?? '',
                date: r.date,
                categoryName: category ? category.name : 'Sin categoría',
                categoryColor: category ? category.color : '#cccccc',
                categoryIcon: category ? category.icon : 'tag'
                }
                topExpenses.push(expense)
   
            }
            return topExpenses

    }

   async compareWithPreviousPeriod(
  userId: string,
  currentStart: string,
  currentEnd: string
) {
  // 1️⃣ Calcular duración del período actual
  const current = { start: new Date(currentStart), end: new Date(currentEnd) }

  // Diferencia en días (redondeada)
  const duration = Math.round(
    (current.end.getTime() - current.start.getTime()) / (1000 * 60 * 60 * 24)
  )

  // 2️⃣ Calcular el período anterior (mismo rango de días hacia atrás)
  const previous = {
    start: new Date(current.start),
    end: new Date(current.end)
  }

  previous.start.setDate(previous.start.getDate() - duration)
  previous.end.setDate(previous.end.getDate() - duration)

  // 3️⃣ Función auxiliar: obtiene métricas de un período
  const getPeriodMetrics = async (start: Date, end: Date) => {
    const qb = this.transactionRepository.createQueryBuilder('t')

    qb.where('t.userId = :userId', { userId })
      .andWhere('t.date BETWEEN :start AND :end', { start, end })
      .andWhere('t.deletedAt IS NULL')
      .select(
        "SUM(CASE WHEN t.type = 'INCOME' THEN t.amount ELSE 0 END)",
        'income'
      )
      .addSelect(
        "SUM(CASE WHEN t.type = 'EXPENSE' THEN t.amount ELSE 0 END)",
        'expense'
      )

    const result = await qb.getRawOne()

    const income = parseFloat(result?.income) || 0
    const expense = parseFloat(result?.expense) || 0
    const savings = income - expense

    return { income, expense, savings }
  }

  // 4️⃣ Ejecutar ambas consultas en paralelo
  const [currentMetrics, previousMetrics] = await Promise.all([
    getPeriodMetrics(current.start, current.end),
    getPeriodMetrics(previous.start, previous.end)
  ])

  // 5️⃣ Calcular el cambio porcentual
  function calcChange(currentValue: number, previousValue: number) {
    if (previousValue === 0) return currentValue > 0 ? 100 : 0
    const change = ((currentValue - previousValue) / previousValue) * 100
    return Math.round(change * 100) / 100
  }

  const changes = {
    income: calcChange(currentMetrics.income, previousMetrics.income),
    expense: calcChange(currentMetrics.expense, previousMetrics.expense),
    savings: calcChange(currentMetrics.savings, previousMetrics.savings)
  }

  // 6️⃣ Retornar el resultado final
  return {
    current: currentMetrics,
    previous: previousMetrics,
    changes
  }
}


}
