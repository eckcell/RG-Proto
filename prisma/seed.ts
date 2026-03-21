import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const adminEmail = process.env.INITIAL_ADMIN_EMAIL || 'erohero77@gmail.com';
  const adminPassword = process.env.INITIAL_ADMIN_PASSWORD || 'admin123';

  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  // 1. Admin User
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { password: hashedPassword },
    create: {
      email: adminEmail,
      password: hashedPassword,
      name: 'Admin User',
      role: 'ADMIN',
    },
  });

  // 2. Industries
  const fnbIndustry = await prisma.industry.upsert({
    where: { slug: 'fnb' },
    update: {},
    create: {
      name: 'Food & Beverage',
      slug: 'fnb',
    },
  });

  // 3. Form Templates
  const fnbFormConfig = {
    steps: [
      {
        id: "company",
        title: "Company Basics",
        fields: [
          { id: "companyName", label: "Company Name", type: "text", required: true, placeholder: "e.g. John Doe Limited" },
          { id: "uen", label: "Business UEN", type: "text", required: true, pattern: "^([0-9]{8,9}[A-Z]|[TSRP][0-9]{2}[A-Z]{2}[0-9]{4}[A-Z])$", placeholder: "e.g. T08LL1234A" }
        ]
      },
      {
        id: "type",
        title: "Business Type",
        fields: [
          { 
            id: "businessType", 
            label: "Business Type", 
            type: "radio", 
            required: true,
            options: [
              { value: "stall", label: "Stall", desc: "Food court stall, Coffee shop" },
              { value: "takeaway", label: "Takeaway", desc: "Kiosk, Bakery, Cafe (No dine in)" },
              { value: "restaurant", label: "Restaurant", desc: "Dining-in service" },
              { value: "pub", label: "Pubs & Bars", desc: "Bars, Lounges, Late-night" },
              { value: "fnb", label: "Other F&B", desc: "Other Food & Beverage" }
            ]
          }
        ]
      },
      {
        id: "optional",
        title: "Optional Coverages",
        fields: [
          { id: "additionalSumInsured", label: "Additional Fire Sum Insured", type: "number", prefix: "S$", defaultValue: 0 },
          { id: "additionalPlLimit", label: "Additional Public Liability Limit", type: "number", prefix: "S$", defaultValue: 0 },
          { id: "additionalEmployees", label: "Additional Employees (above base 4)", type: "number", defaultValue: 0 },
          { id: "wicaRequired", label: "Add WICA Cover?", type: "checkbox", defaultValue: false },
          { 
            id: "wicaEmployees", 
            label: "WICA Employee Groups", 
            type: "fieldArray", 
            dependsOn: { field: "wicaRequired", value: true },
            arrayFields: [
              { id: "category", label: "Category (e.g. Waiter)", type: "text", required: true },
              { id: "count", label: "Count", type: "number", required: true, defaultValue: 1 },
              { id: "annualWage", label: "Avg Annual Wage", type: "number", required: true, defaultValue: 30000 }
            ]
          }
        ]
      },
      {
        id: "contact",
        title: "Contact Information",
        fields: [
          { id: "contactName", label: "Full Name", type: "text", required: true, placeholder: "e.g. John Doe" },
          { id: "contactEmail", label: "Work Email Address", type: "email", required: true, placeholder: "e.g. john@example.com" },
          { id: "contactPhone", label: "Mobile Number (Singapore)", type: "tel", pattern: "^[89]\\d{7}$", prefix: "+65", required: true, placeholder: "e.g. 91234567" }
        ]
      }
    ]
  };

  await prisma.formTemplate.upsert({
    where: { id: 'fnb-default-template' },
    update: { config: JSON.stringify(fnbFormConfig) },
    create: {
      id: 'fnb-default-template',
      name: 'Standard F&B Quote Form',
      industryId: fnbIndustry.id,
      config: JSON.stringify(fnbFormConfig),
    },
  });

  // 4. Insurers & Products
  const insurers = [
    {
      id: "msig",
      name: "MSIG",
      fullName: "MSIG Insurance (Singapore) Pte. Ltd.",
      logoPath: "/insurers/msig-1773549795559.webp",
      products: [
        {
          name: "CafeCare",
          productCode: "JAN 2024",
          configuration: JSON.stringify({
            insurerId: "msig",
            productName: "CafeCare",
            tiers: [
              {
                id: "msig_fnb",
                name: "CafeCare Plan",
                description: "Comprehensive F&B protection",
                basePremiumCents: 89000,
                baseCoverage: {
                    fireContents: { description: "S$100,000", sumInsuredCents: 10000000 },
                    publicLiability: { description: "S$1,000,000", limitCents: 100000000 },
                }
              }
            ],
            topUpRates: {
                wica: { perEmployeeCents: { fnb: 5000 } },
                fireContents: { ratePer10000Cents: { fnb: 1500 } }
            },
            optionalCovers: [],
            specialFeatures: ["24/7 Helpline", "Food Spoilage Cover"],
            keyExclusions: ["War", "Nuclear", "Pollution"]
          })
        }
      ]
    },
    {
      id: "eq",
      name: "EQ Insurance",
      fullName: "EQ Insurance Company Limited",
      logoPath: "/insurers/eq-1773549775357.webp",
      products: [
        {
          name: "EQ Business Plus",
          productCode: "FGP2401",
          configuration: JSON.stringify({
            insurerId: "eq",
            productName: "EQ Business Plus",
            tiers: [
              {
                id: "eq_restaurant",
                name: "Restaurant Plan",
                description: "Standard F&B coverage",
                basePremiumCents: 75000,
                baseCoverage: {
                    fireContents: { description: "S$50,000", sumInsuredCents: 5000000 },
                    publicLiability: { description: "S$500,000", limitCents: 50000000 },
                }
              }
            ],
            topUpRates: {},
            optionalCovers: [],
            specialFeatures: ["Fidelity Guarantee"],
            keyExclusions: ["Asbestos", "Sanction Limitation"]
          })
        }
      ]
    }
  ];

  for (const ins of insurers) {
    const insurer = await prisma.insurer.upsert({
      where: { id: ins.id },
      update: { fullName: ins.fullName, logoPath: ins.logoPath },
      create: {
        id: ins.id,
        name: ins.name,
        fullName: ins.fullName,
        logoPath: ins.logoPath,
      },
    });

    for (const prod of ins.products) {
      await prisma.product.upsert({
        where: { id: `${insurer.id}-${prod.name}`.toLowerCase().replace(/\s+/g, '-') },
        update: { configuration: prod.configuration, industryId: fnbIndustry.id },
        create: {
          id: `${insurer.id}-${prod.name}`.toLowerCase().replace(/\s+/g, '-'),
          insurerId: insurer.id,
          industryId: fnbIndustry.id,
          name: prod.name,
          productCode: prod.productCode,
          configuration: prod.configuration,
        },
      });
    }
  }

  console.log('Seeding complete.');
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
