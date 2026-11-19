import { BadRequestException, ConflictException, Injectable, Logger, NotFoundException, OnApplicationBootstrap, OnModuleDestroy } from "@nestjs/common";
import { LeaseStatus, PaymentStatus } from "@prisma/client";
import { randomUUID } from "crypto";
import { PrismaService } from "../prisma/prisma.service";
import { AuditService } from "../audit/audit.service";
import { coveredByAdvance, reminderDue, startOfMonth } from "./rent-reminder";
import { PdfService } from "../common/pdf/pdf.service";
import { toSkipTake } from "../common/dto/pagination.dto";
import { NotificationsService } from "../notifications/notifications.service";
import { formatXOF, PAYMENT_METHOD_LABELS } from "@ivologis/shared";
import { StorageService } from "../storage/storage.service";
import { SettingsService } from "../settings/settings.service";
import { CreatePaymentDto } from "./dto/create-payment.dto";
import { PaymentFilterDto } from "./dto/payment-filter.dto";
import { PayRentDto } from "./dto/pay-rent.dto";
import { Lang, requestLang, runWithLang, tr } from "../common/i18n/i18n";

function generateReceiptNumber() {
  const year = new Date().getFullYear();
  return `QUIT-${year}-${randomUUID().slice(0, 8).toUpperCase()}`;
}

const AUTO_REMINDER_ACTION = "AUTO_RENT_REMINDER";

@Injectable()
export class PaymentsService implements OnApplicationBootstrap, OnModuleDestroy {
  private readonly logger = new Logger(PaymentsService.name);
  private reminderTimers: NodeJS.Timeout[] = [];

  constructor(
    private prisma: PrismaService,
    private pdfService: PdfService,
    private notifications: NotificationsService,
    private storage: StorageService,
    private settings: SettingsService,
    private audit: AuditService,
  ) {}

  onApplicationBootstrap() {
    if (process.env.NODE_ENV === "test") return;
    const run = () => this.sendAutomaticReminders().catch((e) => this.logger.error(`Relances de loyers : ${e?.message ?? e}`));
    // Comme les échéances des baux : le plan gratuit endort le serveur, chaque réveil rattrape les relances, puis toutes les 6 h.
    this.reminderTimers = [setTimeout(run, 45_000), setInterval(run, 6 * 60 * 60 * 1000)];
    this.reminderTimers.forEach((t) => t.unref());
  }

  onModuleDestroy() {
    this.reminderTimers.forEach((t) => clearTimeout(t));
  }

  async create(dto: CreatePaymentDto) {
    if (!dto.tenantId) {
      throw new BadRequestException("Le locataire du paiement est requis.");
    }

    const property = await this.prisma.property.findUnique({ where: { id: dto.propertyId } });
    if (!property) throw new NotFoundException("Bien introuvable.");

    const periodMonth = startOfMonth(new Date(dto.periodMonth));
    let leaseId = dto.leaseId;
    if (leaseId) {
      const lease = await this.prisma.lease.findUnique({ where: { id: leaseId } });
      if (!lease || lease.propertyId !== dto.propertyId || lease.tenantId !== dto.tenantId) {
        throw new BadRequestException("Ce contrat ne correspond pas au bien et au locataire indiqués.");
      }
    } else {
      const activeLease = await this.prisma.lease.findFirst({
        where: { propertyId: dto.propertyId, tenantId: dto.tenantId, status: LeaseStatus.ACTIVE },
      });
      leaseId = activeLease?.id;
    }
    // Une quittance de loyer suppose un bail : sans lui, le paiement serait rattaché à un locataire qui n'occupe pas le bien.
    if (!leaseId) {
      throw new BadRequestException("Aucun bail en cours entre ce locataire et ce bien : créez d'abord le contrat.");
    }

    const status = dto.status ?? PaymentStatus.PAID;

    if (status === PaymentStatus.PAID && leaseId) {
      const alreadyPaid = await this.prisma.payment.findFirst({
        where: { leaseId, periodMonth, status: PaymentStatus.PAID },
      });
      if (alreadyPaid) {
        throw new ConflictException("Un paiement a déjà été enregistré pour cette période.");
      }
    }

    const payment = await this.prisma.payment.create({
      data: {
        tenantId: dto.tenantId,
        propertyId: dto.propertyId,
        ownerId: property.ownerId,
        leaseId,
        amount: dto.amount,
        periodMonth,
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
   * Le locataire déclare avoir payé (aucun encaissement en ligne n'est branché) : le paiement reste
   * EN ATTENTE jusqu'à ce que l'agence retrouve la transaction. Montant, bien et période viennent du bail.
   */
  async declareOwnRent(tenantId: string, dto: PayRentDto) {
    const lease = await this.prisma.lease.findFirst({
      where: { tenantId, status: LeaseStatus.ACTIVE },
      orderBy: { startDate: "desc" },
      include: { property: { select: { name: true } }, tenant: { select: { fullName: true } } },
    });
    if (!lease) throw new BadRequestException("Aucun bail actif ne vous est rattaché.");

    const periodMonth = startOfMonth(new Date());
    const existing = await this.prisma.payment.findFirst({
      where: { leaseId: lease.id, periodMonth, status: { in: [PaymentStatus.PAID, PaymentStatus.PENDING] } },
    });
    if (existing?.status === PaymentStatus.PAID) throw new ConflictException("Le loyer de ce mois est déjà réglé.");
    if (existing) throw new ConflictException("Un paiement est déjà en cours de vérification pour ce mois.");

    const payment = await this.prisma.payment.create({
      data: {
        tenantId,
        propertyId: lease.propertyId,
        ownerId: lease.ownerId,
        leaseId: lease.id,
        amount: lease.rentAmount,
        periodMonth,
        method: dto.method,
        transactionRef: dto.transactionRef.trim(),
        notes: dto.notes,
        status: PaymentStatus.PENDING,
      },
    });

    await this.notifications.notifyStaff({
      type: "PAYMENT_DECLARED",
      title: "Paiement à vérifier",
      message: `${lease.tenant.fullName} déclare avoir payé ${formatXOF(Number(lease.rentAmount))} (${lease.property.name}), réf. ${payment.transactionRef}.`,
    });

    return this.findOne(payment.id);
  }

  async confirmPayment(id: string) {
    const payment = await this.findOne(id);
    if (payment.status !== PaymentStatus.PENDING && payment.status !== PaymentStatus.LATE) {
      throw new BadRequestException("Seul un paiement en attente ou en retard peut être confirmé.");
    }
    if (payment.leaseId) {
      const alreadyPaid = await this.prisma.payment.findFirst({
        where: { leaseId: payment.leaseId, periodMonth: payment.periodMonth, status: PaymentStatus.PAID, id: { not: id } },
      });
      if (alreadyPaid) throw new ConflictException("Un paiement a déjà été confirmé pour cette période.");
    }
    await this.prisma.payment.update({ where: { id }, data: { status: PaymentStatus.PAID } });
    await this.generateReceipt(id);
    await this.notifyTenantPaymentReceived(id);
    return this.findOne(id);
  }

  async rejectPayment(id: string, reason?: string) {
    const payment = await this.findOne(id);
    if (payment.status !== PaymentStatus.PENDING) {
      throw new BadRequestException("Seul un paiement en attente peut être refusé.");
    }
    await this.prisma.payment.update({
      where: { id },
      data: { status: PaymentStatus.CANCELLED, notes: reason ? `Refusé : ${reason}` : payment.notes },
    });
    if (payment.tenant.userId) {
      await this.notifications.notify({
        userId: payment.tenant.userId,
        type: "PAYMENT_REJECTED",
        title: "Paiement non retrouvé",
        message: `L'agence n'a pas retrouvé votre paiement (réf. ${payment.transactionRef ?? "-"}).${reason ? ` Motif : ${reason}.` : ""} Contactez-la si vous avez bien payé.`,
      });
    }
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
    if (payment.status !== PaymentStatus.PAID) {
      throw new BadRequestException("Une quittance ne peut être émise que pour un paiement encaissé.");
    }
    const receiptNumber = generateReceiptNumber();
    const company = await this.settings.get();
    const previous = await this.prisma.receipt.findUnique({ where: { paymentId } });
    await this.storage.deleteByUrl(previous?.pdfUrl);

    // Quittance dans la langue du locataire s'il a un compte, sinon dans celle de la personne qui l'émet.
    const tenantUser = payment.tenant.userId
      ? await this.prisma.user.findUnique({ where: { id: payment.tenant.userId }, select: { language: true } })
      : null;
    const pdfUrl = await runWithLang((tenantUser?.language as Lang | undefined) ?? requestLang(), () => this.pdfService.generateReceiptPdf({
      receiptNumber,
      companyName: company.companyName,
      companyAddress: company.address,
      companyEmail: company.email,
      companyPhone: company.phone,
      tenantName: payment.tenant.fullName,
      propertyName: payment.property.name,
      propertyAddress: `${payment.property.address}, ${payment.property.commune}`,
      amount: payment.amount as any,
      periodMonth: payment.periodMonth,
      paymentDate: payment.paymentDate,
      method: PAYMENT_METHOD_LABELS[payment.method as keyof typeof PAYMENT_METHOD_LABELS] ?? payment.method,
    }));

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
      startDate: Date;
      month: Date;
    }> = [];
    for (const lease of activeLeases) {
      if (coveredByAdvance(lease, currentMonth)) continue;
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
          startDate: lease.startDate,
          month: currentMonth,
        });
      }
    }
    return overdue;
  }

  private remindTenant(userId: string, propertyName: string, rentAmount: unknown) {
    return this.notifications.notify({
      userId,
      type: "PAYMENT_REMINDER",
      title: "Rappel de paiement",
      message: `Votre loyer pour ${propertyName} (${formatXOF(Number(rentAmount))}) est en attente ce mois-ci. Merci de régulariser votre situation rapidement.`,
    });
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

    await this.remindTenant(lease.tenant.userId, lease.property.name, lease.rentAmount);
    return { message: "Rappel envoyé au locataire." };
  }

  /**
   * P1-16 : à J+5 d'un loyer impayé, un seul rappel par bail et par mois (journalisé dans l'audit, ce qui évite les doublons
   * entre deux passages) ; l'agence reçoit le récapitulatif, avec les locataires sans compte à appeler.
   */
  async sendAutomaticReminders(now = new Date()) {
    const month = startOfMonth(now);
    const due = (await this.findOverdue()).filter((o) => reminderDue(o.startDate, now));
    if (!due.length) return { reminded: 0, toCall: 0 };

    const done = await this.prisma.auditLog.findMany({
      where: { action: AUTO_REMINDER_ACTION, createdAt: { gte: month }, entityId: { in: due.map((o) => o.leaseId) } },
      select: { entityId: true },
    });
    const already = new Set(done.map((d) => d.entityId));
    const todo = due.filter((o) => !already.has(o.leaseId));
    if (!todo.length) return { reminded: 0, toCall: 0 };

    const toCall: string[] = [];
    for (const o of todo) {
      if (o.tenant.userId) await this.remindTenant(o.tenant.userId, o.property.name, o.rentAmount);
      else toCall.push(o.tenant.fullName);
      await this.audit.log({
        action: AUTO_REMINDER_ACTION,
        entityType: "Lease",
        entityId: o.leaseId,
        metadata: { month: month.toISOString().slice(0, 7), tenantNotified: !!o.tenant.userId },
      });
    }

    const reminded = todo.length - toCall.length;
    await this.notifications.notifyStaff({
      type: "PAYMENT_REMINDER",
      title: "Relances automatiques de loyers",
      message: toCall.length
        ? `${todo.length} loyer(s) impayé(s) à J+5 : rappel envoyé à ${reminded} locataire(s). Sans compte, à appeler : ${toCall.join(", ")}.`
        : `${todo.length} loyer(s) impayé(s) à J+5 : rappel envoyé à ${reminded} locataire(s).`,
    });
    this.logger.log(`Relances de loyers : ${reminded} rappel(s), ${toCall.length} locataire(s) à appeler.`);
    return { reminded, toCall: toCall.length };
  }

  async exportCsv(filter: PaymentFilterDto, scope: { ownerId?: string; tenantId?: string }) {
    const { data } = await this.findAll({ ...filter, page: 1, limit: 1000 }, scope);
    const header = tr("Date,Locataire,Bien,Montant,Methode,Statut,Reference") + "\n";
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
