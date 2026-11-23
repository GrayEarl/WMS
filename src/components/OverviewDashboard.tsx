import React from 'react';
import { ArrowRight, Download } from 'lucide-react';
import { ATTRIBUTE_DICTIONARY, CLASSIFICATION_REGISTER } from '../data/codingPolicy';
import { ClassificationCode, MaterialRecord } from '../types/inventory';
import { downloadTextFile, formatSAR } from '../utils/barcode';

interface OverviewDashboardProps {
  materials: MaterialRecord[];
  nextSeqNum: number;
  onFilterByCategory: (cc: ClassificationCode) => void;
  onNavigateToWorkflow: () => void;
}

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({
  materials,
  nextSeqNum,
  onFilterByCategory,
  onNavigateToWorkflow,
}) => {
  const totalValuation = materials.reduce(
    (sum, m) => sum + m.stockOnHand * m.unitCostSAR,
    0
  );
  const activeCount = materials.filter((m) => m.status === 'ACTIVE').length;
  const lowStockCount = materials.filter(
    (m) => m.status === 'ACTIVE' && m.stockOnHand <= m.reorderLevel
  ).length;
  const paddedNext = String(nextSeqNum).padStart(6, '0');

  const handleExportClassificationCsv = () => {
    const header = 'Classification_Code,Category_Name,Default_Stock_UOM,Traceability_Rule,Storage_Requirement,Examples\n';
    const rows = CLASSIFICATION_REGISTER.map(
      (c) =>
        `"${c.code}","${c.name}","${c.defaultStockUom}","${c.defaultTraceability}","${c.storageRequirement}","${c.examples.join('; ')}"`
    ).join('\n');
    downloadTextFile('IMS-REG-0XX-002-Classification-Register.csv', header + rows, 'text/csv;charset=utf-8');
  };

  return (
    <div className="space-y-8">
      {/* KPI Summary Strip */}
      <section aria-label="Material Master Key Metrics" className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-lg p-5">
          <div className="text-xs font-medium text-slate-500">Issued Permanent SKUs</div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono tabular-nums text-slate-900">
              {materials.length}
            </span>
            <span className="text-xs text-slate-500 font-mono tabular-nums">
              {activeCount} ACTIVE
            </span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-5">
          <div className="text-xs font-medium text-slate-500">Next Global Sequence</div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono tabular-nums text-amber-800">
              {paddedNext}
            </span>
            <span className="text-xs text-slate-500 font-mono">
              AJ-CC-{paddedNext}
            </span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-5">
          <div className="text-xs font-medium text-slate-500">Inventory Valuation (Master)</div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono tabular-nums text-slate-900">
              {formatSAR(totalValuation)}
            </span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-5">
          <div className="text-xs font-medium text-slate-500">Reorder Threshold Alerts</div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono tabular-nums text-slate-900">
              {lowStockCount}
            </span>
            <span className="text-xs text-slate-500">
              12 Approved Categories
            </span>
          </div>
        </div>
      </section>

      {/* Permanent SKU Structure & Governance Policy */}
      <section className="bg-white border border-slate-200 rounded-lg p-6">
        <div className="flex flex-wrap items-start justify-between gap-4 pb-5 border-b border-slate-200">
          <div>
            <div className="text-xs font-mono text-slate-500">
              IMS-PRO-0XX · Section 1 &amp; 2 · Permanent Coding Policy
            </div>
            <h2 className="mt-1 text-xl font-bold text-slate-900">
              Permanent Inventory SKU Architecture: AJ-CC-NNNNNN
            </h2>
            <p className="mt-1 text-sm text-slate-600 max-w-3xl">
              Designed for Khalid Al-Juraid Trading Company Ltd. to eliminate descriptive code overloading, prevent duplicate item creation, and guarantee permanent traceability across manufacturing, upholstery, warehousing, and after-sales service.
            </p>
          </div>
          <button
            type="button"
            onClick={onNavigateToWorkflow}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium rounded-md inline-flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <span>Open SKU Request Workflow</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 3-Segment SKU Anatomy Grid */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="border border-slate-200 rounded-md p-4 bg-slate-50/60">
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold font-mono text-slate-900">AJ</span>
              <span className="text-xs font-mono text-slate-500">Segment 1 · 2 Chars Fixed</span>
            </div>
            <div className="mt-2 text-sm font-semibold text-slate-900">Al-Juraid Company Prefix</div>
            <p className="mt-1 text-xs text-slate-600 leading-relaxed">
              Immutable corporate namespace separating internal permanent SKUs from third-party OEM part numbers, legacy ERP codes, and supplier catalog IDs.
            </p>
          </div>

          <div className="border border-slate-200 rounded-md p-4 bg-slate-50/60">
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold font-mono text-amber-800">CC</span>
              <span className="text-xs font-mono text-slate-500">Segment 2 · 2 Alpha Uppercase</span>
            </div>
            <div className="mt-2 text-sm font-semibold text-slate-900">Approved Inventory Classification</div>
            <p className="mt-1 text-xs text-slate-600 leading-relaxed">
              Controlled 2-letter domain code from <span className="font-mono">IMS-REG-0XX-002</span> (FF, SF, RM, UP, HW, MC, AC, SP, PK, CS, TL, EQ). Never encodes color, size, or vendor.
            </p>
          </div>

          <div className="border border-slate-200 rounded-md p-4 bg-slate-50/60">
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold font-mono text-slate-900">NNNNNN</span>
              <span className="text-xs font-mono text-slate-500">Segment 3 · 6 Digits Monotonic</span>
            </div>
            <div className="mt-2 text-sm font-semibold text-slate-900">Globally Unique Sequential Number</div>
            <p className="mt-1 text-xs text-slate-600 leading-relaxed">
              Zero-padded integer (<span className="font-mono">000001–999999</span>) minted atomically upon Controller approval. Never duplicated, altered, or recycled after obsolescence.
            </p>
          </div>
        </div>

        {/* Non-Negotiable Coding Policy Rules */}
        <div className="mt-6 pt-5 border-t border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-700">
          <div className="space-y-2">
            <div className="font-semibold text-slate-900 text-sm">Mandatory Governance Rules</div>
            <ul className="space-y-1.5 list-disc pl-4 leading-relaxed">
              <li><strong>Zero SKU Overloading:</strong> Dimensions, timber species, leather color, finish, and mechanism live in structured database attributes—never inside the SKU string.</li>
              <li><strong>Strict Immutability:</strong> Once minted, <span className="font-mono">AJ-CC-NNNNNN</span> cannot be edited or reassigned. Spec changes affecting form, fit, or function require a new SKU.</li>
              <li><strong>Zero Recycling:</strong> Deactivated or <span className="font-mono">OBSOLETE</span> SKUs stay permanently locked in <span className="font-mono">material_master</span> to preserve historical PO, warranty, and financial audit integrity.</li>
            </ul>
          </div>
          <div className="space-y-2">
            <div className="font-semibold text-slate-900 text-sm">SKU Generation Examples Across Categories</div>
            <div className="border border-slate-200 rounded-md divide-y divide-slate-200 font-mono text-xs">
              <div className="px-3 py-2 flex items-center justify-between gap-2">
                <span className="font-semibold text-slate-900">AJ-FF-000001</span>
                <span className="font-sans text-slate-600 truncate">Al-Diriyah 3-Seater Sofa (Camel Aniline)</span>
              </div>
              <div className="px-3 py-2 flex items-center justify-between gap-2">
                <span className="font-semibold text-slate-900">AJ-RM-000007</span>
                <span className="font-sans text-slate-600 truncate">Kiln-Dried American Black Walnut 50mm FAS</span>
              </div>
              <div className="px-3 py-2 flex items-center justify-between gap-2">
                <span className="font-semibold text-slate-900">AJ-HW-000011</span>
                <span className="font-sans text-slate-600 truncate">Blum 110° Soft-Close Concealed Hinge</span>
              </div>
              <div className="px-3 py-2 flex items-center justify-between gap-2">
                <span className="font-semibold text-slate-900">AJ-CS-000017</span>
                <span className="font-sans text-slate-600 truncate">2K Dead-Flat Catalyzed PU Topcoat (10 Gloss)</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 12-Category Classification Register (IMS-REG-0XX-002) */}
      <section className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-xs font-mono text-slate-500">IMS-REG-0XX-002 · Controlled Lookup Table</div>
            <h2 className="text-lg font-bold text-slate-900">Approved Inventory Classification Register (12 Categories)</h2>
          </div>
          <button
            type="button"
            onClick={handleExportClassificationCsv}
            className="px-3 py-1.5 border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-medium rounded-md inline-flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600">
                <th className="py-3 px-4 whitespace-nowrap">Code</th>
                <th className="py-3 px-4 whitespace-nowrap">Classification</th>
                <th className="py-3 px-4">Scope &amp; Representative Items</th>
                <th className="py-3 px-4 whitespace-nowrap">Default UOM</th>
                <th className="py-3 px-4 whitespace-nowrap">Traceability</th>
                <th className="py-3 px-4 text-right whitespace-nowrap">Live SKUs</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-sm">
              {CLASSIFICATION_REGISTER.map((cat) => {
                const count = materials.filter((m) => m.cc === cat.code).length;
                return (
                  <tr
                    key={cat.code}
                    onClick={() => onFilterByCategory(cat.code)}
                    className="hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-4 font-mono font-semibold text-amber-800 whitespace-nowrap">
                      {cat.code}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-900 whitespace-nowrap">
                      {cat.name}
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-600 max-w-md">
                      <div>{cat.description}</div>
                      <div className="mt-1 text-slate-500">
                        Examples: {cat.examples.join(' · ')}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-xs text-slate-700 whitespace-nowrap">
                      {cat.defaultStockUom}
                    </td>
                    <td className="py-3 px-4 font-mono text-xs text-slate-700 whitespace-nowrap">
                      {cat.defaultTraceability}
                    </td>
                    <td className="py-3 px-4 font-mono tabular-nums text-right font-semibold text-slate-900 whitespace-nowrap">
                      {count}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Technical Attribute Dictionary Summary (IMS-REG-0XX-003) */}
      <section className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200">
          <div className="text-xs font-mono text-slate-500">IMS-REG-0XX-003 · Structured Identification</div>
          <h2 className="text-lg font-bold text-slate-900">Technical Attribute Dictionary (12 Mandatory / Controlled Fields)</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600">
                <th className="py-2.5 px-4 whitespace-nowrap">Field Key</th>
                <th className="py-2.5 px-4 whitespace-nowrap">Attribute Label</th>
                <th className="py-2.5 px-4 whitespace-nowrap">Standardized Format</th>
                <th className="py-2.5 px-4">Controlled Example</th>
                <th className="py-2.5 px-4 whitespace-nowrap">Mandatory Categories</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs">
              {ATTRIBUTE_DICTIONARY.map((attr) => (
                <tr key={attr.attribute} className="hover:bg-slate-50">
                  <td className="py-2.5 px-4 font-mono text-slate-800 whitespace-nowrap">{attr.attribute}</td>
                  <td className="py-2.5 px-4 font-medium text-slate-900 whitespace-nowrap">{attr.label}</td>
                  <td className="py-2.5 px-4 text-slate-600 whitespace-nowrap">{attr.format}</td>
                  <td className="py-2.5 px-4 text-slate-700">{attr.example}</td>
                  <td className="py-2.5 px-4 font-mono text-slate-600 whitespace-nowrap">{attr.mandatoryFor}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
