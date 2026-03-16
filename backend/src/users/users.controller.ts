import { Controller, Delete, Param, ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { TeacherGuard } from '../auth/auth.guard';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Delete(':id')
    @UseGuards(TeacherGuard)
    async remove(@Param('id', new ParseUUIDPipe()) id: string) {
        return await this.usersService.remove(id);
    }
}
