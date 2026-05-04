import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Text } from './entities/text.entity';
import { AuthModule } from '../../auth/auth.module';
import { TextsController } from './texts.controller';
import { TextsService } from './texts.service';

@Module({
    imports: [AuthModule, TypeOrmModule.forFeature([Text])],
    controllers: [TextsController],
    providers: [TextsService],
})
export class TextsModule {}
