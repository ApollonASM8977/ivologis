import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { PrismaService } from "../../prisma/prisma.service";
import { AccountStatus } from "@prisma/client";
import { AuthenticatedUser } from "../../common/types/authenticated-user";

interface JwtPayload {
  sub: string;
  tv?: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET as string,
    });
  }

  async validate(payload: JwtPayload): Promise<AuthenticatedUser> {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: {
        owner: { select: { id: true } },
        tenant: { select: { id: true } },
        permissions: { include: { permission: true } },
      },
    });

    if (!user) {
      throw new UnauthorizedException("Utilisateur introuvable.");
    }
    if (user.status !== AccountStatus.ACTIVE) {
      throw new UnauthorizedException("Ce compte n'est pas actif.");
    }
    if ((payload.tv ?? 0) !== user.tokenVersion) {
      throw new UnauthorizedException("Session expirée. Reconnectez-vous.");
    }

    return {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      permissions: user.permissions.map((p) => p.permission.key),
      ownerId: user.owner?.id ?? null,
      tenantId: user.tenant?.id ?? null,
    };
  }
}
