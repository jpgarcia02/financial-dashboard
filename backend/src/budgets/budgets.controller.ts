import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { BudgetsService } from './budgets.service';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';

@ApiTags('Budgets')
@ApiBearerAuth()
@Controller('budgets')
export class BudgetsController {
  constructor(private readonly budgetsService: BudgetsService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo presupuesto' })
  @ApiResponse({ status: 201, description: 'Presupuesto creado' })
  create(@Body() createBudgetDto: CreateBudgetDto) {
    return this.budgetsService.create(createBudgetDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar presupuestos' })
  findAll() {
    return this.budgetsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener presupuesto por id' })
  findOne(@Param('id') id: string) {
    return this.budgetsService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar presupuesto' })
  update(@Param('id') id: string, @Body() updateBudgetDto: UpdateBudgetDto) {
    return this.budgetsService.update(+id, updateBudgetDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar presupuesto' })
  remove(@Param('id') id: string) {
    return this.budgetsService.remove(+id);
  }
}
