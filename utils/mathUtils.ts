// Helper to simplify fractions without external libraries
export const getFraction = (num: number): string => {
  if (Number.isInteger(num)) return num.toString();
  
  const tolerance = 1.0E-6;
  let h1 = 1; let h2 = 0;
  let k1 = 0; let k2 = 1;
  let b = num;
  
  do {
      let a = Math.floor(b);
      let aux = h1; h1 = a * h1 + h2; h2 = aux;
      aux = k1; k1 = a * k1 + k2; k2 = aux;
      b = 1 / (b - a);
  } while (Math.abs(num - h1 / k1) > num * tolerance);

  // Handle negative sign nicely
  if (k1 < 0) {
      k1 = -k1;
      h1 = -h1;
  }
  
  if (k1 === 1) return h1.toString();
  if (h1 < 0) return `-\\frac{${Math.abs(h1)}}{${k1}}`;
  return `\\frac{${h1}}{${k1}}`;
};

export const sign = (num: number) => {
  if (isNaN(num)) return 0;
  if (num > 0) return 1;
  if (num < 0) return -1;
  return 0;
};

export const signStr = (num: number) => num > 0 ? '+' : '';

export const getSqrtNor = (a: number, b: number): [number, number, number] => {
  const c = a / (b * b);
  const n = c;
  let e = 1;
  
  for (let i = 1; i <= Math.floor(n); i++) {
    const j = i * i;
    if (Math.floor(n + 0.001) % j === 0) {
      e = i;
    }
  }
  
  const y = Math.floor(c / (e * e));
  const x = e;
  const z = 1; // Unused in original logic but returned
  
  return [x, y, z];
};

export const ptbhView = (x: number, y: number, z: number, w: number) => {
  let tu = '';
  
  if (x === 0) {
    if (y === 1) tu = `\\sqrt{${z}}`;
    else if (y === -1) tu = `-\\sqrt{${z}}`;
    else if (y === 0) tu = '0';
    else tu = `${y}\\sqrt{${z}}`;
  } else {
    if (y === 1) tu = `${x}+\\sqrt{${z}}`;
    else if (y === -1) tu = `${x}-\\sqrt{${z}}`;
    else if (y === 0) tu = String(x);
    else tu = `${x}${signStr(y)}${Math.abs(y)}\\sqrt{${z}}`;
  }
  
  return w === 1 ? tu : `\\frac{${tu}}{${w}}`;
};

export const solvePTBH = (a: number, b: number, c: number): [string, string] => {
  const Delta = b * b - 4 * a * c;
  
  if (Delta > 0) {
    const sqrtDelta = Math.sqrt(Delta);
    const x1 = (-sign(a) * b - sqrtDelta) / (2 * sign(a) * a);
    const x2 = (-sign(a) * b + sqrtDelta) / (2 * sign(a) * a);
    
    if (Math.floor(sqrtDelta) === sqrtDelta) {
      return [getFraction(x1), getFraction(x2)];
    } else {
      const [m, n, p] = getSqrtNor(Delta, 2 * a);
      const d = -b / (2 * a);
      const e = 1;
      
      const w = e * p; // Using p as 3rd return from getSqrtNor in original code was z, but logic matches
      const x = d * w / e;
      const y = m * w / p; // Logic adaptation
      const z = n;
      
      return [ptbhView(x, -y, z, w), ptbhView(x, y, z, w)];
    }
  }
  return ['', ''];
};

// Formatting functions
const viewDtChuan = (block: string) => block
    .replace(/\+\+/g, '+')
    .replace(/\+-/g, '-')
    .replace(/\+0/g, '')
    .replace(/\\frac/g, '\\dfrac');

const viewHeSoA = (num: number) => {
  if (num === 1) return '';
  if (num === -1) return '-';
  return getFraction(num);
};

const viewHeSoB = (num: number) => {
  if (num === 1) return '+';
  if (num === -1) return '-';
  if (num > 0) return '+' + getFraction(num);
  return getFraction(num);
};

const viewHeSoC = (num: number) => {
  if (num === 0) return '';
  if (num > 0) return '+' + getFraction(num);
  return getFraction(num);
};

export const viewDtBacNhat = (a: number, b: number, x: string) => {
  if (a === 0) return b === 0 ? '0' : getFraction(b);
  const block = viewHeSoA(a) + x + viewHeSoC(b);
  return viewDtChuan(block);
};

export const viewDtBacHai = (a: number, b: number, c: number, x: string) => {
  if (a === 0) return viewDtBacNhat(b, c, x);
  const block = viewHeSoA(a) + x + '^2' + viewDtBacNhat(b, c, x).replace(x, x);
  // Re-implementing simplified logic to avoid recursion complexity issues
  let res = viewHeSoA(a) + x + '^2';
  if (b !== 0) res += (b > 0 ? '+' : '') + viewHeSoA(b) + x;
  if (c !== 0) res += (c > 0 ? '+' : '') + getFraction(c);
  return viewDtChuan(res);
};

export const viewDtBacBa = (a: number, b: number, c: number, d: number, x: string) => {
  if (a === 0) return viewDtBacHai(b, c, d, x);
  let res = viewHeSoA(a) + x + '^3';
  if (b !== 0) res += (b > 0 ? '+' : '') + viewHeSoA(b) + x + '^2';
  if (c !== 0) res += (c > 0 ? '+' : '') + viewHeSoA(c) + x;
  if (d !== 0) res += (d > 0 ? '+' : '') + getFraction(d);
  return viewDtChuan(res);
};

export const viewDtBacBon = (a: number, b: number, c: number, x: string) => {
  let res = viewHeSoA(a) + x + '^4';
  if (b !== 0) res += (b > 0 ? '+' : '') + viewHeSoA(b) + x + '^2';
  if (c !== 0) res += (c > 0 ? '+' : '') + getFraction(c);
  return viewDtChuan(res);
};
