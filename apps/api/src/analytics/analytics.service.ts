import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { PageViewDto } from "./dto/page-view.dto";

const DAY_MS = 24 * 60 * 60 * 1000;
const UUID = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi;

/** Chemin sans paramètres et sans identifiants : on compte des pages, pas des personnes ni des dossiers. */
export function normalizePath(path: string) {
  const clean = path.split(/[?#]/)[0].replace(UUID, ":id").replace(/\/+$/, "");
  return clean || "/";
}

/** Site d'origine (domaine seulement) ; les visites internes au site ne comptent pas comme « origine ». */
export function referrerHost(referrer?: string, ownHosts: string[] = []) {
  if (!referrer) return null;
  try {
    const host = new URL(referrer).hostname.replace(/^www\./, "");
    return ownHosts.some((h) => host === h || host.endsWith(`.${h}`)) ? null : host.slice(0, 100);
  } catch {
    return null;
  }
}

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async record(dto: PageViewDto) {
    const own = (process.env.CORS_ORIGIN ?? "").split(",").map((o) => o.trim().replace(/^https?:\/\//, "").replace(/:\d+$/, "")).filter(Boolean);
    await this.prisma.pageView.create({
      data: { path: normalizePath(dto.path), lang: dto.lang, device: dto.device, referrerHost: referrerHost(dto.referrer, own) },
    });
  }

  /** Synthèse pour l'agence : visites par jour, pages, langues, appareils, sites d'origine. */
  async summary(days = 30) {
    const since = new Date(Date.now() - days * DAY_MS);
    const where = { createdAt: { gte: since } };
    const [total, pages, langs, devices, referrers, rows] = await Promise.all([
      this.prisma.pageView.count({ where }),
      this.prisma.pageView.groupBy({ by: ["path"], where, _count: { _all: true }, orderBy: { _count: { path: "desc" } }, take: 10 }),
      this.prisma.pageView.groupBy({ by: ["lang"], where, _count: { _all: true } }),
      this.prisma.pageView.groupBy({ by: ["device"], where, _count: { _all: true } }),
      this.prisma.pageView.groupBy({ by: ["referrerHost"], where: { ...where, referrerHost: { not: null } }, _count: { _all: true }, orderBy: { _count: { referrerHost: "desc" } }, take: 5 }),
      this.prisma.pageView.findMany({ where, select: { createdAt: true } }),
    ]);
    const perDay = new Map<string, number>();
    for (const r of rows) {
      const day = r.createdAt.toISOString().slice(0, 10);
      perDay.set(day, (perDay.get(day) ?? 0) + 1);
    }
    return {
      days,
      total,
      perDay: [...perDay.entries()].sort().map(([day, views]) => ({ day, views })),
      pages: pages.map((p) => ({ path: p.path, views: p._count._all })),
      langs: langs.map((l) => ({ lang: l.lang, views: l._count._all })),
      devices: devices.map((d) => ({ device: d.device, views: d._count._all })),
      referrers: referrers.map((r) => ({ host: r.referrerHost, views: r._count._all })),
    };
  }
}
