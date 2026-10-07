import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcryptjs";
import { AccountStatus, UserRole } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import { AuditService } from "../audit/audit.service";
import { authenticator } from "otplib";
import { publicUser } from "../common/utils/public-user";

const SELF_REGISTER_ROLES: UserRole[] = [UserRole.OWNER, UserRole.TENANT];
const INTERNAL_ROLES: UserRole[] = [UserRole.SUPER_ADMIN, UserRole.ADMIN_AGENT];
// Désactivé temporairement pendant la phase de test (demande du 2026-10-07) : la 2FA reste
// disponible en configuration volontaire (/auth/2fa/setup + /auth/2fa/enable) mais n'est plus
// imposée au login des comptes internes. Remettre à `true` une fois les tests terminés.
const ENFORCE_MANDATORY_2FA = false;

export interface SessionMeta {
  userAgent?: string;
  ip?: string;
}

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private audit: AuditService,
  ) {}

  private async issueToken(user: { id: string; tokenVersion: number }, meta?: SessionMeta) {
    const session = await this.prisma.session.create({
      data: { userId: user.id, userAgent: meta?.userAgent?.slice(0, 300) ?? null, ip: meta?.ip ?? null },
      select: { id: true },
    });
    return this.jwt.signAsync({ sub: user.id, tv: user.tokenVersion, sid: session.id });
  }

  private passwordFingerprint(passwordHash: string) {
    return passwordHash.slice(-16);
  }

  private sanitizeUser(user: Record<string, any>) {
    return publicUser(user);
  }

  async register(dto: RegisterDto, meta?: SessionMeta) {
    const role = dto.role ?? UserRole.OWNER;
    if (!SELF_REGISTER_ROLES.includes(role)) {
      throw new BadRequestException(
        "Ce rôle ne peut pas être créé par inscription publique.",
      );
    }

    const existing = await this.prisma.user.findFirst({
      where: { OR: [{ email: dto.email }, { phone: dto.phone }] },
    });
    if (existing) {
      throw new ConflictException(
        "Un compte existe déjà avec cet email ou ce numéro de téléphone.",
      );
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);

    const user = await this.prisma.$transaction(async (tx) => {
      if (role === UserRole.OWNER) {
        const existingOwner = await tx.owner.findFirst({
          where: { phone: dto.phone, userId: null },
        });

        const createdUser = await tx.user.create({
          data: {
            fullName: dto.fullName,
            email: dto.email,
            phone: dto.phone,
            passwordHash,
            role: UserRole.OWNER,
            status: AccountStatus.ACTIVE,
          },
        });

        if (existingOwner) {
          await tx.owner.update({
            where: { id: existingOwner.id },
            data: { userId: createdUser.id, email: dto.email },
          });
        } else {
          await tx.owner.create({
            data: {
              userId: createdUser.id,
              fullName: dto.fullName,
              phone: dto.phone,
              email: dto.email,
            },
          });
        }
        return createdUser;
      }

      // TENANT : doit déjà avoir un dossier créé par un agent/propriétaire.
      const existingTenant = await tx.tenant.findFirst({
        where: { phone: dto.phone, userId: null },
      });
      if (!existingTenant) {
        throw new BadRequestException(
          "Aucun dossier locataire trouvé pour ce numéro. Contactez votre agence IVOLOGIS.",
        );
      }

      const createdUser = await tx.user.create({
        data: {
          fullName: dto.fullName,
          email: dto.email,
          phone: dto.phone,
          passwordHash,
          role: UserRole.TENANT,
          status: AccountStatus.ACTIVE,
        },
      });

      await tx.tenant.update({
        where: { id: existingTenant.id },
        data: { userId: createdUser.id, email: dto.email },
      });

      return createdUser;
    });

    await this.audit.log({
      userId: user.id,
      action: "REGISTER",
      entityType: "User",
      entityId: user.id,
    });

    const accessToken = await this.issueToken(user, meta);
    return { accessToken, user: this.sanitizeUser(user) };
  }

  async login(dto: LoginDto, meta?: SessionMeta) {
    const user = await this.prisma.user.findFirst({
      where: { OR: [{ email: dto.identifier }, { phone: dto.identifier }] },
    });

    if (!user) {
      throw new UnauthorizedException("Identifiants incorrects.");
    }
    if (user.status === AccountStatus.SUSPENDED) {
      throw new UnauthorizedException("Ce compte a été suspendu.");
    }
    if (user.status === AccountStatus.PENDING) {
      throw new UnauthorizedException("Ce compte est en attente de validation.");
    }

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException("Identifiants incorrects.");
    }

    if (ENFORCE_MANDATORY_2FA && INTERNAL_ROLES.includes(user.role) && !user.totpEnabled) {
      const setupToken = await this.jwt.signAsync({ sub: user.id, purpose: "2fa-setup" }, { expiresIn: "15m" });
      return { requires2faSetup: true as const, setupToken };
    }

    if (user.totpEnabled) {
      if (!dto.code) {
        return { requires2fa: true as const };
      }
      if (!user.totpSecret || !authenticator.check(dto.code, user.totpSecret)) {
        throw new UnauthorizedException("Code de vérification invalide.");
      }
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    await this.audit.log({
      userId: user.id,
      action: "LOGIN",
      entityType: "User",
      entityId: user.id,
    });

    const accessToken = await this.issueToken(user, meta);
    return { accessToken, user: this.sanitizeUser(user) };
  }

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    // On ne révèle jamais si l'email existe ou non (anti-énumération de comptes).
    if (!user) {
      return { message: "Si ce compte existe, un lien de réinitialisation a été envoyé." };
    }

    const resetToken = await this.jwt.signAsync(
      { sub: user.id, purpose: "reset", h: this.passwordFingerprint(user.passwordHash) },
      { expiresIn: "1h" },
    );

    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.log(`[IVOLOGIS][dev] Lien de réinitialisation pour ${email}: /reset-password?token=${resetToken}`);
    }

    return { message: "Si ce compte existe, un lien de réinitialisation a été envoyé." };
  }

  async resetPassword(token: string, newPassword: string) {
    let payload: { sub: string; purpose: string; h: string };
    try {
      payload = await this.jwt.verifyAsync(token);
    } catch {
      throw new BadRequestException("Lien de réinitialisation invalide ou expiré.");
    }
    if (payload.purpose !== "reset") {
      throw new BadRequestException("Lien de réinitialisation invalide.");
    }

    const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user || this.passwordFingerprint(user.passwordHash) !== payload.h) {
      throw new BadRequestException("Ce lien a déjà été utilisé. Demandez un nouveau lien.");
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await this.prisma.user.update({
      where: { id: user.id },
      data: { passwordHash, tokenVersion: { increment: 1 } },
    });

    await this.audit.log({ userId: user.id, action: "PASSWORD_RESET", entityType: "User", entityId: user.id });

    return { message: "Mot de passe réinitialisé avec succès." };
  }

  async logoutEverywhere(userId: string) {
    await this.prisma.$transaction([
      this.prisma.user.update({ where: { id: userId }, data: { tokenVersion: { increment: 1 } } }),
      this.prisma.session.updateMany({ where: { userId, revokedAt: null }, data: { revokedAt: new Date() } }),
    ]);
    return { message: "Toutes les sessions ont été fermées." };
  }

  async setupTwoFactor(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException();
    if (user.totpEnabled) {
      throw new BadRequestException("La double authentification est déjà activée.");
    }
    const secret = authenticator.generateSecret();
    await this.prisma.user.update({ where: { id: userId }, data: { totpSecret: secret } });
    return {
      secret,
      otpauthUrl: authenticator.keyuri(user.email, "IVOLOGIS", secret),
    };
  }

  async enableTwoFactor(userId: string, code: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user?.totpSecret) {
      throw new BadRequestException("Lancez d'abord la configuration de la double authentification.");
    }
    if (!authenticator.check(code, user.totpSecret)) {
      throw new BadRequestException("Code invalide. Vérifiez l'heure de votre téléphone et réessayez.");
    }
    await this.prisma.user.update({ where: { id: userId }, data: { totpEnabled: true } });
    await this.audit.log({ userId, action: "ENABLE_2FA", entityType: "User", entityId: userId });
    return { message: "Double authentification activée." };
  }

  async disableTwoFactor(userId: string, code: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user?.totpEnabled || !user.totpSecret) {
      throw new BadRequestException("La double authentification n'est pas activée.");
    }
    if (!authenticator.check(code, user.totpSecret)) {
      throw new BadRequestException("Code invalide.");
    }
    await this.prisma.user.update({
      where: { id: userId },
      data: { totpEnabled: false, totpSecret: null },
    });
    await this.audit.log({ userId, action: "DISABLE_2FA", entityType: "User", entityId: userId });
    return { message: "Double authentification désactivée." };
  }

  private async verifySetupToken(setupToken: string) {
    let payload: { sub: string; purpose: string };
    try {
      payload = await this.jwt.verifyAsync(setupToken);
    } catch {
      throw new UnauthorizedException("Session de configuration expirée. Reconnectez-vous.");
    }
    if (payload.purpose !== "2fa-setup") throw new UnauthorizedException("Jeton invalide.");
    const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user || !INTERNAL_ROLES.includes(user.role)) throw new UnauthorizedException("Jeton invalide.");
    return user;
  }

  async mandatorySetup(setupToken: string) {
    const user = await this.verifySetupToken(setupToken);
    if (user.totpEnabled) throw new BadRequestException("La double authentification est déjà activée.");
    const secret = authenticator.generateSecret();
    await this.prisma.user.update({ where: { id: user.id }, data: { totpSecret: secret } });
    return { secret, otpauthUrl: authenticator.keyuri(user.email, "IVOLOGIS", secret) };
  }

  async mandatoryConfirm(setupToken: string, code: string, meta?: SessionMeta) {
    const user = await this.verifySetupToken(setupToken);
    if (!user.totpSecret || !authenticator.check(code, user.totpSecret)) {
      throw new BadRequestException("Code invalide. Vérifiez l'heure de votre téléphone et réessayez.");
    }
    const updated = await this.prisma.user.update({ where: { id: user.id }, data: { totpEnabled: true } });
    await this.audit.log({ userId: user.id, action: "ENABLE_2FA", entityType: "User", entityId: user.id });
    const accessToken = await this.issueToken(updated, meta);
    return { accessToken, user: this.sanitizeUser(updated) };
  }

  async listSessions(userId: string, currentSessionId?: string | null) {
    const sessions = await this.prisma.session.findMany({
      where: { userId, revokedAt: null },
      orderBy: { lastSeenAt: "desc" },
      select: { id: true, userAgent: true, ip: true, createdAt: true, lastSeenAt: true },
      take: 50,
    });
    return sessions.map((x) => ({ ...x, current: x.id === currentSessionId }));
  }

  async revokeSession(userId: string, sessionId: string) {
    const result = await this.prisma.session.updateMany({
      where: { id: sessionId, userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    if (result.count === 0) throw new BadRequestException("Session introuvable ou déjà fermée.");
    return { message: "Session fermée." };
  }

  async me(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { owner: true, tenant: true },
    });
    if (!user) throw new UnauthorizedException();
    return this.sanitizeUser(user);
  }
}
