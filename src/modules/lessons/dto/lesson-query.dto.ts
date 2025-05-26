import { IsOptional, IsEnum, IsString, IsBoolean, IsInt } from 'class-validator';
import { Transform } from 'class-transformer';
import { LessonType } from '@prisma/client';

export class LessonQueryDto {
    @IsOptional()
    @IsString()
    languageId?: string;

    @IsOptional()
    @IsEnum(LessonType)
    type?: LessonType;

    @IsOptional()
    @IsString()
    level?: string;

    @IsOptional()
    @Transform(({ value }) => value === 'true')
    @IsBoolean()
    isPublished?: boolean;

    @IsOptional()
    @Transform(({ value }) => parseInt(value))
    @IsInt()
    page?: number;

    @IsOptional()
    @Transform(({ value }) => parseInt(value))
    @IsInt()
    limit?: number;

    @IsOptional()
    @IsString()
    search?: string;
}