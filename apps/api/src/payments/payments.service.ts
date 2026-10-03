import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { LeaseStatus, PaymentStatus } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { PdfService } from "../common/pdf/pdf.service";
import { toSkipTake } from "../common/dto/pagination.dto";
import { NotificationsService } from "../notifications/notifications.service";
import { formatXOF, PAYMENT_METHOD_LABELS, PaymentMethod } from "@ivologis/shared";
import { StorageService } from "../storage/storage.service";
import { SettingsService } from "../settings/settings.service";
import { CreatePaymentDto } from "./dto/create-payment.dto";
import { PaymentFilterDto } from "./dto/payment-filter.dto";

function generateReceiptNumber() {
  const year = new Date().getFullYear();
  const random = Math.floor(10000 + Math.random() * 90000);
  return `QUIT-${year}-${random}`;
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

@Injectable()
export class PaymentsService {
  constructor(
    private prisma: PrismaService,
    private pdfService: PdfService,
    private notifications: NotificationsService,
    private storage: StorageService,
    private settings: SettingsService,
  ) {}

  async create(dto: CreatePaymentDto) {
    if (!dto.tenantId) {
      throw new BadRequestException("Le locataire du paiement est requis.");
    }

    const property = await this.prisma.property.findUnique({ where: { id: dto.propertyId } });
    if (!property) throw new NotFoundException("Bien introuvable.");

    let leaseId = dto.leaseId;
    if (!leaseId) {
      const activeLease = await this.prisma.lease.findFirst({
        where: { propertyId: dto.propertyId, tenantId: dto.tenantId, status: LeaseStatus.ACTIVE },
      });
      leaseId = activeLease?.id;
    }

    const status = dto.status ?? PaymentStatus.PAID;

    const payment = await this.prisma.payment.create({
      data: {
        tenantId: dto.tenantId,
        propertyId: dto.propertyId,
        ownerId: property.ownerId,
        leaseId,
        amount: dto.amount,
        periodMonth: startOfMonth(new Date(dto.periodMonth)),
        paymentDate: dto.paymentDate ? new Date(dto.paymentDate) : new Date(),
        method: dto.method,
        transactionRef: dto.transactionRef,
        status,
        notes: dto.notes,
      },
    });

    if (status === PaymentStatus.PAID) {
      await this.generateReceipt(payment.id);
      await this.notifyTenantPaymentReceived(payment.id);
    }

    return this.findOne(payment.id);
  }

  private async notifyTenantPaymentReceived(paymentId: string) {
    const payment = await this.findOne(paymentId);
    if (!payment.tenant.userId) return;
    await this.notifications.notify({
      userId: payment.tenant.userId,
      type: "PAYMENT_RECEIVED",
      title: "Paiement reçu",
      message: `Votre paiement de ${formatXOF(Number(payment.amount))} pour ${payment.property.name} a été confirmé.`,
    });
  }

  /**
   * Aucune intégration Orange Money / MTN / Wave n'est encore disponible :
   * on simule une confirmation quasi instantanée comme le ferait le
   * fournisseur réel, et on génère directement la quittance.
   */
  async simulateMobileMoneyPayment(dto: CreatePaymentDto) {
    return this.create({
      ...dto,
      status: PaymentStatus.PAID,
      transactionRef: dto.transactionRef ?? `SIM-${Date.now()}`,
    });
  }

  async confirmPayment(id: string) {
    await this.prisma.payment.update({ where: { id }, data: { status: PaymentStatus.PAID } });
    await this.generateReceipt(id);
    await this.notifyTenantPaymentReceived(id);
    return this.findOne(id);
  }

  async findAll(filter: PaymentFilterDto, scope: { ownerId?: string; tenantId?: string }) {
    const { skip, take } = toSkipTake(filter);
    const where: any = {
      ...(scope.ownerId ? { ownerId: scope.ownerId } : {}),
      ...(scope.tenantId ? { tenantId: scope.tenantId } : {}),
      ...(filter.tenantId ? { tenantId: filter.tenantId } : {}),
      ...(filter.propertyId ? { propertyId: filter.propertyId } : {}),
      ...(filter.ownerId ? { ownerId: filter.ownerId } : {}),
      ...(filter.status ? { status: filter.status } : {}),
      ...(filter.method ? { method: filter.method } : {}),
    };

    const [data, total] = await Promise.all([
      this.prisma.payment.findMany({
        where,
        skip,
        take,
        orderBy: { paymentDate: "desc" },
        include: {
          tenant: { select: { id: true, fullName: true } },
          property: { select: { id: true, name: true } },
          owner: { select: { id: true, fullName: true } },
          receipt: true,
        },
      }),
      this.prisma.payment.count({ where }),
    ]);

    return { data, total, page: filter.page, limit: filter.limit };
  }

  async findOne(id: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id },
      include: { tenant: true, property: true, owner: true, lease: true, receipt: true },
    });
    if (!payment) throw new NotFoundException("Paiement introuvable.");
    return payment;
  }

  async generateReceipt(paymentId: string) {
    const payment = await this.findOne(paymentId);
    const receiptNumber = generateReceiptNumber();
    const company = await this.settings.get();
    const previous = await this.prisma.receipt.findUnique({ where: { paymentId } });
    await this.storage.deleteByUrl(previous?.pdfUrl);

    const pdfUrl = await this.pdfService.generateReceiptPdf({
      receiptNumber,
      companyName: company.companyName,
      tenantName: payment.tenant.fullName,
      propertyName: payment.property.name,
      propertyAddress: `${payment.property.address}, ${payment.property.commune}`,
      amount: payment.amount as any,
      periodMonth: payment.periodMonth,
      paymentDate: payment.paymentDate,
      method: PAYMENT_METHOD_LABELS[payment.method as PaymentMethod] ?? payment.method,
    });

    return this.prisma.receipt.upsert({
      where: { paymentId },
      create: { paymentId, receiptNumber, pdfUrl },
      update: { receiptNumber, pdfUrl },
    });
  }

  async findOverdue(scope: { ownerId?: string } = {}) {
    const currentMonth = startOfMonth(new Date());

    const activeLeases = await this.prisma.lease.findMany({
      where: {
        status: LeaseStatus.ACTIVE,
        startDate: { lte: new Date() },
        ...(scope.ownerId ? { ownerId: scope.ownerId } : {}),
      },
      include: { tenant: true, property: true, owner: true },
    });

    const overdue: Array<{
      leaseId: string;
      tenant: (typeof activeLeases)[number]["tenant"];
      property: (typeof activeLeases)[number]["property"];
      owner: (typeof activeLeases)[number]["owner"];
      rentAmount: (typeof activeLeases)[number]["rentAmount"];
      month: Date;
    }> = [];
    for (const lease of activeLeases) {
      const paidThisMonth = await this.prisma.payment.findFirst({
        where: {
          leaseId: lease.id,
          periodMonth: currentMonth,
          status: PaymentStatus.PAID,
        },
      });
      if (!paidThisMonth) {
        overdue.push({
          leaseId: lease.id,
          tenant: lease.tenant,
          property: lease.property,
          owner: lease.owner,
          rentAmount: lease.rentAmount,
          month: currentMonth,
        });
      }
    }
    return overdue;
  }

  async sendOverdueReminder(leaseId: string) {
    const lease = await this.prisma.lease.findUnique({
      where: { id: leaseId },
      include: { tenant: true, property: true },
    });
    if (!lease) throw new NotFoundException("Contrat introuvable.");
    if (!lease.tenant.userId) {
      throw new BadRequestException("Ce locataire n'a pas de compte de connexion à notifier.");
    }

    await this.notifications.notify({
      userId: lease.tenant.userId,
      type: "PAYMENT_REMINDER",
      title: "Rappel de paiement",
      message: `Votre loyer pour ${lease.property.name} (${formatXOF(Number(lease.rentAmount))}) est en attente ce mois-ci. Merci de régulariser votre situation rapidement.`,
    });

    return { message: "Rappel envoyé au locataire." };
  }

  async exportCsv(filter: PaymentFilterDto, scope: { ownerId?: string; tenantId?: string }) {
    const { data } = await this.findAll({ ...filter, page: 1, limit: 1000 }, scope);
    const header = "Date,Locataire,Bien,Montant,Methode,Statut,Reference\n";
    const rows = data
      .map((p) =>
        [
          p.paymentDate.toISOString().slice(0, 10),
          p.tenant.fullName,
          p.property.name,
          p.amount,
          p.method,
          p.status,
          p.transactionRef ?? "",
        ]
          .map((v) => `"${String(v).replace(/"/g, '""')}"`)
          .join(","),
      )
      .join("\n");
    return header + rows;
  }
}
