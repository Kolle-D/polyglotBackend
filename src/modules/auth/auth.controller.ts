import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './dto';
import { JwtGuard } from './guards/jwt.guard';
import { GetUser } from './decorators/get-user.decorator';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Post('register')
    register(@Body() dto: RegisterDto) {
        return this.authService.register(dto);
    }

    @Post('login')
    login(@Body() dto: LoginDto) {
        return this.authService.login(dto);
    }

    @UseGuards(JwtGuard)
    @Get('profile')
    getProfile(@GetUser('id') userId: string) {
        return this.authService.getProfile(userId);
    }
}
