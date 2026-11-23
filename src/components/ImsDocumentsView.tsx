import React, { useState } from 'react';
import { Download, Printer } from 'lucide-react';
import { IMS_DOCUMENT_TEMPLATES } from '../data/imsDocuments';
import { IMSDocumentTemplate } from '../types/inventory';
import { downloadTextFile } from '../utils/barcode';

function formatDocAsMarkdown(doc: IMSDocumentTemplate): string {
  const lines: string[] = [
    `# ${doc.docNumber} — ${doc.title}`,
    `**Company:** Khalid Al-Juraid Trading Company Ltd.`,
    `**Document Type:** ${doc.docType} | **Parent Document:** ${doc.parentDoc}`,
    `**Revision:** ${doc.revision} | **Effective Date:** ${doc.effectiveDate}`,
    `**Owner:** ${doc.ownerRole} | **Approver:** ${doc.approverRole}`,
    `**Retention:** ${doc.retentionPeriod}`,
    ``,
    `> **IMS Register Control Notice:** "0XX" is a controlled placeholder until verified against the approved IMS Master Document Register. Never reuse an existing document number.`,
    ``,
    `## 1. Purpose`,
    doc.purpose,
    ``,
    `## 2. Scope`,
    doc.scope,
    ``,
    `## 3. Responsibilities`,
    ...doc.responsibilities.map((r) => `- **${r.role}:** ${r.duties}`),
    ``,
    `## 4. Controlled Requirements & Instructions`,
    ...doc.clauses.flatMap((c) => [`### ${c.heading}`, ...c.body.map((b) => `- ${b}`), '']),
  ];

  if (doc.formFields && doc.formFields.length > 0) {
    lines.push(`## 5. Controlled Form Field Schema`);
    lines.push(`| Field ID | Label | Type | Mandatory | Validation Rule |`);
    lines.push(`| :--- | :--- | :--- | :--- | :--- |`);
    doc.formFields.forEach((f) => {
      lines.push(`| ${f.fieldId} | ${f.label} | ${f.type} | ${f.mandatory ? 'Yes' : 'No'} | ${f.validationRule} |`);
    });
    lines.push('');
  }

  lines.push(`## Revision History`);
  doc.revisionHistory.forEach((r) => {
    lines.push(`- **Rev ${r.rev}** (${r.date}) — ${r.author}: ${r.summary}`);
  });

  return lines.join('\n');
}

export const ImsDocumentsView: React.FC = () => {
  const [selectedDocNo, setSelectedDocNo] = useState<string>(IMS_DOCUMENT_TEMPLATES[0].docNumber);
  const selectedDoc =
    IMS_DOCUMENT_TEMPLATES.find((d) => d.docNumber === selectedDocNo) || IMS_DOCUMENT_TEMPLATES[0];

  const handleExportSingle = () => {
    downloadTextFile(
      `${selectedDoc.docNumber}-${selectedDoc.title.replace(/[^a-zA-Z0-9]+/g, '-')}.md`,
      formatDocAsMarkdown(selectedDoc),
      'text/markdown;charset=utf-8'
    );
  };

  const handleExportAllPackage = () => {
    const combined = IMS_DOCUMENT_TEMPLATES.map(formatDocAsMarkdown).join('\n\n---\n\n');
    downloadTextFile(
      'Al-Juraid-IMS-0XX-Complete-Documentation-Package.md',
      combined,
      'text/markdown;charset=utf-8'
    );
  };

  return (
    <div className="space-y-6">
      <div className="no-print bg-white border border-slate-200 rounded-lg px-5 py-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-xs font-mono text-slate-500">Deliverable 4 · Parent–Child Document Control</div>
          <h2 className="text-lg font-bold text-slate-900">IMS Controlled Document Hierarchy (14 Templates)</h2>
        </div>
        <button
          type="button"
          onClick={handleExportAllPackage}
          className="h-9 px-4 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium rounded-md inline-flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Full 14-Doc IMS Package (.md)</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Document Hierarchy Selector */}
        <aside className="no-print lg:col-span-4 bg-white border border-slate-200 rounded-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-700">
            Document Hierarchy Tree
          </div>
          <ul className="divide-y divide-slate-200 text-xs">
            {IMS_DOCUMENT_TEMPLATES.map((doc) => {
              const active = doc.docNumber === selectedDoc.docNumber;
              const isChild = doc.docType !== 'PROCEDURE';
              return (
                <li key={doc.docNumber}>
                  <button
                    type="button"
                    onClick={() => setSelectedDocNo(doc.docNumber)}
                    className={`w-full text-left px-4 py-3 transition-colors cursor-pointer ${
                      isChild ? 'pl-7' : ''
                    } ${active ? 'bg-slate-900 text-white' : 'hover:bg-slate-50 text-slate-800'}`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`font-mono font-semibold ${
                          active ? 'text-amber-300' : 'text-amber-800'
                        }`}
                      >
                        {doc.docNumber}
                      </span>
                      <span
                        className={`text-[10px] font-mono ${
                          active ? 'text-slate-300' : 'text-slate-400'
                        }`}
                      >
                        {doc.docType}
                      </span>
                    </div>
                    <div className={`mt-0.5 font-medium ${active ? 'text-white' : 'text-slate-900'}`}>
                      {doc.title}
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </aside>

        {/* Controlled Document Template Viewer */}
        <article className="lg:col-span-8 bg-white border border-slate-200 rounded-lg p-6 space-y-6 print-surface">
          <div className="no-print flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200">
            <span className="text-xs text-slate-500">
              Controlled Template Preview · Placeholder <span className="font-mono text-slate-900">0XX</span> pending Master Document Register assignment
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleExportSingle}
                className="h-8 px-3 border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-medium rounded-md inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download .md</span>
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="h-8 px-3 border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-medium rounded-md inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print</span>
              </button>
            </div>
          </div>

          {/* Standard IMS Document Header Table */}
          <div className="border border-slate-900 rounded-sm overflow-hidden text-xs">
            <div className="bg-slate-900 text-white px-4 py-2.5 flex flex-wrap items-center justify-between gap-2">
              <span className="font-semibold">KHALID AL-JURAID TRADING COMPANY LTD. — INTEGRATED MANAGEMENT SYSTEM</span>
              <span className="font-mono text-amber-300 font-semibold">{selectedDoc.docNumber}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-300 border-b border-slate-300">
              <div className="p-3 sm:col-span-2">
                <div className="text-[11px] text-slate-500">Document Title</div>
                <div className="text-sm font-bold text-slate-900 mt-0.5">{selectedDoc.title}</div>
              </div>
              <div className="p-3">
                <div className="text-[11px] text-slate-500">Parent Document</div>
                <div className="font-mono font-semibold text-slate-900 mt-0.5">{selectedDoc.parentDoc}</div>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-300">
              <div className="p-3">
                <div className="text-[11px] text-slate-500">Revision</div>
                <div className="font-mono font-medium text-slate-900 mt-0.5">{selectedDoc.revision}</div>
              </div>
              <div className="p-3">
                <div className="text-[11px] text-slate-500">Effective Date</div>
                <div className="font-mono font-medium text-slate-900 mt-0.5">{selectedDoc.effectiveDate}</div>
              </div>
              <div className="p-3">
                <div className="text-[11px] text-slate-500">Process Owner</div>
                <div className="font-medium text-slate-900 mt-0.5">{selectedDoc.ownerRole}</div>
              </div>
              <div className="p-3">
                <div className="text-[11px] text-slate-500">Approving Authority</div>
                <div className="font-medium text-slate-900 mt-0.5">{selectedDoc.approverRole}</div>
              </div>
            </div>
          </div>

          {/* Document Body */}
          <div className="space-y-5 text-sm text-slate-700 leading-relaxed">
            <div>
              <h3 className="text-sm font-bold text-slate-900">1. Purpose</h3>
              <p className="mt-1 text-xs leading-relaxed">{selectedDoc.purpose}</p>
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-900">2. Scope</h3>
              <p className="mt-1 text-xs leading-relaxed">{selectedDoc.scope}</p>
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-900">3. Roles &amp; Responsibilities</h3>
              <div className="mt-2 border border-slate-200 rounded-md divide-y divide-slate-200 text-xs">
                {selectedDoc.responsibilities.map((r) => (
                  <div key={r.role} className="px-3.5 py-2.5 grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div className="font-semibold text-slate-900">{r.role}</div>
                    <div className="sm:col-span-2 text-slate-700">{r.duties}</div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-900">4. Controlled Clauses &amp; Operating Standards</h3>
              <div className="mt-2 space-y-4">
                {selectedDoc.clauses.map((clause) => (
                  <div key={clause.heading} className="space-y-1.5">
                    <div className="text-xs font-semibold text-slate-900">{clause.heading}</div>
                    <ul className="list-disc pl-5 space-y-1 text-xs text-slate-700">
                      {clause.body.map((line, i) => (
                        <li key={i}>{line}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {selectedDoc.formFields && selectedDoc.formFields.length > 0 && (
              <div>
                <h3 className="text-sm font-bold text-slate-900">5. Controlled Form Data Dictionary</h3>
                <div className="mt-2 overflow-x-auto border border-slate-200 rounded-md">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-600">
                        <th className="py-2 px-3">ID</th>
                        <th className="py-2 px-3">Field Label</th>
                        <th className="py-2 px-3">Type</th>
                        <th className="py-2 px-3">Required</th>
                        <th className="py-2 px-3">Validation Rule</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {selectedDoc.formFields.map((f) => (
                        <tr key={f.fieldId}>
                          <td className="py-2 px-3 font-mono font-semibold text-slate-900">{f.fieldId}</td>
                          <td className="py-2 px-3 font-medium text-slate-800">{f.label}</td>
                          <td className="py-2 px-3 font-mono text-slate-600">{f.type}</td>
                          <td className="py-2 px-3 font-mono text-slate-700">{f.mandatory ? 'YES' : 'NO'}</td>
                          <td className="py-2 px-3 font-mono text-[11px] text-slate-600">{f.validationRule}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-slate-200">
              <div className="text-xs font-semibold text-slate-900 mb-2">Document Revision &amp; Retention Control</div>
              <div className="text-xs text-slate-600 mb-2">Record Retention Period: {selectedDoc.retentionPeriod}</div>
              {selectedDoc.revisionHistory.map((rev) => (
                <div key={rev.rev} className="text-xs text-slate-600 font-mono">
                  Rev {rev.rev} · {rev.date} · {rev.author} — {rev.summary}
                </div>
              ))}
            </div>
          </div>
        </article>
      </div>
    </div>
  );
};
