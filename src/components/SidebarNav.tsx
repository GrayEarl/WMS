import React from 'react';
import {
  Barcode,
  BookOpen,
  Database,
  FileCheck2,
  GitBranch,
  Layers,
  LayoutGrid,
  ShieldCheck,
} from 'lucide-react';

export type NavViewId =
  | 'overview'
  | 'master'
  | 'workflow'
  | 'variants-bom'
  | 'barcode-location'
  | 'database'
  | 'ims-docs'
  | 'migration-gov';

interface SidebarNavProps {
  activeView: NavViewId;
  onSelectView: (view: NavViewId) => void;
  pendingWorkflowCount: number;
  totalMaterials: number;
}

const NAV_GROUPS: {
  heading: string;
  items: { id: NavViewId; label: string; docRef: string; icon: React.ComponentType<{ className?: string }> }[];
}[] = [
  {
    heading: 'Architecture & Registry',
    items: [
      { id: 'overview', label: 'Coding Policy & Matrix', docRef: 'IMS-REG-0XX-002', icon: LayoutGrid },
      { id: 'master', label: 'Master Material Register', docRef: 'IMS-REG-0XX-001', icon: Layers },
      { id: 'variants-bom', label: 'Variants & BOM Control', docRef: 'IMS-REG-0XX-004/005', icon: GitBranch },
    ],
  },
  {
    heading: 'Operational Controls',
    items: [
      { id: 'workflow', label: 'SKU Request & Approval', docRef: 'IMS-FRM-0XX-001..003', icon: FileCheck2 },
      { id: 'barcode-location', label: 'Barcode, QR & Bin Codes', docRef: 'IMS-WI-0XX-004', icon: Barcode },
    ],
  },
  {
    heading: 'System & IMS Governance',
    items: [
      { id: 'database', label: 'DB Schema & WMS Link', docRef: 'Single-DB Architecture', icon: Database },
      { id: 'ims-docs', label: 'IMS Controlled Docs', docRef: 'IMS-PRO-0XX', icon: BookOpen },
      { id: 'migration-gov', label: 'Migration, RBAC & UAT', docRef: 'IMS-WI-0XX-005', icon: ShieldCheck },
    ],
  },
];

export const SidebarNav: React.FC<SidebarNavProps> = ({
  activeView,
  onSelectView,
  pendingWorkflowCount,
  totalMaterials,
}) => {
  return (
    <aside className="no-print w-full lg:w-[272px] shrink-0 bg-white border-b lg:border-b-0 lg:border-r border-slate-200 flex flex-col justify-between">
      <div>
        <div className="px-6 py-5 border-b border-slate-200">
          <div className="text-xs font-mono tracking-wide text-amber-800 font-medium">
            AJ-CC-NNNNNN · IMS-PRO-0XX
          </div>
          <div className="mt-1 text-base font-bold text-slate-900 leading-snug">
            Khalid Al-Juraid Trading Co.
          </div>
          <div className="mt-0.5 text-xs text-slate-500">
            Material Master & Stock Coding
          </div>
        </div>

        <nav className="p-4 space-y-6" aria-label="Primary sections">
          {NAV_GROUPS.map((group) => (
            <div key={group.heading}>
              <div className="px-3 mb-2 text-xs font-semibold text-slate-500">
                {group.heading}
              </div>
              <ul className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeView === item.id;
                  return (
                    <li key={item.id}>
                      <button
                        type="button"
                        onClick={() => onSelectView(item.id)}
                        className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-md text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-700 ${
                          isActive
                            ? 'bg-slate-900 text-white'
                            : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Icon
                            className={`w-4 h-4 shrink-0 ${
                              isActive ? 'text-amber-400' : 'text-slate-400'
                            }`}
                          />
                          <div className="min-w-0">
                            <div className="text-sm font-medium truncate whitespace-nowrap">
                              {item.label}
                            </div>
                            <div
                              className={`text-[11px] font-mono truncate ${
                                isActive ? 'text-slate-300' : 'text-slate-400'
                              }`}
                            >
                              {item.docRef}
                            </div>
                          </div>
                        </div>
                        {item.id === 'workflow' && pendingWorkflowCount > 0 && (
                          <span
                            className={`text-xs font-mono tabular-nums shrink-0 ${
                              isActive ? 'text-amber-300' : 'text-amber-700 font-semibold'
                            }`}
                          >
                            {pendingWorkflowCount}
                          </span>
                        )}
                        {item.id === 'master' && (
                          <span
                            className={`text-xs font-mono tabular-nums shrink-0 ${
                              isActive ? 'text-slate-300' : 'text-slate-500'
                            }`}
                          >
                            {totalMaterials}
                          </span>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
      </div>

      <div className="p-4 border-t border-slate-200 text-xs text-slate-500 space-y-1">
        <div className="font-medium text-slate-700">IMS Register Notice</div>
        <p className="leading-relaxed">
          Document codes use <span className="font-mono text-slate-900 font-medium">0XX</span> until verified against the approved Master Document Register.
        </p>
      </div>
    </aside>
  );
};
