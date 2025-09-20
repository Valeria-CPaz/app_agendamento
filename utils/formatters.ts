// Format CPF
export function formatCPF(cpf?: string): string {
    if (!cpf) return "";
    return cpf.replace(/\D/g, "")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

/**
 * Validates if a given CPF is valid (including check digits).
 */
export function isValidCPF(cpf: string): boolean {
    if (!cpf) return false;
    cpf = cpf.replace(/\D/g, "");
    if (cpf.length !== 11) return false;
    // Rejects CPFs with all digits the same
    if (/^(\d)\1+$/.test(cpf)) return false;

    let sum = 0;
    let rest;

    // First check digit
    for (let i = 1; i <= 9; i++)
        sum += parseInt(cpf.substring(i - 1, i)) * (11 - i);
    rest = (sum * 10) % 11;
    if (rest === 10 || rest === 11) rest = 0;
    if (rest !== parseInt(cpf.substring(9, 10))) return false;

    // Second check digit
    sum = 0;
    for (let i = 1; i <= 10; i++)
        sum += parseInt(cpf.substring(i - 1, i)) * (12 - i);
    rest = (sum * 10) % 11;
    if (rest === 10 || rest === 11) rest = 0;
    if (rest !== parseInt(cpf.substring(10, 11))) return false;

    return true;
}

// Format phone (Brazilian)
export function formatPhone(phone?: string): string {
    if (!phone) return "";
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.length === 11) {
        // Mobile
        return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
    }
    if (cleaned.length === 10) {
        // Landline
        return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
    }
    return phone;
}

// Check phone
export function isValidPhone(phone: string): boolean {
    const cleaned = (phone || "").replace(/\D/g, "");
    return cleaned.length === 10 || cleaned.length === 11;
}


// Checks email
export function isValidEmail(email: string) {
    return !email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Format name (first letter capitalized)
export function capitalize(value: string): string {
    if (!value) return "";
    return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
}


