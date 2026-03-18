import crypto from 'crypto';

export class CreateMatricula {
    private static luhnCheckDigit(numbers: string): number {
        let sum = 0;
        let shouldDouble = true;
        for (let i = numbers.length - 1; i >= 0; i--) {
            let n = Number(numbers[i]);
            if (shouldDouble) {
                n = n * 2;
                if (n > 9) n -= 9;
            }
            sum += n;
            shouldDouble = !shouldDouble;
        }
        return (10 - (sum % 10)) % 10;
    }

    private static randomDigits(len: number): string {
        const bytes = crypto.randomBytes(len);
        let out = "";
        for (let i = 0; i < len; i++) {
            out += (bytes[i] % 10).toString();
        }
        if (/^0+$/.test(out)) return this.randomDigits(len);
        return out;
    }

    static generateMatricula(): string {
        const corpo = this.randomDigits(9);
        const dv = this.luhnCheckDigit(corpo);
        return `${corpo}${dv}`;
    }

    static isMatriculaValida(m: string): boolean {
        if (!/^\d{10}$/.test(m)) return false;
        const corpo = m.slice(0, 9);
        const dv = Number(m[9]);
        return this.luhnCheckDigit(corpo) === dv;
    }
}