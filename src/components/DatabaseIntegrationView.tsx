import React, { useState } from 'react';
import { Download } from 'lucide-react';
import { DATABASE_SCHEMA_TABLES } from '../data/codingPolicy';
import { downloadTextFile, generateDDLScript } from '../utils/barcode';

export const DatabaseIntegrationView: React.FC = () => {
  const [selectedTable, setSelectedTable] = useState<string>(DATABASE_SCHEMA_TABLES[0].tableName);
  const tableDef =
    DATABASE_SCHEMA_TABLES.find((t) => t.tableName === selectedTable) || DATABASE_SCHEMA_TABLES[0];

  const handleDownloadSql = () => {
    const ddl = generateDDLScript(DATABASE_SCHEMA_TABLES);
    downloadTextFile('Al-Juraid-Material-Master-Schema.sql', ddl, 'text/sql;charset=utf-8');
  };

  return (
    <div className="space-y-8">
      {/* Integration Architecture Overview */}
      <section className="bg-white border border-slate-200 rounded-lg p-6 space-y-5">
        <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <div className="text-xs font-mono text-slate-500">
              Section 4 · Single-Database Warehouse Integration
            </div>
            <h2 className="mt-1 text-lg font-bold text-slate-900">
              Material Master Integration Architecture (Zero Duplicate Inventory Database)
            </h2>
            <p className="mt-1 text-xs text-slate-600 max-w-3xl">
              The Material Master resides directly inside Khalid Al-Juraid Trading Company’s existing warehouse database schema. Existing operational tables (<span className="font-mono">inventory_balances</span>, <span className="font-mono">inventory_transactions</span>, <span className="font-mono">purchase_orders</span>, <span className="font-mono">valuation_ledger</span>) reference the immutable <span className="font-mono">aj_sku</span> foreign key, while <span className="font-mono">legacy_sku_xref</span> preserves 100% of historical transactions and opening balances.
            </p>
          </div>
          <button
            type="button"
            onClick={handleDownloadSql}
            className="h-9 px-4 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium rounded-md inline-flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download SQL DDL</span>
          </button>
        </div>

        {/* 3-Layer Integration Diagram */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="border border-slate-200 rounded-md p-4 bg-slate-50/70 space-y-2">
            <div className="font-mono text-[11px] font-semibold text-amber-800">
              LAYER 1 · CORE MATERIAL MASTER
            </div>
            <div className="font-semibold text-slate-900 text-sm">Canonical Item Identity</div>
            <ul className="space-y-1 font-mono text-slate-700">
              <li>• material_master (PK: aj_sku)</li>
              <li>• material_technical_attributes</li>
              <li>• product_variants (FF / SF)</li>
              <li>• bom_headers_and_lines</li>
              <li>• uom_conversions</li>
            </ul>
          </div>

          <div className="border border-slate-200 rounded-md p-4 bg-slate-50/70 space-y-2">
            <div className="font-mono text-[11px] font-semibold text-amber-800">
              LAYER 2 · ZERO-LOSS BRIDGE
            </div>
            <div className="font-semibold text-slate-900 text-sm">Migration &amp; Audit Controls</div>
            <ul className="space-y-1 font-mono text-slate-700">
              <li>• legacy_sku_xref (1:1 / N:1 map)</li>
              <li>• material_audit_log (append-only)</li>
              <li>• DB Trigger: block UPDATE aj_sku</li>
              <li>• DB Check: ^AJ-[A-Z]{'{2}'}-\d{'{6}'}$</li>
              <li>• Global monotonic sequence</li>
            </ul>
          </div>

          <div className="border border-slate-200 rounded-md p-4 bg-slate-50/70 space-y-2">
            <div className="font-mono text-[11px] font-semibold text-emerald-700">
              LAYER 3 · EXISTING WMS TABLES
            </div>
            <div className="font-semibold text-slate-900 text-sm">Preserved Warehouse Operations</div>
            <ul className="space-y-1 font-mono text-slate-700">
              <li>• inventory_balances (FK aj_sku)</li>
              <li>• inventory_transactions (FK aj_sku)</li>
              <li>• warehouse_locations (WH-ZN-AS-RK)</li>
              <li>• valuation_ledger (SAR FIFO/WAvg)</li>
              <li>• purchase_orders / sales_orders</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Interactive Database Table & Field Dictionary */}
      <section className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-xs font-mono text-slate-500">Deliverable 3 · Material Master Field Dictionary</div>
            <h2 className="text-lg font-bold text-slate-900">Relational Schema &amp; Field Validation Dictionary</h2>
          </div>

          <div className="flex flex-wrap gap-1 p-1 bg-slate-100 rounded-md">
            {DATABASE_SCHEMA_TABLES.map((tbl) => (
              <button
                key={tbl.tableName}
                type="button"
                onClick={() => setSelectedTable(tbl.tableName)}
                className={`px-2.5 py-1 text-xs font-mono rounded transition-colors whitespace-nowrap cursor-pointer ${
                  selectedTable === tbl.tableName
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tbl.tableName}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4 text-xs pb-3 border-b border-slate-200">
            <div>
              <span className="font-mono text-sm font-bold text-slate-900">{tableDef.tableName}</span>
              <p className="text-slate-600 mt-0.5">{tableDef.purpose}</p>
            </div>
            <div className="font-mono text-slate-700 space-y-0.5 text-right">
              <div>PK: {tableDef.primaryKey}</div>
              <div className="text-slate-500">FK: {tableDef.foreignKeys.join(', ')}</div>
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-md">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-600">
                  <th className="py-2.5 px-3 whitespace-nowrap">Column Name</th>
                  <th className="py-2.5 px-3 whitespace-nowrap">Data Type</th>
                  <th className="py-2.5 px-3 whitespace-nowrap">Key</th>
                  <th className="py-2.5 px-3 whitespace-nowrap">Nullable</th>
                  <th className="py-2.5 px-3">Validation / Constraint</th>
                  <th className="py-2.5 px-3">Functional Definition</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {tableDef.columns.map((col) => (
                  <tr key={col.name} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-mono font-semibold text-slate-900 whitespace-nowrap">
                      {col.name}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-700 whitespace-nowrap">{col.dataType}</td>
                    <td className="py-2.5 px-3 font-mono font-semibold text-amber-800 whitespace-nowrap">
                      {col.keyType}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-600 whitespace-nowrap">
                      {col.nullable ? 'NULL' : 'NOT NULL'}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-slate-700">{col.validationRule}</td>
                    <td className="py-2.5 px-3 text-slate-700">{col.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
};
