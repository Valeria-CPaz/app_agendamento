import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ServiceFormSchema } from "@/app/dashboard/services/ServiceFormSchema";
import { parse } from "path";

export async function POST(req: NextRequest) {
    // Get user session 
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        return NextResponse.json({
            error: "Não autenticado!"
        },
            { status: 401 });
    }

    // Parse body and validate with Zod
    const body = await req.json();
    const parsed = ServiceFormSchema.safeParse({
        ...body,
        duration: Number(body.duration),
        priceCents: Number(body.priceCents),
        online: !!body.online,
    });

    if (!parsed.success) {
        return NextResponse.json({
            error: "Falha na validação!",
            details: parsed.error.issues
        },
            { status: 400 });
    }

    // Find tenantId from user
    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { tenantId: true },
    });

    if (!user?.tenantId) {
        return NextResponse.json({
            error: "Usuário não tem profissional"
        },
            { status: 400 });
    }

    // Create new service
    const created = await prisma.service.create({
        data: {
            name: parsed.data.name,
            duration: parsed.data.duration,
            priceCents: parsed.data.priceCents,
            online: parsed.data.online,
            tenantId: user.tenantId,
        },
    });

    return NextResponse.json({
        ok: true,
        service: created
    },
        { status: 201 }
    );

}