/* eslint-disable prettier/prettier */
import { IsString, IsOptional, IsUrl, IsBoolean } from 'class-validator';

export class CreateLanguageDto {
    @IsString()
    name: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsString()
    country: string;

    @IsOptional()
    @IsUrl()
    imageUrl?: string;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}