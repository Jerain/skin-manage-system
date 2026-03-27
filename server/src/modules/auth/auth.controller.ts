import { Controller, Post, Body, Get, Headers, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('customer/login')
  customerLogin(@Body() body: { phone: string; password: string }) {
    return this.authService.customerLogin(body.phone, body.password);
  }

  @Post('customer/register')
  customerRegister(@Body() body: { phone: string; password: string; name?: string }) {
    return this.authService.customerRegister(body);
  }

  @Post('employee/login')
  employeeLogin(@Body() body: { phone: string; password: string }) {
    return this.authService.employeeLogin(body.phone, body.password);
  }

  @Post('admin/login')
  adminLogin(@Body() body: { username: string; password: string }) {
    return this.authService.adminLogin(body.username, body.password);
  }

  @Post('face/login')
  faceLogin(@Body() body: { faceToken: string; userType: 'customer' | 'employee' }) {
    return this.authService.faceLogin(body.faceToken, body.userType);
  }

  @Get('verify')
  verifyToken(@Headers('authorization') auth: string) {
    if (!auth || !auth.startsWith('Bearer ')) {
      throw new UnauthorizedException('未提供令牌');
    }
    const token = auth.replace('Bearer ', '');
    return this.authService.validateToken(token);
  }
}
