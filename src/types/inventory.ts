export type ClassificationCode =
  | 'FF' // Finished Furniture
  | 'SF' // Semi-Finished Goods
  | 'RM' // Raw Materials
  | 'UP' // Upholstery Materials
  | 'HW' // Hardware & Fittings
  | 'MC' // Mechanical Components
  | 'AC' // Accessories
  | 'SP' // Spare Parts
  | 'PK' // Packaging
  | 'CS' // Consumables
  | 'TL' // Tools
  | 'EQ'; // Equipment

export type ItemStatus =
  | 'DRAFT'
  | 'PENDING_ENGINEERING'
  | 'PENDING_CONTROLLER'
  | 'ACTIVE'
  | 'HOLD'
  | 'PHASE_OUT'
  | 'OBSOLETE';

export type ABCClass = 'A' | 'B' | 'C';
export type VEDClass = 'V' | 'E' | 'D';

export type TraceabilityMode = 'NONE' | 'BATCH_LOT' | 'SERIAL' | 'BATCH_AND_SERIAL';

export type UserRole =
  | 'REQUESTER'
  | 'ENGINEERING'
  | 'PROCUREMENT'
  | 'WAREHOUSE_OFFICER'
  | 'INVENTORY_CONTROLLER'
  | 'WAREHOUSE_MANAGER'
  | 'ADMIN';

export interface ClassificationDefinition {
  code: ClassificationCode;
  name: string;
  description: string;
  examples: string[];
  defaultStockUom: string;
  defaultTraceability: TraceabilityMode;
  storageRequirement: string;
  sequenceStart: number;
  activeCount: number;
  imsRegisterRef: string;
}

export interface TechnicalAttributes {
  itemType: string;
  itemClass: string;
  dimensions: string;
  materialComposition: string;
  grade: string;
  color: string;
  finish: string;
  functionality: string;
  configuration: string;
  manufacturer: string;
  model: string;
  technicalSpecifications: string;
}

export interface VariantSpecification {
  familyCode: string;
  familyName: string;
  sizeVariant: string;
  upholsteryMaterial: string;
  colorFinish: string;
  frameMaterial: string;
  operatingMechanism: string;
}

export interface UOMConfiguration {
  stockUom: string;
  purchaseUom: string;
  conversionFactor: number; // 1 purchaseUom = N stockUom
  conversionNote: string;
}

export interface SupplierReference {
  supplierCode: string;
  supplierName: string;
  manufacturerPartNo: string;
  supplierPartNo: string;
  leadTimeDays: number;
  moq: number;
  unitCostSAR: number;
  isPrimary: boolean;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actorRole: UserRole;
  actorName: string;
  action:
    | 'REQUEST_CREATED'
    | 'DUPLICATE_CHECK_PASSED'
    | 'ENGINEERING_VERIFIED'
    | 'CONTROLLER_APPROVED'
    | 'SKU_MINTED'
    | 'ACTIVATED'
    | 'ATTRIBUTE_UPDATED'
    | 'STATUS_CHANGED'
    | 'LEGACY_MIGRATED';
  summary: string;
  imsFormRef?: string;
}

export interface MaterialRecord {
  ajSku: string; // AJ-CC-NNNNNN
  cc: ClassificationCode;
  seqNum: number;
  shortName: string;
  status: ItemStatus;
  abcClass: ABCClass;
  vedClass: VEDClass;
  traceability: TraceabilityMode;
  storageCondition: string;
  warehouseLocation: string; // WH-ZN-AS-RK-LV-BN
  stockOnHand: number;
  reorderLevel: number;
  safetyStock: number;
  unitCostSAR: number;
  legacySku?: string;
  createdAt: string;
  updatedAt: string;
  attributes: TechnicalAttributes;
  variantSpec?: VariantSpecification;
  uom: UOMConfiguration;
  suppliers: SupplierReference[];
  auditHistory: AuditLogEntry[];
}

export interface BOMComponentLine {
  lineNo: number;
  componentSku: string;
  componentName: string;
  cc: ClassificationCode;
  qtyPerParent: number;
  stockUom: string;
  scrapPercent: number;
  effectiveQty: number;
  unitCostSAR: number;
  extendedCostSAR: number;
  level: 1 | 2;
  operationStage: string;
}

export interface BOMHeader {
  bomId: string;
  parentSku: string;
  parentName: string;
  revision: string;
  status: 'ACTIVE' | 'DRAFT' | 'SUPERSEDED';
  effectiveDate: string;
  engineeredBy: string;
  approvedBy: string;
  changeNote: string;
  lines: BOMComponentLine[];
}

export interface SkuWorkflowRequest {
  requestId: string;
  submittedAt: string;
  submittedBy: string;
  cc: ClassificationCode;
  shortName: string;
  stage: 'DRAFT' | 'DUPLICATE_CHECK' | 'PENDING_ENGINEERING' | 'PENDING_CONTROLLER' | 'COMPLETED' | 'REJECTED';
  duplicateMatchSku?: string;
  duplicateScore?: number;
  attributes: TechnicalAttributes;
  variantSpec?: VariantSpecification;
  uom: UOMConfiguration;
  traceability: TraceabilityMode;
  storageCondition: string;
  warehouseLocation: string;
  abcClass: ABCClass;
  vedClass: VEDClass;
  reorderLevel: number;
  safetyStock: number;
  supplierName: string;
  unitCostSAR: number;
  engineeringVerifiedBy?: string;
  engineeringNotes?: string;
  controllerApprovedBy?: string;
  mintedSku?: string;
}

export interface IMSDocumentTemplate {
  docNumber: string;
  docType: 'PROCEDURE' | 'WORK_INSTRUCTION' | 'FORM' | 'REGISTER';
  title: string;
  parentDoc: string;
  revision: string;
  effectiveDate: string;
  ownerRole: string;
  approverRole: string;
  retentionPeriod: string;
  purpose: string;
  scope: string;
  responsibilities: { role: string; duties: string }[];
  clauses: { heading: string; body: string[] }[];
  formFields?: { fieldId: string; label: string; type: string; mandatory: boolean; validationRule: string }[];
  revisionHistory: { rev: string; date: string; author: string; summary: string }[];
}

export interface DatabaseColumnDef {
  name: string;
  dataType: string;
  nullable: boolean;
  keyType: 'PK' | 'FK' | 'UQ' | 'IDX' | '-';
  validationRule: string;
  description: string;
}

export interface DatabaseTableDef {
  tableName: string;
  schemaGroup: 'CORE_MASTER' | 'ATTRIBUTES_BOM' | 'INTEGRATION_BRIDGE' | 'EXISTING_WMS_LINK';
  purpose: string;
  primaryKey: string;
  foreignKeys: string[];
  columns: DatabaseColumnDef[];
}

export interface LegacyMigrationRow {
  migrationId: string;
  legacySku: string;
  legacyDescription: string;
  legacyWarehouse: string;
  stockOnHand: number;
  stockUom: string;
  unitCostSAR: number;
  totalValueSAR: number;
  targetCc: ClassificationCode;
  mappedAjSku: string;
  reconciliationStatus: 'MATCHED' | 'PENDING_MAPPING' | 'VARIANCE_REVIEW';
  varianceSAR: number;
  notes: string;
}

export interface RolePermissionRow {
  capability: string;
  imsRef: string;
  permissions: Record<UserRole, string>; // e.g. 'CRUD', 'R', 'Approve', 'Verify', '-'
}

export interface UATCheckItem {
  id: string;
  phase: 'Phase 1: Governance & Schema' | 'Phase 2: Core System & Workflows' | 'Phase 3: Legacy Migration & Labeling' | 'Phase 4: Cutover & Audit';
  testCode: string;
  title: string;
  verificationMethod: string;
  acceptanceCriteria: string;
  passed: boolean;
}
