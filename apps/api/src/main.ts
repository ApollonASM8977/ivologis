import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { NestExpressApplication } from "@nestjs/platform-express";
import { ValidationPipe } from "@nestjs/common";
import helmet from "helmet";
import { AppModule } from "./app.module";
import { HttpExceptionFilter } from "./common/filters/http-exception.filter";
import { frenchValidationException } from "./common/validation/validation-messages";

async function bootstrap() {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET doit être défini.");
  }

  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  // Derrière le proxy Render : sans cela, req.ip est l'IP du proxy pour tout le monde (limitation de débit commune, IP fausses dans les sessions).
  if (process.env.NODE_ENV === "production") app.set("trust proxy", 1);

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
      exceptionFactory: frenchValidationException,
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());

  const port = process.env.PORT ?? 3001;
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`IVOLOGIS API démarrée sur http://localhost:${port}/api`);
}

bootstrap();
