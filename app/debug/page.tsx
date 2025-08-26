// Server Component: roda no servidor e acessa o Prisma direto.
import { prisma } from "@/lib/prisma";

export default async function DebugPage() {
  // 1) Carregar tenant padrão
  const tenant = await prisma.tenant.findUnique({
    where: { slug: "Psicóloga da Val" },
    include: {
      services: true,
      patients: {
        include: {
          appointments: {
            include: { service: true },
            orderBy: { startsAt: "asc" },
          },
        },
      },
    },
  });

  if (!tenant) return <div>Tenant não encontrado. Rode o seed?</div>;

  return (
    <main className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">/debug — {tenant.name}</h1>

      <section>
        <h2 className="text-xl font-semibold">Serviços</h2>
        <ul className="list-disc pl-5">
          {tenant.services.map((s) => (
            <li key={s.id}>
              {s.name} — {s.duration} min — R${(s.priceCents / 100).toFixed(2)}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold">Pacientes</h2>
        {tenant.patients.map((p) => (
          <div key={p.id} className="border rounded p-3 my-2">
            <div className="font-medium">{p.name}</div>
            <div className="text-sm text-gray-500">{p.email ?? "sem e-mail"}</div>

            {p.appointments.length > 0 ? (
              <ul className="mt-2 list-disc pl-5">
                {p.appointments.map((a) => (
                  <li key={a.id}>
                    {a.service.name} — {new Date(a.startsAt).toLocaleString()} →{" "}
                    {new Date(a.endsAt).toLocaleTimeString()} — {a.status}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-sm text-gray-500 mt-2">Sem agendamentos</div>
            )}
          </div>
        ))}
      </section>
    </main>
  );
}
