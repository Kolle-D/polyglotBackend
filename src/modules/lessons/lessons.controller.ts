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
import { LessonsService } from './lessons.service';
import { CreateLessonDto, UpdateLessonDto, LessonQueryDto } from './dto';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { UserRole } from '@prisma/client';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Controller('lessons')
export class LessonsController {
    constructor(
        private readonly lessonsService: LessonsService,
        private readonly cloudinaryService: CloudinaryService,
    ) { }
    @UseGuards(JwtGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @Post()
    @UseInterceptors(FileInterceptor('media'))
    async create(
        @Body() createLessonDto: CreateLessonDto,
        @UploadedFile() file?: Express.Multer.File,
    ) {
        if (file) {
            let uploadResult;

            // Handle different media types
            if (file.mimetype.startsWith('video/')) {
                uploadResult = await this.cloudinaryService.uploadVideo(file);
            } else if (file.mimetype.startsWith('audio/')) {
                uploadResult = await this.cloudinaryService.uploadVideo(file); // Cloudinary handles audio as video
            } else {
                uploadResult = await this.cloudinaryService.uploadImage(file);
            }

            createLessonDto.mediaUrl = uploadResult.secure_url;
        }

        return this.lessonsService.create(createLessonDto);
    }

    @Get()
    findAll(@Query() query: LessonQueryDto) {
        return this.lessonsService.findAll(query);
    }

    @Get('stats')
    @UseGuards(JwtGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    getStats() {
        return this.lessonsService.getLessonStats();
    }

    @Get('language/:languageId')
    getLessonsByLanguage(@Param('languageId') languageId: string) {
        return this.lessonsService.getPublishedLessonsByLanguage(languageId);
    }

    @Get(':id')
    @UseGuards(JwtGuard)
    findOne(@Param('id') id: string, @GetUser('role') userRole: UserRole) {
        return this.lessonsService.findOne(id, userRole);
    }

    @UseGuards(JwtGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @Patch(':id')
    @UseInterceptors(FileInterceptor('media'))
    async update(
        @Param('id') id: string,
        @Body() updateLessonDto: UpdateLessonDto,
        @UploadedFile() file?: Express.Multer.File,
    ) {
        if (file) {
            let uploadResult;

            if (file.mimetype.startsWith('video/')) {
                uploadResult = await this.cloudinaryService.uploadVideo(file);
            } else if (file.mimetype.startsWith('audio/')) {
                uploadResult = await this.cloudinaryService.uploadVideo(file);
            } else {
                uploadResult = await this.cloudinaryService.uploadImage(file);
            }

            updateLessonDto.mediaUrl = uploadResult.secure_url;
        }

        return this.lessonsService.update(id, updateLessonDto);
    }

    @UseGuards(JwtGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.lessonsService.remove(id);
    }
  }