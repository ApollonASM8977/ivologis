import { Controller, Get, Param, Query, Res } from "@nestjs/common";
import { Response } from "express";
import { StorageService } from "./storage.service";

@Controller("files")
export class StorageController {
  constructor(private storage: StorageService) {}

  @Get(":id")
  async serve(@Param("id") id: string, @Query("download") download: string | undefined, @Res() res: Response) {
    const file = await this.storage.get(id);
    res.setHeader("Content-Type", file.mimeType);
    res.setHeader("Content-Length", file.size.toString());
    res.setHeader("Cache-Control", "private, max-age=3600");
    const disposition = download === "1" ? "attachment" : "inline";
    res.setHeader("Content-Disposition", `${disposition}; filename="${encodeURIComponent(file.filename)}"`);
    res.end(Buffer.from(file.data));
  }
}
