import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { Request, Response } from "express";

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

    response.status(status).json({
      statusCode: status,
      path: request.url,
      timestamp: new Date().toISOString(),
      message,
    });
  }
}
