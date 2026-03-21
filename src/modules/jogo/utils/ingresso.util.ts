export class IngressoUtil {
    static toDecimalStringTwoPlaces(v: string | number): string {
        const num = typeof v === "number" ? v : Number(String(v).replace(",", "."));
        if (Number.isNaN(num)) throw new Error("Valor inválido");
        return num.toFixed(2);
    }

    static parseOptionalDate(v: unknown): Date | null {
        if (v == null || v === "") return null;
        if (v instanceof Date) return v;
        const dt = new Date(String(v));
        return Number.isNaN(dt.getTime()) ? null : dt;
    }
}