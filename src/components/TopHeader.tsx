import React from 'react';
import { Plus } from 'lucide-react';
import { ROLE_LABELS } from '../data/codingPolicy';
import { UserRole } from '../types/inventory';
import { NavViewId } from './SidebarNav';

interface TopHeaderProps {
  activeView: NavViewId;
  activeRole: UserRole;
  onChangeRole: (role: UserRole) => void;
  onQuickRegister: () => void;
}

const VIEW_BREADCRUMBS: Record<NavViewId, { section: string; title: string }> = {
  overview: { section: 'Architecture', title: 'Coding Policy & 12-Category Matrix' },
  master: { section: 'Material Master', title: 'IMS-REG-0XX-001 · Master Material Register' },
  workflow: { section: 'Operational Controls', title: 'Registration, Verification & SKU Minting' },
  'variants-bom': { section: 'Engineering', title: 'Product Variants & Multi-Level BOM Control' },
  'barcode-location': { section: 'Warehouse Ops', title: 'Barcode, QR Studio & Bin Location Coding' },
  database: { section: 'System Integration', title: 'Material Master DB Schema & Existing WMS Link' },
  'ims-docs': { section: 'IMS Governance', title: 'Controlled Procedure, Work Instructions & Templates' },
  'migration-gov': { section: 'Cutover & Compliance', title: 'Legacy Migration, RBAC Matrix & UAT Plan' },
};

export const TopHeader: React.FC<TopHeaderProps> = ({
  activeView,
  activeRole,
  onChangeRole,
  onQuickRegister,
}) => {
  const crumb = VIEW_BREADCRUMBS[activeView];

  return (
    <header className="no-print bg-white border-b border-slate-200 px-6 py-3.5 flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-2 text-sm min-w-0">
        <span className="text-slate-500 whitespace-nowrap shrink-0">{crumb.section}</span>
        <span className="text-slate-300" aria-hidden="true">/</span>
        <h1 className="font-semibold text-slate-900 truncate">{crumb.title}</h1>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <label className="flex items-center gap-2 text-xs text-slate-600 whitespace-nowrap">
          <span className="hidden sm:inline font-medium">Active Role</span>
          <select
            aria-label="Simulate active RBAC user role"
            value={activeRole}
            onChange={(e) => onChangeRole(e.target.value as UserRole)}
            className="h-9 px-2.5 bg-slate-50 border border-slate-300 rounded-md text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-700"
          >
            {(Object.keys(ROLE_LABELS) as UserRole[]).map((role) => (
              <option key={role} value={role}>
                {ROLE_LABELS[role]}
              </option>
            ))}
          </select>
        </label>

        <button
          type="button"
          onClick={onQuickRegister}
          className="h-9 px-4 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium rounded-md inline-flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Register Material</span>
        </button>
      </div>
    </header>
  );
};
