import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { randomUUID } from "crypto";
import { ShortStayStatus, UserRole } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { PdfService } from "../common/pdf/pdf.service";
import { SettingsService } from "../settings/settings.service";
import { AuditService } from "../audit/audit.service";
import { AuthenticatedUser } from "../common/types/authenticated-user";
import { ownerScope } from "../common/utils/scope.util";
import { CreateShortStayBookingDto } from "./dto/create-booking.dto";

function nightsBetween(checkIn: Date, checkOut: Date) {
  const ms = checkOut.getTime() - checkIn.getTime();
  return Math.round(ms / (24 * 60 * 60 * 1000));
}

function generateBookingReceiptNumber() {
  const year = new Date().getFullYear();
  return `SEJ-${year}-${randomUUID().slice(0, 8).toUpperCase()}`;
}

@Injectable()
export class ShortStayService {
  constructor(
    private prisma: PrismaService,
    private pdfService: PdfService,
    private settings: SettingsService,
    private audit: AuditService,
  ) {}

  private async getProperty(propertyId: string) {
    const property = await this.prisma.property.findUnique({ where: { id: propertyId } });
    if (!property) throw new NotFoundException("Bien introuvable.");
    return property;
  }

  async create(propertyId: string, dto: CreateShortStayBookingDto, actorId?: string) {
    const property = await this.getProperty(propertyId);
    if (!property.shortStayEnabled) {
      throw new BadRequestException("Ce bien n'est pas activé pour la location courte durée.");
    }

    const checkIn = new Date(dto.checkIn);
    const checkOut = new Date(dto.checkOut);
    if (checkOut <= checkIn) {
      throw new BadRequestException("La date de départ doit être après la date d'arrivée.");
    }

    const overlap = await this.prisma.shortStayBooking.findFirst({
      where: {
        propertyId,
        status: ShortStayStatus.CONFIRMEE,
        checkIn: { lt: checkOut },
        checkOut: { gt: checkIn },
      },
    });
    if (overlap) {
      throw new BadRequestException("Ces dates chevauchent une réservation déjà confirmée pour ce bien.");
    }

    const nights = nightsBetween(checkIn, checkOut);
    const totalAmount = nights * dto.nightlyRate;

    const booking = await this.prisma.shortStayBooking.create({
      data: {
        propertyId,
        ownerId: property.ownerId,
        tenantId: dto.tenantId,
        guestName: dto.guestName,
        guestPhone: dto.guestPhone,
        checkIn,
        checkOut,
        nightlyRate: dto.nightlyRate,
        totalAmount,
        depositAmount: dto.depositAmount ?? 0,
        notes: dto.notes,
      },
    });

    await this.audit.log({
      userId: actorId,
      action: "CREATE_SHORT_STAY_BOOKING",
      entityType: "ShortStayBooking",
      entityId: booking.id,
      metadata: { propertyId, checkIn: dto.checkIn, checkOut: dto.checkOut, totalAmount },
    });

    return booking;
  }

  async listByProperty(propertyId: string, user: AuthenticatedUser) {
    const property = await this.getProperty(propertyId);
    const scopedOwnerId = ownerScope(user);
    if (scopedOwnerId && property.ownerId !== scopedOwnerId) {
      throw new ForbiddenException("Vous n'avez pas accès à ce bien.");
    }
    return this.prisma.shortStayBooking.findMany({
      where: { propertyId },
      orderBy: { checkIn: "asc" },
    });
  }

  async listUpcoming(user: AuthenticatedUser) {
    const scopedOwnerId = ownerScope(user);
    return this.prisma.shortStayBooking.findMany({
      where: {
        ...(scopedOwnerId ? { ownerId: scopedOwnerId } : {}),
        status: ShortStayStatus.CONFIRMEE,
      },
      include: { property: { select: { id: true, name: true, commune: true } } },
      orderBy: { checkIn: "asc" },
      take: 100,
    });
  }

  async listMine(tenantId: string) {
    return this.prisma.shortStayBooking.findMany({
      where: { tenantId },
      include: { property: { select: { id: true, name: true, commune: true, address: true } } },
      orderBy: { checkIn: "desc" },
    });
  }

  async findOne(id: string) {
    const booking = await this.prisma.shortStayBooking.findUnique({
      where: { id },
      include: { property: true },
    });
    if (!booking) throw new NotFoundException("Réservation introuvable.");
    return booking;
  }

  async cancel(id: string, actorId?: string) {
    const booking = await this.findOne(id);
    if (booking.status !== ShortStayStatus.CONFIRMEE) {
      throw new BadRequestException("Seule une réservation confirmée peut être annulée.");
    }
    const updated = await this.prisma.shortStayBooking.update({
      where: { id },
      data: { status: ShortStayStatus.ANNULEE },
    });
    await this.audit.log({ userId: actorId, action: "CANCEL_SHORT_STAY_BOOKING", entityType: "ShortStayBooking", entityId: id });
    return updated;
  }

  async complete(id: string, actorId?: string) {
    const booking = await this.findOne(id);
    if (booking.status !== ShortStayStatus.CONFIRMEE) {
      throw new BadRequestException("Seule une réservation confirmée peut être clôturée.");
    }

    const company = await this.settings.get();
    const receiptNumber = generateBookingReceiptNumber();
    const receiptUrl = await this.pdfService.generateReceiptPdf({
      receiptNumber,
      companyName: company.companyName,
      companyAddress: company.address,
      companyEmail: company.email,
      companyPhone: company.phone,
      tenantName: booking.guestName,
      propertyName: booking.property.name,
      propertyAddress: `${booking.property.address}, ${booking.property.commune}`,
      amount: booking.totalAmount as any,
      periodMonth: booking.checkIn,
      paymentDate: new Date(),
      method: "Séjour courte durée",
    });

    const updated = await this.prisma.shortStayBooking.update({
      where: { id },
      data: { status: ShortStayStatus.TERMINEE, receiptUrl },
    });

    await this.audit.log({ userId: actorId, action: "COMPLETE_SHORT_STAY_BOOKING", entityType: "ShortStayBooking", entityId: id });
    return updated;
  }
}
