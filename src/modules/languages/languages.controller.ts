/* eslint-disable prettier/prettier */
import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
    Query,
    UseInterceptors,
    UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { LanguagesService } from './languages.service';
import { CreateLanguageDto, UpdateLanguageDto } from './dto';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Controller('languages')
export class LanguagesController {
    constructor(
        private readonly languagesService: LanguagesService,
        private readonly cloudinaryService: CloudinaryService,
    ) { }

    @UseGuards(JwtGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @Post()
    @UseInterceptors(FileInterceptor('image'))
    async create(
        @Body() createLanguageDto: CreateLanguageDto,
        @UploadedFile() file?: Express.Multer.File,
    ) {
        if (file) {
            const uploadResult = await this.cloudinaryService.uploadImage(file);
            createLanguageDto.imageUrl = uploadResult.secure_url;
        }

        return this.languagesService.create(createLanguageDto);
    }

    @Get()
    findAll(@Query('includeInactive') includeInactive?: string) {
        const includeInactiveBool = includeInactive === 'true';
        return this.languagesService.findAll(includeInactiveBool);
    }

    @Get('stats')
    @UseGuards(JwtGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    getStats() {
        return this.languagesService.getLanguageStats();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.languagesService.findOne(id);
    }

    @UseGuards(JwtGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @Patch(':id')
    @UseInterceptors(FileInterceptor('image'))
    async update(
        @Param('id') id: string,
        @Body() updateLanguageDto: UpdateLanguageDto,
        @UploadedFile() file?: Express.Multer.File,
    ) {
        if (file) {
            const uploadResult = await this.cloudinaryService.uploadImage(file);
            updateLanguageDto.imageUrl = uploadResult.secure_url;
        }

        return this.languagesService.update(id, updateLanguageDto);
    }

    @UseGuards(JwtGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.languagesService.remove(id);
    }
  }