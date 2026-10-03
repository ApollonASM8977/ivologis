import { Injectable } from "@nestjs/common";
import { MaintenanceStatus, PaymentStatus, PropertyStatus } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";

function monthRange(monthsAgo: number) {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - monthsAgo, 1);
  const end = new Date(now.getFullYear(), now.getMonth() - monthsAgo + 1, 1);
  return { start, end };
}

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  private async revenueByMonth(ownerId?: string, months = 6) {
    const chart: { month: string; revenue: number }[] = [];
    for (let i = months - 1; i >= 0; i--) {
      const { start, end } = monthRange(i);
      const sum = await this.prisma.payment.aggregate({
        where: {
          status: PaymentStatus.PAID,
          paymentDate: { gte: start, lt: end },
          ...(ownerId ? { ownerId } : {}),
        },
        _sum: { amount: true },
      });
      chart.push({
        month: start.toLocaleDateString("fr-FR", { month: "short", year: "2-digit" }),
        revenue: Number(sum._sum.amount ?? 0),
      });
    }
    return chart;
  }

  async globalDashboard() {
    const [
      totalProperties,
      occupied,
      vacant,
      ownersCount,
      tenantsCount,
      monthRevenue,
      overdue,
      openMaintenance,
      revenueChart,
    ] = await Promise.all([
      this.prisma.property.count({ where: { archivedAt: null } }),
      this.prisma.property.count({ where: { status: PropertyStatus.LOUE, archivedAt: null } }),
      this.prisma.property.count({ where: { status: PropertyStatus.VACANT, archivedAt: null } }),
      this.prisma.owner.count(),
      this.prisma.tenant.count(),
      this.prisma.payment.aggregate({
        where: { status: PaymentStatus.PAID, paymentDate: { gte: monthRange(0).start } },
        _sum: { amount: true },
      }),
      this.prisma.payment.count({ where: { status: PaymentStatus.LATE } }),
      this.prisma.maintenanceRequest.count({
        where: { status: { in: [MaintenanceStatus.RECU, MaintenanceStatus.EN_COURS] } },
      }),
      this.revenueByMonth(),
    ]);

    const occupancyRate = totalProperties > 0 ? Math.round((occupied / totalProperties) * 100) : 0;

    return {
      totalProperties,
      occupied,
      vacant,
      ownersCount,
      tenantsCount,
      monthlyRevenue: Number(monthRevenue._sum.amount ?? 0),
      overdueCount: overdue,
      openMaintenanceCount: openMaintenance,
      occupancyRate,
      revenueChart,
    };
  }

  async ownerDashboard(ownerId: string) {
    const [totalProperties, occupied, monthRevenue, overdue, openMaintenance, revenueChart] =
      await Promise.all([
        this.prisma.property.count({ where: { ownerId, archivedAt: null } }),
        this.prisma.property.count({
          where: { ownerId, status: PropertyStatus.LOUE, archivedAt: null },
        }),
        this.prisma.payment.aggregate({
          where: { ownerId, status: PaymentStatus.PAID, paymentDate: { gte: monthRange(0).start } },
          _sum: { amount: true },
        }),
        this.prisma.payment.count({ where: { ownerId, status: PaymentStatus.LATE } }),
        this.prisma.maintenanceRequest.count({
          where: {
            property: { ownerId },
            status: { in: [MaintenanceStatus.RECU, MaintenanceStatus.EN_COURS] },
          },
        }),
        this.revenueByMonth(ownerId),
      ]);

    return {
      totalProperties,
      occupied,
      vacant: totalProperties - occupied,
      monthlyRevenue: Number(monthRevenue._sum.amount ?? 0),
      overdueCount: overdue,
      openMaintenanceCount: openMaintenance,
      revenueChart,
    };
  }

  async ownerFinancialReport(ownerId: string) {
    const [totalRevenue, maintenanceCosts, mostProfitable, settings] = await Promise.all([
      this.prisma.payment.aggregate({
        where: { ownerId, status: PaymentStatus.PAID },
        _sum: { amount: true },
      }),
      this.prisma.maintenanceRequest.aggregate({
        where: { property: { ownerId } },
        _sum: { finalCost: true },
      }),
      this.prisma.payment.groupBy({
        by: ["propertyId"],
        where: { ownerId, status: PaymentStatus.PAID },
        _sum: { amount: true },
        orderBy: { _sum: { amount: "desc" } },
        take: 5,
      }),
      this.prisma.companySettings.findFirst(),
    ]);

    const propertyIds = mostProfitable.map((m) => m.propertyId);
    const properties = await this.prisma.property.findMany({
      where: { id: { in: propertyIds } },
      select: { id: true, name: true, commune: true },
    });

    const revenue = Number(totalRevenue._sum.amount ?? 0);
    const commissionRate = Number(settings?.commissionRate ?? 10);
    const commission = (revenue * commissionRate) / 100;
    const maintenance = Number(maintenanceCosts._sum.finalCost ?? 0);

    return {
      totalRevenue: revenue,
      maintenanceCosts: maintenance,
      commission,
      netBalance: revenue - commission - maintenance,
      mostProfitableProperties: mostProfitable.map((m) => ({
        property: properties.find((p) => p.id === m.propertyId),
        revenue: Number(m._sum.amount ?? 0),
      })),
    };
  }

  async ownerStatement(ownerId: string) {
    const [owner, summary, payments, maintenance, settings] = await Promise.all([
      this.prisma.owner.findUnique({ where: { id: ownerId }, select: { fullName: true } }),
      this.ownerFinancialReport(ownerId),
      this.prisma.payment.findMany({
        where: { ownerId, status: PaymentStatus.PAID },
        orderBy: { paymentDate: "desc" },
        take: 1000,
        include: { property: { select: { name: true } }, tenant: { select: { fullName: true } } },
      }),
      this.prisma.maintenanceRequest.findMany({
        where: { property: { ownerId } },
        orderBy: { createdAt: "desc" },
        take: 1000,
        include: { property: { select: { name: true } } },
      }),
      this.prisma.companySettings.findFirst(),
    ]);

    return {
      owner,
      summary,
      payments,
      maintenance,
      companyName: settings?.companyName ?? "IVOLOGIS",
      commissionRate: Number(settings?.commissionRate ?? 10),
      generatedAt: new Date(),
    };
  }

  async propertyReport(propertyId: string) {
    const [payments, maintenanceRequests, leases] = await Promise.all([
      this.prisma.payment.findMany({ where: { propertyId }, orderBy: { paymentDate: "desc" } }),
      this.prisma.maintenanceRequest.findMany({ where: { propertyId }, orderBy: { createdAt: "desc" } }),
      this.prisma.lease.findMany({ where: { propertyId }, orderBy: { createdAt: "desc" } }),
    ]);

    const totalRevenue = payments
      .filter((p) => p.status === PaymentStatus.PAID)
      .reduce((sum, p) => sum + Number(p.amount), 0);
    const totalMaintenanceCost = maintenanceRequests.reduce(
      (sum, m) => sum + Number(m.finalCost ?? 0),
      0,
    );

    return { totalRevenue, totalMaintenanceCost, payments, maintenanceRequests, leases };
  }

  async globalFinancialReport() {
    const [byCommune, byType, revenueChart] = await Promise.all([
      this.prisma.$queryRaw<{ commune: string; revenue: number }[]>`
        SELECT p.commune as commune, COALESCE(SUM(pay.amount), 0)::float as revenue
        FROM payments pay
        JOIN properties p ON p.id = pay."propertyId"
        WHERE pay.status = 'PAID'
        GROUP BY p.commune
        ORDER BY revenue DESC
      `,
      this.prisma.$queryRaw<{ type: string; revenue: number }[]>`
        SELECT p.type as type, COALESCE(SUM(pay.amount), 0)::float as revenue
        FROM payments pay
        JOIN properties p ON p.id = pay."propertyId"
        WHERE pay.status = 'PAID'
        GROUP BY p.type
        ORDER BY revenue DESC
      `,
      this.revenueByMonth(undefined, 12),
    ]);

    return { byCommune, byType, revenueChart };
  }
}
