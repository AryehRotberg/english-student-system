import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { TextsController } from './texts.controller';
import { TextsService } from './texts.service';

@Module({
    imports: [AuthModule],
    controllers: [TextsController],
    providers: [TextsService],
})
export class TextsModule { }