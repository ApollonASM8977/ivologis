import { Body, Controller, ForbiddenException, Get, Param, Post, Query, Res, UseGuards } from "@nestjs/common";
import { Response } from "express";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { AuthenticatedUser } from "../common/types/authenticated-user";
import { signFilePath, verifyFileSignature } from "../common/utils/signed-url";
import { StorageService } from "./storage.service";
import { SignFileDto } from "./dto/sign-file.dto";

const DOCUMENT_MIME_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

@Controller("files")
export class StorageController {
  constructor(private storage: StorageService) {}

  @UseGuards(JwtAuthGuard)
  @Post("sign")
  sign(@Body() dto: SignFileDto, @CurrentUser() user: AuthenticatedUser) {
    return this.storage.authorizeDocument(dto.url, user).then((path) => ({
      url: signFilePath(path, process.env.JWT_SECRET as string),
    }));
  }

  @Get(":id")
  async serve(
    @Param("id") id: string,
    @Query("download") download: string | undefined,
    @Query("exp") exp: string | undefined,
    @Query("sig") sig: string | undefined,
    @Res() res: Response,
  ) {
    const file = await this.storage.get(id);
    if (DOCUMENT_MIME_TYPES.includes(file.mimeType)) {
      const valid = verifyFileSignature(`/api/files/${id}`, exp, sig, process.env.JWT_SECRET as string);
      if (!valid) throw new ForbiddenException("Lien de document expiré ou invalide. Rouvrez le document depuis l'application.");
    }
    res.setHeader("Content-Type", file.mimeType);
    res.setHeader("Content-Length", file.size.toString());
    res.setHeader("Cache-Control", "private, max-age=600");
    res.setHeader("X-Content-Type-Options", "nosniff");
    const disposition = download === "1" ? "attachment" : "inline";
    res.setHeader("Content-Disposition", `${disposition}; filename="${encodeURIComponent(file.filename)}"`);
    res.end(Buffer.from(file.data));
  }
}
