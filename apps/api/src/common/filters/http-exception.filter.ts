import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { Request, Response } from "express";
import { translateText } from "../i18n/i18n";

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const body =
      exception instanceof HttpException ? exception.getResponse() : null;

    // Une erreur imprévue (base de données, bug) ne doit pas exposer son texte technique au navigateur.
    if (!(exception instanceof HttpException)) {
      // eslint-disable-next-line no-console
      console.error(`[IVOLOGIS] ${request.method} ${request.url}`, exception);
    }
    const message =
      body && typeof body === "object" && "message" in body
        ? (body as any).message
        : exception instanceof HttpException
          ? exception.message
          : "Une erreur inattendue est survenue. Réessayez dans un instant ; si le problème persiste, contactez l'agence.";

    // Limitation de débit : le message de la bibliothèque est en anglais technique (« ThrottlerException: Too Many Requests »).
    const text = status === HttpStatus.TOO_MANY_REQUESTS ? "Trop de tentatives. Patientez une minute puis réessayez." : message;
    // Messages rédigés en français dans le code, traduits si le site est en anglais (en-tête Accept-Language).
    const translated = Array.isArray(text)
      ? text.map((m) => (typeof m === "string" ? translateText(m) : m))
      : typeof text === "string"
        ? translateText(text)
        : text;

    response.status(status).json({
      statusCode: status,
      path: request.url,
      timestamp: new Date().toISOString(),
      message: translated,
    });
  }
}
