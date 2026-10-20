import React, { useCallback, useEffect, useState } from 'react';
import {
  FileText,
  Plus,
  Trash2,
  Upload,
  Search,
  ExternalLink,
  X,
  Loader2,
  Pencil,
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import {
  CoaDocument,
  createCoaDocument,
  deleteCoaDocument,
  fetchCoaDocuments,
  updateCoaDocument,
} from '../lib/coaApi';

export const LabReportsPage: React.FC = () => {
  const { showSuccess, showError } = useToast();
  const [docs, setDocs] = useState<CoaDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<CoaDocument | null>(null);
  const [name, setName] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = useCallback(
    async (q?: string) => {
      setLoading(true);
      try {
        setDocs(await fetchCoaDocuments(q));
      } catch (err: any) {
        showError(err?.message || 'Failed to load lab reports');
      } finally {
        setLoading(false);
      }
    },
    [showError]
  );

  useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    setEditing(null);
    setName('');
    setFile(null);
    setDrawerOpen(true);
  };

  const openEdit = (doc: CoaDocument) => {
    setEditing(doc);
    setName(doc.name);
    setFile(null);
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    if (saving) return;
    setDrawerOpen(false);
    setEditing(null);
    setFile(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showError('Document name is required.');
      return;
    }
    if (!editing && !file) {
      showError('Please choose a document to upload.');
      return;
    }

    setSaving(true);
    try {
      if (editing) {
        await updateCoaDocument(editing.id, name.trim(), file);
        showSuccess('Document updated');
      } else {
        await createCoaDocument(name.trim(), file!);
        showSuccess('Document uploaded');
      }
      setDrawerOpen(false);
      setEditing(null);
      setFile(null);
      await load(search);
    } catch (err: any) {
      showError(err?.message || 'Could not save document');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (doc: CoaDocument) => {
    if (!window.confirm(`Delete “${doc.name}”?`)) return;
    setDeletingId(doc.id);
    try {
      await deleteCoaDocument(doc.id);
      showSuccess('Document deleted');
      setDocs((prev) => prev.filter((d) => d.id !== doc.id));
    } catch (err: any) {
      showError(err?.message || 'Could not delete document');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[#5F7088] mb-1">
            Quality
          </p>
          <h1 className="font-['Sora'] font-bold text-2xl sm:text-3xl text-[#0A2358] tracking-tight">
            Lab Reports
          </h1>
          <p className="text-sm text-[#5F7088] mt-1.5">
            Name a document and upload the file. It will show on the storefront COA page.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center justify-center gap-2 h-10 px-4 rounded-xl bg-[#1C7FDB] hover:bg-[#1666B5] text-white text-sm font-semibold shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Upload document
        </button>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          load(search);
        }}
        className="flex flex-col sm:flex-row gap-2 bg-white border border-[#E3EAF2] rounded-2xl p-3 shadow-card"
      >
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#5F7088] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by document name…"
            className="w-full h-10 pl-9 pr-3 rounded-xl border border-[#E3EAF2] text-sm outline-none focus:border-[#1C7FDB]"
          />
        </div>
        <button
          type="submit"
          className="h-10 px-4 rounded-xl bg-[#F1F5F9] hover:bg-[#E3EAF2] text-sm font-semibold text-[#0A2358]"
        >
          Search
        </button>
      </form>

      <div className="bg-white rounded-2xl border border-[#E3EAF2] shadow-card overflow-hidden">
        {loading ? (
          <div className="p-10 flex items-center justify-center gap-2 text-sm text-[#5F7088]">
            <Loader2 className="w-4 h-4 animate-spin" />
            Loading…
          </div>
        ) : docs.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="w-10 h-10 text-[#CBD5E1] mx-auto mb-3" />
            <p className="font-semibold text-[#0A2358]">No documents yet</p>
            <p className="text-sm text-[#5F7088] mt-1">
              Upload a lab report with a name and file.
            </p>
            <button
              type="button"
              onClick={openCreate}
              className="mt-4 inline-flex items-center gap-2 h-9 px-4 rounded-xl bg-[#1C7FDB] text-white text-sm font-semibold"
            >
              <Upload className="w-4 h-4" />
              Upload document
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#F8FAFC] border-b border-[#E3EAF2] text-[11px] uppercase tracking-wider text-[#5F7088] font-semibold">
                <tr>
                  <th className="py-3 px-4">Document name</th>
                  <th className="py-3 px-4">File</th>
                  <th className="py-3 px-4">Uploaded</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E3EAF2]">
                {docs.map((doc) => (
                  <tr key={doc.id} className="hover:bg-[#F8FAFC]">
                    <td className="py-3 px-4 font-semibold text-[#0A2358]">{doc.name}</td>
                    <td className="py-3 px-4">
                      {doc.fileUrl ? (
                        <a
                          href={doc.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-semibold text-[#1C7FDB] hover:underline"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          {doc.pdfFilename || 'Open'}
                        </a>
                      ) : (
                        <span className="text-xs text-[#94A3B8]">No file</span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono text-xs text-[#5F7088]">
                      {doc.createdAt
                        ? String(doc.createdAt).slice(0, 10)
                        : '—'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => openEdit(doc)}
                          className="p-2 rounded-lg text-[#5F7088] hover:bg-[#F1F5F9] hover:text-[#0A2358]"
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(doc)}
                          disabled={deletingId === doc.id}
                          className="p-2 rounded-lg text-[#5F7088] hover:bg-red-50 hover:text-[#E5484D] disabled:opacity-50"
                          title="Delete"
                        >
                          {deletingId === doc.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-[#0A2358]/40" onClick={closeDrawer} />
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl border-l border-[#E3EAF2] flex flex-col">
            <div className="h-14 px-5 border-b border-[#E3EAF2] flex items-center justify-between shrink-0">
              <h2 className="font-['Sora'] font-bold text-[#0A2358]">
                {editing ? 'Edit document' : 'Upload document'}
              </h2>
              <button
                type="button"
                onClick={closeDrawer}
                className="p-1.5 rounded-lg text-[#5F7088] hover:bg-[#F1F5F9]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-5">
              <label className="block space-y-1.5">
                <span className="text-xs font-semibold text-[#5F7088]">Document name *</span>
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Tirzepatide 15mg COA – LL-2025-0814"
                  className="w-full h-11 px-3 rounded-xl border border-[#E3EAF2] text-sm outline-none focus:border-[#1C7FDB]"
                />
              </label>

              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-[#5F7088]">
                  File {editing ? '(optional replace)' : '*'}
                </span>
                <label className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-[#CBD5E1] bg-[#F8FAFC] px-4 py-8 cursor-pointer hover:border-[#1C7FDB]">
                  <Upload className="w-5 h-5 text-[#1C7FDB]" />
                  <span className="text-sm font-semibold text-[#0A2358] text-center px-2">
                    {file ? file.name : editing?.pdfFilename || 'Choose PDF, Word, or image'}
                  </span>
                  <span className="text-[11px] text-[#5F7088]">Max 20MB</span>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp"
                    className="hidden"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                  />
                </label>
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={closeDrawer}
                  className="flex-1 h-10 rounded-xl border border-[#E3EAF2] text-sm font-semibold text-[#5F7088]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 h-10 rounded-xl bg-[#1C7FDB] hover:bg-[#1666B5] text-white text-sm font-semibold disabled:opacity-60 inline-flex items-center justify-center gap-2"
                >
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editing ? 'Save' : 'Upload'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
