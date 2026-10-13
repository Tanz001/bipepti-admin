import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Upload, X, FileSpreadsheet, CheckCircle2, AlertCircle, Download } from 'lucide-react';
import { Product } from '../../types/product';
import { useProducts } from '../../context/ProductsContext';

export const CsvImportModal: React.FC = () => {
  const { isImportModalOpen, closeImportModal, importFromCsv } = useProducts();
  const [parsedRows, setParsedRows] = useState<Partial<Product>[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isImportModalOpen) return null;

  // Simple CSV parser supporting quotes
  const parseCsvText = (text: string) => {
    const lines = text.split(/\r?\n/).filter((line) => line.trim().length > 0);
    if (lines.length < 2) {
      setErrors(['CSV must have at least a header row and one data row.']);
      return;
    }

    const header = lines[0].split(',').map((h) => h.trim().replace(/^"|"$/g, '').toLowerCase());
    const skuIndex = header.findIndex((h) => h.includes('sku'));
    const nameIndex = header.findIndex((h) => h.includes('name'));
    const specIndex = header.findIndex((h) => h.includes('spec'));
    const catIndex = header.findIndex((h) => h.includes('cat'));
    const priceIndex = header.findIndex((h) => h.includes('price'));
    const purityIndex = header.findIndex((h) => h.includes('purity'));

    if (nameIndex === -1 || skuIndex === -1) {
      setErrors(['CSV must contain columns for "Name" and "SKU".']);
      return;
    }

    const rows: Partial<Product>[] = [];
    const parseErrors: string[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      // Regex to split by comma outside quotes
      const cells = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || line.split(',');
      const cleanCells = cells.map((c) => c.trim().replace(/^"|"$/g, ''));

      const name = cleanCells[nameIndex];
      const sku = cleanCells[skuIndex];

      if (!name || !sku) {
        parseErrors.push(`Row ${i + 1}: Missing name or SKU.`);
        continue;
      }

      const spec = specIndex !== -1 ? cleanCells[specIndex] : '5mg*10vials';
      const category = catIndex !== -1 ? cleanCells[catIndex] : 'GLP-1 & Metabolic';
      const priceRaw = priceIndex !== -1 ? cleanCells[priceIndex] : '100';
      const purityRaw = purityIndex !== -1 ? cleanCells[purityIndex] : '99.5';

      rows.push({
        name,
        sku: sku.toUpperCase(),
        spec: spec || '5mg*10vials',
        category: category || 'Specialty Research',
        price: parseFloat(priceRaw) || 99,
        purity: parseFloat(purityRaw) || 99.5,
        status: 'active',
        stock: 'in_stock',
      });
    }

    setParsedRows(rows);
    setErrors(parseErrors);
  };

  const handleFileUpload = (file: File) => {
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (content) {
        parseCsvText(content);
      }
    };
    reader.readAsText(file);
  };

  const handleConfirmImport = async () => {
    if (parsedRows.length === 0) return;
    setIsProcessing(true);
    try {
      const res = await importFromCsv(parsedRows);
      if (res.errors.length > 0) {
        setErrors(res.errors);
      } else {
        closeImportModal();
        setParsedRows([]);
        setFileName(null);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // Download sample template
  const handleDownloadSample = () => {
    const sample = `SKU,Name,Specification,Category,Price,Purity\nAOD20,AOD9604,20mg*10vials,GLP-1 & Metabolic,185,99.6\nBPC20,BPC-157,20mg*10vials,Tissue Repair & Recovery,160,99.8\nLL37,LL-37,5mg*10vials,Specialty Research,82,99.2`;
    const blob = new Blob([sample], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'biopepti-sample-import.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeImportModal}
          className="fixed inset-0 bg-[#0A2358]/50 backdrop-blur-xs transition-opacity"
          aria-hidden="true"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="relative bg-white rounded-2xl border border-[#E3EAF2] shadow-2xl p-6 max-w-2xl w-full z-10 max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-[#E3EAF2]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#EAF3FD] text-[#1C7FDB] flex items-center justify-center">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-['Sora'] font-bold text-base text-[#0A2358]">
                  Import Products via CSV
                </h3>
                <p className="text-xs text-[#5F7088]">
                  Bulk upload or update catalog peptide formulations
                </p>
              </div>
            </div>

            <button
              onClick={closeImportModal}
              className="p-1.5 text-[#5F7088] hover:text-[#0A2358] rounded-xl hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto py-5 space-y-4">
            {/* Upload Zone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-[#CBD5E1] hover:border-[#1C7FDB] rounded-2xl p-8 text-center cursor-pointer transition-colors bg-[#F8FAFC] hover:bg-[#EAF3FD]/30"
            >
              <Upload className="w-8 h-8 mx-auto text-[#1C7FDB] mb-2" />
              <p className="text-sm font-semibold text-[#0A2358]">
                {fileName ? `Loaded: ${fileName}` : 'Choose a .csv file or drag it here'}
              </p>
              <p className="text-xs text-[#5F7088] mt-1">
                Required columns: <strong>Name</strong> and <strong>SKU</strong>. Optional: Specification, Category, Price, Purity.
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileUpload(e.target.files[0]);
                  }
                }}
                className="hidden"
              />
            </div>

            {/* Download Template Link */}
            <div className="flex items-center justify-between px-1 text-xs">
              <span className="text-[#5F7088]">Need an example format?</span>
              <button
                type="button"
                onClick={handleDownloadSample}
                className="font-semibold text-[#1C7FDB] hover:underline inline-flex items-center gap-1"
              >
                <Download className="w-3.5 h-3.5" />
                Download Sample CSV
              </button>
            </div>

            {/* Errors summary */}
            {errors.length > 0 && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-[#E5484D] space-y-1">
                <div className="flex items-center gap-1.5 font-bold">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>Validation Notices ({errors.length}):</span>
                </div>
                <ul className="list-disc list-inside pl-1 text-[11px] space-y-0.5">
                  {errors.slice(0, 4).map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                  {errors.length > 4 && <li>...and {errors.length - 4} more.</li>}
                </ul>
              </div>
            )}

            {/* Parsed Rows Mapping Preview */}
            {parsedRows.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold text-[#0A2358] uppercase tracking-wider">
                    Ready to Import ({parsedRows.length} items)
                  </h4>
                  <span className="text-xs text-[#12B8A6] flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Mapped
                  </span>
                </div>

                <div className="border border-[#E3EAF2] rounded-xl overflow-hidden max-h-48 overflow-y-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 border-b border-[#E3EAF2] text-[#5F7088] font-mono sticky top-0">
                      <tr>
                        <th className="p-2">SKU</th>
                        <th className="p-2">Name</th>
                        <th className="p-2">Spec</th>
                        <th className="p-2 text-right">Price</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E3EAF2]">
                      {parsedRows.slice(0, 10).map((r, i) => (
                        <tr key={i} className="hover:bg-slate-50">
                          <td className="p-2 font-mono font-bold text-[#0A2358]">{r.sku}</td>
                          <td className="p-2 font-medium">{r.name}</td>
                          <td className="p-2 text-[#5F7088]">{r.spec}</td>
                          <td className="p-2 font-mono text-right">${r.price}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-[#E3EAF2] flex items-center justify-end gap-3">
            <button
              onClick={closeImportModal}
              className="px-4 py-2 text-xs font-semibold text-[#5F7088] hover:text-[#0A2358] hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>

            <button
              onClick={handleConfirmImport}
              disabled={parsedRows.length === 0 || isProcessing}
              className="px-5 py-2 text-xs font-bold text-white bg-brand-gradient hover:opacity-95 rounded-xl shadow-md transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isProcessing ? 'Importing...' : `Confirm Import (${parsedRows.length})`}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
