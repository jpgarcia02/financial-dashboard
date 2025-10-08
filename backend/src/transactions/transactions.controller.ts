import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Request,
  UseGuards,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { FilterTransactionDto } from './dto/filter-transaction.dto';
import { TransactionType } from './entities/transaction.entity';

@ApiTags('Transactions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  @ApiOperation({ summary: 'Crear una transacción' })
  @ApiResponse({ status: 201, description: 'Transacción creada exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 404, description: 'Categoría no encontrada' })
  async create(@Body() createTransactionDto: CreateTransactionDto, @Request() req: any) {
    return this.transactionsService.create(req.user.id, createTransactionDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar transacciones (paginado y filtrable)' })
  @ApiResponse({ status: 200, description: 'Lista de transacciones' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  @ApiQuery({ name: 'categoryId', required: false, type: String, format: 'uuid' })
  @ApiQuery({ name: 'type', required: false, enum: TransactionType })
  @ApiQuery({ name: 'search', required: false, type: String })
  async findAll(@Query() filters: FilterTransactionDto, @Request() req: any) {
    return this.transactionsService.findAll(req.user.id, filters);
  }

  // IMPORTANTE: summary debe ir antes de /:id para evitar conflicto con rutas dinámicas
  @Get('summary')
  @ApiOperation({ summary: 'Resumen de ingresos y gastos' })
  @ApiResponse({ status: 200, description: 'Resumen calculado' })
  async getSummary(
    @Query('startDate') startDate: string | undefined,
    @Query('endDate') endDate: string | undefined,
    @Request() req: any,
  ) {
    return this.transactionsService.getSummary(req.user.id, startDate, endDate);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener transacción por id' })
  @ApiResponse({ status: 200, description: 'Transacción encontrada' })
  @ApiResponse({ status: 404, description: 'Transacción no encontrada' })
  async findOne(@Param('id') id: string, @Request() req: any) {
    return this.transactionsService.findOne(id, req.user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar transacción' })
  @ApiResponse({ status: 200, description: 'Transacción actualizada' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 404, description: 'Transacción o categoría no encontrada' })
  async update(
    @Param('id') id: string,
    @Body() updateTransactionDto: UpdateTransactionDto,
    @Request() req: any,
  ) {
    return this.transactionsService.update(id, updateTransactionDto, req.user.id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar transacción' })
  @ApiResponse({ status: 204, description: 'Transacción eliminada (No Content)' })
  @ApiResponse({ status: 404, description: 'Transacción no encontrada' })
  async remove(@Param('id') id: string, @Request() req: any) {
    await this.transactionsService.remove(id, req.user.id);
    return;
  }
}
