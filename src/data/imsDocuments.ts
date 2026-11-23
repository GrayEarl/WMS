import { IMSDocumentTemplate } from '../types/inventory';

export const IMS_DOCUMENT_TEMPLATES: IMSDocumentTemplate[] = [
  {
    docNumber: 'IMS-PRO-0XX',
    docType: 'PROCEDURE',
    title: 'Material Identification & Stock Coding Procedure',
    parentDoc: 'IMS Quality & Operations Manual (§7.5 / §8.5.2)',
    revision: 'REV 1.0 (DRAFT FOR REGISTER ASSIGNMENT)',
    effectiveDate: '2026-12-01',
    ownerRole: 'Inventory Controller',
    approverRole: 'Warehouse Manager & IMS Management Representative',
    retentionPeriod: 'Permanent (Active + 10 Years Post-Obsolescence)',
    purpose:
      'Establish a single, permanent, non-intelligent stock coding standard (AJ-CC-NNNNNN) and controlled Material Master governance across Khalid Al-Juraid Trading Company Ltd., ensuring unique identification, zero SKU duplication, full traceability, and seamless integration with the existing Warehouse Management System.',
    scope:
      'Applies to all physical inventory categories across Riyadh Distribution Center, Al-Kharj Joinery & Upholstery Plant, showrooms, and service depots: Finished Furniture (FF), Semi-Finished Goods (SF), Raw Materials (RM), Upholstery (UP), Hardware (HW), Mechanical Components (MC), Accessories (AC), Spare Parts (SP), Packaging (PK), Consumables (CS), Tools (TL), and Equipment (EQ).',
    responsibilities: [
      { role: 'Requester (Design / Production / Sales)', duties: 'Initiates IMS-FRM-0XX-001 with complete commercial, dimensional, and OEM data; runs preliminary duplicate search.' },
      { role: 'Engineering & Technical Specialist', duties: 'Validates technical attributes, material grades, fire-retardancy/load specs, variants, and BOM links via IMS-FRM-0XX-002.' },
      { role: 'Inventory Controller', duties: 'Enforces final duplicate check, approves UOM conversions, mints globally unique AJ-CC-NNNNNN SKU, and governs status changes.' },
      { role: 'Warehouse Officer / Manager', duties: 'Assigns physical bin code (WH-ZN-AS-RK-LV-BN), prints QR/Code-128 labels, and reconciles physical stock.' },
      { role: 'System Administrator', duties: 'Maintains database immutability constraints, RBAC enforcement, and nightly audit log backups.' },
    ],
    clauses: [
      {
        heading: '1. Permanent SKU Syntax & Non-Recycling Policy',
        body: [
          'Every approved material or furniture SKU shall strictly follow the 13-character alphanumeric format AJ-CC-NNNNNN.',
          '"AJ" is the fixed company identifier for Khalid Al-Juraid Trading Company Ltd. "CC" is a two-letter classification code selected exclusively from IMS-REG-0XX-002. "NNNNNN" is a globally unique, zero-padded six-digit sequential number (000001–999999).',
          'Once issued, an AJ-CC-NNNNNN SKU is permanently bound to its technical definition. It shall NEVER be altered, split, merged into a different number, or recycled after deactivation.',
        ],
      },
      {
        heading: '2. Separation of SKU, Technical Attributes & Warehouse Location',
        body: [
          'Intelligent or descriptive coding inside the SKU string (such as color abbreviations, dimensions, supplier initials, or price tiers) is strictly prohibited.',
          'All technical characteristics—including item type, dimensions, material composition, grade, color, finish, operating mechanism, and manufacturer—shall reside in structured database fields governed by IMS-REG-0XX-003.',
          'Physical warehouse shelf/bin addresses (WH-ZN-AS-RK-LV-BN) are maintained independently of the SKU so stock relocation never alters item identity.',
        ],
      },
      {
        heading: '3. Document Numbering & 0XX Placeholder Control',
        body: [
          'This procedure and all child Work Instructions (IMS-WI-0XX-001..005), Forms (IMS-FRM-0XX-001..003), and Registers (IMS-REG-0XX-001..005) use "0XX" as a controlled placeholder until the Document Controller assigns the next sequential parent number from the approved IMS Master Document Register.',
          'No previously retired or existing IMS document number may ever be reused.',
        ],
      },
      {
        heading: '4. Single-Database Integration Principle',
        body: [
          'The Material Master shall operate inside the company’s existing warehouse inventory database via normalized foreign-key integration. Creating parallel spreadsheets or disconnected SKU databases is prohibited.',
        ],
      },
    ],
    revisionHistory: [
      { rev: '1.0', date: '2026-11-22', author: 'Warehouse Engineering & IMS Architect', summary: 'Initial release pending 0XX parent number verification.' },
    ],
  },
  {
    docNumber: 'IMS-WI-0XX-001',
    docType: 'WORK_INSTRUCTION',
    title: 'Material Classification & SKU Generation Work Instruction',
    parentDoc: 'IMS-PRO-0XX',
    revision: 'REV 1.0',
    effectiveDate: '2026-12-01',
    ownerRole: 'Inventory Controller',
    approverRole: 'Warehouse Manager',
    retentionPeriod: 'Permanent',
    purpose: 'Define step-by-step rules for assigning the two-letter classification code (CC) and executing atomic sequence generation for NNNNNN.',
    scope: 'All new material requests and legacy item classifications across all 12 approved inventory categories.',
    responsibilities: [
      { role: 'Requester', duties: 'Selects provisional CC category based on primary inventory role.' },
      { role: 'Inventory Controller', duties: 'Confirms final CC assignment and triggers atomic sequence generator.' },
    ],
    clauses: [
      {
        heading: '1. Classification Decision Tree',
        body: [
          'If sold directly to customers as a complete functional piece → FF (Finished Furniture).',
          'If milled, welded, or pre-upholstered in-house awaiting final assembly → SF (Semi-Finished Goods).',
          'If unshaped timber, sheet board, steel bar, or stone slab → RM (Raw Materials).',
          'If leather hide, woven fabric, foam slab, or webbing → UP (Upholstery Materials).',
          'If static fastener, hinge, slide, or bracket → HW; if motorized, pneumatic, or articulated motion assembly → MC.',
          'If after-sales service stock held specifically for repair/warranty → SP; if consumed in process without piece count (glue, lacquer, sandpaper) → CS.',
        ],
      },
      {
        heading: '2. Atomic Sequence Issuance Rule',
        body: [
          'The database sequence generator increments a single global counter (seq_num) across all CC categories. For example, if AJ-FF-000019 is issued, the next item—even if in Hardware (HW)—receives AJ-HW-000020.',
          'No gaps may be backfilled manually; failed or cancelled draft requests never burn a sequence number because NNNNNN is minted ONLY at final Inventory Controller approval.',
        ],
      },
    ],
    revisionHistory: [
      { rev: '1.0', date: '2026-11-22', author: 'Inventory Control Team', summary: 'Standardized global sequence rules.' },
    ],
  },
  {
    docNumber: 'IMS-WI-0XX-002',
    docType: 'WORK_INSTRUCTION',
    title: 'Material Registration & Specification Work Instruction',
    parentDoc: 'IMS-PRO-0XX',
    revision: 'REV 1.0',
    effectiveDate: '2026-12-01',
    ownerRole: 'Engineering & Technical Specialist',
    approverRole: 'Inventory Controller',
    retentionPeriod: 'Permanent',
    purpose: 'Standardize data entry, duplicate prevention, technical attribute validation, UOM conversion setup, and approval routing prior to SKU activation.',
    scope: 'All new material introductions (NMI) submitted via IMS-FRM-0XX-001.',
    responsibilities: [
      { role: 'Requester', duties: 'Populates mandatory attributes, OEM datasheet PDF, and supplier quote.' },
      { role: 'Engineering', duties: 'Verifies dimensions, standards (BS 5852, EN 16139, NHLA), and signs IMS-FRM-0XX-002.' },
      { role: 'Procurement', duties: 'Inputs vendor MOQ, lead time, and purchase-to-stock UOM factor.' },
    ],
    clauses: [
      {
        heading: '1. Mandatory Duplicate Check Protocol',
        body: [
          'Before any request enters Engineering Verification, the system executes an automated similarity scan across Manufacturer + OEM Model + Dimensions + Material Composition.',
          'Any match scoring >= 75% similarity triggers a Duplicate Review Alert displaying both ACTIVE and OBSOLETE records. If an OBSOLETE item matches, Controller evaluates reactivation vs. new SKU.',
        ],
      },
      {
        heading: '2. Purchasing vs. Stock UOM Control',
        body: [
          'Every item must define an unambiguous Stock UOM (PCS, MTR, SQM, CBM, LTR, SET, KG) and a deterministic conversion multiplier from Purchase UOM (e.g., 1 ROLL = 50 MTR; 1 BOX = 250 PCS).',
          'For variable-area natural hides (UP), nominal conversion (5.0 SQM/HID) is reconciled against laser hide-area scan at Goods Receipt Note (GRN).',
        ],
      },
    ],
    revisionHistory: [
      { rev: '1.0', date: '2026-11-22', author: 'Engineering Department', summary: 'Added mandatory duplicate check threshold and UOM verification.' },
    ],
  },
  {
    docNumber: 'IMS-WI-0XX-003',
    docType: 'WORK_INSTRUCTION',
    title: 'Product Variant & BOM Coding Work Instruction',
    parentDoc: 'IMS-PRO-0XX',
    revision: 'REV 1.0',
    effectiveDate: '2026-12-01',
    ownerRole: 'Engineering & Technical Specialist',
    approverRole: 'Inventory Controller',
    retentionPeriod: 'Permanent',
    purpose: 'Govern how furniture product families branch into individually coded variant SKUs and how Bills of Materials (BOMs) maintain revision traceability.',
    scope: 'All Finished Furniture (FF) and Semi-Finished Goods (SF) manufactured or configured by Al-Juraid.',
    responsibilities: [
      { role: 'Design & Engineering', duties: 'Defines variant matrix (size, upholstery, color, frame, mechanism) and multi-level BOM lines.' },
      { role: 'Inventory Controller', duties: 'Approves BOM revisions (REV-A, REV-B) and ensures component SKUs are ACTIVE.' },
    ],
    clauses: [
      {
        heading: '1. Variant-Level SKU Rule',
        body: [
          'Any change in physical form, fit, function, size, upholstery material, colorway, frame timber/metal, or operating mechanism (fixed vs. swivel vs. motorized recliner) requires a distinct permanent AJ-FF-NNNNNN SKU.',
          'Variant records are grouped under a common Family Code (e.g., FAM-DIRIYAH) inside IMS-REG-0XX-004 for showroom catalog roll-up without compromising inventory uniqueness.',
        ],
      },
      {
        heading: '2. BOM Revision & Scrap Control',
        body: [
          'Each active BOM carries an explicit revision identifier (BOM-AJ-FF-NNNNNN-RXX), effective date, component stock UOM quantities, and engineering-approved scrap percentages (e.g., 10% leather nesting loss, 18% rough timber kerf/defect allowance).',
        ],
      },
    ],
    revisionHistory: [
      { rev: '1.0', date: '2026-11-22', author: 'Engineering & Costing', summary: 'Established variant matrix and scrap factor rules.' },
    ],
  },
  {
    docNumber: 'IMS-WI-0XX-004',
    docType: 'WORK_INSTRUCTION',
    title: 'Barcode, QR Code & Labeling Work Instruction',
    parentDoc: 'IMS-PRO-0XX',
    revision: 'REV 1.0',
    effectiveDate: '2026-12-01',
    ownerRole: 'Warehouse Officer',
    approverRole: 'Warehouse Manager',
    retentionPeriod: '5 Years',
    purpose: 'Define physical barcode (Code-128B) and 2D QR Code payload standards, thermal label dimensions, and placement rules across furniture, raw materials, and bins.',
    scope: 'All Goods Receipt (GRN), WIP staging, Finished Goods packing, and Warehouse Rack/Bin signage.',
    responsibilities: [
      { role: 'Warehouse Officer', duties: 'Prints and affixes compliant thermal labels immediately upon GRN inspection or production completion.' },
      { role: 'Warehouse Manager', duties: 'Audits label scan readability and bin signage integrity monthly.' },
    ],
    clauses: [
      {
        heading: '1. Dual-Symbology Standard (Code-128B + QR Code)',
        body: [
          'Every item label shall feature both a linear Code-128B barcode encoding the bare 13-character AJ-CC-NNNNNN SKU (for legacy laser gun compatibility) and an ISO/IEC 18004 QR Code encoding structured data: AJ|SKU:<AJ-CC-NNNNNN>|LOT:<BATCH/SERIAL>|UOM:<STOCK_UOM>|LOC:<WH-BIN>.',
        ],
      },
      {
        heading: '2. Approved Label Formats & Placement',
        body: [
          'Format A (100 × 150 mm Carton / Furniture Hang Tag): Applied to two adjacent faces of export cartons and concealed under-frame Tyvek tag on upholstered seating.',
          'Format B (100 × 50 mm Rack / Timber Bundle Label): Applied to timber bundle end-caps, leather roll tubes, and warehouse rack crossbars.',
          'Format C (50 × 25 mm Hardware Pouch Label): Applied to small poly-bags, spare parts boxes, and bin fronts.',
        ],
      },
    ],
    revisionHistory: [
      { rev: '1.0', date: '2026-11-22', author: 'Warehouse Operations', summary: 'Defined 3 thermal label templates and QR payload syntax.' },
    ],
  },
  {
    docNumber: 'IMS-WI-0XX-005',
    docType: 'WORK_INSTRUCTION',
    title: 'Existing Inventory SKU Migration Work Instruction',
    parentDoc: 'IMS-PRO-0XX',
    revision: 'REV 1.0',
    effectiveDate: '2026-12-01',
    ownerRole: 'Inventory Controller',
    approverRole: 'Finance Director & Warehouse Manager',
    retentionPeriod: 'Permanent',
    purpose: 'Execute zero-loss cutover from legacy free-text item codes to AJ-CC-NNNNNN inside the existing warehouse database while preserving 100% stock balances, transaction history, and financial valuation.',
    scope: 'All active, dormant, and open-PO items currently stored in Khalid Al-Juraid Trading Co. ERP/WMS.',
    responsibilities: [
      { role: 'Inventory Controller', duties: 'Cleanses duplicates, populates legacy_sku_xref, and certifies 0.00 SAR reconciliation.' },
      { role: 'System Administrator', duties: 'Executes transactional SQL migration script during controlled cutover window.' },
    ],
    clauses: [
      {
        heading: '1. Zero-Duplication Cutover Architecture',
        body: [
          'Migration runs in-place against existing inventory_balances and inventory_transactions tables using legacy_sku_xref. Historical transactions retain their original legacy_sku reference alongside the newly linked aj_sku foreign key.',
        ],
      },
      {
        heading: '2. Pre- and Post-Migration Financial Reconciliation',
        body: [
          'Immediately prior to cutover, Finance and Inventory Control freeze stock movements and snapshot total on-hand quantity and SAR valuation by warehouse. Post-cutover queries must confirm 0.000 unit variance and 0.00 SAR valuation variance before unlocking WMS operations.',
        ],
      },
    ],
    revisionHistory: [
      { rev: '1.0', date: '2026-11-22', author: 'Inventory & IT Migration Lead', summary: 'Finalized cutover & valuation reconciliation rules.' },
    ],
  },
  {
    docNumber: 'IMS-FRM-0XX-001',
    docType: 'FORM',
    title: 'New Material Registration Form',
    parentDoc: 'IMS-WI-0XX-002',
    revision: 'REV 1.0',
    effectiveDate: '2026-12-01',
    ownerRole: 'Requester',
    approverRole: 'Inventory Controller',
    retentionPeriod: 'Permanent',
    purpose: 'Controlled intake record capturing commercial, dimensional, UOM, storage, and supplier data required to evaluate and mint a new AJ-CC-NNNNNN SKU.',
    scope: 'Mandatory for every new stock item, furniture variant, raw material, spare part, or tool.',
    responsibilities: [
      { role: 'Requester', duties: 'Completes Sections A–C and attaches OEM technical datasheet.' },
      { role: 'Inventory Controller', duties: 'Records duplicate check result and assigns minted SKU in Section D.' },
    ],
    clauses: [
      {
        heading: 'Completion Instructions',
        body: [
          'All mandatory fields marked (*) must be completed prior to duplicate scan. Incomplete descriptions such as "Walnut Wood" or "Sofa Fabric" without dimensions, grade, and OEM model shall be auto-rejected.',
        ],
      },
    ],
    formFields: [
      { fieldId: 'F-01', label: 'Provisional Classification Code (CC)', type: 'Enum (12 Categories)', mandatory: true, validationRule: 'Must exist in IMS-REG-0XX-002' },
      { fieldId: 'F-02', label: 'Standardized Short Name', type: 'Text (120 chars)', mandatory: true, validationRule: 'No embedded SKU or supplier price' },
      { fieldId: 'F-03', label: 'Structured Technical Attributes (12 Fields)', type: 'Structured Object', mandatory: true, validationRule: 'Per IMS-REG-0XX-003 mandatory matrix' },
      { fieldId: 'F-04', label: 'Stock UOM & Purchase UOM Conversion', type: 'UOM + Decimal Factor', mandatory: true, validationRule: 'Factor > 0' },
      { fieldId: 'F-05', label: 'Traceability & Storage Condition', type: 'Enum + Text', mandatory: true, validationRule: 'NONE | BATCH_LOT | SERIAL' },
      { fieldId: 'F-06', label: 'Duplicate Check Audit Token', type: 'System Generated', mandatory: true, validationRule: 'Max similarity < 75% or Controller override' },
    ],
    revisionHistory: [
      { rev: '1.0', date: '2026-11-22', author: 'Inventory Control', summary: 'Aligned fields with Material Master schema.' },
    ],
  },
  {
    docNumber: 'IMS-FRM-0XX-002',
    docType: 'FORM',
    title: 'Material Specification Verification Form',
    parentDoc: 'IMS-WI-0XX-002',
    revision: 'REV 1.0',
    effectiveDate: '2026-12-01',
    ownerRole: 'Engineering & Technical Specialist',
    approverRole: 'Inventory Controller',
    retentionPeriod: 'Permanent',
    purpose: 'Engineering sign-off checklist confirming technical accuracy, fire/structural compliance, variant differentiation, and BOM readiness before SKU generation.',
    scope: 'Mandatory gate between Duplicate Check and Inventory Controller Approval.',
    responsibilities: [
      { role: 'Engineering', duties: 'Verifies OEM datasheet, tolerances, standards, and approves or returns request.' },
    ],
    clauses: [
      {
        heading: 'Engineering Verification Gate',
        body: [
          'Engineering must confirm: (1) Metric dimensions follow ISO 128 mm format, (2) Flammability/load standards (BS 5852, EN 16139, SASO) are verified, (3) Variant attributes do not collide with existing Product Variant Register entries.',
        ],
      },
    ],
    formFields: [
      { fieldId: 'V-01', label: 'Parent Registration Request ID', type: 'FK (REQ-YYYY-NNNN)', mandatory: true, validationRule: 'Status must be PENDING_ENGINEERING' },
      { fieldId: 'V-02', label: 'Standards & Compliance Verified', type: 'Boolean + Cert Ref', mandatory: true, validationRule: 'Checked for UP, RM, FF, MC, CS' },
      { fieldId: 'V-03', label: 'Engineering Sign-Off Decision', type: 'PASS | RETURN_TO_REQUESTER', mandatory: true, validationRule: 'Role must be ENGINEERING' },
    ],
    revisionHistory: [
      { rev: '1.0', date: '2026-11-22', author: 'Engineering', summary: 'Initial controlled checklist.' },
    ],
  },
  {
    docNumber: 'IMS-FRM-0XX-003',
    docType: 'FORM',
    title: 'SKU Change / Deactivation Request Form',
    parentDoc: 'IMS-PRO-0XX',
    revision: 'REV 1.0',
    effectiveDate: '2026-12-01',
    ownerRole: 'Inventory Controller',
    approverRole: 'Warehouse Manager',
    retentionPeriod: 'Permanent',
    purpose: 'Govern non-key attribute updates, status transitions (HOLD, PHASE_OUT, OBSOLETE), and permanent retirement of SKUs while enforcing strict non-recycling.',
    scope: 'Any existing ACTIVE, HOLD, or PHASE_OUT SKU in the Master Material Register.',
    responsibilities: [
      { role: 'Requester / Manager', duties: 'States business justification and checks open POs, active BOMs, and on-hand stock.' },
      { role: 'Inventory Controller', duties: 'Executes approved status transition and records immutable audit entry.' },
    ],
    clauses: [
      {
        heading: 'Prohibited Modifications',
        body: [
          'This form CANNOT be used to change the AJ-CC-NNNNNN code, reclassify CC, or alter fundamental form-fit-function. Any fundamental spec change requires a new SKU via IMS-FRM-0XX-001.',
          'An SKU may only transition to OBSOLETE when Stock on Hand = 0, Open Purchase Orders = 0, and Active BOM references = 0.',
        ],
      },
    ],
    formFields: [
      { fieldId: 'C-01', label: 'Target Permanent SKU', type: 'FK (AJ-CC-NNNNNN)', mandatory: true, validationRule: 'Immutable primary key' },
      { fieldId: 'C-02', label: 'Action Type', type: 'Enum (HOLD | PHASE_OUT | OBSOLETE | ATTR_UPDATE)', mandatory: true, validationRule: 'OBSOLETE requires zero stock & zero open POs' },
      { fieldId: 'C-03', label: 'Replacement / Superseding SKU (if Phase-Out)', type: 'FK (AJ-CC-NNNNNN)', mandatory: false, validationRule: 'Must be ACTIVE' },
    ],
    revisionHistory: [
      { rev: '1.0', date: '2026-11-22', author: 'Warehouse Governance', summary: 'Added zero-stock precondition for OBSOLETE status.' },
    ],
  },
  {
    docNumber: 'IMS-REG-0XX-001',
    docType: 'REGISTER',
    title: 'Master Material Register',
    parentDoc: 'IMS-PRO-0XX',
    revision: 'REV 1.0',
    effectiveDate: '2026-12-01',
    ownerRole: 'Inventory Controller',
    approverRole: 'System Administrator',
    retentionPeriod: 'Permanent (Live Database Register)',
    purpose: 'Authoritative real-time register of all issued AJ-CC-NNNNNN SKUs, statuses, UOM rules, reorder parameters, and audit trails.',
    scope: '100% of issued SKUs (Active, Hold, Phase-Out, and Obsolete/Retired).',
    responsibilities: [
      { role: 'Inventory Controller', duties: 'Maintains integrity of live master records and reviews dormant items quarterly.' },
    ],
    clauses: [
      {
        heading: 'Register Governance',
        body: [
          'Backed directly by the `material_master` database table. Exports are watermarked with UTC generation timestamp for quarterly IMS audits.',
        ],
      },
    ],
    revisionHistory: [
      { rev: '1.0', date: '2026-11-22', author: 'Inventory Control', summary: 'Live register structure established.' },
    ],
  },
  {
    docNumber: 'IMS-REG-0XX-002',
    docType: 'REGISTER',
    title: 'Material Classification Register',
    parentDoc: 'IMS-WI-0XX-001',
    revision: 'REV 1.0',
    effectiveDate: '2026-12-01',
    ownerRole: 'Inventory Controller',
    approverRole: 'Warehouse Manager',
    retentionPeriod: 'Permanent',
    purpose: 'Controlled lookup table of the 12 approved 2-letter classification codes (CC), default UOMs, traceability rules, and storage classes.',
    scope: 'FF, SF, RM, UP, HW, MC, AC, SP, PK, CS, TL, EQ.',
    responsibilities: [
      { role: 'Warehouse Manager', duties: 'Approves any proposal to introduce a 13th classification code (requires Executive sign-off).' },
    ],
    clauses: [
      {
        heading: 'Controlled Code List',
        body: [
          'No ad-hoc or departmental two-letter codes may be created outside this register.',
        ],
      },
    ],
    revisionHistory: [
      { rev: '1.0', date: '2026-11-22', author: 'Warehouse Engineering', summary: 'Approved 12-category matrix.' },
    ],
  },
  {
    docNumber: 'IMS-REG-0XX-003',
    docType: 'REGISTER',
    title: 'Technical Attribute Dictionary',
    parentDoc: 'IMS-WI-0XX-002',
    revision: 'REV 1.0',
    effectiveDate: '2026-12-01',
    ownerRole: 'Engineering & Technical Specialist',
    approverRole: 'Inventory Controller',
    retentionPeriod: 'Permanent',
    purpose: 'Standardized vocabulary, metric formats, and mandatory-by-category rules for the 12 structured technical attribute fields.',
    scope: 'All technical specification entries across Material Master.',
    responsibilities: [
      { role: 'Engineering', duties: 'Maintains controlled terminology for item types, finishes, grades, and test standards.' },
    ],
    clauses: [
      {
        heading: 'Standardization Rules',
        body: [
          'All physical dimensions use millimeters (mm); colors cite RAL, Pantone, or certified Mill Reference codes; timber grades cite NHLA or EN standards.',
        ],
      },
    ],
    revisionHistory: [
      { rev: '1.0', date: '2026-11-22', author: 'Engineering', summary: 'Published 12-attribute standardization rules.' },
    ],
  },
  {
    docNumber: 'IMS-REG-0XX-004',
    docType: 'REGISTER',
    title: 'Product Variant Register',
    parentDoc: 'IMS-WI-0XX-003',
    revision: 'REV 1.0',
    effectiveDate: '2026-12-01',
    ownerRole: 'Engineering & Design Studio',
    approverRole: 'Inventory Controller',
    retentionPeriod: 'Permanent',
    purpose: 'Maps each Finished Furniture (FF) and Semi-Finished (SF) design family to individual permanent SKUs across size, upholstery, color, frame, and mechanism.',
    scope: 'All multi-variant furniture collections (Al-Diriyah, Najd, Tuwaiq, etc.).',
    responsibilities: [
      { role: 'Design & Engineering', duties: 'Registers every customer-orderable variant combination prior to sales quoting.' },
    ],
    clauses: [
      {
        heading: 'Variant Uniqueness',
        body: [
          'Guarantees zero ambiguity between visually similar variants (e.g., manual vs. motorized recliner, walnut vs. oak plinth) in both sales orders and factory work orders.',
        ],
      },
    ],
    revisionHistory: [
      { rev: '1.0', date: '2026-11-22', author: 'Design & Engineering', summary: 'Established furniture variant matrix.' },
    ],
  },
  {
    docNumber: 'IMS-REG-0XX-005',
    docType: 'REGISTER',
    title: 'Bill of Materials Register',
    parentDoc: 'IMS-WI-0XX-003',
    revision: 'REV 1.0',
    effectiveDate: '2026-12-01',
    ownerRole: 'Engineering & Production Control',
    approverRole: 'Inventory Controller',
    retentionPeriod: 'Permanent',
    purpose: 'Revision-controlled register of parent-child manufacturing BOMs linking FF SKUs to SF, RM, UP, HW, MC, PK, and CS components.',
    scope: 'All manufactured and kitted assemblies.',
    responsibilities: [
      { role: 'Engineering', duties: 'Releases and revises multi-level BOMs with verified scrap allowances.' },
    ],
    clauses: [
      {
        heading: 'Revision & Cost Roll-Up Control',
        body: [
          'Only one BOM revision per parent SKU may hold ACTIVE status at any time. Historical revisions remain archived for warranty traceability.',
        ],
      },
    ],
    revisionHistory: [
      { rev: '1.0', date: '2026-11-22', author: 'Production Engineering', summary: 'Initialized multi-level BOM register.' },
    ],
  },
];
