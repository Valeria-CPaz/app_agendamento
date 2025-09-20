export type Patient = {
    id: string;
    name: string;
    lastName: string;
    cpf?: string;
    email?: string;
    phone: string;
    sessionValue: number;
    isSocial: boolean;
}