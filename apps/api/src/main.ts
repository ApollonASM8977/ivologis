import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { NestExpressApplication } from "@nestjs/platform-express";
import { ValidationPipe } from "@nestjs/common";
import helmet from "helmet";
import { AppModule } from "./app.module";
import { HttpExceptionFilter } from "./common/filters/http-exception.filter";

async function bootstrap() {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET doit être défini.");
  }

  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.use(
    helmet({
      crossOriginResourcePolicy: false,
    }),
  );
  app.enableCors({
    origin: (process.env.CORS_ORIGIN ?? "http://localhost:3000").split(",").map((o) => o.trim()),
    credentials: true,
  });

  app.setGlobalPrefix("api");
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());

  const port = process.env.PORT ?? 3001;
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`IVOLOGIS API démarrée sur http://localhost:${port}/api`);
}

bootstrap();
