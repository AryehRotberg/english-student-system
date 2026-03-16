import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { AssignmentItemsController } from './assignment-items.controller';
import { AssignmentItemsService } from './assignment-items.service';

@Module({
    imports: [AuthModule],
    controllers: [AssignmentItemsController],
    providers: [AssignmentItemsService],
})
export class AssignmentItemsModule { }
