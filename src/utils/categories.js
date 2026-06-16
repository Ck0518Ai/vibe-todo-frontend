import { formatDate, getTodayStr, getWeekdayKey } from './date';

export function categoryAppliesToDate(cat, dateStr) {
  const today = getTodayStr();

  if (cat.startDate != null || cat.endDate != null || cat.applyFromToday !== undefined) {
    const { startDate, endDate } = cat;
    if (startDate && endDate) return dateStr >= startDate && dateStr <= endDate;
    if (startDate) return dateStr === startDate;
    if (endDate) return dateStr <= endDate;
    if (cat.applyFromToday !== false) return dateStr >= today;
    return false;
  }

  const dates = cat.applyDates || [];
  if (dates.includes(dateStr)) return true;
  if (dateStr === today && cat.applyToday) return true;
  if (dateStr < today && cat.applyPast) return true;
  if (dateStr > today && cat.applyFuture) return true;
  return false;
}

function categoryHasDateSettings(cat) {
  return cat.applyFromToday !== undefined
    || cat.startDate != null
    || cat.endDate != null
    || !!cat.applyPast
    || !!cat.applyToday
    || !!cat.applyFuture
    || !!(cat.applyDates && cat.applyDates.length);
}

function passesDateSettings(cat, dateStr) {
  if ((cat.excludedDates || []).includes(dateStr)) return false;
  if (!categoryHasDateSettings(cat)) return true;
  return categoryAppliesToDate(cat, dateStr);
}

export function getCategoryDateSettings(cat) {
  if (cat.startDate != null || cat.endDate != null || cat.applyFromToday !== undefined) {
    const startDate = cat.startDate || null;
    const endDate = startDate && cat.endDate && cat.endDate !== startDate ? cat.endDate : null;
    return {
      applyFromToday: cat.applyFromToday !== false,
      startDate,
      endDate,
    };
  }

  const dates = [...(cat.applyDates || [])].sort();
  let startDate = dates[0] || null;
  let endDate = dates.length > 1 ? dates[dates.length - 1] : (dates[0] || null);
  if (dates.length === 1) endDate = dates[0];

  const applyFromToday = !cat.applyPast && (cat.applyToday !== false || cat.applyFuture);
  return { applyFromToday, startDate, endDate };
}

export function getCategoriesForDate(dateStr, categories, dateCategories, weekdayDefaults) {
  const explicitIds = dateCategories[dateStr];
  if (explicitIds && explicitIds.length > 0) {
    return categories.filter((c) =>
      explicitIds.includes(c.id) && !(c.excludedDates || []).includes(dateStr)
    );
  }

  const fromRules = categories.filter((cat) => {
    if ((cat.excludedDates || []).includes(dateStr)) return false;
    return categoryAppliesToDate(cat, dateStr);
  });
  if (fromRules.length > 0) return fromRules;

  const key = getWeekdayKey(dateStr);
  const ids = weekdayDefaults[key];
  if (ids && ids.length > 0) {
    return categories.filter((c) => ids.includes(c.id) && passesDateSettings(c, dateStr));
  }
  return categories.filter((c) => passesDateSettings(c, dateStr));
}

export function getFutureDatesWithCategory(categoryId, afterDateStr, categories, dateCategories, weekdayDefaults) {
  const cat = categories.find((c) => c.id === categoryId);
  if (!cat) return [];

  const dates = [];
  const cursor = new Date(`${afterDateStr}T12:00:00`);
  const limit = new Date(`${afterDateStr}T12:00:00`);
  limit.setFullYear(limit.getFullYear() + 1);
  const maxDateStr = cat.endDate && cat.endDate > afterDateStr ? cat.endDate : formatDate(limit);

  while (true) {
    cursor.setDate(cursor.getDate() + 1);
    const dateStr = formatDate(cursor);
    if (dateStr > maxDateStr) break;
    const dayCats = getCategoriesForDate(dateStr, categories, dateCategories, weekdayDefaults);
    if (dayCats.some((c) => c.id === categoryId)) dates.push(dateStr);
  }
  return dates;
}

export function getCategoryCompletion(dateStr, categoryId, todos) {
  const items = todos.filter((t) => t.date === dateStr && t.categoryId === categoryId);
  if (items.length === 0) return false;
  return items.every((t) => t.done);
}
