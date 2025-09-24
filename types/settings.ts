export type UserSettings = {
    name: string;
    lastName: string;
    email: string;
    password: string;
    fullPrice: number;
    theme: "light" | "dark";
    fingerprintEnabled: boolean;
}