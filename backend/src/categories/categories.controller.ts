import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@ApiTags('Categories')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard )
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @ApiOperation({ summary: 'Crear una nueva categoría' })
  @ApiResponse({ status: 201, description: 'Categoría creada' })
  create(
    @Body() createCategoryDto: CreateCategoryDto,
    @Request() req
  ) {
    return this.categoriesService.create(req.user.id,createCategoryDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar categorías' })
  findAll(@Request() req) {
    return this.categoriesService.findAll(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener categoría por id' })
  findOne(
    @Param('id') id: string,
    @Request() req
    ) {
    return this.categoriesService.findOne(req.user.id,id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar categoría' })
  update(@Param('id') id: string, @Body() updateCategoryDto: UpdateCategoryDto,
  @Request()req) {
    return this.categoriesService.update(req.user.id, id, updateCategoryDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar categoría' })
  remove(
    @Param('id') id: string,
    @Request() req
  ) {
    return this.categoriesService.remove(req.user.id,id);
  }
}
