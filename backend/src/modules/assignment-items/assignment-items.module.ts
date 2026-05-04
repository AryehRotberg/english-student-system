import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../../auth/auth.module';
import { AssignmentItemsController } from './assignment-items.controller';
import { AssignmentItemsService } from './assignment-items.service';
import { AssignmentItem } from './entities/assignment-item.entity';
import { AssignmentItemRepository } from './repositories/assignment-item.repository';

@Module({
    imports: [AuthModule, TypeOrmModule.forFeature([AssignmentItem])],
    controllers: [AssignmentItemsController],
    providers: [AssignmentItemsService, AssignmentItemRepository],
    exports: [AssignmentItemsService],
})
export class AssignmentItemsModule {}
