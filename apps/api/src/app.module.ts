import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import { APP_GUARD } from "@nestjs/core";
import { PrismaModule } from "./prisma/prisma.module";
import { AuditModule } from "./audit/audit.module";
import { StorageModule } from "./storage/storage.module";
import { PdfModule } from "./common/pdf/pdf.module";
import { DocxModule } from "./common/docx/docx.module";
import { NotificationsModule } from "./notifications/notifications.module";
import { AuthModule } from "./auth/auth.module";
import { UsersModule } from "./users/users.module";
import { OwnersModule } from "./owners/owners.module";
import { TenantsModule } from "./tenants/tenants.module";
import { PropertiesModule } from "./properties/properties.module";
import { LeasesModule } from "./leases/leases.module";
import { PaymentsModule } from "./payments/payments.module";
import { MaintenanceModule } from "./maintenance/maintenance.module";
import { ReportsModule } from "./reports/reports.module";
import { SettingsModule } from "./settings/settings.module";
import { ContactModule } from "./contact/contact.module";
import { SearchModule } from "./search/search.module";
import { TenantRequestsModule } from "./tenant-requests/tenant-requests.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot({
      throttlers: [{ ttl: 60_000, limit: 120 }],
    }),
    PrismaModule,
    AuditModule,
    StorageModule,
    PdfModule,
    DocxModule,
    NotificationsModule,
    AuthModule,
    UsersModule,
    OwnersModule,
    TenantsModule,
    PropertiesModule,
    LeasesModule,
    PaymentsModule,
    MaintenanceModule,
    ReportsModule,
    SettingsModule,
    ContactModule,
    SearchModule,
    TenantRequestsModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
