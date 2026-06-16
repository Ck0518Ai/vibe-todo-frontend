import { formatDate } from './date';

export function normalizeDoc(raw) {
  if (!raw || typeof raw !== 'object') return raw;
  const id = raw._id?.toString?.() || raw._id || raw.id;
  const out = { ...raw, id };
  delete out._id;
  delete out.__v;
  return out;
}

export function normalizeList(list) {
  return (Array.isArray(list) ? list : []).map(normalizeDoc);
}

export function normalizeTodo(raw) {
  const doc = raw.id ? raw : normalizeDoc(raw);
  const createdAt = doc.createdAt
    ? new Date(doc.createdAt).getTime()
    : Date.now();
  return {
    id: doc.id,
    text: doc.text || '',
    done: !!doc.done,
    categoryId: doc.categoryId || '',
    date: doc.date?.trim() || formatDate(new Date(createdAt)),
    createdAt,
  };
}
