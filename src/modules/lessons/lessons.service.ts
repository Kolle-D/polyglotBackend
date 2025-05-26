import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLessonDto, UpdateLessonDto, LessonQueryDto } from './dto';
import { UserRole } from '@prisma/client';

@Injectable()
export class LessonsService {
    constructor(private prisma: PrismaService) { }

    async create(dto: CreateLessonDto) {
        // Verify language exists
        const language = await this.prisma.language.findUnique({
            where: { id: dto.languageId },
        });

        if (!language) {
            throw new NotFoundException('Language not found');
        }

        return this.prisma.lesson.create({
            data: dto,
            include: {
                language: {
                    select: {
                        id: true,
                        name: true,
                        country: true,
                    },
                },
            },
        });
    }

    async findAll(query: LessonQueryDto) {
        const {
            languageId,
            type,
            level,
            isPublished,
            page = 1,
            limit = 10,
            search,
        } = query;

        const skip = (page - 1) * limit;
        const where: any = {};

        if (languageId) where.languageId = languageId;
        if (type) where.type = type;
        if (level) where.level = level;
        if (isPublished !== undefined) where.isPublished = isPublished;
        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
            ];
        }

        const [lessons, total] = await Promise.all([
            this.prisma.lesson.findMany({
                where,
                include: {
                    language: {
                        select: {
                            id: true,
                            name: true,
                            country: true,
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.lesson.count({ where }),
        ]);

        return {
            data: lessons,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async findOne(id: string, userRole?: UserRole) {
        const lesson = await this.prisma.lesson.findUnique({
            where: { id },
            include: {
                language: {
                    select: {
                        id: true,
                        name: true,
                        country: true,
                        imageUrl: true,
                    },
                },
            },
        });

        if (!lesson) {
            throw new NotFoundException('Lesson not found');
        }

        // Only allow unpublished lessons for admins
        if (!lesson.isPublished && userRole !== UserRole.ADMIN) {
            throw new ForbiddenException('Lesson not available');
        }

        return lesson;
    }

    async update(id: string, dto: UpdateLessonDto) {
        const lesson = await this.prisma.lesson.findUnique({
            where: { id },
        });

        if (!lesson) {
            throw new NotFoundException('Lesson not found');
        }

        if (dto.languageId && dto.languageId !== lesson.languageId) {
            const language = await this.prisma.language.findUnique({
                where: { id: dto.languageId },
            });

            if (!language) {
                throw new NotFoundException('Language not found');
            }
        }

        return this.prisma.lesson.update({
            where: { id },
            data: dto,
            include: {
                language: {
                    select: {
                        id: true,
                        name: true,
                        country: true,
                    },
                },
            },
        });
    }

    async remove(id: string) {
        const lesson = await this.prisma.lesson.findUnique({
            where: { id },
        });

        if (!lesson) {
            throw new NotFoundException('Lesson not found');
        }

        return this.prisma.lesson.delete({
            where: { id },
        });
    }

    async getPublishedLessonsByLanguage(languageId: string) {
        return this.prisma.lesson.findMany({
            where: {
                languageId,
                isPublished: true,
            },
            select: {
                id: true,
                title: true,
                description: true,
                type: true,
                duration: true,
                level: true,
                createdAt: true,
            },
            orderBy: { createdAt: 'asc' },
        });
    }

    async getLessonStats() {
        const stats = await this.prisma.lesson.groupBy({
            by: ['level', 'type'],
            where: { isPublished: true },
            _count: {
                id: true,
            },
        });

        const totalLessons = await this.prisma.lesson.count({
            where: { isPublished: true },
        });

        const totalDuration = await this.prisma.lesson.aggregate({
            where: { isPublished: true, duration: { not: null } },
            _sum: { duration: true },
        });

        return {
            totalLessons,
            totalDuration: totalDuration._sum.duration || 0,
            breakdown: stats,
        };
    }
}
