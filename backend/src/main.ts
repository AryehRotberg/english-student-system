import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { CsrfGuard } from './auth/guards/csrf.guard';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    const document = SwaggerModule.createDocument(
        app,
        new DocumentBuilder()
            .setTitle('English Student System API')
            .setDescription('API documentation for the English Student System')
            .setVersion('1.0')
            .build(),
    );
    SwaggerModule.setup('api', app, document, {
        customCssUrl:
            'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.11.0/swagger-ui.min.css',
        customJs: [
            'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.11.0/swagger-ui-bundle.js',
            'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.11.0/swagger-ui-standalone-preset.js',
        ],
    });

    app.enableCors({
        origin: ['http://localhost:5173', process.env.FRONTEND_URL],
        credentials: true,
        methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    });

    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
        }),
    );

    app.use(cookieParser());
    app.use(helmet());
    app.useGlobalGuards(new CsrfGuard());

    await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
