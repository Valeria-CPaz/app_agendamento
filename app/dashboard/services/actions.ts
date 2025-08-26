import { prisma } from "@/lib/prisma";
import { ServiceFormSchema } from "./ServiceFormSchema";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { AuthOptions } from "next-auth";
import { authOptions } from "@/lib/auth";

// Server Action to create a new service for the logged-in user's tenant
export async function createService(formData: any) {
    // Get logged user session
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        throw new Error("Não autenticado!");
    }

    // Parse and validate input using Zod
    const parsed = ServiceFormSchema.safeParse({
        ...formData,
        duration: Number(formData.duration),
        priceCents: Number(formData.priceCents),
        online: !!formData.online,
    });

    if (!parsed.success) {
        // Optionally: throw error or return error object
        throw new Error("Falha na validação!");
    }

    // Get tenantId from user
    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { tenantId: true },
    });

    if (!user?.tenantId) {
        throw new Error("Usuário não tem profissional designado.");
    }

    // Create service in the database
    await prisma.service.create({
        data: {
            name: parsed.data.name,
            duration: parsed.data.duration,
            priceCents: parsed.data.priceCents,
            online: parsed.data.online,
            tenantId: user.tenantId,
        },
    });

    // Invalidate cache for the services page so it updates
    revalidatePath("/dashboard/services");
}