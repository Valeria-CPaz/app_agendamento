// prisma/seed.ts
// Executa com: bunx prisma db seed
// Objetivo: criar um Tenant "Psicóloga da Val", alguns serviços e 2 pacientes

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // 1) Tenant
  const tenant = await prisma.tenant.upsert({
    where: { slug: "psicologa-da-val" },
    update: {},
    create: {
      name: "Psicóloga da Val",
      slug: "psicologa-da-val",
    },
  });

  // 2) Serviços (50min e 90min)
  const sessao50 = await prisma.service.upsert({
    where: { id: "seed-service-50" }, // truque p/ id fixo só no seed
    update: {},
    create: {
      id: "seed-service-50",
      tenantId: tenant.id,
      name: "Sessão individual (50 min)",
      duration: 50,
      priceCents: 20000, // R$200,00
      online: true,
    },
  });

  const sessao90 = await prisma.service.upsert({
    where: { id: "seed-service-90" },
    update: {},
    create: {
      id: "seed-service-90",
      tenantId: tenant.id,
      name: "Sessão estendida (90 min)",
      duration: 90,
      priceCents: 32000, // R$320,00
      online: true,
    },
  });

  // 3) Pacientes
  const ana = await prisma.patient.upsert({
    where: { id: "seed-patient-ana" },
    update: {},
    create: {
      id: "seed-patient-ana",
      tenantId: tenant.id,
      name: "Ana Souza",
      email: "ana@example.com",
      phone: "(11) 99999-1111",
    },
  });

  const bruno = await prisma.patient.upsert({
    where: { id: "seed-patient-bruno" },
    update: {},
    create: {
      id: "seed-patient-bruno",
      tenantId: tenant.id,
      name: "Bruno Lima",
      email: "bruno@example.com",
    },
  });

  // 4) (Opcional) pré-cria 1 agendamento p/ hoje
  const now = new Date();
  const startsAt = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 14, 0, 0);
  const endsAt = new Date(startsAt.getTime() + sessao50.duration * 60_000);

  await prisma.appointment.create({
    data: {
      tenantId: tenant.id,
      patientId: ana.id,
      serviceId: sessao50.id,
      startsAt,
      endsAt,
      status: "SCHEDULED",
    },
  });

  // 5) Usuário admin para login
  const password = await bcrypt.hash("admin", 10); // senha será: admin
  await prisma.user.upsert({
    where: { email: "admin@psico.app" },
    update: {},
    create: {
      email: "admin@psico.app",
      name: "Admin",
      password,
      tenantId: tenant.id,
      // outros campos obrigatórios do seu modelo User (ex: role: "ADMIN")
    },
  });

  console.log("Seed ok ✨", { tenant: tenant.slug });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
