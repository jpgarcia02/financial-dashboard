import { 
  Controller, 
  Get, 
  Query, 
  UseGuards, 
  Request 
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { StatisticsService } from './statistics.service';
import { DateRangeDto } from './dto/date-range.dto';
import { MonthsQueryDto } from './dto/months-query.dto';
import { TopExpensesqueryDto } from './dto/top-expenses-query.dto';
import { ComparePeriodDto } from './dto/compare-period.dto';


@ApiTags('Statistics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('statistics')
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  // 📊 Gastos por categoría
  @Get('expenses-by-category')
  @ApiOperation({ summary: 'Obtener gastos agrupados por categoría para gráfico circular' })
  @ApiResponse({ status: 200, description: 'Lista de gastos por categoría con porcentajes' })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  async getExpensesByCategory(@Query() query: DateRangeDto
  , @Request() req) {
    return this.statisticsService.getExpensesByCategory(
      req.user.id,
      query.startDate,
      query.endDate
    );
  }

  // 📈 Tendencia mensual (ingresos, gastos, ahorros)
  @Get('monthly-trend')
  @ApiOperation({ summary: 'Obtener tendencia mensual de ingresos, gastos y ahorros' })
  @ApiResponse({ status: 200, description: 'Datos para gráfico de barras de últimos N meses' })
  @ApiQuery({ name: 'months', required: false, type: Number, description: 'Número de meses (1-24)' })
  async getMonthlyTrend(@Query() query: MonthsQueryDto
  , @Request() req) {
    return this.statisticsService.getMonthlyTrend(req.user.id, query.months);
  }

  // 💰 Tendencia de ahorros mensuales
  @Get('savings-trend')
  @ApiOperation({ summary: 'Obtener tendencia de ahorros mensuales' })
  @ApiResponse({ status: 200, description: 'Datos para gráfico de línea de ahorros' })
  async getSavingsTrend(@Query() query: MonthsQueryDto, @Request() req) {
    return this.statisticsService.getSavingsTrend(req.user.id, query.months);
  }

  // 🧾 Top N gastos
  @Get('top-expenses')
  @ApiOperation({ summary: 'Obtener los gastos más grandes del período' })
  @ApiResponse({ status: 200, description: 'Lista de top N gastos ordenados por monto' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  async getTopExpenses(@Query() query: TopExpensesqueryDto, @Request() req) {
    return this.statisticsService.getTopExpenses(
      req.user.id,
      query.limit,
      query.startDate,
      query.endDate
    );
  }

  // 📊 Comparar período actual vs anterior
  @Get('compare')
  @ApiOperation({ summary: 'Comparar período actual con anterior' })
  @ApiResponse({ status: 200, description: 'Métricas del período actual, anterior y cambios porcentuales' })
  @ApiQuery({ name: 'currentStart', required: true, type: String })
  @ApiQuery({ name: 'currentEnd', required: true, type: String })
  async compareWithPreviousPeriod(@Query() query: ComparePeriodDto, @Request() req) {
    return this.statisticsService.compareWithPreviousPeriod(
      req.user.id,
      query.currentStart,
      query.currentEnd
    );
  }
}
