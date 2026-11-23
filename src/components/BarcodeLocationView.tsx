import React, { useEffect, useMemo, useState } from 'react';
import QRCode from 'qrcode';
import { Printer } from 'lucide-react';
import { WAREHOUSE_ZONES } from '../data/codingPolicy';
import { MaterialRecord } from '../types/inventory';
import { generateCode128Bars } from '../utils/barcode';

interface BarcodeLocationViewProps {
  materials: MaterialRecord[];
  initialSku?: string;
}

type LabelFormat = 'CARTON_100x150' | 'RACK_100x50' | 'POUCH_50x25';

export const BarcodeLocationView: React.FC<BarcodeLocationViewProps> = ({
  materials,
  initialSku,
}) => {
  const [selectedSku, setSelectedSku] = useState<string>(initialSku || materials[0]?.ajSku || '');
  const [labelFormat, setLabelFormat] = useState<LabelFormat>('CARTON_100x150');
  const [batchOrSerial, setBatchOrSerial] = useState<string>('LOT-2026-11A');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  // Warehouse location builder state (separate from SKU)
  const [whCode, setWhCode] = useState('WH1');
  const [zoneCode, setZoneCode] = useState('A');
  const [aisleNum, setAisleNum] = useState('04');
  const [rackNum, setRackNum] = useState('02');
  const [levelNum, setLevelNum] = useState('3');
  const [binNum, setBinNum] = useState('05');

  useEffect(() => {
    if (initialSku) {
      setSelectedSku(initialSku);
    }
  }, [initialSku]);

  const material = materials.find((m) => m.ajSku === selectedSku) || materials[0];

  const qrPayload = useMemo(() => {
    if (!material) return '';
    return `AJ|SKU:${material.ajSku}|LOT:${batchOrSerial}|UOM:${material.uom.stockUom}|LOC:${material.warehouseLocation}`;
  }, [material, batchOrSerial]);

  useEffect(() => {
    if (!qrPayload) return;
    let active = true;
    QRCode.toDataURL(qrPayload, {
      width: 240,
      margin: 1,
      errorCorrectionLevel: 'M',
      color: { dark: '#0f172a', light: '#ffffff' },
    })
      .then((url) => {
        if (active) setQrDataUrl(url);
      })
      .catch(() => {
        if (active) setQrDataUrl('');
      });
    return () => {
      active = false;
    };
  }, [qrPayload]);

  const code128 = useMemo(() => {
    return generateCode128Bars(material?.ajSku || 'AJ-FF-000001');
  }, [material]);

  const customLocationCode = `${whCode}-${zoneCode}-${aisleNum.padStart(2, '0')}-R${rackNum.padStart(2, '0')}-L${levelNum}-B${binNum.padStart(2, '0')}`;

  return (
    <div className="space-y-8">
      {/* Barcode & QR Label Studio (IMS-WI-0XX-004) */}
      <section className="bg-white border border-slate-200 rounded-lg p-6 space-y-6">
        <div className="no-print flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <div className="text-xs font-mono text-slate-500">IMS-WI-0XX-004 · Dual-Symbology Identification</div>
            <h2 className="mt-1 text-lg font-bold text-slate-900">
              Barcode (Code-128B) &amp; QR Code Label Studio
            </h2>
            <p className="mt-1 text-xs text-slate-600">
              Generates live scannable Code-128B barcodes and ISO/IEC 18004 QR labels encoding permanent SKU, batch/serial reference, stock UOM, and separate bin address.
            </p>
          </div>
          <button
            type="button"
            onClick={() => window.print()}
            className="h-9 px-4 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium rounded-md inline-flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Label</span>
          </button>
        </div>

        {/* Controls */}
        <div className="no-print grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block font-medium text-slate-700 mb-1">Target Material SKU</label>
            <select
              value={selectedSku}
              onChange={(e) => setSelectedSku(e.target.value)}
              className="w-full h-9 px-3 border border-slate-300 rounded-md bg-white font-mono text-slate-900"
            >
              {materials.map((m) => (
                <option key={m.ajSku} value={m.ajSku}>
                  {m.ajSku} — {m.shortName.slice(0, 48)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Thermal Label Standard</label>
            <select
              value={labelFormat}
              onChange={(e) => setLabelFormat(e.target.value as LabelFormat)}
              className="w-full h-9 px-3 border border-slate-300 rounded-md bg-white text-slate-900"
            >
              <option value="CARTON_100x150">Format A · 100 × 150 mm Carton / Hang Tag</option>
              <option value="RACK_100x50">Format B · 100 × 50 mm Rack / Timber Bundle</option>
              <option value="POUCH_50x25">Format C · 50 × 25 mm Hardware Pouch Label</option>
            </select>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Batch / Lot or Serial Suffix</label>
            <input
              type="text"
              value={batchOrSerial}
              onChange={(e) => setBatchOrSerial(e.target.value.toUpperCase())}
              className="w-full h-9 px-3 border border-slate-300 rounded-md font-mono text-slate-900"
            />
          </div>
        </div>

        {/* Printable Label Canvas */}
        {material && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-7 flex justify-center bg-slate-100/80 border border-slate-200 rounded-lg p-8">
              <div
                className={`print-surface bg-white border-2 border-slate-900 rounded-sm p-5 text-slate-900 flex flex-col justify-between ${
                  labelFormat === 'CARTON_100x150'
                    ? 'w-full max-w-[420px] min-h-[300px]'
                    : labelFormat === 'RACK_100x50'
                    ? 'w-full max-w-[460px] min-h-[190px]'
                    : 'w-full max-w-[300px] min-h-[140px]'
                }`}
              >
                <div className="flex items-start justify-between gap-4 border-b border-slate-900 pb-3">
                  <div className="min-w-0">
                    <div className="text-[10px] font-mono tracking-wider text-slate-600">
                      KHALID AL-JURAID TRADING CO. LTD.
                    </div>
                    <div className="text-xl font-bold font-mono tracking-tight text-slate-900 mt-0.5">
                      {material.ajSku}
                    </div>
                    <div className="text-xs font-semibold text-slate-800 mt-1 line-clamp-2">
                      {material.shortName}
                    </div>
                  </div>
                  {qrDataUrl && (
                    <img
                      src={qrDataUrl}
                      alt={`QR Code for ${material.ajSku}`}
                      className="w-20 h-20 shrink-0 border border-slate-200"
                    />
                  )}
                </div>

                {labelFormat !== 'POUCH_50x25' && (
                  <div className="py-3 grid grid-cols-2 gap-2 text-[11px] font-mono border-b border-slate-200">
                    <div>
                      <span className="text-slate-500">BIN:</span>{' '}
                      <span className="font-semibold">{material.warehouseLocation}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">UOM:</span>{' '}
                      <span className="font-semibold">{material.uom.stockUom}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">TRACE:</span>{' '}
                      <span className="font-semibold">{batchOrSerial}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">OEM:</span>{' '}
                      <span className="font-semibold">{material.attributes.model}</span>
                    </div>
                  </div>
                )}

                <div className="pt-3 flex flex-col items-center">
                  <svg
                    viewBox={`0 0 ${code128.totalWidth} 44`}
                    className="w-full h-11"
                    role="img"
                    aria-label={`Code-128B barcode for ${material.ajSku}`}
                  >
                    <rect x={0} y={0} width={code128.totalWidth} height={44} fill="#ffffff" />
                    {code128.bars.map((bar, idx) => (
                      <rect
                        key={idx}
                        x={bar.x}
                        y={2}
                        width={bar.width}
                        height={40}
                        fill="#0f172a"
                      />
                    ))}
                  </svg>
                  <div className="text-[11px] font-mono tracking-[0.2em] font-semibold mt-1">
                    *{material.ajSku}*
                  </div>
                </div>
              </div>
            </div>

            <div className="no-print lg:col-span-5 space-y-4 text-xs">
              <div className="border border-slate-200 rounded-md p-4 space-y-2">
                <div className="font-semibold text-slate-900">Encoded QR Payload String</div>
                <pre className="p-2.5 bg-slate-50 border border-slate-200 rounded font-mono text-[11px] text-slate-800 whitespace-pre-wrap break-all">
                  {qrPayload}
                </pre>
                <p className="text-slate-600 leading-relaxed">
                  Scannable by warehouse Android/iOS terminals and Zebra 2D imagers. Linear Code-128B encodes strictly the 13-character immutable SKU for 1D laser scanners.
                </p>
              </div>

              <div className="border border-slate-200 rounded-md p-4 space-y-2">
                <div className="font-semibold text-slate-900">Physical Placement Standards</div>
                <ul className="space-y-1.5 list-disc pl-4 text-slate-600 leading-relaxed">
                  <li><strong>Finished Furniture (FF):</strong> Woven/Tyvek under-frame serial label + two 100×150 mm export carton faces.</li>
                  <li><strong>Timber &amp; Leather (RM/UP):</strong> End-grain staple tag or inner core tube sticker per lot/dye-batch.</li>
                  <li><strong>Hardware &amp; Spares (HW/SP):</strong> 50×25 mm tamper-evident pouch label + bin front magnetic strip.</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Warehouse Location Coding (Strictly Separate from SKU) */}
      <section className="no-print bg-white border border-slate-200 rounded-lg p-6 space-y-5">
        <div className="pb-4 border-b border-slate-200">
          <div className="text-xs font-mono text-slate-500">Operational Control · Physical Address Governance</div>
          <h2 className="mt-1 text-lg font-bold text-slate-900">
            Warehouse Location Coding: WH-ZN-AS-RK-LV-BN (Separate from SKU)
          </h2>
          <p className="mt-1 text-xs text-slate-600">
            Warehouse coordinates identify where stock sits physically—never what the item is. Moving an item between warehouses or racks updates its location assignment without ever altering its permanent <span className="font-mono">AJ-CC-NNNNNN</span> SKU.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 text-xs">
          <div>
            <label className="block font-medium text-slate-700 mb-1">Warehouse (WH)</label>
            <select
              value={whCode}
              onChange={(e) => setWhCode(e.target.value)}
              className="w-full h-9 px-2 border border-slate-300 rounded-md font-mono bg-white"
            >
              <option value="WH1">WH1 (Riyadh DC)</option>
              <option value="WH2">WH2 (Al-Kharj Mill)</option>
              <option value="WH3">WH3 (Upholstery Vault)</option>
              <option value="WH4">WH4 (Mezzanine)</option>
            </select>
          </div>
          <div>
            <label className="block font-medium text-slate-700 mb-1">Zone (ZN)</label>
            <input
              type="text"
              maxLength={1}
              value={zoneCode}
              onChange={(e) => setZoneCode(e.target.value.toUpperCase() || 'A')}
              className="w-full h-9 px-2 border border-slate-300 rounded-md font-mono"
            />
          </div>
          <div>
            <label className="block font-medium text-slate-700 mb-1">Aisle (AS)</label>
            <input
              type="text"
              maxLength={2}
              value={aisleNum}
              onChange={(e) => setAisleNum(e.target.value)}
              className="w-full h-9 px-2 border border-slate-300 rounded-md font-mono"
            />
          </div>
          <div>
            <label className="block font-medium text-slate-700 mb-1">Rack (RK)</label>
            <input
              type="text"
              maxLength={2}
              value={rackNum}
              onChange={(e) => setRackNum(e.target.value)}
              className="w-full h-9 px-2 border border-slate-300 rounded-md font-mono"
            />
          </div>
          <div>
            <label className="block font-medium text-slate-700 mb-1">Level (LV)</label>
            <input
              type="text"
              maxLength={1}
              value={levelNum}
              onChange={(e) => setLevelNum(e.target.value)}
              className="w-full h-9 px-2 border border-slate-300 rounded-md font-mono"
            />
          </div>
          <div>
            <label className="block font-medium text-slate-700 mb-1">Bin (BN)</label>
            <input
              type="text"
              maxLength={2}
              value={binNum}
              onChange={(e) => setBinNum(e.target.value)}
              className="w-full h-9 px-2 border border-slate-300 rounded-md font-mono"
            />
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-md px-4 py-3 flex flex-wrap items-center justify-between gap-4">
          <div className="text-xs text-slate-600">Generated Standard Warehouse Bin Code</div>
          <div className="text-base font-bold font-mono text-slate-900">{customLocationCode}</div>
        </div>

        <div className="overflow-x-auto border border-slate-200 rounded-md">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-600">
                <th className="py-2.5 px-3">Warehouse Code</th>
                <th className="py-2.5 px-3">Facility</th>
                <th className="py-2.5 px-3">Zone</th>
                <th className="py-2.5 px-3">Dedicated Storage Function</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {WAREHOUSE_ZONES.map((z) => (
                <tr key={`${z.warehouse}-${z.zone}`}>
                  <td className="py-2.5 px-3 font-mono font-semibold text-slate-900">{z.warehouse}</td>
                  <td className="py-2.5 px-3 text-slate-800">{z.name}</td>
                  <td className="py-2.5 px-3 font-mono text-amber-800 font-semibold">Zone {z.zone}</td>
                  <td className="py-2.5 px-3 text-slate-600">{z.zoneName}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
