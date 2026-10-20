import { apiRequest, resolveMediaUrl } from './api';

export interface CoaDocument {
  id: string;
  name: string;
  pdfFilename: string;
  fileUrl?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

function mapDoc(doc: CoaDocument): CoaDocument {
  return {
    ...doc,
    fileUrl: resolveMediaUrl(doc.fileUrl) || null,
  };
}

export async function fetchCoaDocuments(q?: string): Promise<CoaDocument[]> {
  const query = q?.trim() ? `?q=${encodeURIComponent(q.trim())}` : '';
  const data = await apiRequest<{ documents: CoaDocument[] }>(`/api/coa${query}`);
  return (data.documents || []).map(mapDoc);
}

export async function createCoaDocument(name: string, file: File): Promise<CoaDocument> {
  const form = new FormData();
  form.append('name', name);
  form.append('document', file);
  const res = await apiRequest<{ document: CoaDocument }>('/api/coa', {
    method: 'POST',
    formData: form,
  });
  return mapDoc(res.document);
}

export async function updateCoaDocument(
  id: string,
  name: string,
  file?: File | null
): Promise<CoaDocument> {
  const form = new FormData();
  form.append('name', name);
  if (file) form.append('document', file);
  const res = await apiRequest<{ document: CoaDocument }>(`/api/coa/${id}`, {
    method: 'PUT',
    formData: form,
  });
  return mapDoc(res.document);
}

export async function deleteCoaDocument(id: string): Promise<void> {
  await apiRequest(`/api/coa/${id}`, { method: 'DELETE' });
}
