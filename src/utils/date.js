import { DAY_LABELS, WEEKDAY_KEYS } from '../constants';

export function formatDate(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getTodayStr() {
  return formatDate(new Date());
}

export function getWeekdayKey(dateStr) {
  const date = new Date(`${dateStr}T12:00:00`);
  const day = date.getDay();
  return WEEKDAY_KEYS[day === 0 ? 6 : day - 1];
}

export function getWeekdayIndex(dateStr) {
  const date = new Date(`${dateStr}T12:00:00`);
  const day = date.getDay();
  return day === 0 ? 6 : day - 1;
}

export function getWeekDays(anchor) {
  const d = new Date(anchor);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(d);
  monday.setDate(d.getDate() + diff);
  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    return date;
  });
}

export function getWeekLabel(anchor) {
  return `${anchor.getFullYear()}년 ${anchor.getMonth() + 1}월 ${Math.ceil(anchor.getDate() / 7)}주차`;
}

export function getDatesInRange(fromStr, toStr) {
  const from = fromStr <= toStr ? fromStr : toStr;
  const to = fromStr <= toStr ? toStr : fromStr;
  const dates = [];
  const cursor = new Date(`${from}T12:00:00`);
  const end = new Date(`${to}T12:00:00`);
  while (cursor <= end) {
    dates.push(formatDate(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return dates;
}

export function weekdayLabel(dateStr) {
  return DAY_LABELS[getWeekdayIndex(dateStr)];
}
