import QRCode from 'qrcode';
import { DatabaseTableDef, MaterialRecord, TechnicalAttributes } from '../types/inventory';

// Standard Code-128 bar-space module widths (codes 0..106)
const CODE128_PATTERNS: string[] = [
  '212222', '222122', '222221', '121223', '121322', '131222', '122213', '122312', '132212', '221213',
  '221312', '231212', '112232', '122132', '122231', '113222', '123122', '123221', '223211', '221132',
  '221231', '213212', '223112', '312131', '311222', '321122', '321221', '312212', '322112', '322211',
  '212123', '212321', '232121', '111323', '131123', '131321', '112313', '132113', '132311', '211313',
  '231113', '231311', '112133', '112331', '132131', '113123', '113321', '133121', '313121', '211331',
  '231131', '213113', '213311', '213131', '311123', '311321', '331121', '312113', '312311', '332111',
  '314111', '221411', '431111', '111224', '111422', '121124', '121421', '141122', '141221', '112214',
  '112412', '122114', '122411', '142112', '142211', '241211', '221114', '413111', '241112', '134111',
  '111242', '121142', '121241', '114212', '124112', '124211', '411212', '421112', '421211', '212141',
  '214121', '412121', '111143', '111341', '131141', '114113', '114311', '411113', '411311', '113141',
  '114131', '311141', '411131', '211412', '211214', '211232', '2331112',
];

export interface Code128Bar {
  x: number;
  width: number;
}

export function generateCode128Bars(text: string): { bars: Code128Bar[]; totalWidth: number } {
  const startCodeB = 104;
  const stopCode = 106;
  const codes: number[] = [startCodeB];

  for (let i = 0; i < text.length; i++) {
    const charCode = text.charCodeAt(i);
    // Code 128B supports ASCII 32..126
    const val = charCode >= 32 && charCode <= 126 ? charCode - 32 : 0;
    codes.push(val);
  }

  // Modulo 103 check digit
  let checksum = startCodeB;
  for (let i = 1; i < codes.length; i++) {
    checksum += codes[i] * i;
  }
  codes.push(checksum % 103);
  codes.push(stopCode);

  const bars: Code128Bar[] = [];
  let cursor = 10; // quiet zone

  for (const code of codes) {
    const pattern = CODE128_PATTERNS[code] || CODE128_PATTERNS[0];
    for (let j = 0; j < pattern.length; j++) {
      const moduleWidth = parseInt(pattern[j], 10);
      if (j % 2 === 0) {
        bars.push({ x: cursor, width: moduleWidth });
      }
      cursor += moduleWidth;
    }
  }

  return { bars, totalWidth: cursor + 10 };
}

export async function generateQrSvgString(payload: string): Promise<string> {
  return QRCode.toString(payload, {
    type: 'svg',
    margin: 1,
    width: 160,
    errorCorrectionLevel: 'M',
    color: {
      dark: '#0f172a',
      light: '#ffffff',
    },
  });
}

export interface DuplicateCheckMatch {
  material: MaterialRecord;
  score: number;
  reasons: string[];
}

export function checkMaterialDuplicates(
  shortName: string,
  attributes: Partial<TechnicalAttributes>,
  existingMaterials: MaterialRecord[]
): DuplicateCheckMatch[] {
  const norm = (v?: string) => (v || '').trim().toLowerCase();
  const tokenize = (v?: string) =>
    norm(v)
      .split(/[^a-z0-9]+/)
      .filter((t) => t.length >= 2);

  const queryTokens = new Set([
    ...tokenize(shortName),
    ...tokenize(attributes.itemType),
    ...tokenize(attributes.materialComposition),
    ...tokenize(attributes.dimensions),
  ]);

  const targetModel = norm(attributes.model);
  const targetMfr = norm(attributes.manufacturer);
  const targetDim = norm(attributes.dimensions);

  const matches: DuplicateCheckMatch[] = [];

  for (const item of existingMaterials) {
    let score = 0;
    const reasons: string[] = [];

    const itemModel = norm(item.attributes.model);
    const itemMfr = norm(item.attributes.manufacturer);
    const itemDim = norm(item.attributes.dimensions);

    if (targetModel && itemModel && (itemModel === targetModel || itemModel.includes(targetModel) || targetModel.includes(itemModel))) {
      score += 48;
      reasons.push(`Matching OEM Model (${item.attributes.model})`);
    }

    if (targetMfr && itemMfr && itemMfr === targetMfr) {
      score += 18;
      reasons.push(`Same Manufacturer (${item.attributes.manufacturer})`);
    }

    if (targetDim && itemDim && (itemDim === targetDim || itemDim.includes(targetDim))) {
      score += 20;
      reasons.push(`Matching Dimensions (${item.attributes.dimensions})`);
    }

    const itemTokens = new Set([
      ...tokenize(item.shortName),
      ...tokenize(item.attributes.itemType),
      ...tokenize(item.attributes.materialComposition),
    ]);

    let overlap = 0;
    for (const tok of queryTokens) {
      if (itemTokens.has(tok)) overlap++;
    }

    if (queryTokens.size > 0 && overlap > 0) {
      const jaccard = overlap / Math.max(queryTokens.size, itemTokens.size);
      const tokenPoints = Math.round(jaccard * 40);
      if (tokenPoints >= 10) {
        score += tokenPoints;
        reasons.push(`${overlap} overlapping technical terms`);
      }
    }

    if (score >= 30) {
      matches.push({
        material: item,
        score: Math.min(99, score),
        reasons,
      });
    }
  }

  return matches.sort((a, b) => b.score - a.score).slice(0, 5);
}

export function formatSAR(amount: number): string {
  return new Intl.NumberFormat('en-SA', {
    style: 'currency',
    currency: 'SAR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function downloadTextFile(filename: string, content: string, mimeType = 'text/plain;charset=utf-8'): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

export function generateDDLScript(tables: DatabaseTableDef[]): string {
  const header = `-- Khalid Al-Juraid Trading Company Ltd.\n-- Permanent Material Master & Existing WMS Integration DDL\n-- Controlled Document Reference: IMS-PRO-0XX / IMS-REG-0XX-001\n\n`;
  const body = tables
    .map((t) => {
      const cleanName = t.tableName.replace(/\s*\(.*?\)\s*/g, '');
      const cols = t.columns
        .map((c) => `  ${c.name.padEnd(24, ' ')} ${c.dataType}${c.nullable ? '' : ' NOT NULL'}`)
        .join(',\n');
      return `-- Purpose: ${t.purpose}\nCREATE TABLE IF NOT EXISTS ${cleanName} (\n${cols},\n  PRIMARY KEY (${t.primaryKey})\n);\n`;
    })
    .join('\n');
  return header + body;
}
