export type BasicKpis = {
    sessionCount: number;
    totalRevenue: number;
    avgTicket: number;
    canceledCount: number;
}

export type kpiOptions<T> = {
    getPrice: (item: T) => number;
    getStatus: (item: T) => string;

    countStatuses?: string[];
    revenueStatuses?: string[];
    canceledStatuses?: string[];
}

export type Period = { start: Date; end: Date; };

export type GetDate<T> = (item: T) => Date | string | number;

export type RevenueByPriceType = {
    totalPatients: number;
    totalRevenue: number;

    socialCount: number;
    socialRevenue: number;
    socialAvgTicket: number;

    fullCount: number;
    fullRevenue: number;
    fullAvgTicket: number;
};

export type RevenueOpts<T> = {
    getPrice: (item: T) => number;
    getStatus: (item: T) => string;
    isSocial: (item: T) => boolean;

    countStatuses?: string[];
    revenueStatuses?: string[];
};