/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { BarcodeLocationView } from './components/BarcodeLocationView';
import { DatabaseIntegrationView } from './components/DatabaseIntegrationView';
import { ImsDocumentsView } from './components/ImsDocumentsView';
import { MaterialMasterView } from './components/MaterialMasterView';
import { MigrationAccessView } from './components/MigrationAccessView';
import { OverviewDashboard } from './components/OverviewDashboard';
import { NavViewId, SidebarNav } from './components/SidebarNav';
import { SkuWorkflowView } from './components/SkuWorkflowView';
import { TopHeader } from './components/TopHeader';
import { VariantsBomView } from './components/VariantsBomView';
import { INITIAL_UAT_CHECKLIST, ROLE_LABELS } from './data/codingPolicy';
import {
  INITIAL_BOMS,
  INITIAL_MATERIALS,
  INITIAL_MIGRATION_ROWS,
  INITIAL_WORKFLOW_REQUESTS,
} from './data/sampleMaterials';
import {
  ClassificationCode,
  ItemStatus,
  LegacyMigrationRow,
  MaterialRecord,
  SkuWorkflowRequest,
  UATCheckItem,
  UserRole,
} from './types/inventory';

export default function App() {
  const [activeView, setActiveView] = useState<NavViewId>('overview');
  const [activeRole, setActiveRole] = useState<UserRole>('INVENTORY_CONTROLLER');

  const [materials, setMaterials] = useState<MaterialRecord[]>(INITIAL_MATERIALS);
  const [requests, setRequests] = useState<SkuWorkflowRequest[]>(INITIAL_WORKFLOW_REQUESTS);
  const [migrationRows, setMigrationRows] = useState<LegacyMigrationRow[]>(INITIAL_MIGRATION_ROWS);
  const [uatChecklist, setUatChecklist] = useState<UATCheckItem[]>(INITIAL_UAT_CHECKLIST);

  // Monotonic global sequence counter starting after INITIAL_MATERIALS (19 -> next is 20)
  const [nextSeqNum, setNextSeqNum] = useState<number>(20);

  // Cross-view navigation context
  const [masterCategoryFilter, setMasterCategoryFilter] = useState<ClassificationCode | 'ALL'>('ALL');
  const [barcodeTargetSku, setBarcodeTargetSku] = useState<string | undefined>(undefined);
  const [changeTargetSku, setChangeTargetSku] = useState<string | undefined>(undefined);

  const pendingWorkflowCount = requests.filter(
    (r) => r.stage === 'PENDING_ENGINEERING' || r.stage === 'PENDING_CONTROLLER'
  ).length;

  const mintPermanentSku = (cc: ClassificationCode): { ajSku: string; seqNum: number } => {
    const seqNum = nextSeqNum;
    const ajSku = `AJ-${cc}-${String(seqNum).padStart(6, '0')}`;
    setNextSeqNum((prev) => prev + 1);
    return { ajSku, seqNum };
  };

  const handleSubmitRequest = (req: SkuWorkflowRequest) => {
    setRequests((prev) => [req, ...prev]);
  };

  const handleVerifyEngineering = (requestId: string, notes: string) => {
    setRequests((prev) =>
      prev.map((r) =>
        r.requestId === requestId
          ? {
              ...r,
              stage: 'PENDING_CONTROLLER',
              engineeringVerifiedBy: ROLE_LABELS[activeRole],
              engineeringNotes: notes,
            }
          : r
      )
    );
  };

  const handleRejectRequest = (requestId: string, reason: string) => {
    setRequests((prev) =>
      prev.map((r) =>
        r.requestId === requestId
          ? { ...r, stage: 'REJECTED', engineeringNotes: reason }
          : r
      )
    );
  };

  const handleApproveAndMintSku = (requestId: string): string | null => {
    const req = requests.find((r) => r.requestId === requestId);
    if (!req || req.stage !== 'PENDING_CONTROLLER') return null;

    const { ajSku, seqNum } = mintPermanentSku(req.cc);
    const today = new Date().toISOString().slice(0, 10);
    const timestamp = new Date().toISOString().slice(0, 16).replace('T', ' ');

    const newMaterial: MaterialRecord = {
      ajSku,
      cc: req.cc,
      seqNum,
      shortName: req.shortName,
      status: 'ACTIVE',
      abcClass: req.abcClass,
      vedClass: req.vedClass,
      traceability: req.traceability,
      storageCondition: req.storageCondition,
      warehouseLocation: req.warehouseLocation,
      stockOnHand: 0,
      reorderLevel: req.reorderLevel,
      safetyStock: req.safetyStock,
      unitCostSAR: req.unitCostSAR,
      createdAt: today,
      updatedAt: today,
      attributes: req.attributes,
      variantSpec: req.variantSpec,
      uom: req.uom,
      suppliers: [
        {
          supplierCode: `SUP-NEW-${seqNum}`,
          supplierName: req.supplierName,
          manufacturerPartNo: req.attributes.model,
          supplierPartNo: req.attributes.model,
          leadTimeDays: 14,
          moq: 1,
          unitCostSAR: req.unitCostSAR,
          isPrimary: true,
        },
      ],
      auditHistory: [
        {
          id: `AUD-${seqNum}-1`,
          timestamp,
          actorRole: activeRole,
          actorName: ROLE_LABELS[activeRole],
          action: 'SKU_MINTED',
          summary: `Minted permanent SKU ${ajSku} from ${req.requestId} (Verified by ${req.engineeringVerifiedBy || 'Engineering'}).`,
          imsFormRef: 'IMS-FRM-0XX-001',
        },
      ],
    };

    setMaterials((prev) => [newMaterial, ...prev]);
    setRequests((prev) =>
      prev.map((r) =>
        r.requestId === requestId
          ? {
              ...r,
              stage: 'COMPLETED',
              controllerApprovedBy: ROLE_LABELS[activeRole],
              mintedSku: ajSku,
            }
          : r
      )
    );

    return ajSku;
  };

  const handleChangeMaterialStatus = (
    ajSku: string,
    newStatus: ItemStatus,
    justification: string
  ): string | null => {
    const target = materials.find((m) => m.ajSku === ajSku);
    if (!target) return 'SKU not found.';
    if (newStatus === 'OBSOLETE' && target.stockOnHand > 0) {
      return `Cannot mark ${ajSku} OBSOLETE while physical stock on hand is ${target.stockOnHand} ${target.uom.stockUom}. Deplete or adjust stock to 0 first per IMS-FRM-0XX-003.`;
    }
    const timestamp = new Date().toISOString().slice(0, 16).replace('T', ' ');
    setMaterials((prev) =>
      prev.map((m) =>
        m.ajSku === ajSku
          ? {
              ...m,
              status: newStatus,
              updatedAt: timestamp.slice(0, 10),
              auditHistory: [
                {
                  id: `AUD-${Date.now()}`,
                  timestamp,
                  actorRole: activeRole,
                  actorName: ROLE_LABELS[activeRole],
                  action: 'STATUS_CHANGED',
                  summary: `Status transitioned ${m.status} -> ${newStatus}: ${justification}`,
                  imsFormRef: 'IMS-FRM-0XX-003',
                },
                ...m.auditHistory,
              ],
            }
          : m
      )
    );
    return null;
  };

  const handleMapLegacyRow = (migrationId: string): string | null => {
    const row = migrationRows.find((r) => r.migrationId === migrationId);
    if (!row || row.mappedAjSku !== 'UNMAPPED') return null;

    const { ajSku, seqNum } = mintPermanentSku(row.targetCc);
    const today = new Date().toISOString().slice(0, 10);
    const timestamp = new Date().toISOString().slice(0, 16).replace('T', ' ');

    const migratedRecord: MaterialRecord = {
      ajSku,
      cc: row.targetCc,
      seqNum,
      shortName: `${row.legacyDescription} — Standardized D3 Adhesive`,
      status: 'ACTIVE',
      abcClass: 'C',
      vedClass: 'E',
      traceability: 'BATCH_LOT',
      storageCondition: 'Ventilated Chemical Storage Bay (15–25°C)',
      warehouseLocation: 'WH4-F-01-R01-L2-B02',
      stockOnHand: row.stockOnHand,
      reorderLevel: 10,
      safetyStock: 5,
      unitCostSAR: row.unitCostSAR,
      legacySku: row.legacySku,
      createdAt: today,
      updatedAt: today,
      attributes: {
        itemType: 'Woodworking PVA Adhesive',
        itemClass: 'Joinery Bonding Consumable',
        dimensions: '25 kg Sealed Pail',
        materialComposition: 'Cross-Linking Polyvinyl Acetate Dispersion (D3)',
        grade: 'EN 204 D3 Moisture Resistant',
        color: 'White (Dries Clear)',
        finish: 'Translucent Bond Line',
        functionality: 'Structural Beech & Birch Dowel/Carcass Bonding',
        configuration: 'Ready-to-Use 1K Dispersion',
        manufacturer: 'Kleiberit SE & Co. KG',
        model: 'KLEIBERIT-303.0',
        technicalSpecifications: 'Open Time 6–10 min, Press Time 15 min at 20°C',
      },
      uom: {
        stockUom: row.stockUom,
        purchaseUom: 'PAIL',
        conversionFactor: 25,
        conversionNote: `1 Pail = 25 ${row.stockUom}`,
      },
      suppliers: [
        {
          supplierCode: 'SUP-DE-KLEIB',
          supplierName: 'Riyadh Industrial Adhesives Trading',
          manufacturerPartNo: '303.0-25KG',
          supplierPartNo: 'RIAT-303-25',
          leadTimeDays: 7,
          moq: 2,
          unitCostSAR: row.unitCostSAR,
          isPrimary: true,
        },
      ],
      auditHistory: [
        {
          id: `AUD-MIG-${seqNum}`,
          timestamp,
          actorRole: activeRole,
          actorName: ROLE_LABELS[activeRole],
          action: 'LEGACY_MIGRATED',
          summary: `Migrated legacy code ${row.legacySku} with ${row.stockOnHand} ${row.stockUom} opening balance (0.00 SAR variance).`,
          imsFormRef: 'IMS-WI-0XX-005',
        },
      ],
    };

    setMaterials((prev) => [migratedRecord, ...prev]);
    setMigrationRows((prev) =>
      prev.map((r) =>
        r.migrationId === migrationId
          ? {
              ...r,
              mappedAjSku: ajSku,
              reconciliationStatus: 'MATCHED',
              notes: `Mapped & reconciled to ${ajSku} with 0.00 SAR variance.`,
            }
          : r
      )
    );

    return ajSku;
  };

  const handleToggleUatItem = (id: string) => {
    setUatChecklist((prev) =>
      prev.map((u) => (u.id === id ? { ...u, passed: !u.passed } : u))
    );
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-slate-50 text-slate-900">
      <SidebarNav
        activeView={activeView}
        onSelectView={(view) => {
          setChangeTargetSku(undefined);
          setActiveView(view);
        }}
        pendingWorkflowCount={pendingWorkflowCount}
        totalMaterials={materials.length}
      />

      <div className="flex-1 min-w-0 flex flex-col">
        <TopHeader
          activeView={activeView}
          activeRole={activeRole}
          onChangeRole={setActiveRole}
          onQuickRegister={() => {
            setChangeTargetSku(undefined);
            setActiveView('workflow');
          }}
        />

        <main className="flex-1 p-6 max-w-[1440px] w-full mx-auto">
          {activeView === 'overview' && (
            <OverviewDashboard
              materials={materials}
              nextSeqNum={nextSeqNum}
              onFilterByCategory={(cc) => {
                setMasterCategoryFilter(cc);
                setActiveView('master');
              }}
              onNavigateToWorkflow={() => setActiveView('workflow')}
            />
          )}

          {activeView === 'master' && (
            <MaterialMasterView
              materials={materials}
              initialCategoryFilter={masterCategoryFilter}
              onClearInitialFilter={() => setMasterCategoryFilter('ALL')}
              onOpenBarcodeForSku={(sku) => {
                setBarcodeTargetSku(sku);
                setActiveView('barcode-location');
              }}
              onOpenChangeFormForSku={(sku) => {
                setChangeTargetSku(sku);
                setActiveView('workflow');
              }}
            />
          )}

          {activeView === 'workflow' && (
            <SkuWorkflowView
              activeRole={activeRole}
              onChangeRole={setActiveRole}
              materials={materials}
              requests={requests}
              nextSeqNum={nextSeqNum}
              initialChangeSku={changeTargetSku}
              onSubmitRequest={handleSubmitRequest}
              onVerifyEngineering={handleVerifyEngineering}
              onApproveAndMintSku={handleApproveAndMintSku}
              onRejectRequest={handleRejectRequest}
              onChangeMaterialStatus={handleChangeMaterialStatus}
            />
          )}

          {activeView === 'variants-bom' && (
            <VariantsBomView materials={materials} boms={INITIAL_BOMS} />
          )}

          {activeView === 'barcode-location' && (
            <BarcodeLocationView materials={materials} initialSku={barcodeTargetSku} />
          )}

          {activeView === 'database' && <DatabaseIntegrationView />}

          {activeView === 'ims-docs' && <ImsDocumentsView />}

          {activeView === 'migration-gov' && (
            <MigrationAccessView
              migrationRows={migrationRows}
              onMapLegacyRow={handleMapLegacyRow}
              uatChecklist={uatChecklist}
              onToggleUatItem={handleToggleUatItem}
              activeRole={activeRole}
            />
          )}
        </main>
      </div>
    </div>
  );
}
