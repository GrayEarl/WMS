import React, { useState } from 'react';
import { CheckCircle2, Download } from 'lucide-react';
import {
  IMPLEMENTATION_ROADMAP,
  RBAC_MATRIX,
  ROLE_LABELS,
} from '../data/codingPolicy';
import {
  LegacyMigrationRow,
  UATCheckItem,
  UserRole,
} from '../types/inventory';
import { downloadTextFile, formatSAR } from '../utils/barcode';

interface MigrationAccessViewProps {
  migrationRows: LegacyMigrationRow[];
  onMapLegacyRow: (migrationId: string) => string | null;
  uatChecklist: UATCheckItem[];
  onToggleUatItem: (id: string) => void;
  activeRole: UserRole;
}

export const MigrationAccessView: React.FC<MigrationAccessViewProps> = ({
  migrationRows,
  onMapLegacyRow,
  uatChecklist,
  onToggleUatItem,
  activeRole,
}) => {
  const [activeTab, setActiveTab] = useState<'migration' | 'rbac' | 'roadmap'>('migration');
  const [migrationBanner, setMigrationBanner] = useState<string | null>(null);

  const totalLegacyValue = migrationRows.reduce((s, r) => s + r.totalValueSAR, 0);
  const totalVariance = migrationRows.reduce((s, r) => s + r.varianceSAR, 0);
  const matchedCount = migrationRows.filter((r) => r.reconciliationStatus === 'MATCHED').length;
  const passedUatCount = uatChecklist.filter((u) => u.passed).length;

  const handleExportMigrationCsv = () => {
    const header = 'Migration_ID,Legacy_SKU,Legacy_Description,Legacy_Warehouse,Stock_On_Hand,UOM,Unit_Cost_SAR,Total_Value_SAR,Target_CC,Mapped_AJ_SKU,Status,Variance_SAR\n';
    const rows = migrationRows
      .map((r) =>
        [
          r.migrationId,
          r.legacySku,
          `"${r.legacyDescription}"`,
          r.legacyWarehouse,
          r.stockOnHand,
          r.stockUom,
          r.unitCostSAR,
          r.totalValueSAR,
          r.targetCc,
          r.mappedAjSku,
          r.reconciliationStatus,
          r.varianceSAR,
        ].join(',')
      )
      .join('\n');
    downloadTextFile('legacy_sku_xref_reconciliation.csv', header + rows, 'text/csv;charset=utf-8');
  };

  const handleExportUatReport = () => {
    const lines = [
      '# Al-Juraid Material & Stock Coding System — UAT Acceptance Checklist',
      `Status: ${passedUatCount} of ${uatChecklist.length} Test Cases Passed`,
      '',
      ...uatChecklist.map(
        (u) =>
          `- [${u.passed ? 'x' : ' '}] **${u.testCode}: ${u.title}** (${u.phase})\n  - Method: ${u.verificationMethod}\n  - Criteria: ${u.acceptanceCriteria}`
      ),
    ];
    downloadTextFile('Al-Juraid-UAT-Acceptance-Report.md', lines.join('\n'), 'text/markdown;charset=utf-8');
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-lg p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-md">
          <button
            type="button"
            onClick={() => setActiveTab('migration')}
            className={`px-3 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'migration' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Legacy Migration &amp; Reconciliation (IMS-WI-0XX-005)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('rbac')}
            className={`px-3 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'rbac' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            User Access &amp; RBAC Matrix (7 Roles)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('roadmap')}
            className={`px-3 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'roadmap' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Roadmap, Testing &amp; UAT ({passedUatCount}/{uatChecklist.length})
          </button>
        </div>

        <div className="text-xs text-slate-500">
          Simulated Role: <span className="font-medium text-slate-900">{ROLE_LABELS[activeRole]}</span>
        </div>
      </div>

      {/* TAB 1: LEGACY MIGRATION & RECONCILIATION */}
      {activeTab === 'migration' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white border border-slate-200 rounded-lg p-5">
              <div className="text-xs font-medium text-slate-500">Preserved Legacy Stock Valuation</div>
              <div className="mt-2 text-2xl font-bold font-mono tabular-nums text-slate-900">
                {formatSAR(totalLegacyValue)}
              </div>
            </div>
            <div className="bg-white border border-slate-200 rounded-lg p-5">
              <div className="text-xs font-medium text-slate-500">Valuation Reconciliation Variance</div>
              <div className="mt-2 text-2xl font-bold font-mono tabular-nums text-emerald-700">
                {formatSAR(totalVariance)}
              </div>
            </div>
            <div className="bg-white border border-slate-200 rounded-lg p-5">
              <div className="text-xs font-medium text-slate-500">Migration Crosswalk Coverage</div>
              <div className="mt-2 text-2xl font-bold font-mono tabular-nums text-slate-900">
                {matchedCount} / {migrationRows.length} SKUs
              </div>
            </div>
          </div>

          {migrationBanner && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-3 text-xs text-emerald-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>{migrationBanner}</span>
            </div>
          )}

          <section className="bg-white border border-slate-200 rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="text-xs font-mono text-slate-500">IMS-WI-0XX-005 · Zero-Loss Cutover Ledger</div>
                <h2 className="text-lg font-bold text-slate-900">Legacy SKU to Permanent AJ-CC-NNNNNN Reconciliation</h2>
              </div>
              <button
                type="button"
                onClick={handleExportMigrationCsv}
                className="h-9 px-3 border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-medium rounded-md inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Crosswalk CSV</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-600">
                    <th className="py-2.5 px-4 whitespace-nowrap">Legacy SKU</th>
                    <th className="py-2.5 px-4">Legacy Description &amp; Notes</th>
                    <th className="py-2.5 px-4 whitespace-nowrap">Warehouse</th>
                    <th className="py-2.5 px-4 text-right whitespace-nowrap">Qty</th>
                    <th className="py-2.5 px-4 text-right whitespace-nowrap">Value (SAR)</th>
                    <th className="py-2.5 px-4 whitespace-nowrap">Mapped Permanent SKU</th>
                    <th className="py-2.5 px-4 whitespace-nowrap">Reconciliation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {migrationRows.map((row) => (
                    <tr key={row.migrationId} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-mono text-slate-800 whitespace-nowrap">{row.legacySku}</td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-900">{row.legacyDescription}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">{row.notes}</div>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-600 whitespace-nowrap">{row.legacyWarehouse}</td>
                      <td className="py-3 px-4 font-mono tabular-nums text-right text-slate-900 whitespace-nowrap">
                        {row.stockOnHand} {row.stockUom}
                      </td>
                      <td className="py-3 px-4 font-mono tabular-nums text-right text-slate-900 whitespace-nowrap">
                        {formatSAR(row.totalValueSAR)}
                      </td>
                      <td className="py-3 px-4 font-mono font-semibold text-slate-900 whitespace-nowrap">
                        {row.mappedAjSku === 'UNMAPPED' ? (
                          <button
                            type="button"
                            onClick={() => {
                              const minted = onMapLegacyRow(row.migrationId);
                              if (minted) {
                                setMigrationBanner(
                                  `Legacy item ${row.legacySku} mapped & minted as ${minted}. Preserved ${row.stockOnHand} ${row.stockUom} (${formatSAR(row.totalValueSAR)}) in Master Material Register.`
                                );
                              }
                            }}
                            className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-sans font-medium rounded cursor-pointer"
                          >
                            Mint AJ-{row.targetCc} &amp; Map
                          </button>
                        ) : (
                          row.mappedAjSku
                        )}
                      </td>
                      <td
                        className={`py-3 px-4 font-mono font-semibold whitespace-nowrap ${
                          row.reconciliationStatus === 'MATCHED' ? 'text-emerald-700' : 'text-amber-700'
                        }`}
                      >
                        {row.reconciliationStatus}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}

      {/* TAB 2: RBAC ACCESS MATRIX */}
      {activeTab === 'rbac' && (
        <section className="bg-white border border-slate-200 rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200">
            <div className="text-xs font-mono text-slate-500">Deliverable 9 · Segregation of Duties</div>
            <h2 className="text-lg font-bold text-slate-900">User Access &amp; Responsibility Matrix (7 Operational Roles)</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-600">
                  <th className="py-3 px-4">Controlled Capability</th>
                  <th className="py-3 px-3 whitespace-nowrap">IMS Ref</th>
                  <th className="py-3 px-3 whitespace-nowrap">Requester</th>
                  <th className="py-3 px-3 whitespace-nowrap">Engineering</th>
                  <th className="py-3 px-3 whitespace-nowrap">Procurement</th>
                  <th className="py-3 px-3 whitespace-nowrap">Warehouse Off.</th>
                  <th className="py-3 px-3 whitespace-nowrap">Inv. Controller</th>
                  <th className="py-3 px-3 whitespace-nowrap">WH Manager</th>
                  <th className="py-3 px-3 whitespace-nowrap">Admin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {RBAC_MATRIX.map((row) => (
                  <tr key={row.capability} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-medium text-slate-900">{row.capability}</td>
                    <td className="py-3 px-3 font-mono text-slate-500 whitespace-nowrap">{row.imsRef}</td>
                    {(
                      [
                        'REQUESTER',
                        'ENGINEERING',
                        'PROCUREMENT',
                        'WAREHOUSE_OFFICER',
                        'INVENTORY_CONTROLLER',
                        'WAREHOUSE_MANAGER',
                        'ADMIN',
                      ] as UserRole[]
                    ).map((role) => {
                      const val = row.permissions[role];
                      const isBlocked = val === 'Prohibited' || val === 'Immutable (Blocked)' || val === '-';
                      const isHighlighted = role === activeRole;
                      return (
                        <td
                          key={role}
                          className={`py-3 px-3 font-mono whitespace-nowrap ${
                            isHighlighted ? 'bg-amber-50/70' : ''
                          } ${isBlocked ? 'text-slate-400' : 'text-slate-800 font-medium'}`}
                        >
                          {val}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* TAB 3: ROADMAP, TESTING & ACCEPTANCE CHECKLIST */}
      {activeTab === 'roadmap' && (
        <div className="space-y-6">
          <section className="bg-white border border-slate-200 rounded-lg p-6 space-y-4">
            <div className="pb-3 border-b border-slate-200">
              <div className="text-xs font-mono text-slate-500">Deliverable 10 · 12-Week Rollout Plan</div>
              <h2 className="text-lg font-bold text-slate-900">Phased Implementation Roadmap</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {IMPLEMENTATION_ROADMAP.map((p) => (
                <div key={p.phase} className="border border-slate-200 rounded-md p-4 space-y-2">
                  <div className="text-xs font-mono font-semibold text-amber-800">{p.phase}</div>
                  <div className="text-sm font-bold text-slate-900">{p.title}</div>
                  <ul className="list-disc pl-4 space-y-1 text-xs text-slate-600 leading-relaxed">
                    {p.deliverables.map((d, idx) => (
                      <li key={idx}>{d}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-white border border-slate-200 rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="text-xs font-mono text-slate-500">Testing Procedures &amp; Go-Live Gate</div>
                <h2 className="text-lg font-bold text-slate-900">
                  Interactive UAT Acceptance Checklist ({passedUatCount}/{uatChecklist.length} Verified)
                </h2>
              </div>
              <button
                type="button"
                onClick={handleExportUatReport}
                className="h-9 px-3 border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-medium rounded-md inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export UAT Report</span>
              </button>
            </div>

            <div className="divide-y divide-slate-200">
              {uatChecklist.map((item) => (
                <label
                  key={item.id}
                  className="px-6 py-4 flex items-start gap-3.5 hover:bg-slate-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={item.passed}
                    onChange={() => onToggleUatItem(item.id)}
                    className="mt-1 h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-amber-700"
                  />
                  <div className="flex-1 min-w-0 text-xs space-y-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="font-semibold text-slate-900">
                        <span className="font-mono text-amber-800 mr-2">{item.testCode}</span>
                        {item.title}
                      </div>
                      <span
                        className={`font-mono font-semibold ${
                          item.passed ? 'text-emerald-700' : 'text-slate-500'
                        }`}
                      >
                        {item.passed ? 'PASSED' : 'PENDING TEST'}
                      </span>
                    </div>
                    <div className="text-slate-600">
                      <span className="font-medium text-slate-700">Procedure:</span> {item.verificationMethod}
                    </div>
                    <div className="text-slate-600">
                      <span className="font-medium text-slate-700">Acceptance Criteria:</span> {item.acceptanceCriteria}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  );
};
