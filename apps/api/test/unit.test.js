const { test } = require("node:test");
const assert = require("node:assert/strict");
const { buildContractBlocks } = require("../dist/src/common/documents/contract-builder.js");
const { ownerStatementCsv } = require("../dist/src/reports/owner-statement.renderer.js");
const { publicUser } = require("../dist/src/common/utils/public-user.js");
const { CreateContactDto } = require("../dist/src/contact/dto/create-contact.dto.js");
const { plainToInstance } = require("class-transformer");
const { validate } = require("class-validator");

const contractData = {
  contractNumber: "BAIL-TEST-0001",
  type: "HABITATION_NUE",
  companyName: "IVOLOGIS",
  companyAddress: "Abidjan, Cocody",
  companyContact: "+2250700000000 · contact@ivologis.ci",
  ownerName: "Kouadio Jean",
  tenantName: "Yao Patrick",
  propertyName: "Villa Test",
  propertyAddress: "Rue 1",
  propertyCommune: "Cocody",
  propertyTypeLabel: "Villa",
  startDate: new Date("2026-01-01"),
  endDate: new Date("2027-01-01"),
  rentAmount: 350000,
  deposit: 700000,
  advance: 350000,
  details: {},
};

test("contrat : en-tête entreprise et signatures présents", () => {
  const blocks = buildContractBlocks(contractData);
  const texts = blocks.map((b) => b.text ?? "");
  assert.ok(blocks.some((b) => b.kind === "title" && b.text === "IVOLOGIS"));
  assert.ok(texts.some((t) => t.includes("Abidjan, Cocody")));
  assert.ok(blocks.some((b) => b.kind === "signatures"));
});

test("contrat : chaque type produit un document distinct", () => {
  const types = ["HABITATION_NUE", "HABITATION_MEUBLEE", "COMMERCIAL", "PROFESSIONNEL", "TERRAIN"];
  const titles = types.map((type) => {
    const block = buildContractBlocks({ ...contractData, type }).find((b) => b.kind === "subtitle");
    return block.text;
  });
  assert.equal(new Set(titles).size, types.length);
});

test("relevé CSV : BOM, séparateur point-virgule et échappement des cellules", () => {
  const csv = ownerStatementCsv({
    owner: { fullName: 'Marc "Koffi"; SA' },
    summary: { totalRevenue: 650000, maintenanceCosts: 0, commission: 65000, netBalance: 585000 },
    payments: [
      {
        paymentDate: new Date("2026-09-26"),
        amount: 350000,
        method: "ORANGE_MONEY",
        property: { name: "Villa; Riviera" },
        tenant: { fullName: "Yao Patrick" },
      },
    ],
    maintenance: [],
    companyName: "IVOLOGIS",
    commissionRate: 10,
    generatedAt: new Date("2026-10-03T10:00:00Z"),
  }).toString("utf8");
  assert.equal(csv.charCodeAt(0), 0xfeff);
  assert.ok(csv.includes('"Marc ""Koffi""; SA"'), "propriétaire échappé");
  assert.ok(csv.includes('"Villa; Riviera"'), "bien échappé");
  assert.ok(csv.includes("Orange Money"), "libellé du moyen de paiement");
  assert.ok(csv.includes("650000"), "revenus encaissés");
});

test("utilisateur public : aucun secret ne sort de l'API", () => {
  const user = publicUser({
    id: "1",
    email: "a@b.ci",
    passwordHash: "hash",
    totpSecret: "SECRET",
    tokenVersion: 3,
    totpEnabled: true,
  });
  assert.deepEqual(Object.keys(user).sort(), ["email", "id", "totpEnabled"]);
});

async function contactErrors(payload) {
  const dto = plainToInstance(CreateContactDto, payload);
  const errors = await validate(dto, { whitelist: true, forbidNonWhitelisted: true });
  return errors.map((e) => e.property);
}

test("démo : formulaire valide accepté, téléphone vide toléré", async () => {
  const errors = await contactErrors({
    fullName: "Aïcha Koné",
    email: "aicha@example.ci",
    phone: "",
    organization: "",
    portfolioSize: "",
    message: "Nous gérons une quinzaine de biens à Cocody.",
  });
  assert.deepEqual(errors, []);
});

test("démo : email, nom et message invalides rejetés", async () => {
  const errors = await contactErrors({ fullName: "A", email: "pas-un-email", message: "court" });
  assert.deepEqual(errors.sort(), ["email", "fullName", "message"]);
});

test("démo : téléphone renseigné mais incorrect rejeté", async () => {
  const errors = await contactErrors({
    fullName: "Aïcha Koné",
    email: "aicha@example.ci",
    phone: "abc",
    message: "Nous gérons une quinzaine de biens à Cocody.",
  });
  assert.deepEqual(errors, ["phone"]);
});

const { signFilePath, verifyFileSignature } = require("../dist/src/common/utils/signed-url.js");

test("lien signé : valide avant expiration, refusé après, refusé si altéré", () => {
  const secret = "test-secret";
  const now = 1_000_000;
  const signed = signFilePath("/api/files/abc", secret, now);
  const params = new URLSearchParams(signed.split("?")[1]);
  assert.equal(verifyFileSignature("/api/files/abc", params.get("exp"), params.get("sig"), secret, now + 60), true);
  assert.equal(verifyFileSignature("/api/files/abc", params.get("exp"), params.get("sig"), secret, now + 60 * 60), false, "expiré");
  assert.equal(verifyFileSignature("/api/files/autre", params.get("exp"), params.get("sig"), secret, now + 60), false, "autre fichier");
  assert.equal(verifyFileSignature("/api/files/abc", params.get("exp"), "00", secret, now + 60), false, "signature courte");
  assert.equal(verifyFileSignature("/api/files/abc", params.get("exp"), params.get("sig"), "autre-secret", now + 60), false, "mauvais secret");
  assert.equal(verifyFileSignature("/api/files/abc", undefined, undefined, secret, now), false, "sans signature");
});

const { CreateInspectionDto } = require("../dist/src/leases/dto/create-inspection.dto.js");
const { DepositSettlementDto } = require("../dist/src/leases/dto/deposit-settlement.dto.js");
const { CreatePayoutDto } = require("../dist/src/owners/dto/create-payout.dto.js");
const { CreateTenantRequestDto } = require("../dist/src/tenant-requests/dto/create-tenant-request.dto.js");

async function errorsOf(Dto, payload) {
  const dto = plainToInstance(Dto, payload);
  const errors = await validate(dto, { whitelist: true, forbidNonWhitelisted: true });
  return errors.map((e) => e.property);
}

test("état des lieux : pièces et états contrôlés", async () => {
  const valid = {
    type: "ENTREE",
    inspectionDate: "2026-10-01",
    rooms: [{ name: "Salon", condition: "BON", notes: "RAS", photoUrls: ["/api/files/x"] }],
  };
  assert.deepEqual(await errorsOf(CreateInspectionDto, valid), []);
  assert.ok((await errorsOf(CreateInspectionDto, { ...valid, rooms: [{ name: "Salon", condition: "PARFAIT" }] })).includes("rooms"));
  assert.ok((await errorsOf(CreateInspectionDto, { ...valid, type: "AUTRE" })).includes("type"));
});

test("restitution du dépôt : retenues positives uniquement", async () => {
  assert.deepEqual(await errorsOf(DepositSettlementDto, { deductions: [{ label: "Peinture", amount: 15000 }] }), []);
  assert.ok((await errorsOf(DepositSettlementDto, { deductions: [{ label: "Peinture", amount: -1 }] })).includes("deductions"));
});

test("versement propriétaire : montant strictement positif et moyen connu", async () => {
  assert.deepEqual(await errorsOf(CreatePayoutDto, { amount: 150000, method: "BANK_TRANSFER", reference: "VIR-42" }), []);
  assert.ok((await errorsOf(CreatePayoutDto, { amount: 0, method: "CASH" })).includes("amount"));
  assert.ok((await errorsOf(CreatePayoutDto, { amount: 1000, method: "BITCOIN" })).includes("method"));
});

test("demande locataire : type et message contrôlés", async () => {
  assert.deepEqual(await errorsOf(CreateTenantRequestDto, { type: "RESILIATION", effectiveDate: "2027-01-31", message: "Je souhaite résilier mon bail." }), []);
  assert.ok((await errorsOf(CreateTenantRequestDto, { type: "RESILIATION", message: "court" })).includes("message"));
  assert.ok((await errorsOf(CreateTenantRequestDto, { type: "INCONNU", message: "Un message suffisant ici." })).includes("type"));
});

const { CreateShortStayBookingDto } = require("../dist/src/short-stay/dto/create-booking.dto.js");
const { SetSaleDto } = require("../dist/src/sales/dto/set-sale.dto.js");
const { CreateSaleOfferDto } = require("../dist/src/sales/dto/create-offer.dto.js");
const { FinalizeSaleDto } = require("../dist/src/sales/dto/finalize-sale.dto.js");

test("réservation courte durée : tarif et dates contrôlés", async () => {
  const valid = { guestName: "Yao Patrick", checkIn: "2026-11-01", checkOut: "2026-11-05", nightlyRate: 25000 };
  assert.deepEqual(await errorsOf(CreateShortStayBookingDto, valid), []);
  assert.ok((await errorsOf(CreateShortStayBookingDto, { ...valid, nightlyRate: -1 })).includes("nightlyRate"));
  assert.ok((await errorsOf(CreateShortStayBookingDto, { ...valid, checkIn: "pas une date" })).includes("checkIn"));
  assert.ok((await errorsOf(CreateShortStayBookingDto, { guestName: "Yao" })).includes("checkIn"));
});

test("mise en vente : prix et commission numériques et bornés", async () => {
  assert.deepEqual(await errorsOf(SetSaleDto, { forSale: true, salePrice: 45000000, saleCommissionRate: 5 }), []);
  assert.ok((await errorsOf(SetSaleDto, { forSale: true, saleCommissionRate: 150 })).includes("saleCommissionRate"));
  assert.ok((await errorsOf(SetSaleDto, { salePrice: 1000 })).includes("forSale"));
});

test("offre d'achat : acheteur et montant requis", async () => {
  assert.deepEqual(await errorsOf(CreateSaleOfferDto, { buyerName: "Konan Affoué", offerAmount: 40000000 }), []);
  assert.ok((await errorsOf(CreateSaleOfferDto, { offerAmount: 40000000 })).includes("buyerName"));
  assert.ok((await errorsOf(CreateSaleOfferDto, { buyerName: "Konan", offerAmount: -5 })).includes("offerAmount"));
});

test("finalisation de vente : acheteur et prix final requis", async () => {
  assert.deepEqual(await errorsOf(FinalizeSaleDto, { buyerName: "Konan Affoué", finalPrice: 42000000 }), []);
  assert.ok((await errorsOf(FinalizeSaleDto, { buyerName: "Konan", finalPrice: 42000000, saleDate: "pas une date" })).includes("saleDate"));
  assert.ok((await errorsOf(FinalizeSaleDto, { finalPrice: 42000000 })).includes("buyerName"));
});

const { rentalEntryCost } = require("@ivologis/shared");

test("coût d'entrée location : avance + caution + moitié d'un mois de frais d'agence", () => {
  assert.deepEqual(rentalEntryCost(150000, 300000, 300000), { advance: 300000, deposit: 300000, agencyFeeTenantShare: 75000, total: 675000 });
  assert.equal(rentalEntryCost(85000, 85000, 170000).agencyFeeTenantShare, 42500);
});

const { entryCostViolation } = require("../dist/src/common/utils/lease-rules.js");

test("bail d'habitation : caution et avance plafonnées à 2 mois (loi 2019-576)", () => {
  assert.equal(entryCostViolation("HABITATION_NUE", 150000, 300000, 300000), null);
  assert.match(entryCostViolation("HABITATION_MEUBLEE", 150000, 450000, 300000), /caution dépasse 2 mois/);
  assert.match(entryCostViolation("HABITATION_NUE", 150000, 300000, 900000), /avance dépasse 2 mois/);
  assert.equal(entryCostViolation("COMMERCIAL", 500000, 3000000, 3000000), null);
});

const { PayRentDto } = require("../dist/src/payments/dto/pay-rent.dto.js");

test("déclaration de loyer : référence de transaction obligatoire", async () => {
  assert.deepEqual(await errorsOf(PayRentDto, { method: "WAVE", transactionRef: "T2611171432" }), []);
  assert.ok((await errorsOf(PayRentDto, { method: "WAVE" })).includes("transactionRef"));
  assert.ok((await errorsOf(PayRentDto, { method: "WAVE", transactionRef: "ab" })).includes("transactionRef"));
  assert.ok((await errorsOf(PayRentDto, { method: "PAYPAL", transactionRef: "T2611171432" })).includes("method"));
});

const { generateInviteCode, hashInviteCode, normalizeInviteCode, inviteExpiry } = require("../dist/src/common/utils/invite-code.util.js");

test("code d'invitation : 8 caractères sans ambiguïté, empreinte dépendante du secret", () => {
  const codes = new Set(Array.from({ length: 200 }, () => generateInviteCode()));
  assert.ok(codes.size > 195);
  for (const code of codes) assert.match(code, /^[ABCDEFGHJKLMNPQRSTUVWXYZ2-9]{8}$/);
  const code = generateInviteCode();
  assert.equal(normalizeInviteCode(`${code.slice(0, 4).toLowerCase()} - ${code.slice(4)}`), code);
  assert.equal(hashInviteCode(code.toLowerCase(), "s1"), hashInviteCode(code, "s1"));
  assert.notEqual(hashInviteCode(code, "s1"), hashInviteCode(code, "s2"));
  const now = new Date("2026-11-17T10:00:00Z");
  assert.equal(inviteExpiry(now).toISOString(), "2026-11-24T10:00:00.000Z");
});

test("messages de validation : traduits en français, messages du DTO conservés", () => {
  const { frenchConstraintMessage } = require("../dist/src/common/validation/validation-messages.js");
  assert.equal(frenchConstraintMessage("amount", "min", "amount must not be less than 0"), "Le montant est trop petit.");
  assert.equal(frenchConstraintMessage("type", "isEnum", "type must be one of the following values: A, B"), "Le type : valeur non reconnue.");
  assert.equal(frenchConstraintMessage("foo", "whitelistValidation", "property foo should not exist"), "Champ non autorisé : foo.");
  assert.equal(frenchConstraintMessage("zz", "isUUID", "zz must be a UUID"), "Le champ « zz » : identifiant invalide.");
  assert.equal(frenchConstraintMessage("amount", "min", "Le montant doit être supérieur à zéro."), "Le montant doit être supérieur à zéro.");
});

test("messages de validation : un champ absent est signalé « obligatoire » une seule fois", () => {
  const { messagesFor } = require("../dist/src/common/validation/validation-messages.js");
  const missing = { property: "phone", value: undefined, constraints: { isString: "phone must be a string", minLength: "phone must be longer than or equal to 8 characters" } };
  assert.deepEqual(messagesFor(missing), ["Le téléphone est obligatoire."]);
  const short = { property: "phone", value: "07", constraints: { minLength: "phone must be longer than or equal to 8 characters" } };
  assert.deepEqual(messagesFor(short), ["Le téléphone est trop court."]);
});

test("tout passe par l'agence : coordonnées de l'autre partie masquées selon le rôle", () => {
  const { hideCounterpartContacts } = require("../dist/src/common/interceptors/agency-privacy.interceptor.js");
  const forOwner = hideCounterpartContacts(
    { data: [{ id: 1, guestPhone: "+225", guestEmail: "a@b.c", tenant: { fullName: "T", phone: "07", monthlyIncome: 1, inviteCodeHash: "h" }, owner: { phone: "05" }, amount: 10, date: new Date(0) }] },
    "OWNER",
  );
  const row = forOwner.data[0];
  assert.equal(row.guestPhone, undefined);
  assert.equal(row.tenant.phone, undefined);
  assert.equal(row.tenant.monthlyIncome, undefined);
  assert.equal(row.tenant.inviteCodeHash, undefined);
  assert.equal(row.tenant.fullName, "T");
  assert.equal(row.owner.phone, "05");
  assert.ok(row.date instanceof Date);
  const forTenant = hideCounterpartContacts({ property: { owner: { fullName: "O", phone: "05", email: "o@x", inviteCodeHash: "h" } }, tenant: { phone: "07" } }, "TENANT");
  assert.equal(forTenant.property.owner.inviteCodeHash, undefined);
  assert.equal(forTenant.property.owner.phone, undefined);
  assert.equal(forTenant.property.owner.email, undefined);
  assert.equal(forTenant.tenant.phone, "07");
  const forStaff = hideCounterpartContacts({ tenant: { phone: "07" } }, "SUPER_ADMIN");
  assert.equal(forStaff.tenant.phone, "07");
});

test("échéance des baux (AD-06) : alertes 90/60/30 jours, reconduction tacite, non-reconduction, échu sans décision", async () => {
  const { LeasesService } = require("../dist/src/leases/leases.service.js");
  const DAY = 24 * 60 * 60 * 1000;
  const now = new Date("2026-11-18T00:00:00Z");
  const calls = { updates: [], staff: [], notify: [], audit: [] };
  const prisma = { lease: { updateMany: async (args) => (calls.updates.push(args), { count: 1 }) } };
  const notifications = { notifyStaff: async (n) => calls.staff.push(n), notify: async (n) => calls.notify.push(n) };
  const audit = { log: async (e) => calls.audit.push(e) };
  const service = new LeasesService(prisma, null, null, audit, null, null, notifications);
  const lease = (days, autoRenewMonths, expiryNoticeDays = null) => ({
    id: "L1", contractNumber: "BAIL-1", status: "ACTIVE", endDate: new Date(now.getTime() + days * DAY), autoRenewMonths, expiryNoticeDays,
    property: { name: "Villa" }, tenant: { fullName: "Yao", userId: "u-t" }, owner: { userId: "u-o" },
  });

  await service.handleExpiry(lease(45, null), now);
  assert.equal(calls.updates[0].data.expiryNoticeDays, 60);
  assert.match(calls.staff[0].message, /aucune décision/);
  assert.equal(calls.notify[0].userId, "u-o", "le propriétaire est prévenu à la première alerte");

  Object.values(calls).forEach((a) => (a.length = 0));
  await service.handleExpiry(lease(-1, 12), now);
  assert.equal(calls.updates[0].data.endDate.toISOString().slice(0, 10), "2027-11-17");
  assert.equal(calls.audit[0].action, "TACIT_RENEWAL");
  assert.deepEqual(calls.notify.map((n) => n.userId), ["u-o", "u-t"]);

  Object.values(calls).forEach((a) => (a.length = 0));
  await service.handleExpiry(lease(-1, 0), now);
  assert.equal(calls.updates[0].data.status, "EXPIRED");

  Object.values(calls).forEach((a) => (a.length = 0));
  await service.handleExpiry(lease(-3, null), now);
  assert.equal(calls.updates[0].data.status, undefined, "sans décision le bail reste actif");
  assert.equal(calls.updates[0].data.expiryNoticeDays, 0);
  assert.match(calls.staff[0].title, /décision à prendre/);
});

test("bilingue de l'API : messages exacts, gabarits imbriqués, dates et montants à l'anglaise", () => {
  const { translateText, runWithLang, tr } = require("../dist/src/common/i18n/i18n.js");
  assert.equal(translateText("Contrat introuvable.", "en"), "Contract not found.");
  assert.equal(translateText("Contrat introuvable.", "fr"), "Contrat introuvable.");
  // Validation : le libellé du champ est lui-même traduit.
  assert.equal(translateText("Le montant est obligatoire.", "en"), "The amount is required.");
  assert.equal(translateText("Le champ « foo » est obligatoire.", "en"), "The field “foo” is required.");
  // Notification composée : fragment traduit + date française convertie.
  assert.equal(
    translateText("Pour le bail de « Villa A » (fin le 1 novembre 2026), l'agence a prévu une reconduction tacite de 12 mois.", "en"),
    "For the lease of “Villa A” (ending on 1 November 2026), the agency has planned a tacit renewal of 12 months.",
  );
  assert.equal(translateText("Votre paiement de 150 000 FCFA pour novembre 2026 a été confirmé.", "en"), "Your payment of 150,000 FCFA for November 2026 has been confirmed.");
  // Message inconnu : renvoyé tel quel (jamais d'erreur).
  assert.equal(translateText("Texte inconnu", "en"), "Texte inconnu");
  // Documents : langue fixée pour la génération (ex. quittance du locataire anglophone).
  assert.equal(runWithLang("en", () => tr("QUITTANCE DE LOYER")), "RENT RECEIPT");
  assert.equal(runWithLang("fr", () => tr("Émise le {0}", "1 mai")), "Émise le 1 mai");
});

test("mesure d'audience : chemins anonymisés (identifiants, paramètres) et site d'origine réduit au domaine", () => {
  const { normalizePath, referrerHost } = require("../dist/src/analytics/analytics.service.js");
  assert.equal(normalizePath("/catalogue/locations/da2bc257-c550-46f6-b3d5-1d25d56a90b2?ref=wa#photos"), "/catalogue/locations/:id");
  assert.equal(normalizePath("/admin/leases/"), "/admin/leases");
  assert.equal(normalizePath("/?utm_source=x"), "/");
  assert.equal(referrerHost("https://www.google.com/search?q=villa"), "google.com");
  assert.equal(referrerHost("https://ivologis-web.onrender.com/catalogue", ["ivologis-web.onrender.com"]), null);
  assert.equal(referrerHost("pas une adresse"), null);
});

test("photos : réduites, converties en WebP, sans métadonnées GPS, et rejet d'un faux fichier image", async () => {
  const sharp = require("sharp");
  const { optimizeImage } = require("../dist/src/storage/storage.service.js");
  // Photo 4000×3000 avec métadonnées EXIF (dont une position GPS simulée).
  const big = await sharp({ create: { width: 4000, height: 3000, channels: 3, background: { r: 200, g: 120, b: 40 } } })
    .jpeg({ quality: 95 })
    .withExif({ IFD0: { Copyright: "test" }, IFD3: { GPSLatitude: "5/1 19/1 0/1", GPSLatitudeRef: "N" } })
    .toBuffer();
  const out = await optimizeImage(big);
  const meta = await sharp(out).metadata();
  assert.equal(meta.format, "webp");
  assert.ok(meta.width <= 2000 && meta.height <= 2000, `taille ${meta.width}×${meta.height}`);
  assert.equal(meta.exif, undefined, "les métadonnées (GPS) doivent disparaître");
  await assert.rejects(() => optimizeImage(Buffer.from("<script>pas une image</script>")), /illisible/);
});

test("annonces en anglais : saisie de l'agence prioritaire, sinon traduction automatique, sinon version périmée effacée", async () => {
  const { PropertiesService } = require("../dist/src/properties/properties.service.js");
  const updates = [];
  const prisma = { property: { update: async (a) => (updates.push(a.data), {}) } };
  let calls = 0;
  const translation = { enabled: true, toEnglish: async (texts) => (calls++, texts.map((t) => `EN:${t}`)) };
  const service = new PropertiesService(prisma, null, null, translation);
  const p = { id: "P1", description: "Belle villa" };

  let r = await service.syncEnglish(p, { name: "Villa Riviera", description: "Belle villa" });
  assert.deepEqual(updates.pop(), { nameEn: "EN:Villa Riviera", descriptionEn: "EN:Belle villa" });
  assert.equal(r.nameEn, "EN:Villa Riviera");

  // L'agence a saisi l'anglais : rien n'est traduit.
  calls = 0;
  await service.syncEnglish(p, { name: "Villa", nameEn: "Riviera villa", description: "x", descriptionEn: "y" });
  assert.equal(calls, 0);

  // Service indisponible : l'anglais devenu faux est effacé (le site affiche alors le français).
  service.translation = { enabled: true, toEnglish: async () => null };
  await service.syncEnglish(p, { name: "Nouveau nom" });
  assert.deepEqual(updates.pop(), { nameEn: null });

  // Description vidée : version anglaise vidée aussi.
  await service.syncEnglish({ id: "P1", description: null }, { description: "" });
  assert.deepEqual(updates.pop(), { descriptionEn: null });
});

test("P1-16 relances : l'avance couvre les premiers mois, rappel à J+5 de l'échéance", () => {
  const { coveredByAdvance, reminderDue } = require("../dist/src/payments/rent-reminder.js");
  const lease = { startDate: new Date(2026, 9, 15), rentAmount: "150000", advance: "300000" }; // entrée le 15/10, 2 mois d'avance
  assert.equal(coveredByAdvance(lease, new Date(2026, 9, 20)), true); // octobre payé par l'avance
  assert.equal(coveredByAdvance(lease, new Date(2026, 10, 20)), true); // novembre aussi
  assert.equal(coveredByAdvance(lease, new Date(2026, 11, 2)), false); // décembre dû
  assert.equal(coveredByAdvance({ ...lease, advance: "0" }, new Date(2026, 9, 20)), false);
  assert.equal(coveredByAdvance({ ...lease, rentAmount: "0" }, new Date(2026, 9, 20)), false);

  const old = new Date(2025, 0, 1);
  assert.equal(reminderDue(old, new Date(2026, 10, 5, 23, 59)), false); // le 5 : trop tôt
  assert.equal(reminderDue(old, new Date(2026, 10, 6, 0, 0)), true); // le 6 : J+5
  const enteredThisMonth = new Date(2026, 10, 10);
  assert.equal(reminderDue(enteredThisMonth, new Date(2026, 10, 14)), false); // entrée le 10 : J+4
  assert.equal(reminderDue(enteredThisMonth, new Date(2026, 10, 15)), true); // J+5
});

test("U-14 sessions : durée de vie du jeton comme jsonwebtoken, format inconnu = rien de masqué", () => {
  const { tokenLifetimeMs } = require("../dist/src/auth/auth.service.js");
  assert.equal(tokenLifetimeMs("7d"), 7 * 86_400_000);
  assert.equal(tokenLifetimeMs("12h"), 12 * 3_600_000);
  assert.equal(tokenLifetimeMs("30m"), 30 * 60_000);
  assert.equal(tokenLifetimeMs("90s"), 90_000);
  assert.equal(tokenLifetimeMs("120"), 120); // chiffres seuls = millisecondes (jsonwebtoken)
  assert.equal(tokenLifetimeMs("2 days"), Number.POSITIVE_INFINITY);
});

test("champs facultatifs vides : retirés s'ils ne sont pas du texte libre (demande de visite sans e-mail ni date)", async () => {
  const { OptionalEmptyFieldsPipe } = require("../dist/src/common/validation/optional-empty-fields.pipe.js");
  const { CreateVisitRequestDto } = require("../dist/src/sales/dto/create-visit-request.dto.js");
  const pipe = new OptionalEmptyFieldsPipe();
  const body = { guestName: "Awa", guestPhone: "+225 07 11 22 33 44", guestEmail: "", preferredDate: "", message: "", website: "" };
  const out = pipe.transform({ ...body }, { type: "body", metatype: CreateVisitRequestDto });
  assert.equal("guestEmail" in out, false);
  assert.equal("preferredDate" in out, false);
  assert.equal(out.message, ""); // texte libre : "" gardé (effacer)
  assert.equal(out.website, ""); // champ piège : inchangé
  assert.deepEqual(await validate(plainToInstance(CreateVisitRequestDto, out)), []);
  // Sans le tube, l'ancien défaut : e-mail et date vides refusés.
  assert.ok((await validate(plainToInstance(CreateVisitRequestDto, body))).length >= 2);
  // Paramètres de route / requête : non concernés.
  assert.deepEqual(pipe.transform({ q: "" }, { type: "query", metatype: CreateVisitRequestDto }), { q: "" });
});
