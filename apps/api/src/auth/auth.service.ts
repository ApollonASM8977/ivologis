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

const SELF_REGISTER_ROLES: UserRole[] = [UserRole.OWNER, UserRole.TENANT];

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private audit: AuditService,
  ) {}

  private async issueToken(userId: string) {
    return this.jwt.signAsync({ sub: userId });
  }

  private sanitizeUser(user: { passwordHash: string } & Record<string, any>) {
    const { passwordHash, ...rest } = user;
    return rest;
  }

  async register(dto: RegisterDto) {
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

    const accessToken = await this.issueToken(user.id);
    return { accessToken, user: this.sanitizeUser(user) };
  }

  async login(dto: LoginDto) {
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

    const accessToken = await this.issueToken(user.id);
    return { accessToken, user: this.sanitizeUser(user) };
  }

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    // On ne révèle jamais si l'email existe ou non (anti-énumération de comptes).
    if (!user) {
      return { message: "Si ce compte existe, un lien de réinitialisation a été envoyé." };
    }

    const resetToken = await this.jwt.signAsync(
      { sub: user.id, purpose: "reset" },
      { expiresIn: "1h" },
    );

    // Placeholder : en attendant l'intégration d'un fournisseur email/SMS réel,
    // le lien est journalisé côté serveur pour les tests en local.
    // eslint-disable-next-line no-console
    console.log(`[IVOLOGIS] Lien de réinitialisation pour ${email}: /reset-password?token=${resetToken}`);

    return { message: "Si ce compte existe, un lien de réinitialisation a été envoyé." };
  }

  async resetPassword(token: string, newPassword: string) {
    let payload: { sub: string; purpose: string };
    try {
      payload = await this.jwt.verifyAsync(token);
    } catch {
      throw new BadRequestException("Lien de réinitialisation invalide ou expiré.");
    }
    if (payload.purpose !== "reset") {
      throw new BadRequestException("Lien de réinitialisation invalide.");
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await this.prisma.user.update({
      where: { id: payload.sub },
      data: { passwordHash },
    });

    return { message: "Mot de passe réinitialisé avec succès." };
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
