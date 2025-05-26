import { IsString, IsOptional, IsEnum, IsInt, IsBoolean, IsUrl } from 'class-validator';
import { Transform } from 'class-transformer';
import { LessonType } from '@prisma/client';

export class CreateLessonDto {
    @IsString()
    title: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsString()
    content?: string;

    @IsOptional()
    @IsUrl()
    mediaUrl?: string;

    @IsEnum(LessonType)
    type: LessonType;

    @IsOptional()
    @Transform(({ value }) => parseInt(value))
    @IsInt()
    duration?: number;

    @IsOptional()
    @IsString()
    level?: string;

    @IsString()
    languageId: string;

    @IsOptional()
    @Transform(({ value }) => value === 'true')
    @IsBoolean()
    isPublished?: boolean;
}