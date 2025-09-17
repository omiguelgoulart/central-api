import crypto from "crypto";

function luhnCheckDigit(numbers: string): number {
  // calcula o dígito verificador Luhn para a string numérica (sem o DV)
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
  const dv = (10 - (sum % 10)) % 10;
  return dv;
}

export function randomDigits(len: number): string {
  // gera 'len' dígitos usando crypto (sem viés)
  const bytes = crypto.randomBytes(len);
  let out = "";
  for (let i = 0; i < len; i++) {
    out += (bytes[i] % 10).toString();
  }
  // evita sequências triviais tipo "000000000"
  if (/^0+$/.test(out)) return randomDigits(len);
  return out;
}

export function gerarMatricula(): string {
  const corpo = randomDigits(9);         // 9 dígitos base
  const dv = luhnCheckDigit(corpo);      // dígito verificador
  return `${corpo}${dv}`;                // total 10 dígitos
}

// opcional: validar formato rapidamente
export function isMatriculaValida(m: string): boolean {
  if (!/^\d{10}$/.test(m)) return false;
  const corpo = m.slice(0, 9);
  const dv = Number(m[9]);
  return luhnCheckDigit(corpo) === dv;
}
