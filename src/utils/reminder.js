export function to24Hour(period, hour, minute) {
  let h = hour % 12;
  if (period === 'PM') h += 12;
  return `${String(h).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

export function formatReminderTime(r) {
  const [h24, m] = r.time24.split(':');
  const h = parseInt(h24, 10);
  const period = h >= 12 ? '오후' : '오전';
  const h12 = h % 12 || 12;
  return `${period} ${h12}:${m}`;
}
