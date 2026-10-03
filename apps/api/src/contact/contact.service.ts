import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateContactDto } from "./dto/create-contact.dto";

@Injectable()
export class ContactService {
  constructor(private prisma: PrismaService) {}

  create(dto: CreateContactDto) {
    return this.prisma.contactRequest.create({
      data: {
        fullName: dto.fullName.trim(),
        email: dto.email.trim().toLowerCase(),
        phone: dto.phone?.trim() || null,
        organization: dto.organization?.trim() || null,
        portfolioSize: dto.portfolioSize?.trim() || null,
        message: dto.message.trim(),
      },
      select: { id: true },
    });
  }

  async findAll(page = 1, limit = 25) {
    const [data, total] = await Promise.all([
      this.prisma.contactRequest.findMany({
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.contactRequest.count(),
    ]);
    return { data, total, page, limit };
  }

  async markHandled(id: string, handled: boolean) {
    return this.prisma.contactRequest.update({ where: { id }, data: { handled } });
  }
}
