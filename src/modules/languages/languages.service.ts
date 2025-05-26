/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { LanguagesService } from './languages.service';
import { LanguagesController } from './languages.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';

@Module({
    imports: [PrismaModule, CloudinaryModule],
    controllers: [LanguagesController],
    providers: [LanguagesService],
    exports: [LanguagesService],
})
export class LanguagesModule { }

// src/languages/languages.service.ts
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLanguageDto, UpdateLanguageDto } from './dto';

@Injectable()
export class LanguagesService {
    constructor(private prisma: PrismaService) { }

    async create(dto: CreateLanguageDto) {
        const existingLanguage = await this.prisma.language.findUnique({
            where: { name: dto.name },
        });

        if (existingLanguage) {
            throw new ConflictException('Language already exists');
        }

        return this.prisma.language.create({
            data: dto,
            include: {
                _count: {
                    select: {
                        lessons: true,
                        tutors: true,
                    },
                },
            },
        });
    }

    async findAll(includeInactive = false) {
        const where = includeInactive ? {} : { isActive: true };

        return this.prisma.language.findMany({
            where,
            include: {
                _count: {
                    select: {
                        lessons: { where: { isPublished: true } },
                        tutors: true,
                    },
                },
            },
            orderBy: { name: 'asc' },
        });
    }

    async findOne(id: string) {
        const language = await this.prisma.language.findUnique({
            where: { id },
            include: {
                lessons: {
                    where: { isPublished: true },
                    orderBy: { createdAt: 'desc' },
                    take: 10,
                },
                tutors: {
                    include: {
                        tutor: {
                            include: {
                                user: {
                                    select: {
                                        firstName: true,
                                        lastName: true,
                                        avatar: true,
                                    },
                                },
                            },
                        },
                    },
                    take: 10,
                },
                _count: {
                    select: {
                        lessons: { where: { isPublished: true } },
                        tutors: true,
                    },
                },
            },
        });

        if (!language) {
            throw new NotFoundException('Language not found');
        }

        return language;
    }

    async update(id: string, dto: UpdateLanguageDto) {
        const language = await this.prisma.language.findUnique({
            where: { id },
        });

        if (!language) {
            throw new NotFoundException('Language not found');
        }

        if (dto.name && dto.name !== language.name) {
            const existingLanguage = await this.prisma.language.findUnique({
                where: { name: dto.name },
            });

            if (existingLanguage) {
                throw new ConflictException('Language name already exists');
            }
        }

        return this.prisma.language.update({
            where: { id },
            data: dto,
            include: {
                _count: {
                    select: {
                        lessons: true,
                        tutors: true,
                    },
                },
            },
        });
    }

    async remove(id: string) {
        const language = await this.prisma.language.findUnique({
            where: { id },
            include: {
                _count: {
                    select: {
                        lessons: true,
                        tutors: true,
                    },
                },
            },
        });

        if (!language) {
            throw new NotFoundException('Language not found');
        }

        // Soft delete by setting isActive to false
        return this.prisma.language.update({
            where: { id },
            data: { isActive: false },
        });
    }


    async getLanguageStats() {
        const stats = await this.prisma.language.groupBy({
            by: ['country'],
            where: { isActive: true },
            _count: {
                id: true,
            },
            orderBy: {
                _count: {
                    id: 'desc',
                },
            },
        });

        const totalLanguages = await this.prisma.language.count({
            where: { isActive: true },
        });

        const totalLessons = await this.prisma.lesson.count({
            where: { isPublished: true },
        });

        const totalTutors = await this.prisma.tutor.count({
            where: { isAvailable: true },
        });

        return {
            totalLanguages,
            totalLessons,
            totalTutors,
            languagesByCountry: stats,
        };
    }
}