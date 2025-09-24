import { Appointment } from "@/types/appointment";
import { Patient } from "@/types/patient";
import {
    BasicKpis,
    kpiOptions,
    Period,
    GetDate,
    RevenueByPriceType,
    RevenueOpts
} from "@/types/report";

export function computeBasicKpis<T>(items: T[], opts: kpiOptions<T>): BasicKpis {
    const {
        getPrice,
        getStatus,
        countStatuses = ["confirmado"],
        revenueStatuses = ["confirmado"],
        canceledStatuses = ["cancelado", "faltou"],
    } = opts;

    let sessionCount = 0;
    let totalRevenue = 0;
    let revenueCount = 0;
    let canceledCount = 0;

    // normalize arrays for quick membership checks
    const setCount = new Set(countStatuses.map(s => s.toLowerCase()));
    const setRevenue = new Set(revenueStatuses.map(s => s.toLowerCase()));
    const setCanceled = new Set(canceledStatuses.map(s => s.toLowerCase()));

    for (const it of items) {
        const status = (getStatus(it) || "").toString().trim().toLowerCase();

        if (setCanceled.has(status)) {
            canceledCount += 1;
        }
        if (setCount.has(status)) {
            sessionCount += 1;
        }
        if (setRevenue.has(status)) {
            const price = Number(getPrice(it) || 0);
            if (!Number.isNaN(price)) {
                totalRevenue += price;
                revenueCount += 1;
            }
        }
    }

    const avgTicket = revenueCount > 0 ? totalRevenue / revenueCount : 0;

    return { sessionCount, totalRevenue, avgTicket, canceledCount };

}

export function filterByPeriod<T>(items: T[], getDate: GetDate<T>, period: Period): T[] {
    const startTimestamp = period.start.getTime();
    const endTimestamp = period.end.getTime();

    return items.filter((it) => {
        const date = getDate(it);
        const timestamp = date instanceof Date ? date.getTime() : new Date(date).getTime();
        return !Number.isNaN(timestamp) && timestamp >= startTimestamp && timestamp <= endTimestamp;
    });
}

export function computeRevenueByPriceType<T>(items: T[], opts: RevenueOpts<T>): RevenueByPriceType {
    const {
        getPrice,
        getStatus,
        isSocial,
        countStatuses = ["completed"],
        revenueStatuses = ["completed"],
    } = opts;

    const setCount = new Set(countStatuses.map((s) => s.toLowerCase()));
    const setRevenue = new Set(revenueStatuses.map((s) => s.toLowerCase()));

    let socialCount = 0, socialRevenue = 0, fullCount = 0, fullRevenue = 0, totalRevenue = 0, totalPatients = 0;

    for (const it of items) {
        const status = (getStatus(it) || "").toString().trim().toLowerCase();
        const counts = setCount.has(status);
        const revs = setRevenue.has(status);

        if (counts) totalPatients += 1;

        if (revs) {
            const price = Number(getPrice(it) || 0);
            if (!Number.isNaN(price)) {
                totalRevenue += price;
                if (isSocial(it)) {
                    socialCount += 1;
                    socialRevenue += price;
                } else {
                    fullCount += 1;
                    fullRevenue += price;
                }
            }
        }
    }

    const socialAvgTicket = socialCount > 0 ? socialRevenue / socialCount : 0;
    const fullAvgTicket = fullCount > 0 ? fullRevenue / fullCount : 0;

    return {
        totalPatients,
        totalRevenue,
        socialCount,
        socialRevenue,
        socialAvgTicket,
        fullCount,
        fullRevenue,
        fullAvgTicket,
    };

}

export function computeByPatient(appointments: Appointment[], patients: Patient[]) {
    const byPatient: Record<string, {
        patientId: string;
        name: string;
        isSocial: boolean;
        totalSessions: number;
        totalAmount: number;
    }> = {};

    for (const a of appointments) {
        if (!a.patientId) continue;
        const patient = patients.find(p => p.id === a.patientId);

        if (!byPatient[a.patientId]) {
            byPatient[a.patientId] = {
                patientId: a.patientId,
                name: patient ? `${patient.name} ${patient.lastName ?? ""}`.trim() : "(Sem nome)",
                isSocial: !!patient?.isSocial,
                totalSessions: 0,
                totalAmount: 0,
            };
        }

        byPatient[a.patientId].totalSessions += 1;
        byPatient[a.patientId].totalAmount += patient?.sessionValue ?? 0;
    }

    return Object.values(byPatient).sort((a, b) => a.name.localeCompare(b.name));
}