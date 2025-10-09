export interface ExpenseByCategory{
    categoryId: string
    categoryName: string 
    categoryColor: string 
    categoryIcon: string
    total:number
    percentage: number
    transactionCount: number


}

export interface MonthlyTrendData{
    month: string
    income:number
    expense:number
    savings:number
    
}

export interface SavingsTrendData{
    month: string
    savings:number

}

export interface TopExpense{

    id:string
    amount: number 
    description:string
    date:Date
    categoryName: string
    categoryColor: string
    categoryIcon: string
}

export interface PeriodComparison{
    current: { income: number; expense: number; savings: number }
    previous: { income: number; expense: number; savings: number }
    changes: { income: number; expense: number; savings: number }
}
