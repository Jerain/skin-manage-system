import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CustomersService } from '../customers/customers.service';
import { EmployeesService } from '../employees/employees.service';
import { AdminService } from '../admin/admin.service';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private customersService: CustomersService,
    private employeesService: EmployeesService,
    private adminService: AdminService,
  ) {}

  async customerLogin(phone: string, password: string) {
    const customer = await this.customersService.findByPhone(phone);
    if (!customer) {
      throw new UnauthorizedException('手机号或密码错误');
    }

    const isValid = await this.customersService.validatePassword(customer, password);
    if (!isValid) {
      throw new UnauthorizedException('手机号或密码错误');
    }

    if (customer.status === 0) {
      throw new UnauthorizedException('账号已被禁用');
    }

    const payload = { sub: customer.id, phone: customer.phone, type: 'customer' };
    return {
      access_token: this.jwtService.sign(payload),
      customer: {
        id: customer.id,
        name: customer.name,
        phone: customer.phone,
        avatar: customer.avatar,
        level: customer.level,
        balance: customer.balance,
        points: customer.points,
      },
    };
  }

  async customerRegister(data: { phone: string; password: string; name?: string }) {
    const existing = await this.customersService.findByPhone(data.phone);
    if (existing) {
      throw new BadRequestException('该手机号已注册');
    }

    const customer = await this.customersService.create({
      phone: data.phone,
      password: data.password,
      name: data.name || '新用户',
    });

    const payload = { sub: customer.id, phone: customer.phone, type: 'customer' };
    return {
      access_token: this.jwtService.sign(payload),
      customer: {
        id: customer.id,
        name: customer.name,
        phone: customer.phone,
      },
    };
  }

  async employeeLogin(phone: string, password: string) {
    const employee = await this.employeesService.findByPhone(phone);
    if (!employee) {
      throw new UnauthorizedException('手机号或密码错误');
    }

    const isValid = await this.employeesService.validatePassword(employee, password);
    if (!isValid) {
      throw new UnauthorizedException('手机号或密码错误');
    }

    if (employee.status === 0) {
      throw new UnauthorizedException('账号已被禁用');
    }

    const payload = { sub: employee.id, phone: employee.phone, type: 'employee', role: employee.role };
    return {
      access_token: this.jwtService.sign(payload),
      employee: {
        id: employee.id,
        name: employee.name,
        phone: employee.phone,
        role: employee.role,
        position: employee.position,
        storeId: employee.storeId,
        avatar: employee.avatar,
      },
    };
  }

  async adminLogin(username: string, password: string) {
    const admin = await this.adminService.validateCredentials(username, password);
    if (!admin) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    const payload = { sub: admin.id, username: admin.username, type: 'admin', role: admin.role };
    return {
      access_token: this.jwtService.sign(payload),
      admin: {
        id: admin.id,
        username: admin.username,
        name: admin.name,
        role: admin.role,
        storeId: admin.storeId,
      },
    };
  }

  async faceLogin(faceToken: string, userType: 'customer' | 'employee') {
    if (userType === 'employee') {
      const employee = await this.employeesService.findByFaceToken(faceToken);
      if (!employee) {
        throw new UnauthorizedException('人脸识别失败');
      }
      
      if (employee.status === 0) {
        throw new UnauthorizedException('账号已被禁用');
      }

      const payload = { sub: employee.id, phone: employee.phone, type: 'employee', role: employee.role };
      return {
        access_token: this.jwtService.sign(payload),
        employee: {
          id: employee.id,
          name: employee.name,
          phone: employee.phone,
          role: employee.role,
          position: employee.position,
          storeId: employee.storeId,
          avatar: employee.avatar,
        },
      };
    } else {
      // Customer face login
      const customer = await this.customersService.findByFaceToken(faceToken);
      if (!customer) {
        throw new UnauthorizedException('人脸识别失败');
      }
      
      if (customer.status === 0) {
        throw new UnauthorizedException('账号已被禁用');
      }

      const payload = { sub: customer.id, phone: customer.phone, type: 'customer' };
      return {
        access_token: this.jwtService.sign(payload),
        customer: {
          id: customer.id,
          name: customer.name,
          phone: customer.phone,
          avatar: customer.avatar,
          level: customer.level,
          balance: customer.balance,
          points: customer.points,
        },
      };
    }
  }

  validateToken(token: string) {
    try {
      return this.jwtService.verify(token);
    } catch {
      throw new UnauthorizedException('无效的令牌');
    }
  }
}
