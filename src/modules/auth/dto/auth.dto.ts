import { IsEmail, IsString, MinLength, IsOptional, IsEnum } from 'class-validator';
import { UserRole } from '@prisma/client';

export class RegisterDto {
    @IsEmail()
    email: string;

    @IsString()
    @MinLength(6)
    password: string;

    @IsString()
    firstName: string;

    @IsString()
    lastName: string;

    @IsOptional()
    @IsEnum(UserRole)
    role?: UserRole;
}

export class LoginDto {
    @IsEmail()
    email: string;

    @IsString()
    password: string;
}
