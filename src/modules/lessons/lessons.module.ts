import { Module } from '@nestjs/common';
import { LessonsService } from './lessons.service';
import { LessonsController } from './lessons.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';

@Module({
    imports: [PrismaModule, CloudinaryModule],
    controllers: [LessonsController],
    providers: [LessonsService],
    exports: [LessonsService],
})
export class LessonsModule { }