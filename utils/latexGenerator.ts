import { 
  getFraction, sign, solvePTBH, 
  viewDtBacNhat, viewDtBacHai, viewDtBacBa, viewDtBacBon 
} from './mathUtils';
import { Coefficients, GeoParams } from '../types';

// ==================== BBT GENERATORS ====================

function bbtBacNhatSource(a: number, b: number) {
  if (a === 0) return 'Hàm hằng không vẽ bảng biến thiên';
  
  let block = `\\begin{tikzpicture}
\\tkzTabInit[nocadre,lgt=1.2,espcl=2.5,deltacl=0.6]
{$x$/0.6,$y'$/0.6,$y$/2}
{$-\\infty$,$+\\infty$}
`;
  if (a > 0) {
    block += `\\tkzTabLine{,+,}
\\tkzTabVar{-/$-\\infty$,+/$+\\infty$}
`;
  } else {
    block += `\\tkzTabLine{,-,}
\\tkzTabVar{+/$+\\infty$,-/$-\\infty$}
`;
  }
  block += '\\end{tikzpicture}';
  return block;
}

function bbtBacHaiSource(a: number, b: number, c: number) {
  const d = -b / (2 * a);
  const xi = getFraction(d);
  const e = a * d * d + b * d + c;
  const yi = getFraction(e);
  
  let block = `\\begin{tikzpicture}
\\tkzTabInit[nocadre,lgt=1.2,espcl=2.5,deltacl=0.6]
{$x$/0.6,$y'$/0.6,$y$/2}{$-\\infty$,$${xi}$,$+\\infty$}
`;
  if (a > 0) {
    block += `\\tkzTabLine{,-,0,+,}
\\tkzTabVar{+/$+\\infty$,-/$${yi}$,+/$+\\infty$}
\\end{tikzpicture}`;
  } else {
    block += `\\tkzTabLine{,+,0,-,}
\\tkzTabVar{-/$-\\infty$,+/$${yi}$,-/$-\\infty$}
\\end{tikzpicture}`;
  }
  return block;
}

function bbtBacBaSource(a: number, b: number, c: number, d: number) {
  const hamF = (x: number) => a * x * x * x + b * x * x + c * x + d;
  const Delta = b * b - 3 * a * c;
  const xi = -b / (3 * a);
  const yi = hamF(xi);
  
  if (Delta < 0) return a > 0 ? bbtBacNhatSource(1, 0) : bbtBacNhatSource(-1, 0);
  
  if (Delta === 0) {
    const xiStr = getFraction(xi);
    const yiStr = getFraction(yi);
    if (a > 0) {
      return `\\begin{tikzpicture}
\\tkzTabInit[nocadre,lgt=1.2,espcl=2.5,deltacl=0.6]
{$x$/0.6,$y'$/0.6,$y$/2}
{$-\\infty$,$${xiStr}$,$+\\infty$}
\\tkzTabLine{,+,0,+,}
\\tkzTabVar{-/$-\\infty$,R/,+/$+\\infty$}
\\tkzTabVal{1}{3}{0.5}{}{$${yiStr}$}
\\end{tikzpicture}`;
    } else {
      return `\\begin{tikzpicture}
\\tkzTabInit[nocadre,lgt=1.2,espcl=2.5,deltacl=0.6]
{$x$/0.6,$y'$/0.6,$y$/2}
{$-\\infty$,$${xiStr}$,$+\\infty$}
\\tkzTabLine{,-,0,-,}
\\tkzTabVar{+/$+\\infty$,R/,-/$-\\infty$}
\\tkzTabVal{1}{3}{0.5}{}{$${yiStr}$}
\\end{tikzpicture}`;
    }
  }
  
  const [x1Str, x2Str] = solvePTBH(3 * a, 2 * b, c);
  const x1 = (-sign(a) * b - Math.sqrt(Delta)) / (3 * sign(a) * a);
  const x2 = (-sign(a) * b + Math.sqrt(Delta)) / (3 * sign(a) * a);
  const y1 = getFraction(hamF(x1));
  const y2 = getFraction(hamF(x2));
  
  if (a > 0) {
    return `\\begin{tikzpicture}
\\tkzTabInit[nocadre,lgt=1.2,espcl=2.5,deltacl=0.6]
{$x$/0.6,$y'$/0.6,$y$/2}
{$-\\infty$,$${x1Str}$,$${x2Str}$,$+\\infty$}
\\tkzTabLine{,+,0,-,0,+,}
\\tkzTabVar{-/$-\\infty$,+/$${y1}$,-/$${y2}$,+/$+\\infty$}
\\end{tikzpicture}`;
  } else {
    return `\\begin{tikzpicture}
\\tkzTabInit[nocadre,lgt=1.2,espcl=2.5,deltacl=0.6]
{$x$/0.6,$y'$/0.6,$y$/2}
{$-\\infty$,$${x1Str}$,$${x2Str}$,$+\\infty$}
\\tkzTabLine{,-,0,+,0,-,}
\\tkzTabVar{+/$+\\infty$,-/$${y1}$,+/$${y2}$,-/$-\\infty$}
\\end{tikzpicture}`;
  }
}

function bbtTrungPhuongSource(a: number, b: number, c: number) {
  const yo = getFraction(c);
  if (a * b >= 0) {
    let block = `\\begin{tikzpicture}
\\tkzTabInit[nocadre,lgt=1.2,espcl=2.5,deltacl=0.6]
{$x$/0.6,$y'$/0.6,$y$/2}
{$-\\infty$,$0$,$+\\infty$}
`;
    if (a > 0) {
      block += `\\tkzTabLine{,-,0,+,}
\\tkzTabVar{+/$+\\infty$,-/$${yo}$,+/$+\\infty$}
`;
    } else {
      block += `\\tkzTabLine{,+,0,-,}
\\tkzTabVar{-/$-\\infty$,+/$${yo}$,-/$-\\infty$}
`;
    }
    block += '\\end{tikzpicture}';
    return block;
  } else {
    const e = -b / (2 * a);
    const d = Math.sqrt(e);
    const xi = getFraction(d);
    const yi = getFraction(a * d * d * d * d + b * d * d + c);
    
    let block = `\\begin{tikzpicture}
\\tkzTabInit[nocadre,lgt=1.2,espcl=2.5,deltacl=0.6]
{$x$/0.6,$y'$/0.6,$y$/2}
{$-\\infty$,$-${xi}$,$0$,$${xi}$,$+\\infty$}
`;
    if (a > 0) {
      block += `\\tkzTabLine{,-,0,+,0,-,0,+,}
\\tkzTabVar{+/$+\\infty$,-/$${yi}$,+/$${yo}$,-/$${yi}$,+/$+\\infty$}
`;
    } else {
      block += `\\tkzTabLine{,+,0,-,0,+,0,-,}
\\tkzTabVar{-/$-\\infty$,+/$${yi}$,-/$${yo}$,+/$${yi}$,-/$-\\infty$}
`;
    }
    block += '\\end{tikzpicture}';
    return block;
  }
}

function bbtMotMotSource(a: number, b: number, c: number, d: number) {
  const Delta = a * d - b * c;
  const xi = getFraction(-d / c);
  const yi = getFraction(a / c);
  
  if (c === 0) return 'ERROR!!! Dữ liệu hàm sai.';
  
  let block = `Bảng biến thiên của hàm số $y=\\dfrac{${viewDtBacNhat(a, b, 'x')}}{${viewDtBacNhat(c, d, 'x')}}$.

`;
  if (Delta > 0) {
    block += `\\begin{tikzpicture}
\\tkzTabInit[nocadre,lgt=1.2,espcl=2.5,deltacl=0.6]
{$x$/0.6,$y'$/0.6,$y$/2}
{$-\\infty$,$${xi}$,$+\\infty$}
\\tkzTabLine{,+,d,+,}
\\tkzTabVar{-/$${yi}$,+D-/$+\\infty$/$-\\infty$,+/$${yi}$}
\\end{tikzpicture}`;
  } else if (Delta < 0) {
    block += `\\begin{tikzpicture}
\\tkzTabInit[nocadre,lgt=1.2,espcl=2.5,deltacl=0.6]
{$x$/0.6,$y'$/0.6,$y$/2}
{$-\\infty$,$${xi}$,$+\\infty$}
\\tkzTabLine{,-,d,-,}
\\tkzTabVar{+/$${yi}$,-D+/$-\\infty$/$+\\infty$,-/$${yi}$}
\\end{tikzpicture}`;
  } else {
    block += `Hàm số không đổi trên $\\mathbb{R}\\setminus\\{${xi}\\}$.`;
  }
  return block;
}

function bbtHaiMotSource(a: number, b: number, c: number, m: number, n: number) {
  const hamF = (x: number) => (a * x * x + b * x + c) / (m * x + n);
  const A = a * m;
  const B = a * n;
  const C = b * n - c * m;
  const Delta = B * B - A * C;
  const xi = getFraction(-n / m);
  
  if (m === 0) return bbtBacHaiSource(a / n, b / n, c / n);
  if (a === 0) {
    if (b * m - a * n !== 0) return bbtMotMotSource(b, c, m, n);
    else return 'Hàm số không đổi trên các khoảng xác định';
  }
  
  // Checking if simplified
  if (a * Math.pow(-n / m, 2) + b * (-n / m) + c === 0) return bbtMotMotSource(0, -a, m, n);

  if (Delta < 0) {
    if (A > 0) {
      return `\\begin{tikzpicture}
\\tkzTabInit[nocadre,lgt=1.2,espcl=2.5,deltacl=0.6]
{$x$/0.6,$y'$/0.6,$y$/2}
{$-\\infty$,$${xi}$,$+\\infty$}
\\tkzTabLine{,+,d,+,}
\\tkzTabVar{-/$-\\infty$,+D-/$+\\infty$/$-\\infty$,+/$+\\infty$}
\\end{tikzpicture}`;
    } else {
      return `\\begin{tikzpicture}
\\tkzTabInit[nocadre,lgt=1.2,espcl=2.5,deltacl=0.6]
{$x$/0.6,$y'$/0.6,$y$/2}
{$-\\infty$,$${xi}$,$+\\infty$}
\\tkzTabLine{,-,d,-,}
\\tkzTabVar{+/$+\\infty$,-D+/$-\\infty$/$+\\infty$,-/$-\\infty$}
\\end{tikzpicture}`;
    }
  } else {
    const [x1Str, x2Str] = solvePTBH(a * m, 2 * a * n, b * n - c * m);
    const x1 = (-sign(A) * B - Math.sqrt(Delta)) / (sign(A) * A);
    const x2 = (-sign(A) * B + Math.sqrt(Delta)) / (sign(A) * A);
    const y1 = getFraction(hamF(x1));
    const y2 = getFraction(hamF(x2));
    
    if (A > 0) {
      return `\\begin{tikzpicture}
\\tkzTabInit[nocadre,lgt=1.2,espcl=2.5,deltacl=0.6]
{$x$/0.6,$y'$/0.6,$y$/2}
{$-\\infty$,$${x1Str}$,$${xi}$,$${x2Str}$,$+\\infty$}
\\tkzTabLine{,+,0,-,d,-,0,+,}
\\tkzTabVar{-/$-\\infty$,+/$${y1}$,-D+/$-\\infty$/$+\\infty$,-/$${y2}$,+/$+\\infty$}
\\end{tikzpicture}`;
    } else {
      return `\\begin{tikzpicture}
\\tkzTabInit[nocadre,lgt=1.2,espcl=2.5,deltacl=0.6]
{$x$/0.6,$y'$/0.6,$y$/2}
{$-\\infty$,$${x1Str}$,$${xi}$,$${x2Str}$,$+\\infty$}
\\tkzTabLine{,-,0,+,d,+,0,-,}
\\tkzTabVar{+/$+\\infty$,-/$${y1}$,+D-/$+\\infty$/$-\\infty$,+/$${y2}$,-/$-\\infty$}
\\end{tikzpicture}`;
    }
  }
}

// ==================== GRAPH GENERATORS ====================

function generateGraphBlock(xmin: number, xmax: number, ymin: number, ymax: number, plot: string, dayx: string, dayy: string) {
  if (!dayx) {
    const xVals = [];
    for (let x = Math.ceil(xmin); x <= Math.floor(xmax); x++) {
      if (x !== 0) xVals.push(x);
    }
    dayx = xVals.join(',');
  }
  if (!dayy) {
    const yVals = [];
    for (let y = Math.ceil(ymin); y <= Math.floor(ymax); y++) {
      if (y !== 0) yVals.push(y);
    }
    dayy = yVals.join(',');
  }
  
  let block = `\\begin{tikzpicture}[scale=1, font=\\footnotesize, line join=round, line cap=round, >=stealth]
\\def\\xmin{${xmin}}\\def\\xmax{${xmax}}\\def\\ymin{${ymin}}\\def\\ymax{${ymax}}
\\draw[->] (\\xmin-0.2,0)--(\\xmax+0.2,0) node[below] {\\footnotesize $x$};
\\draw[->] (0,\\ymin-0.2)--(0,\\ymax+0.2) node[right] {\\footnotesize $y$};
\\draw (0,0) node [below left] {\\footnotesize $O$};
`;
  if (dayx) block += `\\foreach \\x in {${dayx}}\\draw (\\x,0.1)--(\\x,-0.1) node [below] {\\footnotesize $\\x$};
`;
  if (dayy) block += `\\foreach \\y in {${dayy}}\\draw (0.1,\\y)--(-0.1,\\y) node [left] {\\footnotesize $\\y$};
`;
  block += `\\clip (\\xmin,\\ymin) rectangle (\\xmax,\\ymax);
`;
  if (plot) block += `\\draw[smooth,samples=200,domain=\\xmin:\\xmax] plot (\\x,{${plot}});
`;
  block += '\\end{tikzpicture}';
  return block;
}

function dothiBacNhatSource(a: number, b: number) {
  if (a === 0) {
    const Delta = 1;
    const xmin = -2;
    const xmax = 2;
    const ymin = Math.min(b - Delta, -Delta);
    const ymax = Math.max(b + Delta, Delta);
    return generateGraphBlock(xmin, xmax, ymin, ymax, `${b}`, '', '');
  }
  const k = -b / a;
  const Delta = 1;
  const xmin = Math.min(k - Delta, -Delta);
  const xmax = Math.max(k + Delta, Delta);
  const ymin = Math.min(b - Delta, -Delta);
  const ymax = Math.max(b + Delta, Delta);
  return generateGraphBlock(xmin, xmax, ymin, ymax, `${a}*(\\x)+${b}`, '', '');
}

function dothiBacHaiSource(a: number, b: number, c: number) {
  if (a === 0) return dothiBacNhatSource(b, c);
  const xi = -b / (2 * a);
  const yi = -(b * b - 4 * a * c) / (4 * a);
  const Deltax = 3;
  const Deltay = 4.5;
  const xmin = Math.floor(Math.min(xi - Deltax, -1));
  const xmax = Math.floor(Math.max(xi + Deltax, 1));
  let ymin, ymax;
  if (a > 0) {
    ymax = Math.floor(Math.max(yi + Deltay, 1));
    ymin = yi > 0 ? -1 : Math.floor(yi - Deltay / 4);
  } else {
    ymin = Math.floor(Math.min(yi - Deltay, -1));
    ymax = yi < 0 ? 1 : Math.floor(yi + Deltay / 4);
  }
  const plot = `${a}*((\\x)^2)+${b}*\\x+${c}`;
  let block = generateGraphBlock(xmin, xmax, ymin, ymax, plot, '', '');
  const xiRound = Math.round((xi + 0.001) * 100) / 100;
  const yiRound = Math.round((yi + 0.001) * 100) / 100;
  block = block.replace('\\end{tikzpicture}', 
    `\\draw[dashed] (${xiRound},0)--(${xiRound},${yiRound})--(0,${yiRound});
\\fill (${xiRound},${yiRound}) circle (1pt);
\\end{tikzpicture}`);
  return block;
}

function dothiBacBaSource(a: number, b: number, c: number, d: number) {
  if (a === 0) return dothiBacHaiSource(b, c, d);
  const hamF = (x: number) => a * x * x * x + b * x * x + c * x + d;
  const Delta = b * b - 3 * a * c;
  const xi = -b / (3 * a);
  const yi = hamF(xi);
  let y1 = yi, y2 = yi;
  if (Delta > 0) {
    const x1 = (-sign(a) * b - Math.sqrt(Delta)) / (3 * sign(a) * a);
    const x2 = (-sign(a) * b + Math.sqrt(Delta)) / (3 * sign(a) * a);
    y1 = hamF(x1);
    y2 = hamF(x2);
  }
  const Deltax = 3;
  const Deltay = 3;
  const xmin = Math.floor(Math.min(xi - Deltax, -1));
  const xmax = Math.floor(Math.max(xi + Deltax, 1));
  const ymin = Math.floor(Math.min(yi - Deltay, y1 - 1, y2 - 1, -1));
  const ymax = Math.floor(Math.max(yi + Deltay, y1 + 1, y2 + 1, 1));
  const plot = `${a}*((\\x)^3)+${b}*((\\x)^2)+${c}*(\\x)+${d}`;
  return generateGraphBlock(xmin, xmax, ymin, ymax, plot, '', '');
}

function dothiTrungPhuongSource(a: number, b: number, c: number) {
  if (a === 0) return dothiBacHaiSource(b, 0, c);
  const xi = 0;
  const yi = c;
  const Deltax = 3;
  const xmin = Math.floor(Math.min(-Deltax, -3));
  const xmax = Math.floor(Math.max(Deltax, 3));
  let ymin, ymax;
  if (a > 0) {
    if (b > 0) {
      ymin = Math.floor(Math.min(yi - 1, -1));
      ymax = Math.floor(Math.max(yi + 4, 1));
    } else {
      const yo = -b * b / (4 * a) + c;
      ymin = Math.floor(Math.min(yo - 1, -1));
      ymax = Math.floor(Math.max(yi + 2, yo + 4, 1));
    }
  } else {
    if (b > 0) {
      const yo = -b * b / (4 * a) + c;
      ymin = Math.floor(Math.min(yi - 2, yo - 4, -1));
      ymax = Math.floor(Math.max(yo + 1, 1));
    } else {
      ymin = Math.floor(Math.min(yi - 4, -1));
      ymax = Math.floor(Math.max(yi + 1, 1));
    }
  }
  const plot = `${a}*((\\x)^4)+${b}*((\\x)^2)+${c}`;
  return generateGraphBlock(xmin, xmax, ymin, ymax, plot, '', '');
}

function dothiBacMotMotSource(a: number, b: number, c: number, d: number) {
  if (c === 0 || a * d - b * c === 0) return 'Nhập dữ liệu sai.';
  const xi = Math.round((-d / c) * 100) / 100;
  const yi = Math.round((a / c) * 100) / 100;
  const Deltax = 3.5;
  const Deltay = 3.5;
  const xmin = Math.floor(Math.min(xi - Deltax, -1));
  const xmax = Math.floor(Math.max(xi + Deltax, 1));
  const ymin = Math.floor(Math.min(yi - Deltay, -1));
  const ymax = Math.floor(Math.max(yi + Deltay, 1));
  let block = generateGraphBlock(xmin, xmax, ymin, ymax, '', '', '');
  block = block.replace('\\clip', 
    `\\draw[dashed] (\\xmin,${yi})--(\\xmax,${yi});
\\draw[dashed] (${xi},\\ymin)--(${xi},\\ymax);
\\clip`);
  block = block.replace('\\end{tikzpicture}', 
    `\\draw[smooth,samples=200,domain=\\xmin:${xi - 0.1}] plot (\\x,{(${a}*(\\x)+${b})/(${c}*(\\x)+${d})});
\\draw[smooth,samples=200,domain=${xi + 0.1}:\\xmax] plot (\\x,{(${a}*(\\x)+${b})/(${c}*(\\x)+${d})});
\\end{tikzpicture}`);
  return block;
}

function dothiBacHaiMotSource(a: number, b: number, c: number, m: number, n: number) {
  if (m === 0 || a === 0) return 'Nhập dữ liệu sai.';
  const hamF = (x: number) => (a * x * x + b * x + c) / (m * x + n);
  const xi = Math.round((-n / m) * 100) / 100;
  const Deltax = 4;
  const Deltay = 3;
  const xmin = Math.floor(Math.min(xi - Deltax, -1));
  const xmax = Math.floor(Math.max(xi + Deltax, 1));
  const A = a * m;
  const B = a * n;
  const C = b * n - c * m;
  const Delta = B * B - A * C;
  let ymin, ymax;
  if (Delta < 0) {
    const yi = (b * m - 2 * a * n) / (m * m);
    ymin = Math.floor(Math.min(yi - Deltay, -1));
    ymax = Math.floor(Math.max(yi + Deltay, 1));
  } else {
    const x1 = (-sign(A) * B - Math.sqrt(Delta)) / (sign(A) * A);
    const x2 = (-sign(A) * B + Math.sqrt(Delta)) / (sign(A) * A);
    const y1 = hamF(x1);
    const y2 = hamF(x2);
    ymin = Math.floor(Math.min(y1 - Deltay, y2 - Deltay, -1));
    ymax = Math.floor(Math.max(y1 + Deltay, y2 + Deltay, 1));
  }
  let block = generateGraphBlock(xmin, xmax, ymin, ymax, '', '', '');
  const asymSlope = a / m;
  const asymIntercept = (b * m - a * n) / (m * m);
  block = block.replace('\\clip', 
    `\\draw[dashed] (${xi},\\ymin)--(${xi},\\ymax);
\\draw[dashed,domain=\\xmin:\\xmax] plot (\\x,{${asymSlope}*(\\x)+${asymIntercept}});
\\clip`);
  block = block.replace('\\end{tikzpicture}', 
    `\\draw[smooth,samples=200,domain=\\xmin:${xi - 0.1}] plot (\\x,{(${a}*((\\x)^2)+${b}*(\\x)+${c})/(${m}*(\\x)+${n})});
\\draw[smooth,samples=200,domain=${xi + 0.1}:\\xmax] plot (\\x,{(${a}*((\\x)^2)+${b}*(\\x)+${c})/(${m}*(\\x)+${n})});
\\end{tikzpicture}`);
  return block;
}

// ==================== GEOMETRY GENERATORS ====================
// Simplified versions of Geometry generators from code.gs

const geometryGenerators = {
  tu_dien: (p: GeoParams) => `\\begin{tikzpicture}[scale=1,>=stealth, line join=round, line cap=round, line width=1pt]
\t\\foreach \\x/\\y/\\p in {0/0/${p.B},1.3/-1.6/${p.C},4.5/0/${p.D},1/3.5/${p.A}}{\\path (\\x,\\y) coordinate (\\p);}
\t\\draw (${p.A})--(${p.B})--(${p.C})--(${p.D})--(${p.A})--(${p.C});
\t\\draw[dashed, line width=.8pt](${p.B})--(${p.D});
\t\\foreach \\x/\\g in {${p.A}/90,${p.B}/-170,${p.C}/-110,${p.D}/-10}\\draw[fill=white] (\\x) circle (.045)+(\\g:.3) node[black]{$\\x$};
\\end{tikzpicture}`,

  khoi_non: (p: GeoParams) => `\\begin{tikzpicture}[scale=1, line join=round, line cap=round, line width=1pt]
\t\\def\\h{${p.h}}
\t\\def\\R{${p.R}}
\t\\pgfmathsetmacro\\r{0.45*\\R}
\t\\pgfmathsetmacro\\g{asin(\\r/\\h)}
\t\\pgfmathsetmacro\\xo{\\R*cos(\\g)}
\t\\pgfmathsetmacro\\yo{\\r*sin(\\g)}
\t\\path (0,0) coordinate (O)
\t(0,\\h) coordinate (S)
\t(180:\\R) coordinate (A)
\t(0:\\R) coordinate (B);
\t\\draw[dashed, line width=.8pt](\\xo,\\yo) arc (\\g:180-\\g:{\\R} and {\\r}) (A)--(B) (O)--(S);
\t\\draw (S)--(-\\xo,\\yo) arc (180-\\g:360+\\g:{\\R} and {\\r})--(S);
\\end{tikzpicture}`,

  khoi_tru: (p: GeoParams) => `\\begin{tikzpicture}[scale=1, line join=round, line cap=round, line width=1pt]
\t\\def\\h{${p.h}}
\t\\def\\R{${p.R}}
\t\\pgfmathsetmacro\\r{0.45*\\R}
\t\\path (0,0) coordinate (O)
\t(0,\\h) coordinate (O')
\t(180:\\R) coordinate (A)
\t(0:\\R) coordinate (B)
\t($(B)+(O')$) coordinate (C)
\t($(A)+(O')$) coordinate (D);
\t\\draw[dashed, line width=.8pt] (B) arc (0:180:{\\R} and {\\r});
\t\\draw (O') ellipse ({\\R} and {\\r}) (C)--(B) arc (0:-180:{\\R} and {\\r})--(D);
\\end{tikzpicture}`,

  khoi_cau: (p: GeoParams) => `\\begin{tikzpicture}[scale=1, line join=round, line cap=round, line width=1pt]
\t\\def\\R{${p.R}}
\t\\pgfmathsetmacro\\r{0.45*\\R}
\t\\path (0,0) coordinate (O)
\t(180:\\R) coordinate (A)
\t(0:\\R) coordinate (B);
\t\\draw[dashed, line width=.8pt] (B) arc (0:180:{\\R} and {\\r});
\t\\draw (O) circle (\\R) (B) arc (0:-180:{\\R} and {\\r});
\\end{tikzpicture}`,

  lang_tru_dung: (p: GeoParams) => `\\begin{tikzpicture}[scale=1,>=stealth, line join=round, line cap=round, line width=1pt]
\t\\foreach \\x/\\y/\\p in {0/0/${p.A},1.1/-1.5/${p.B},3.5/0/${p.C}}{\\path (\\x,\\y) coordinate (\\p);}
\t\\path ($(${p.A})+(0,3.2)$) coordinate (${p.M});
\t\\foreach \\x/\\y in {${p.B}/${p.N},${p.C}/${p.P}}{\\path ($(${p.M})+(\\x)-(${p.A})$) coordinate (\\y);}
\t\\draw (${p.A})--(${p.B})--(${p.C})--(${p.P})--(${p.N})--(${p.M})--cycle (${p.M})--(${p.P}) (${p.B})--(${p.N});
\t\\draw[dashed, line width=.8pt](${p.A})--(${p.C});
\t\\foreach \\x/\\g in {${p.A}/-170,${p.B}/-110,${p.C}/-10,${p.M}/170,${p.N}/80,${p.P}/10}\\draw[fill=white] (\\x) circle (.045)+(\\g:.3) node[black]{$\\x$};
\\end{tikzpicture}`,
  
  hinh_hop: (p: GeoParams) => `\\begin{tikzpicture}[scale=1,>=stealth, line join=round, line cap=round, line width=1pt]
\t\\foreach \\x/\\y/\\p in {0/0/${p.A},-1.1/-1.5/${p.B},2.5/-1.5/${p.C}}{\\path (\\x,\\y) coordinate (\\p);}
\t\\path ($(${p.A})+(${p.C})-(${p.B})$) coordinate (${p.D})
\t($(${p.A})+(0,3.2)$) coordinate (${p.M});
\t\\foreach \\x/\\y in {${p.B}/${p.N},${p.C}/${p.P},${p.D}/${p.Q}}{\\path ($(${p.M})+(\\x)-(${p.A})$) coordinate (\\y);}
\t\\draw (${p.C})--(${p.P}) (${p.N})--(${p.M})--(${p.Q})--(${p.P})--(${p.N})--(${p.B})--(${p.C})--(${p.D})--(${p.Q});
\t\\draw[dashed, line width=.8pt] (${p.M})--(${p.A})--(${p.D})(${p.A})--(${p.B});
\t\\foreach \\x/\\g in {${p.A}/-170,${p.B}/-120,${p.C}/-50,${p.D}/-10,${p.M}/170,${p.N}/-145,${p.P}/-30,${p.Q}/10}\\draw[fill=white] (\\x) circle (.045)+(\\g:.3) node[black]{$\\x$};
\\end{tikzpicture}`
};

// ==================== EXPORTED MAIN FUNCTIONS ====================

export const generateBBT = (type: string, c: Coefficients): string => {
  try {
    const { a, b, c: cc, d, m, n } = c;
    let result = '';
    
    switch(type) {
      case 'bac_nhat':
        result = `Bảng biến thiên của hàm số $y=${viewDtBacNhat(a, b, 'x')}$.\n\n`;
        result += bbtBacNhatSource(a, b);
        break;
      case 'bac_hai':
        result = `Bảng biến thiên của hàm số $y=${viewDtBacHai(a, b, cc, 'x')}$.\n\n`;
        result += a === 0 ? bbtBacNhatSource(b, cc) : bbtBacHaiSource(a, b, cc);
        break;
      case 'bac_ba':
        result = `Bảng biến thiên của hàm số $y=${viewDtBacBa(a, b, cc, d, 'x')}$.\n\n`;
        result += a === 0 ? bbtBacHaiSource(b, cc, d) : bbtBacBaSource(a, b, cc, d);
        break;
      case 'trung_phuong':
        result = `Bảng biến thiên của hàm số $y=${viewDtBacBon(a, 0, b, 'x')}$.\n\n`; // Simplified view
        result += bbtTrungPhuongSource(a, b, cc);
        break;
      case 'mot_mot':
        result = bbtMotMotSource(a, b, cc, d);
        break;
      case 'hai_mot':
        result = `Bảng biến thiên của hàm số $y=\\dfrac{${viewDtBacHai(a, b, cc, 'x')}}{${viewDtBacNhat(m, n, 'x')}}$.\n\n`;
        result += bbtHaiMotSource(a, b, cc, m, n);
        break;
    }
    return result;
  } catch (e: any) {
    return `Error: ${e.message}`;
  }
};

export const generateGraph = (type: string, c: Coefficients): string => {
  try {
    const { a, b, c: cc, d, m, n } = c;
    let result = '';
    
    switch(type) {
      case 'bac_nhat':
        result = `Đồ thị của hàm số $y=${viewDtBacNhat(a, b, 'x')}$.\n\n`;
        result += dothiBacNhatSource(a, b);
        break;
      case 'bac_hai':
        result = `Đồ thị của hàm số $y=${viewDtBacHai(a, b, cc, 'x')}$.\n\n`;
        result += dothiBacHaiSource(a, b, cc);
        break;
      case 'bac_ba':
        result = `Đồ thị của hàm số $y=${viewDtBacBa(a, b, cc, d, 'x')}$.\n\n`;
        result += dothiBacBaSource(a, b, cc, d);
        break;
      case 'trung_phuong':
        result = `Đồ thị của hàm số $y=${viewDtBacBon(a, 0, b, 'x')}$.\n\n`;
        result += dothiTrungPhuongSource(a, b, cc);
        break;
      case 'mot_mot':
        result = `Đồ thị của hàm số $y=\\dfrac{${viewDtBacNhat(a, b, 'x')}}{${viewDtBacNhat(cc, d, 'x')}}$.\n\n`;
        result += dothiBacMotMotSource(a, b, cc, d);
        break;
      case 'hai_mot':
        result = `Đồ thị của hàm số $y=\\dfrac{${viewDtBacHai(a, b, cc, 'x')}}{${viewDtBacNhat(m, n, 'x')}}$.\n\n`;
        result += dothiBacHaiMotSource(a, b, cc, m, n);
        break;
    }
    return result;
  } catch (e: any) {
    return `Error: ${e.message}`;
  }
};

export const generateGeometry = (type: string, p: GeoParams): string => {
  try {
    const generator = geometryGenerators[type as keyof typeof geometryGenerators];
    if (generator) return generator(p);
    return 'Hình chưa được hỗ trợ';
  } catch (e: any) {
    return `Error: ${e.message}`;
  }
};

export const generateCustomGraphCode = (params: any) => {
    const {xmin, xmax, ymin, ymax, hsf, gtx, gty} = params;
    
    let block = `\\begin{tikzpicture}[scale=1,>=stealth, line join=round, line cap=round, line width=1pt]
\t\\tikzset{declare function={xmin=${xmin};xmax=${xmax};ymin=${ymin};ymax=${ymax};},smooth,samples=450}
\t\\path (0,0) node[below left]{$ O $};`;
    
    if (gtx) block += `\n\t\\foreach \\x in {${gtx}}{\\draw (\\x,-.05)--(\\x,.05);\\path (\\x,0)node[below]{$\\x$};}`;
    if (gty) block += `\n\t\\foreach \\y in {${gty}}{\\draw (-.05,\\y)--(.05,\\y);\\path (0,\\y)node[left]{$\\y$};}`;
    
    block += `\n\t\\draw[->] (xmin,0)--(xmax,0) node[below]{$ x $};
\t\\draw[->] (0,ymin)--(0,ymax) node[right]{$ y $};
\t\\clip (xmin+.2,ymin+.2) rectangle (xmax-.2,ymax-.2);`;
    
    if (hsf) block += `\n\t\\draw plot[domain=xmin+.2:xmax-.2] (\\x, {${hsf}});`;
    
    block += '\n\\end{tikzpicture}';
    return block;
};
