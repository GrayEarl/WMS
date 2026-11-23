import React, { useMemo, useState } from 'react';
import { Barcode, Download, FileWarning, Search, X } from 'lucide-react';
import { CLASSIFICATION_REGISTER } from '../data/codingPolicy';
import { ClassificationCode, ItemStatus, MaterialRecord } from '../types/inventory';
import { downloadTextFile, formatSAR } from '../utils/barcode';

interface MaterialMasterViewProps {
  materials: MaterialRecord[];
  initialCategoryFilter: ClassificationCode | 'ALL';
  onClearInitialFilter: () => void;
  onOpenBarcodeForSku: (sku: string) => void;
  onOpenChangeFormForSku: (sku: string) => void;
}

const STATUS_TEXT_STYLE: Record<ItemStatus, string> = {
  DRAFT: 'text-slate-500',
  PENDING_ENGINEERING: 'text-amber-700',
  PENDING_CONTROLLER: 'text-amber-700',
  ACTIVE: 'text-emerald-700',
  HOLD: 'text-amber-700',
  PHASE_OUT: 'text-amber-800',
  OBSOLETE: 'text-red-700',
};

export const MaterialMasterView: React.FC<MaterialMasterViewProps> = ({
  materials,
  initialCategoryFilter,
  onClearInitialFilter,
  onOpenBarcodeForSku,
  onOpenChangeFormForSku,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<ClassificationCode | 'ALL'>(
    initialCategoryFilter
  );
  const [statusFilter, setStatusFilter] = useState<ItemStatus | 'ALL'>('ALL');
  const [selectedSku, setSelectedSku] = useState<string>(
    materials[0]?.ajSku || ''
  );

  React.useEffect(() => {
    setCategoryFilter(initialCategoryFilter);
  }, [initialCategoryFilter]);

  const filteredMaterials = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return materials.filter((item) => {
      if (categoryFilter !== 'ALL' && item.cc !== categoryFilter) return false;
      if (statusFilter !== 'ALL' && item.status !== statusFilter) return false;
      if (!q) return true;
      const haystack = [
        item.ajSku,
        item.shortName,
        item.legacySku || '',
        item.warehouseLocation,
        item.attributes.manufacturer,
        item.attributes.model,
        item.attributes.materialComposition,
        item.attributes.color,
        item.attributes.itemType,
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [materials, searchQuery, categoryFilter, statusFilter]);

  const selectedMaterial =
    materials.find((m) => m.ajSku === selectedSku) || filteredMaterials[0] || null;

  const handleExportRegisterCsv = () => {
    const headers = [
      'AJ_SKU',
      'CC',
      'Short_Name',
      'Status',
      'ABC_VED',
      'Stock_On_Hand',
      'Stock_UOM',
      'Purchase_UOM',
      'Conversion_Factor',
      'Unit_Cost_SAR',
      'Warehouse_Location',
      'Traceability',
      'Legacy_SKU',
      'Manufacturer',
      'OEM_Model',
    ];
    const rows = filteredMaterials.map((m) =>
      [
        m.ajSku,
        m.cc,
        `"${m.shortName.replace(/"/g, '""')}"`,
        m.status,
        `${m.abcClass}/${m.vedClass}`,
        m.stockOnHand,
        m.uom.stockUom,
        m.uom.purchaseUom,
        m.uom.conversionFactor,
        m.unitCostSAR,
        m.warehouseLocation,
        m.traceability,
        m.legacySku || '',
        `"${m.attributes.manufacturer.replace(/"/g, '""')}"`,
        `"${m.attributes.model.replace(/"/g, '""')}"`,
      ].join(',')
    );
    downloadTextFile(
      'IMS-REG-0XX-001-Master-Material-Register.csv',
      [headers.join(','), ...rows].join('\n'),
      'text/csv;charset=utf-8'
    );
  };

  return (
    <div className="space-y-6">
      {/* Filter & Search Toolbar */}
      <section className="bg-white border border-slate-200 rounded-lg p-4 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="relative flex-1 min-w-[260px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search AJ-CC-NNNNNN, description, OEM model, legacy SKU, or bin location..."
              className="w-full h-9 pl-9 pr-8 border border-slate-300 rounded-md text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-700"
            />
            {searchQuery && (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <select
              aria-label="Filter by status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as ItemStatus | 'ALL')}
              className="h-9 px-3 border border-slate-300 rounded-md text-xs font-medium text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-amber-700"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="PHASE_OUT">PHASE_OUT</option>
              <option value="HOLD">HOLD</option>
              <option value="OBSOLETE">OBSOLETE</option>
            </select>

            <button
              type="button"
              onClick={handleExportRegisterCsv}
              className="h-9 px-3 border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-medium rounded-md inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Register</span>
            </button>
          </div>
        </div>

        {/* Category Segmented Filter Bar */}
        <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-md">
          <button
            type="button"
            onClick={() => {
              setCategoryFilter('ALL');
              onClearInitialFilter();
            }}
            className={`px-2.5 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              categoryFilter === 'ALL'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All ({materials.length})
          </button>
          {CLASSIFICATION_REGISTER.map((cat) => {
            const count = materials.filter((m) => m.cc === cat.code).length;
            const active = categoryFilter === cat.code;
            return (
              <button
                key={cat.code}
                type="button"
                onClick={() => setCategoryFilter(cat.code)}
                title={cat.name}
                className={`px-2.5 py-1 text-xs font-mono font-medium rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  active
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                {cat.code} ({count})
              </button>
            );
          })}
        </div>
      </section>

      {/* Split Master Table + Technical Specification Inspector */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Table Column */}
        <div className="xl:col-span-7 bg-white border border-slate-200 rounded-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between text-xs text-slate-500">
            <span>Showing {filteredMaterials.length} of {materials.length} permanent SKUs</span>
            <span className="font-mono">Click row for technical profile</span>
          </div>

          {filteredMaterials.length === 0 ? (
            <div className="p-10 text-center space-y-2">
              <div className="text-sm font-semibold text-slate-900">No matching SKUs in Master Material Register</div>
              <p className="text-xs text-slate-500">
                Adjust category or search keywords, or submit IMS-FRM-0XX-001 to register a new item.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600">
                    <th className="py-2.5 px-3 whitespace-nowrap">Permanent SKU</th>
                    <th className="py-2.5 px-3">Standardized Item Name</th>
                    <th className="py-2.5 px-3 text-right whitespace-nowrap">Stock</th>
                    <th className="py-2.5 px-3 whitespace-nowrap">Location Bin</th>
                    <th className="py-2.5 px-3 whitespace-nowrap">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-xs">
                  {filteredMaterials.map((item) => {
                    const isSelected = selectedMaterial?.ajSku === item.ajSku;
                    const lowStock = item.status === 'ACTIVE' && item.stockOnHand <= item.reorderLevel;
                    return (
                      <tr
                        key={item.ajSku}
                        onClick={() => setSelectedSku(item.ajSku)}
                        className={`cursor-pointer transition-colors ${
                          isSelected ? 'bg-amber-50/70' : 'hover:bg-slate-50'
                        }`}
                      >
                        <td className="py-2.5 px-3 font-mono font-semibold text-slate-900 whitespace-nowrap">
                          {item.ajSku}
                        </td>
                        <td className="py-2.5 px-3 text-slate-800">
                          <div className="font-medium line-clamp-1">{item.shortName}</div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            {item.attributes.manufacturer} · {item.attributes.model}
                          </div>
                        </td>
                        <td className="py-2.5 px-3 font-mono tabular-nums text-right whitespace-nowrap">
                          <span className={lowStock ? 'text-amber-700 font-semibold' : 'text-slate-900'}>
                            {item.stockOnHand.toLocaleString()}
                          </span>{' '}
                          <span className="text-slate-500">{item.uom.stockUom}</span>
                        </td>
                        <td className="py-2.5 px-3 font-mono text-slate-600 whitespace-nowrap">
                          {item.warehouseLocation}
                        </td>
                        <td className={`py-2.5 px-3 font-mono font-medium whitespace-nowrap ${STATUS_TEXT_STYLE[item.status]}`}>
                          {item.status}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Technical Specification Inspector */}
        <div className="xl:col-span-5 bg-white border border-slate-200 rounded-lg p-5 space-y-5">
          {selectedMaterial ? (
            <>
              <div className="pb-4 border-b border-slate-200">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-base font-bold font-mono text-slate-900">
                    {selectedMaterial.ajSku}
                  </span>
                  <span className={`text-xs font-mono font-semibold ${STATUS_TEXT_STYLE[selectedMaterial.status]}`}>
                    {selectedMaterial.status}
                  </span>
                </div>
                <h3 className="mt-1.5 text-sm font-semibold text-slate-900 leading-snug">
                  {selectedMaterial.shortName}
                </h3>
                <div className="mt-1 text-xs text-slate-500">
                  Class {selectedMaterial.cc} · ABC/VED: {selectedMaterial.abcClass}/{selectedMaterial.vedClass} · Traceability: {selectedMaterial.traceability}
                  {selectedMaterial.legacySku ? ` · Legacy: ${selectedMaterial.legacySku}` : ''}
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => onOpenBarcodeForSku(selectedMaterial.ajSku)}
                    className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium rounded-md inline-flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
                  >
                    <Barcode className="w-3.5 h-3.5" />
                    <span>Print Barcode / QR</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onOpenChangeFormForSku(selectedMaterial.ajSku)}
                    className="px-3 py-1.5 border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-medium rounded-md inline-flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
                  >
                    <FileWarning className="w-3.5 h-3.5" />
                    <span>Status / Change (IMS-FRM-0XX-003)</span>
                  </button>
                </div>
              </div>

              {/* Operational Inventory & UOM Grid */}
              <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-xs pb-4 border-b border-slate-200">
                <div>
                  <div className="text-slate-500">Stock UOM / Purchase UOM</div>
                  <div className="font-mono font-medium text-slate-900 mt-0.5">
                    1 {selectedMaterial.uom.purchaseUom} = {selectedMaterial.uom.conversionFactor} {selectedMaterial.uom.stockUom}
                  </div>
                </div>
                <div>
                  <div className="text-slate-500">Warehouse Bin (Separate)</div>
                  <div className="font-mono font-medium text-slate-900 mt-0.5">
                    {selectedMaterial.warehouseLocation}
                  </div>
                </div>
                <div>
                  <div className="text-slate-500">On-Hand / Reorder / Safety</div>
                  <div className="font-mono tabular-nums font-medium text-slate-900 mt-0.5">
                    {selectedMaterial.stockOnHand} / {selectedMaterial.reorderLevel} / {selectedMaterial.safetyStock} {selectedMaterial.uom.stockUom}
                  </div>
                </div>
                <div>
                  <div className="text-slate-500">Standard Unit Cost</div>
                  <div className="font-mono tabular-nums font-medium text-slate-900 mt-0.5">
                    {formatSAR(selectedMaterial.unitCostSAR)}
                  </div>
                </div>
                <div className="col-span-2">
                  <div className="text-slate-500">Storage &amp; Environmental Requirement</div>
                  <div className="font-medium text-slate-800 mt-0.5">
                    {selectedMaterial.storageCondition}
                  </div>
                </div>
              </div>

              {/* 12 Structured Technical Attributes */}
              <div className="space-y-2 pb-4 border-b border-slate-200">
                <div className="text-xs font-semibold text-slate-900">
                  Structured Technical Identification (Non-Overloaded SKU)
                </div>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-xs">
                  <div>
                    <dt className="text-slate-500">Item Type / Class</dt>
                    <dd className="text-slate-900 font-medium">{selectedMaterial.attributes.itemType} · {selectedMaterial.attributes.itemClass}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Dimensions</dt>
                    <dd className="font-mono text-slate-900">{selectedMaterial.attributes.dimensions}</dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="text-slate-500">Material Composition</dt>
                    <dd className="text-slate-900">{selectedMaterial.attributes.materialComposition}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Grade</dt>
                    <dd className="text-slate-900">{selectedMaterial.attributes.grade}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Color &amp; Finish</dt>
                    <dd className="text-slate-900">{selectedMaterial.attributes.color} · {selectedMaterial.attributes.finish}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Functionality</dt>
                    <dd className="text-slate-900">{selectedMaterial.attributes.functionality}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Configuration</dt>
                    <dd className="text-slate-900">{selectedMaterial.attributes.configuration}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">OEM Manufacturer</dt>
                    <dd className="text-slate-900 font-medium">{selectedMaterial.attributes.manufacturer}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">OEM Model / Ref</dt>
                    <dd className="font-mono text-slate-900">{selectedMaterial.attributes.model}</dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="text-slate-500">Technical Specifications &amp; Standards</dt>
                    <dd className="text-slate-800 leading-relaxed">{selectedMaterial.attributes.technicalSpecifications}</dd>
                  </div>
                </dl>
              </div>

              {/* Supplier Cross-Ref & Audit Log */}
              <div className="space-y-3 text-xs">
                <div>
                  <div className="font-semibold text-slate-900 mb-1.5">Approved Supplier Reference</div>
                  {selectedMaterial.suppliers.map((sup) => (
                    <div key={sup.supplierCode} className="flex items-center justify-between gap-2 py-1 text-slate-700">
                      <span>{sup.supplierName} ({sup.supplierPartNo})</span>
                      <span className="font-mono tabular-nums text-slate-500 whitespace-nowrap">
                        LT {sup.leadTimeDays}d · MOQ {sup.moq}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t border-slate-200">
                  <div className="font-semibold text-slate-900 mb-1.5">Immutable Audit Trail</div>
                  <div className="space-y-1.5">
                    {selectedMaterial.auditHistory.map((aud) => (
                      <div key={aud.id} className="text-slate-600 leading-relaxed">
                        <span className="font-mono text-slate-500">{aud.timestamp}</span> ·{' '}
                        <span className="font-medium text-slate-800">{aud.actorName}</span> — {aud.summary}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="text-xs text-slate-500">Select an item from the register to inspect technical attributes.</div>
          )}
        </div>
      </div>
    </div>
  );
};
