import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ServiceList from "./ServiceList";
import ServiceForm from "./ServiceForm"
import { redirect } from "next/navigation";


// List all services from tenant of logged user
export default async function ServicesPage() {
    // Search user session (logged user)
    const session = await getServerSession(authOptions);

    // If not logged, access is blocked
    if (!session?.user) {
        return <div>Você precisa estar logado.</div>;
    }

    // Search for tenantId from logged user (associated)
    const userId = session.user.id;
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { tenant: true },
    });

    // Search for all tenant's services
    const services = await prisma.service.findMany({
        where: { tenantId: user?.tenantId },
        orderBy: { name: "asc" },
    });

    // This function is passed to the form to reload the page after creating
    function refreshPage() {
        window.location.reload();
    }

    return (
        <main className="p-6">
            <h1 className="text-2x1 font-bold mb-4">Serviços</h1>
            <ServiceList services={services} />
            <ServiceForm />
        </main>
    );
}