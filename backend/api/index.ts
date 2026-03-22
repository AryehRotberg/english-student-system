import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import express from 'express';
import { AppModule } from '../src/app.module';

let cachedServer: ReturnType<typeof express> | null = null;

async function createServer() {
    const server = express();

    const app = await NestFactory.create(AppModule, new ExpressAdapter(server));

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
        origin: ['http://localhost:5173', process.env.FRONTEND_URL].filter(
            (origin): origin is string => Boolean(origin),
        ),
        credentials: true,
        methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
    });

    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
        }),
    );

    app.use(cookieParser());
    await app.init();

    return server;
}

export default async function handler(req: any, res: any) {
    if (!cachedServer) {
        cachedServer = await createServer();
    }

    return cachedServer(req, res);
}
