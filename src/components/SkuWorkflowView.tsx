import React, { useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle2, Lock, ShieldAlert } from 'lucide-react';
import { CLASSIFICATION_REGISTER, ROLE_LABELS } from '../data/codingPolicy';
import {
  ABCClass,
  ClassificationCode,
  ItemStatus,
  MaterialRecord,
  SkuWorkflowRequest,
  TraceabilityMode,
  UserRole,
  VEDClass,
} from '../types/inventory';
import { checkMaterialDuplicates, formatSAR } from '../utils/barcode';

interface SkuWorkflowViewProps {
  activeRole: UserRole;
  onChangeRole: (role: UserRole) => void;
  materials: MaterialRecord[];
  requests: SkuWorkflowRequest[];
  nextSeqNum: number;
  initialChangeSku?: string;
  onSubmitRequest: (req: SkuWorkflowRequest) => void;
  onVerifyEngineering: (requestId: string, notes: string) => void;
  onApproveAndMintSku: (requestId: string) => string | null;
  onRejectRequest: (requestId: string, reason: string) => void;
  onChangeMaterialStatus: (ajSku: string, newStatus: ItemStatus, justification: string) => string | null;
}

export const SkuWorkflowView: React.FC<SkuWorkflowViewProps> = ({
  activeRole,
  onChangeRole,
  materials,
  requests,
  nextSeqNum,
  initialChangeSku,
  onSubmitRequest,
  onVerifyEngineering,
  onApproveAndMintSku,
  onRejectRequest,
  onChangeMaterialStatus,
}) => {
  const [activeTab, setActiveTab] = useState<'queue' | 'intake' | 'deactivation'>(
    initialChangeSku ? 'deactivation' : 'queue'
  );

  // Intake Form State (IMS-FRM-0XX-001)
  const [cc, setCc] = useState<ClassificationCode>('HW');
  const [shortName, setShortName] = useState('');
  const [itemType, setItemType] = useState('');
  const [itemClass, setItemClass] = useState('');
  const [dimensions, setDimensions] = useState('');
  const [materialComposition, setMaterialComposition] = useState('');
  const [grade, setGrade] = useState('');
  const [color, setColor] = useState('');
  const [finish, setFinish] = useState('');
  const [functionality, setFunctionality] = useState('');
  const [configuration, setConfiguration] = useState('');
  const [manufacturer, setManufacturer] = useState('');
  const [model, setModel] = useState('');
  const [technicalSpecifications, setTechnicalSpecifications] = useState('');
  const [stockUom, setStockUom] = useState('PCS');
  const [purchaseUom, setPurchaseUom] = useState('BOX');
  const [conversionFactor, setConversionFactor] = useState(100);
  const [traceability, setTraceability] = useState<TraceabilityMode>('BATCH_LOT');
  const [storageCondition, setStorageCondition] = useState('Dry High-Density Bin Mezzanine');
  const [warehouseLocation, setWarehouseLocation] = useState('WH4-H-02-R01-L2-B04');
  const [abcClass, setAbcClass] = useState<ABCClass>('B');
  const [vedClass, setVedClass] = useState<VEDClass>('E');
  const [reorderLevel, setReorderLevel] = useState(50);
  const [safetyStock, setSafetyStock] = useState(25);
  const [supplierName, setSupplierName] = useState('');
  const [unitCostSAR, setUnitCostSAR] = useState(45);
  const [duplicateChecked, setDuplicateChecked] = useState(false);
  const [intakeMessage, setIntakeMessage] = useState<string | null>(null);

  // Engineering verification note per request
  const [engNotesByReq, setEngNotesByReq] = useState<Record<string, string>>({});
  const [workflowFeedback, setWorkflowFeedback] = useState<string | null>(null);

  // Deactivation / Status Change Form (IMS-FRM-0XX-003)
  const [targetChangeSku, setTargetChangeSku] = useState<string>(
    initialChangeSku || materials[0]?.ajSku || ''
  );
  const [requestedStatus, setRequestedStatus] = useState<ItemStatus>('HOLD');
  const [changeJustification, setChangeJustification] = useState('');
  const [changeFeedback, setChangeFeedback] = useState<{ ok: boolean; msg: string } | null>(null);

  React.useEffect(() => {
    if (initialChangeSku) {
      setTargetChangeSku(initialChangeSku);
      setActiveTab('deactivation');
    }
  }, [initialChangeSku]);

  const duplicateMatches = useMemo(() => {
    if (!duplicateChecked) return [];
    return checkMaterialDuplicates(
      shortName,
      { itemType, dimensions, materialComposition, manufacturer, model },
      materials
    );
  }, [duplicateChecked, shortName, itemType, dimensions, materialComposition, manufacturer, model, materials]);

  const canSubmit = ['REQUESTER', 'ENGINEERING', 'PROCUREMENT', 'INVENTORY_CONTROLLER', 'ADMIN'].includes(activeRole);
  const canVerifyEng = activeRole === 'ENGINEERING' || activeRole === 'ADMIN';
  const canMintSku = activeRole === 'INVENTORY_CONTROLLER' || activeRole === 'ADMIN';
  const canChangeStatus = ['INVENTORY_CONTROLLER', 'WAREHOUSE_MANAGER', 'ADMIN'].includes(activeRole);

  const handleLoadDuplicateDemo = () => {
    setCc('HW');
    setShortName('Blum 110 Degree Soft Close Hinge Full Overlay');
    setItemType('Concealed Cabinet Hinge');
    setItemClass('Architectural Door Hardware');
    setDimensions('Cup Dia: 35 mm × Depth: 13 mm · Opening Angle: 110°');
    setMaterialComposition('Cold-Rolled Steel');
    setGrade('EN 15570 Level 3');
    setColor('Bright Nickel');
    setFinish('Nickel Plated');
    setFunctionality('BLUMOTION Soft-Close');
    setConfiguration('Full Overlay');
    setManufacturer('Julius Blum GmbH');
    setModel('71B3550');
    setTechnicalSpecifications('200,000 Cycles');
    setSupplierName('Gulf Architectural Hardware LLC');
    setDuplicateChecked(true);
    setIntakeMessage(null);
  };

  const handleLoadUniqueDemo = () => {
    setCc('MC');
    setShortName('Electric Standing Desk Dual-Column Lifting Frame — Matte Black');
    setItemType('Motorized Desk Frame');
    setItemClass('Height-Adjustable Mechanism');
    setDimensions('Width: 1100–1800 mm · Height Stroke: 620–1270 mm');
    setMaterialComposition('Powder-Coated Cold-Rolled Steel + Dual Brushless Motors');
    setGrade('BIFMA X5.5 Heavy Commercial (140 kg Load)');
    setColor('Matte Black (RAL 9005)');
    setFinish('Fine Texture Powder Coat');
    setFunctionality('Anti-Collision Gyro Sensor + 4 Memory Presets');
    setConfiguration('2-Stage Inverted 3-Segment Columns, 24V DC');
    setManufacturer('Linak A/S');
    setModel('DESKLINE-DL6-PLUS');
    setTechnicalSpecifications('Noise < 45 dBA, Speed 38 mm/s, SASO IEC 60335 Certified');
    setStockUom('SET');
    setPurchaseUom('CTN');
    setConversionFactor(2);
    setTraceability('SERIAL');
    setStorageCondition('ESD-Safe & Moisture-Sealed Mezzanine Bay');
    setWarehouseLocation('WH4-H-03-R02-L1-B02');
    setAbcClass('A');
    setVedClass('E');
    setReorderLevel(15);
    setSafetyStock(6);
    setSupplierName('Linak Middle East FZE');
    setUnitCostSAR(1420);
    setDuplicateChecked(false);
    setIntakeMessage(null);
  };

  const handleSubmitIntake = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) {
      setIntakeMessage(`Active role (${ROLE_LABELS[activeRole]}) has read-only access for IMS-FRM-0XX-001.`);
      return;
    }
    if (!shortName.trim() || !itemType.trim() || !dimensions.trim() || !manufacturer.trim() || !model.trim()) {
      setIntakeMessage('Complete all mandatory technical identification fields before submitting.');
      return;
    }

    const matches = checkMaterialDuplicates(
      shortName,
      { itemType, dimensions, materialComposition, manufacturer, model },
      materials
    );
    setDuplicateChecked(true);

    const topMatch = matches[0];
    if (topMatch && topMatch.score >= 75) {
      setIntakeMessage(
        `Submission blocked by Duplicate Prevention Policy: ${topMatch.score}% match with existing permanent SKU ${topMatch.material.ajSku}.`
      );
      return;
    }

    const newReq: SkuWorkflowRequest = {
      requestId: `REQ-2026-${String(106 + requests.length).padStart(4, '0')}`,
      submittedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
      submittedBy: `${ROLE_LABELS[activeRole]}`,
      cc,
      shortName: shortName.trim(),
      stage: 'PENDING_ENGINEERING',
      duplicateMatchSku: topMatch?.material.ajSku,
      duplicateScore: topMatch?.score || 0,
      attributes: {
        itemType,
        itemClass: itemClass || 'Standard Class',
        dimensions,
        materialComposition: materialComposition || 'Verified per datasheet',
        grade: grade || 'Commercial Grade',
        color: color || 'Standard',
        finish: finish || 'Standard',
        functionality: functionality || 'Standard Operation',
        configuration: configuration || 'Standard',
        manufacturer,
        model,
        technicalSpecifications: technicalSpecifications || 'Per OEM datasheet',
      },
      uom: {
        stockUom,
        purchaseUom,
        conversionFactor: Number(conversionFactor) || 1,
        conversionNote: `1 ${purchaseUom} = ${conversionFactor} ${stockUom}`,
      },
      traceability,
      storageCondition,
      warehouseLocation,
      abcClass,
      vedClass,
      reorderLevel: Number(reorderLevel) || 0,
      safetyStock: Number(safetyStock) || 0,
      supplierName: supplierName || manufacturer,
      unitCostSAR: Number(unitCostSAR) || 0,
    };

    onSubmitRequest(newReq);
    setIntakeMessage(`Request ${newReq.requestId} submitted to Engineering Verification queue.`);
    setShortName('');
    setModel('');
    setDuplicateChecked(false);
    setActiveTab('queue');
  };

  const selectedTargetMaterial = materials.find((m) => m.ajSku === targetChangeSku);

  const handleStatusChangeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canChangeStatus) {
      setChangeFeedback({ ok: false, msg: 'Only Inventory Controller, Warehouse Manager, or Admin may execute IMS-FRM-0XX-003.' });
      return;
    }
    if (!changeJustification.trim()) {
      setChangeFeedback({ ok: false, msg: 'Enter business justification for the audit trail.' });
      return;
    }
    const err = onChangeMaterialStatus(targetChangeSku, requestedStatus, changeJustification.trim());
    if (err) {
      setChangeFeedback({ ok: false, msg: err });
    } else {
      setChangeFeedback({
        ok: true,
        msg: `${targetChangeSku} status transitioned to ${requestedStatus}. Permanent SKU remains immutable and logged.`,
      });
      setChangeJustification('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Sub-Navigation & Role Gate Banner */}
      <section className="bg-white border border-slate-200 rounded-lg p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-md">
          <button
            type="button"
            onClick={() => setActiveTab('queue')}
            className={`px-3 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'queue' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Approval Queue ({requests.filter((r) => r.stage === 'PENDING_ENGINEERING' || r.stage === 'PENDING_CONTROLLER').length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('intake')}
            className={`px-3 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'intake' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            New Material Form (IMS-FRM-0XX-001)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('deactivation')}
            className={`px-3 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'deactivation' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            SKU Status / Deactivation (IMS-FRM-0XX-003)
          </button>
        </div>

        <div className="text-xs text-slate-600">
          Next Global Sequence: <span className="font-mono font-semibold text-amber-800">{String(nextSeqNum).padStart(6, '0')}</span>
        </div>
      </section>

      {/* TAB 1: APPROVAL QUEUE */}
      {activeTab === 'queue' && (
        <div className="space-y-4">
          {workflowFeedback && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-3 text-xs text-emerald-900 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>{workflowFeedback}</span>
              </div>
              <button
                type="button"
                onClick={() => setWorkflowFeedback(null)}
                className="text-emerald-800 underline text-xs cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          )}

          {requests.map((req) => (
            <div key={req.requestId} className="bg-white border border-slate-200 rounded-lg p-5 space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-slate-200">
                <div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 font-mono">
                    <span className="font-semibold text-slate-900">{req.requestId}</span>
                    <span>·</span>
                    <span>Proposed Class: {req.cc}</span>
                    <span>·</span>
                    <span>Submitted {req.submittedAt}</span>
                    <span>·</span>
                    <span
                      className={`font-semibold ${
                        req.stage === 'COMPLETED'
                          ? 'text-emerald-700'
                          : req.stage === 'REJECTED'
                          ? 'text-red-700'
                          : 'text-amber-700'
                      }`}
                    >
                      {req.stage}
                    </span>
                  </div>
                  <h3 className="mt-1.5 text-base font-bold text-slate-900">{req.shortName}</h3>
                  <div className="mt-1 text-xs text-slate-600">
                    Requester: {req.submittedBy} · OEM: {req.attributes.manufacturer} ({req.attributes.model})
                  </div>
                </div>

                {req.mintedSku && (
                  <div className="text-right">
                    <div className="text-[11px] text-slate-500">Minted Permanent SKU</div>
                    <div className="text-base font-bold font-mono text-emerald-700">{req.mintedSku}</div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
                <div>
                  <div className="text-slate-500">Dimensions</div>
                  <div className="font-mono text-slate-900 mt-0.5">{req.attributes.dimensions}</div>
                </div>
                <div>
                  <div className="text-slate-500">UOM Conversion</div>
                  <div className="font-mono text-slate-900 mt-0.5">{req.uom.conversionNote}</div>
                </div>
                <div>
                  <div className="text-slate-500">Traceability &amp; ABC/VED</div>
                  <div className="font-mono text-slate-900 mt-0.5">
                    {req.traceability} · {req.abcClass}/{req.vedClass}
                  </div>
                </div>
                <div>
                  <div className="text-slate-500">Standard Cost / Bin</div>
                  <div className="font-mono text-slate-900 mt-0.5">
                    {formatSAR(req.unitCostSAR)} · {req.warehouseLocation}
                  </div>
                </div>
              </div>

              {req.engineeringVerifiedBy && (
                <div className="bg-slate-50 border border-slate-200 rounded-md px-3.5 py-2.5 text-xs text-slate-700">
                  <span className="font-semibold text-slate-900">IMS-FRM-0XX-002 Verified by {req.engineeringVerifiedBy}:</span>{' '}
                  {req.engineeringNotes}
                </div>
              )}

              {/* Role-Gated Action Bar */}
              {req.stage === 'PENDING_ENGINEERING' && (
                <div className="pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex-1 min-w-[240px]">
                    <input
                      type="text"
                      value={engNotesByReq[req.requestId] || ''}
                      onChange={(e) =>
                        setEngNotesByReq((prev) => ({ ...prev, [req.requestId]: e.target.value }))
                      }
                      placeholder="Engineering verification remarks (standards, tolerances, BOM readiness)..."
                      className="w-full h-9 px-3 border border-slate-300 rounded-md text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-700"
                    />
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {!canVerifyEng ? (
                      <button
                        type="button"
                        onClick={() => onChangeRole('ENGINEERING')}
                        className="h-9 px-3 border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-medium rounded-md inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <Lock className="w-3.5 h-3.5" />
                        <span>Switch to Engineering to Verify</span>
                      </button>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            onRejectRequest(req.requestId, 'Returned by Engineering for incomplete spec');
                            setWorkflowFeedback(`Request ${req.requestId} returned/rejected.`);
                          }}
                          className="h-9 px-3 border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-medium rounded-md cursor-pointer"
                        >
                          Return
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            onVerifyEngineering(
                              req.requestId,
                              engNotesByReq[req.requestId] || 'Verified dimensions, compliance standards, and category assignment per IMS-FRM-0XX-002.'
                            );
                            setWorkflowFeedback(`${req.requestId} passed Engineering Verification and routed to Inventory Controller.`);
                          }}
                          className="h-9 px-4 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium rounded-md cursor-pointer"
                        >
                          Sign Off IMS-FRM-0XX-002
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}

              {req.stage === 'PENDING_CONTROLLER' && (
                <div className="pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
                  <div className="text-xs text-slate-600">
                    Duplicate Check Score: <span className="font-mono font-semibold text-emerald-700">{req.duplicateScore ?? 0}% (Clear)</span> · Ready to mint{' '}
                    <span className="font-mono font-semibold text-slate-900">
                      AJ-{req.cc}-{String(nextSeqNum).padStart(6, '0')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {!canMintSku ? (
                      <button
                        type="button"
                        onClick={() => onChangeRole('INVENTORY_CONTROLLER')}
                        className="h-9 px-3 border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-medium rounded-md inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <Lock className="w-3.5 h-3.5" />
                        <span>Switch to Inventory Controller to Mint SKU</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          const minted = onApproveAndMintSku(req.requestId);
                          if (minted) {
                            setWorkflowFeedback(
                              `Permanent SKU ${minted} minted, activated in Master Material Register (IMS-REG-0XX-001), and logged to audit trail.`
                            );
                          }
                        }}
                        className="h-9 px-4 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-medium rounded-md cursor-pointer"
                      >
                        Approve &amp; Mint Permanent SKU
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: NEW MATERIAL INTAKE (IMS-FRM-0XX-001) */}
      {activeTab === 'intake' && (
        <form onSubmit={handleSubmitIntake} className="bg-white border border-slate-200 rounded-lg p-6 space-y-6">
          <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-slate-200">
            <div>
              <div className="text-xs font-mono text-slate-500">IMS-FRM-0XX-001 · New Material Registration Form</div>
              <h2 className="mt-1 text-lg font-bold text-slate-900">Submit Material Request with Automated Duplicate Detection</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleLoadDuplicateDemo}
                className="px-3 py-1.5 border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-medium rounded-md cursor-pointer"
              >
                Load Duplicate Test (Blum Hinge)
              </button>
              <button
                type="button"
                onClick={handleLoadUniqueDemo}
                className="px-3 py-1.5 border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-medium rounded-md cursor-pointer"
              >
                Load Sample Unique Item
              </button>
            </div>
          </div>

          {intakeMessage && (
            <div className="bg-amber-50 border border-amber-200 rounded-md px-4 py-3 text-xs text-amber-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
              <span>{intakeMessage}</span>
            </div>
          )}

          {/* Live Duplicate Check Output */}
          {duplicateChecked && (
            <div className="border border-slate-200 rounded-md p-4 bg-slate-50 space-y-2">
              <div className="text-xs font-semibold text-slate-900">
                Duplicate Prevention Scan Result ({duplicateMatches.length} potential match{duplicateMatches.length === 1 ? '' : 'es'})
              </div>
              {duplicateMatches.length === 0 ? (
                <div className="text-xs text-emerald-700 font-medium">
                  No matching active or retired SKUs found in Master Material Register. Safe to proceed.
                </div>
              ) : (
                <div className="divide-y divide-slate-200 border border-slate-200 bg-white rounded">
                  {duplicateMatches.map((m) => (
                    <div key={m.material.ajSku} className="px-3 py-2 flex flex-wrap items-center justify-between gap-2 text-xs">
                      <div>
                        <span className="font-mono font-semibold text-slate-900">{m.material.ajSku}</span>
                        <span className="text-slate-600 ml-2">{m.material.shortName}</span>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          Match signals: {m.reasons.join(' · ')}
                        </div>
                      </div>
                      <span
                        className={`font-mono font-bold ${
                          m.score >= 75 ? 'text-red-700' : 'text-amber-700'
                        }`}
                      >
                        {m.score}% {m.score >= 75 ? '(BLOCKED)' : '(REVIEW)'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Classification Code (CC) *</label>
              <select
                value={cc}
                onChange={(e) => setCc(e.target.value as ClassificationCode)}
                className="w-full h-9 px-3 border border-slate-300 rounded-md bg-white text-slate-900"
              >
                {CLASSIFICATION_REGISTER.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.code} — {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block font-medium text-slate-700 mb-1">Standardized Short Name (No SKU Embedded) *</label>
              <input
                type="text"
                required
                value={shortName}
                onChange={(e) => setShortName(e.target.value)}
                placeholder="e.g., Electric Standing Desk Dual-Column Frame — Matte Black"
                className="w-full h-9 px-3 border border-slate-300 rounded-md text-slate-900"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Item Type *</label>
              <input
                type="text"
                required
                value={itemType}
                onChange={(e) => setItemType(e.target.value)}
                placeholder="e.g., Motorized Desk Frame"
                className="w-full h-9 px-3 border border-slate-300 rounded-md text-slate-900"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Item Class</label>
              <input
                type="text"
                value={itemClass}
                onChange={(e) => setItemClass(e.target.value)}
                placeholder="e.g., Height-Adjustable Mechanism"
                className="w-full h-9 px-3 border border-slate-300 rounded-md text-slate-900"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Metric Dimensions (mm) *</label>
              <input
                type="text"
                required
                value={dimensions}
                onChange={(e) => setDimensions(e.target.value)}
                placeholder="e.g., 1100–1800 × 620–1270 mm"
                className="w-full h-9 px-3 border border-slate-300 rounded-md font-mono text-slate-900"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">OEM Manufacturer *</label>
              <input
                type="text"
                required
                value={manufacturer}
                onChange={(e) => setManufacturer(e.target.value)}
                placeholder="e.g., Linak A/S"
                className="w-full h-9 px-3 border border-slate-300 rounded-md text-slate-900"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">OEM Model / Part No. *</label>
              <input
                type="text"
                required
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="e.g., DESKLINE-DL6-PLUS"
                className="w-full h-9 px-3 border border-slate-300 rounded-md font-mono text-slate-900"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Material Composition</label>
              <input
                type="text"
                value={materialComposition}
                onChange={(e) => setMaterialComposition(e.target.value)}
                placeholder="e.g., Cold-Rolled Steel"
                className="w-full h-9 px-3 border border-slate-300 rounded-md text-slate-900"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Grade / Standard</label>
              <input
                type="text"
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                placeholder="e.g., BIFMA X5.5 / BS 5852"
                className="w-full h-9 px-3 border border-slate-300 rounded-md text-slate-900"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Color &amp; Finish</label>
              <input
                type="text"
                value={`${color}${finish ? ` / ${finish}` : ''}`}
                onChange={(e) => {
                  setColor(e.target.value);
                  setFinish('Standard');
                }}
                placeholder="e.g., Matte Black RAL 9005"
                className="w-full h-9 px-3 border border-slate-300 rounded-md text-slate-900"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Functionality / Configuration</label>
              <input
                type="text"
                value={functionality}
                onChange={(e) => setFunctionality(e.target.value)}
                placeholder="e.g., Dual-Motor 24V DC"
                className="w-full h-9 px-3 border border-slate-300 rounded-md text-slate-900"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Stock UOM / Purchase UOM / Factor</label>
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="text"
                  value={stockUom}
                  onChange={(e) => setStockUom(e.target.value.toUpperCase())}
                  className="h-9 px-2 border border-slate-300 rounded-md font-mono text-slate-900"
                  title="Stock UOM"
                />
                <input
                  type="text"
                  value={purchaseUom}
                  onChange={(e) => setPurchaseUom(e.target.value.toUpperCase())}
                  className="h-9 px-2 border border-slate-300 rounded-md font-mono text-slate-900"
                  title="Purchase UOM"
                />
                <input
                  type="number"
                  min={0.01}
                  step={0.01}
                  value={conversionFactor}
                  onChange={(e) => setConversionFactor(Number(e.target.value))}
                  className="h-9 px-2 border border-slate-300 rounded-md font-mono text-slate-900"
                  title="Factor"
                />
              </div>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Traceability &amp; ABC / VED</label>
              <div className="grid grid-cols-3 gap-2">
                <select
                  value={traceability}
                  onChange={(e) => setTraceability(e.target.value as TraceabilityMode)}
                  className="col-span-2 h-9 px-2 border border-slate-300 rounded-md bg-white text-slate-900"
                >
                  <option value="NONE">NONE</option>
                  <option value="BATCH_LOT">BATCH_LOT</option>
                  <option value="SERIAL">SERIAL</option>
                </select>
                <select
                  value={abcClass}
                  onChange={(e) => setAbcClass(e.target.value as ABCClass)}
                  className="h-9 px-2 border border-slate-300 rounded-md bg-white font-mono text-slate-900"
                >
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Warehouse Bin Location &amp; Cost (SAR)</label>
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="text"
                  value={warehouseLocation}
                  onChange={(e) => setWarehouseLocation(e.target.value.toUpperCase())}
                  className="col-span-2 h-9 px-2 border border-slate-300 rounded-md font-mono text-slate-900"
                />
                <input
                  type="number"
                  min={0}
                  step={0.01}
                  value={unitCostSAR}
                  onChange={(e) => setUnitCostSAR(Number(e.target.value))}
                  className="h-9 px-2 border border-slate-300 rounded-md font-mono text-slate-900"
                />
              </div>
            </div>

            <div className="md:col-span-3">
              <label className="block font-medium text-slate-700 mb-1">Technical Specifications &amp; Storage Requirement</label>
              <input
                type="text"
                value={technicalSpecifications}
                onChange={(e) => setTechnicalSpecifications(e.target.value)}
                placeholder="Standards, certifications, load rating, moisture limits..."
                className="w-full h-9 px-3 border border-slate-300 rounded-md text-slate-900"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setDuplicateChecked(true)}
              className="h-9 px-4 border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-medium rounded-md cursor-pointer"
            >
              Run Duplicate Scan
            </button>
            <button
              type="submit"
              className="h-9 px-5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium rounded-md cursor-pointer"
            >
              Submit IMS-FRM-0XX-001 to Engineering
            </button>
          </div>
        </form>
      )}

      {/* TAB 3: SKU CHANGE / DEACTIVATION (IMS-FRM-0XX-003) */}
      {activeTab === 'deactivation' && (
        <form onSubmit={handleStatusChangeSubmit} className="bg-white border border-slate-200 rounded-lg p-6 space-y-5">
          <div className="pb-4 border-b border-slate-200">
            <div className="text-xs font-mono text-slate-500">IMS-FRM-0XX-003 · SKU Lifecycle &amp; Non-Recycling Control</div>
            <h2 className="mt-1 text-lg font-bold text-slate-900">SKU Change / Deactivation Request</h2>
            <p className="mt-1 text-xs text-slate-600">
              Permanent <span className="font-mono">AJ-CC-NNNNNN</span> identifiers are immutable and never recycled. Items with remaining physical stock cannot transition to <span className="font-mono">OBSOLETE</span> until stock reaches 0.
            </p>
          </div>

          {changeFeedback && (
            <div
              className={`border rounded-md px-4 py-3 text-xs flex items-center gap-2 ${
                changeFeedback.ok
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-red-50 border-red-200 text-red-900'
              }`}
            >
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{changeFeedback.msg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Select Permanent SKU</label>
              <select
                value={targetChangeSku}
                onChange={(e) => setTargetChangeSku(e.target.value)}
                className="w-full h-9 px-3 border border-slate-300 rounded-md bg-white font-mono text-slate-900"
              >
                {materials.map((m) => (
                  <option key={m.ajSku} value={m.ajSku}>
                    {m.ajSku} — {m.shortName} ({m.status})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Target Lifecycle Status</label>
              <select
                value={requestedStatus}
                onChange={(e) => setRequestedStatus(e.target.value as ItemStatus)}
                className="w-full h-9 px-3 border border-slate-300 rounded-md bg-white font-mono text-slate-900"
              >
                <option value="ACTIVE">ACTIVE (Normal Receiving &amp; Issue)</option>
                <option value="HOLD">HOLD (QA Inspection / Supplier Freeze)</option>
                <option value="PHASE_OUT">PHASE_OUT (Deplete Stock, Block Reorder)</option>
                <option value="OBSOLETE">OBSOLETE (Permanently Retired — Stock Must Be 0)</option>
              </select>
            </div>

            {selectedTargetMaterial && (
              <div className="md:col-span-2 bg-slate-50 border border-slate-200 rounded-md p-3 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <span className="font-mono font-semibold text-slate-900">{selectedTargetMaterial.ajSku}</span>
                  <span className="text-slate-600 ml-2">Current Status: {selectedTargetMaterial.status}</span>
                </div>
                <div className="font-mono tabular-nums text-slate-800">
                  On-Hand Balance: {selectedTargetMaterial.stockOnHand} {selectedTargetMaterial.uom.stockUom}
                </div>
              </div>
            )}

            <div className="md:col-span-2">
              <label className="block font-medium text-slate-700 mb-1">Audit Justification / Engineering Change Reference *</label>
              <input
                type="text"
                required
                value={changeJustification}
                onChange={(e) => setChangeJustification(e.target.value)}
                placeholder="e.g., Discontinued 2026 upholstery dye lot; superseded by AJ-UP-000021"
                className="w-full h-9 px-3 border border-slate-300 rounded-md text-slate-900"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
            {!canChangeStatus ? (
              <button
                type="button"
                onClick={() => onChangeRole('INVENTORY_CONTROLLER')}
                className="h-9 px-3 border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-medium rounded-md inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Switch to Inventory Controller to Execute</span>
              </button>
            ) : (
              <button
                type="submit"
                className="h-9 px-4 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium rounded-md cursor-pointer"
              >
                Execute Status Transition &amp; Log Audit
              </button>
            )}
          </div>
        </form>
      )}
    </div>
  );
};
