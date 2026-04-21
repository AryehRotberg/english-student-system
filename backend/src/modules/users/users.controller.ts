import {
    Controller,
    Delete,
    Get,
    Param,
    ParseUUIDPipe,
    Patch,
    Query,
    UseGuards,
} from '@nestjs/common';
import { User } from '../../auth/decorators/user.decorator';
import { TeacherGuard } from '../../auth/guards/auth.guard';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Get('students')
    @UseGuards(TeacherGuard)
    async findStudentsByTeacherId(
        @User() user,
        @Query('approved') approved = 'true',
    ) {
        return await this.usersService.findStudentsByTeacherId(
            user.id,
            approved === 'true',
        );
    }

    @Get('teachers')
    async findAllTeachers() {
        return await this.usersService.findAllTeachers();
    }

    @Patch(':id/approve')
    @UseGuards(TeacherGuard)
    async approve(@Param('id', new ParseUUIDPipe()) id: string) {
        return await this.usersService.approve(id);
    }

    @Delete(':id')
    @UseGuards(TeacherGuard)
    async remove(@Param('id', new ParseUUIDPipe()) id: string) {
        return await this.usersService.remove(id);
    }
}
