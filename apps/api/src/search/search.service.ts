import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

const LIMIT = 6;

@Injectable()
export class SearchService {
  constructor(private prisma: PrismaService) {}

  async search(q: string) {
    const term = q.trim();
    if (term.length < 2) return { properties: [], tenants: [], owners: [], leases: [] };

    const [properties, tenants, owners, leases] = await Promise.all([
      this.prisma.property.findMany({
        where: { OR: [{ name: { contains: term, mode: "insensitive" } }, { commune: { contains: term, mode: "insensitive" } }, { address: { contains: term, mode: "insensitive" } }] },
        select: { id: true, name: true, commune: true },
        take: LIMIT,
      }),
      this.prisma.tenant.findMany({
        where: { OR: [{ fullName: { contains: term, mode: "insensitive" } }, { phone: { contains: term } }] },
        select: { id: true, fullName: true, phone: true },
        take: LIMIT,
      }),
      this.prisma.owner.findMany({
        where: { OR: [{ fullName: { contains: term, mode: "insensitive" } }, { phone: { contains: term } }] },
        select: { id: true, fullName: true, phone: true },
        take: LIMIT,
      }),
      this.prisma.lease.findMany({
        where: { contractNumber: { contains: term, mode: "insensitive" } },
        select: { id: true, contractNumber: true, tenant: { select: { fullName: true } } },
        take: LIMIT,
      }),
    ]);

    return { properties, tenants, owners, leases };
  }
}
