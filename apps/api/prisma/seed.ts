import { PrismaClient, UserRole, AccountStatus, PropertyType, PropertyStatus, PaymentMethod, PaymentStatus, MaintenanceIssueType, MaintenancePriority, MaintenanceStatus, LeaseStatus, LeaseType } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const PERMISSIONS = [
  { key: "properties.manage", label: "Gérer les biens" },
  { key: "owners.manage", label: "Gérer les propriétaires" },
  { key: "tenants.manage", label: "Gérer les locataires" },
  { key: "leases.manage", label: "Gérer les contrats" },
  { key: "payments.manage", label: "Vérifier les paiements" },
  { key: "maintenance.manage", label: "Suivre la maintenance" },
  { key: "reports.view", label: "Voir les statistiques" },
  { key: "settings.manage", label: "Gérer les paramètres" },
  { key: "users.manage", label: "Gérer les comptes admin" },
];

const hash = (pwd: string) => bcrypt.hash(pwd, 12);

async function main() {
  console.log("Seeding IVOLOGIS...");

  await prisma.companySettings.deleteMany();
  await prisma.companySettings.create({
    data: {
      companyName: "IVOLOGIS",
      address: "Abidjan, Cocody, II Plateaux",
      email: "contact@ivologis.ci",
      phone: "+225 07 00 00 00 00",
      commissionRate: 10,
      currency: "XOF",
    },
  });

  for (const p of PERMISSIONS) {
    await prisma.permission.upsert({ where: { key: p.key }, update: {}, create: p });
  }
  const allPermissions = await prisma.permission.findMany();

  // --- Super Admin ---------------------------------------------------------
  const superAdmin = await prisma.user.upsert({
    where: { email: "admin@ivologis.ci" },
    update: {},
    create: {
      fullName: "Direction IVOLOGIS",
      email: "admin@ivologis.ci",
      phone: "+2250700000001",
      passwordHash: await hash("Ivologis@2026"),
      role: UserRole.SUPER_ADMIN,
      status: AccountStatus.ACTIVE,
    },
  });

  // --- Admin secondaire (agent) --------------------------------------------
  const agent = await prisma.user.upsert({
    where: { email: "agent@ivologis.ci" },
    update: {},
    create: {
      fullName: "Aya Traoré",
      email: "agent@ivologis.ci",
      phone: "+2250700000002",
      passwordHash: await hash("Agent@2026"),
      role: UserRole.ADMIN_AGENT,
      status: AccountStatus.ACTIVE,
      permissions: {
        create: allPermissions
          .filter((p) => p.key !== "settings.manage" && p.key !== "users.manage")
          .map((p) => ({ permissionId: p.id })),
      },
    },
  });

  // --- Propriétaires --------------------------------------------------------
  async function createOwner(fullName: string, email: string, phone: string, password: string) {
    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        fullName,
        email,
        phone,
        passwordHash: await hash(password),
        role: UserRole.OWNER,
        status: AccountStatus.ACTIVE,
      },
    });
    return prisma.owner.upsert({
      where: { userId: user.id },
      update: {},
      create: { userId: user.id, fullName, email, phone, address: "Abidjan" },
    });
  }

  const kouadio = await createOwner("Kouadio Jean", "kouadio.jean@ivologis.ci", "+2250700000003", "Proprio@2026");
  const fatou = await createOwner("Fatou Diarra", "fatou.diarra@ivologis.ci", "+2250700000004", "Proprio@2026");
  const marc = await createOwner("Marc Koffi", "marc.koffi@ivologis.ci", "+2250700000005", "Proprio@2026");

  // --- Locataires ------------------------------------------------------------
  async function createTenant(fullName: string, email: string, phone: string, password: string, profession: string) {
    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        fullName,
        email,
        phone,
        passwordHash: await hash(password),
        role: UserRole.TENANT,
        status: AccountStatus.ACTIVE,
      },
    });
    return prisma.tenant.upsert({
      where: { userId: user.id },
      update: {},
      create: { userId: user.id, fullName, email, phone, profession, address: "Abidjan" },
    });
  }

  const yao = await createTenant("Yao Patrick", "yao.patrick@ivologis.ci", "+2250700000006", "Locataire@2026", "Ingénieur");
  const aicha = await createTenant("Aïcha Koné", "aicha.kone@ivologis.ci", "+2250700000007", "Locataire@2026", "Commerçante");
  const bamba = await createTenant("Bamba Ibrahim", "bamba.ibrahim@ivologis.ci", "+2250700000008", "Locataire@2026", "Enseignant");
  const koffi = await createTenant("Koffi Serge", "koffi.serge@ivologis.ci", "+2250700000009", "Locataire@2026", "Étudiant");

  // --- Biens ------------------------------------------------------------------
  const villa = await prisma.property.create({
    data: {
      name: "Villa Riviera 3",
      type: PropertyType.VILLA,
      description: "Belle villa 5 pièces avec piscine, quartier calme et sécurisé.",
      address: "Rue des Jardins, Riviera 3",
      commune: "Riviera",
      city: "Abidjan",
      rooms: 6,
      bedrooms: 4,
      bathrooms: 3,
      surfaceM2: 350,
      floor: 0,
      yearBuilt: 2018,
      furnished: true,
      amenities: ["Climatisation", "Piscine", "Gardiennage", "Groupe électrogène", "Cour clôturée", "Parking"],
      landmark: "Près de la pharmacie Riviera 3, face à l'école internationale",
      rentAmount: 350000,
      deposit: 700000,
      advance: 350000,
      status: PropertyStatus.LOUE,
      ownerId: kouadio.id,
    },
  });

  const studio = await prisma.property.create({
    data: {
      name: "Studio Angré 8e Tranche",
      type: PropertyType.STUDIO,
      description: "Studio meublé idéal pour jeune actif.",
      address: "Angré 8e Tranche, Cocody",
      commune: "Cocody",
      city: "Abidjan",
      rooms: 1,
      bedrooms: 1,
      bathrooms: 1,
      surfaceM2: 30,
      floor: 2,
      yearBuilt: 2021,
      furnished: true,
      amenities: ["Climatisation", "Internet / fibre", "Cuisine équipée"],
      landmark: "Immeuble bleu en face de la station Total",
      rentAmount: 150000,
      deposit: 300000,
      advance: 150000,
      status: PropertyStatus.LOUE,
      ownerId: fatou.id,
    },
  });

  const appartement = await prisma.property.create({
    data: {
      name: "Appartement Marcory Zone 4",
      type: PropertyType.APPARTEMENT,
      description: "Appartement 3 pièces au 2e étage, proche des commerces.",
      address: "Zone 4, Marcory",
      commune: "Marcory",
      city: "Abidjan",
      rooms: 3,
      bedrooms: 2,
      bathrooms: 2,
      surfaceM2: 90,
      rentAmount: 250000,
      deposit: 500000,
      advance: 250000,
      status: PropertyStatus.LOUE,
      ownerId: marc.id,
    },
  });

  const terrain = await prisma.property.create({
    data: {
      name: "Terrain Bingerville",
      type: PropertyType.TERRAIN,
      description: "Terrain clôturé de 600 m², idéal pour construction.",
      address: "Route de Bingerville",
      commune: "Bingerville",
      city: "Abidjan",
      surfaceM2: 600,
      rentAmount: 0,
      status: PropertyStatus.VACANT,
      ownerId: kouadio.id,
    },
  });

  const maisonYopougon = await prisma.property.create({
    data: {
      name: "Maison Yopougon Niangon",
      type: PropertyType.VILLA,
      description: "Maison familiale 4 pièces avec cour.",
      address: "Niangon Sud, Yopougon",
      commune: "Yopougon",
      city: "Abidjan",
      rooms: 4,
      bedrooms: 3,
      bathrooms: 2,
      surfaceM2: 180,
      rentAmount: 120000,
      deposit: 240000,
      advance: 120000,
      status: PropertyStatus.VACANT,
      ownerId: fatou.id,
    },
  });

  // --- Contrats de bail --------------------------------------------------------
  const now = new Date();
  const oneYearLater = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, 1);

  async function createLease(
    propertyId: string,
    ownerId: string,
    tenantId: string,
    rentAmount: number,
    deposit: number,
    advance: number,
    type: LeaseType = LeaseType.HABITATION_NUE,
    details?: Record<string, unknown>,
  ) {
    const lease = await prisma.lease.create({
      data: {
        contractNumber: `BAIL-${now.getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
        type,
        propertyId,
        ownerId,
        tenantId,
        startDate: sixMonthsAgo,
        endDate: oneYearLater,
        rentAmount,
        deposit,
        advance,
        details: details as any,
        status: LeaseStatus.ACTIVE,
        signatureStatus: "SIGNED",
      },
    });
    await prisma.property.update({ where: { id: propertyId }, data: { currentTenantId: tenantId } });
    return lease;
  }

  const leaseVilla = await createLease(villa.id, kouadio.id, yao.id, 350000, 700000, 350000, LeaseType.HABITATION_MEUBLEE, {
    furnitureInventory: "Salon complet (canapé 6 places, table basse), salle à manger 6 couverts, 3 chambres équipées (lit, armoire, climatiseur), cuisine équipée (cuisinière, réfrigérateur).",
    occupantsCount: "4",
    guarantorName: "Konan Affoué",
    guarantorPhone: "+2250700000050",
    guarantorAddress: "Cocody, Angré",
    noticePeriodMonths: "3",
  });
  const leaseStudio = await createLease(studio.id, fatou.id, aicha.id, 150000, 300000, 150000, LeaseType.HABITATION_NUE, {
    occupantsCount: "1",
    noticePeriodMonths: "1",
  });
  const leaseAppart = await createLease(appartement.id, marc.id, bamba.id, 250000, 500000, 250000, LeaseType.HABITATION_NUE, {
    occupantsCount: "3",
    noticePeriodMonths: "2",
  });

  // --- Paiements ------------------------------------------------------------
  async function createPaidPayment(leaseId: string, tenantId: string, propertyId: string, ownerId: string, amount: number, monthsAgo: number, method: PaymentMethod) {
    const periodMonth = new Date(now.getFullYear(), now.getMonth() - monthsAgo, 1);
    const payment = await prisma.payment.create({
      data: {
        leaseId,
        tenantId,
        propertyId,
        ownerId,
        amount,
        periodMonth,
        paymentDate: periodMonth,
        method,
        status: PaymentStatus.PAID,
        transactionRef: `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
      },
    });
    await prisma.receipt.create({
      data: {
        paymentId: payment.id,
        receiptNumber: `QUIT-${now.getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`,
      },
    });
    return payment;
  }

  for (let i = 5; i >= 1; i--) {
    await createPaidPayment(leaseVilla.id, yao.id, villa.id, kouadio.id, 350000, i, PaymentMethod.ORANGE_MONEY);
  }
  for (let i = 4; i >= 1; i--) {
    await createPaidPayment(leaseStudio.id, aicha.id, studio.id, fatou.id, 150000, i, PaymentMethod.WAVE);
  }
  await createPaidPayment(leaseAppart.id, bamba.id, appartement.id, marc.id, 250000, 2, PaymentMethod.MTN_MONEY);

  // Paiement en retard (mois courant non payé pour l'appartement) -> laissé volontairement absent.
  // Paiement en attente
  await prisma.payment.create({
    data: {
      leaseId: leaseStudio.id,
      tenantId: aicha.id,
      propertyId: studio.id,
      ownerId: fatou.id,
      amount: 150000,
      periodMonth: new Date(now.getFullYear(), now.getMonth(), 1),
      paymentDate: now,
      method: PaymentMethod.MOOV_MONEY,
      status: PaymentStatus.PENDING,
      transactionRef: `SIM-${Date.now()}`,
    },
  });

  // --- Technicien + Maintenance -------------------------------------------
  const technicien = await prisma.technician.create({
    data: { fullName: "Ismaël Ouattara", phone: "+2250700000099", specialty: "Plomberie & Électricité" },
  });

  await prisma.maintenanceRequest.create({
    data: {
      tenantId: yao.id,
      propertyId: villa.id,
      issueType: MaintenanceIssueType.PLOMBERIE,
      description: "Fuite d'eau sous l'évier de la cuisine.",
      priority: MaintenancePriority.URGENTE,
      status: MaintenanceStatus.EN_COURS,
      technicianId: technicien.id,
      estimatedCost: 25000,
    },
  });

  await prisma.maintenanceRequest.create({
    data: {
      tenantId: aicha.id,
      propertyId: studio.id,
      issueType: MaintenanceIssueType.ELECTRICITE,
      description: "Prise électrique du salon ne fonctionne plus.",
      priority: MaintenancePriority.MOYENNE,
      status: MaintenanceStatus.RECU,
    },
  });

  console.log("Seed terminé.");
  console.log("----------------------------------------------------");
  console.log("Comptes de test (mot de passe entre parenthèses) :");
  console.log("Super Admin  : admin@ivologis.ci (Ivologis@2026)");
  console.log("Agent        : agent@ivologis.ci (Agent@2026)");
  console.log("Propriétaire : kouadio.jean@ivologis.ci (Proprio@2026)");
  console.log("Locataire    : yao.patrick@ivologis.ci (Locataire@2026)");
  console.log("----------------------------------------------------");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
