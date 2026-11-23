import React, { useState } from 'react';
import { Download } from 'lucide-react';
import { BOMHeader, MaterialRecord } from '../types/inventory';
import { downloadTextFile, formatSAR } from '../utils/barcode';

interface VariantsBomViewProps {
  materials: MaterialRecord[];
  boms: BOMHeader[];
}

export const VariantsBomView: React.FC<VariantsBomViewProps> = ({ materials, boms }) => {
  const variantMaterials = materials.filter((m) => m.variantSpec);
  const [selectedBomId, setSelectedBomId] = useState<string>(boms[0]?.bomId || '');
  const selectedBom = boms.find((b) => b.bomId === selectedBomId) || boms[0];

  const bomTotalCost = selectedBom
    ? selectedBom.lines.reduce((sum, l) => sum + l.extendedCostSAR, 0)
    : 0;

  const handleExportBomCsv = () => {
    if (!selectedBom) return;
    const header = 'BOM_ID,Revision,Parent_SKU,Line,Level,Component_SKU,Component_Name,CC,Net_Qty,Scrap_Pct,Effective_Qty,UOM,Unit_Cost_SAR,Extended_Cost_SAR,Stage\n';
    const rows = selectedBom.lines
      .map((l) =>
        [
          selectedBom.bomId,
          selectedBom.revision,
          selectedBom.parentSku,
          l.lineNo,
          l.level,
          l.componentSku,
          `"${l.componentName}"`,
          l.cc,
          l.qtyPerParent,
          l.scrapPercent,
          l.effectiveQty,
          l.stockUom,
          l.unitCostSAR,
          l.extendedCostSAR.toFixed(2),
          `"${l.operationStage}"`,
        ].join(',')
      )
      .join('\n');
    downloadTextFile(`${selectedBom.bomId}.csv`, header + rows, 'text/csv;charset=utf-8');
  };

  return (
    <div className="space-y-8">
      {/* Product Variant Register (IMS-REG-0XX-004) */}
      <section className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200">
          <div className="text-xs font-mono text-slate-500">IMS-REG-0XX-004 · Furniture Variant Differentiation</div>
          <h2 className="text-lg font-bold text-slate-900">Product Variant Register (Size, Upholstery, Color, Frame &amp; Mechanism)</h2>
          <p className="mt-1 text-xs text-slate-600">
            Each sellable or semi-finished variant receives its own permanent <span className="font-mono">AJ-CC-NNNNNN</span> SKU while sharing a Design Family Code for commercial grouping.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600">
                <th className="py-2.5 px-4 whitespace-nowrap">Permanent SKU</th>
                <th className="py-2.5 px-4 whitespace-nowrap">Family Code</th>
                <th className="py-2.5 px-4 whitespace-nowrap">Size Variant</th>
                <th className="py-2.5 px-4">Upholstery Material</th>
                <th className="py-2.5 px-4">Color &amp; Finish</th>
                <th className="py-2.5 px-4">Frame Material</th>
                <th className="py-2.5 px-4">Operating Mechanism</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs">
              {variantMaterials.map((item) => (
                <tr key={item.ajSku} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-mono font-semibold text-slate-900 whitespace-nowrap">
                    {item.ajSku}
                  </td>
                  <td className="py-3 px-4 font-mono text-amber-800 whitespace-nowrap">
                    {item.variantSpec?.familyCode}
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-900 whitespace-nowrap">
                    {item.variantSpec?.sizeVariant}
                  </td>
                  <td className="py-3 px-4 text-slate-700">{item.variantSpec?.upholsteryMaterial}</td>
                  <td className="py-3 px-4 text-slate-700">{item.variantSpec?.colorFinish}</td>
                  <td className="py-3 px-4 text-slate-700">{item.variantSpec?.frameMaterial}</td>
                  <td className="py-3 px-4 font-medium text-slate-800">{item.variantSpec?.operatingMechanism}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Bill of Materials Register (IMS-REG-0XX-005) */}
      <section className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-xs font-mono text-slate-500">IMS-REG-0XX-005 · Multi-Level Revision Control</div>
            <h2 className="text-lg font-bold text-slate-900">Bill of Materials (BOM) Explorer</h2>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              aria-label="Select BOM to inspect"
              value={selectedBomId}
              onChange={(e) => setSelectedBomId(e.target.value)}
              className="h-9 px-3 border border-slate-300 rounded-md text-xs font-medium bg-white text-slate-900"
            >
              {boms.map((b) => (
                <option key={b.bomId} value={b.bomId}>
                  {b.bomId} ({b.revision}) — {b.parentSku}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={handleExportBomCsv}
              className="h-9 px-3 border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-medium rounded-md inline-flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export BOM CSV</span>
            </button>
          </div>
        </div>

        {selectedBom && (
          <div className="p-6 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pb-4 border-b border-slate-200 text-xs">
              <div>
                <div className="text-slate-500">Parent Furniture SKU</div>
                <div className="font-mono font-bold text-slate-900 mt-0.5">{selectedBom.parentSku}</div>
                <div className="text-slate-600 mt-0.5">{selectedBom.parentName}</div>
              </div>
              <div>
                <div className="text-slate-500">BOM Revision &amp; Status</div>
                <div className="font-mono font-semibold text-emerald-700 mt-0.5">
                  {selectedBom.revision} · {selectedBom.status}
                </div>
                <div className="text-slate-500 mt-0.5">Effective {selectedBom.effectiveDate}</div>
              </div>
              <div>
                <div className="text-slate-500">Engineering &amp; Approval</div>
                <div className="text-slate-900 font-medium mt-0.5">{selectedBom.engineeredBy}</div>
                <div className="text-slate-500 mt-0.5">Approved: {selectedBom.approvedBy}</div>
              </div>
              <div className="md:text-right">
                <div className="text-slate-500">Rolled-Up Material Cost</div>
                <div className="text-lg font-bold font-mono tabular-nums text-slate-900 mt-0.5">
                  {formatSAR(bomTotalCost)}
                </div>
                <div className="text-slate-500 mt-0.5">{selectedBom.lines.length} controlled lines</div>
              </div>
            </div>

            <div className="text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-md px-3.5 py-2.5">
              <span className="font-semibold text-slate-800">Revision Change Note:</span> {selectedBom.changeNote}
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-md">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600">
                    <th className="py-2.5 px-3 whitespace-nowrap">Line</th>
                    <th className="py-2.5 px-3 whitespace-nowrap">Lvl</th>
                    <th className="py-2.5 px-3 whitespace-nowrap">Component SKU</th>
                    <th className="py-2.5 px-3">Component Description</th>
                    <th className="py-2.5 px-3 whitespace-nowrap">Operation Stage</th>
                    <th className="py-2.5 px-3 text-right whitespace-nowrap">Net Qty</th>
                    <th className="py-2.5 px-3 text-right whitespace-nowrap">Scrap %</th>
                    <th className="py-2.5 px-3 text-right whitespace-nowrap">Eff. Qty</th>
                    <th className="py-2.5 px-3 text-right whitespace-nowrap">Ext. Cost</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-xs">
                  {selectedBom.lines.map((line) => (
                    <tr key={line.lineNo} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-mono tabular-nums text-slate-500">{line.lineNo}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-700">L{line.level}</td>
                      <td className="py-2.5 px-3 font-mono font-semibold text-slate-900 whitespace-nowrap">
                        {line.componentSku}
                      </td>
                      <td className="py-2.5 px-3 text-slate-800">{line.componentName}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-600 whitespace-nowrap">{line.operationStage}</td>
                      <td className="py-2.5 px-3 font-mono tabular-nums text-right text-slate-800 whitespace-nowrap">
                        {line.qtyPerParent} {line.stockUom}
                      </td>
                      <td className="py-2.5 px-3 font-mono tabular-nums text-right text-slate-600">
                        {line.scrapPercent}%
                      </td>
                      <td className="py-2.5 px-3 font-mono tabular-nums text-right font-medium text-slate-900 whitespace-nowrap">
                        {line.effectiveQty} {line.stockUom}
                      </td>
                      <td className="py-2.5 px-3 font-mono tabular-nums text-right font-semibold text-slate-900 whitespace-nowrap">
                        {formatSAR(line.extendedCostSAR)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};
