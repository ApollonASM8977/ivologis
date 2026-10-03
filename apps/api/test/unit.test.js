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
