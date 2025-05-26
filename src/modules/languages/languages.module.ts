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