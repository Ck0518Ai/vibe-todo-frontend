import { DAY_LABELS } from '../../constants';
import { formatDate, getDatesInRange, getTodayStr } from '../../utils/date';

function getDeleteRangeBounds(draft) {
  const { deleteStartDate, deleteEndDate } = draft;
  if (!deleteStartDate || !deleteEndDate) return null;
  return deleteStartDate <= deleteEndDate
    ? { from: deleteStartDate, to: deleteEndDate }
    : { from: deleteEndDate, to: deleteStartDate };
}

function isDateInDeleteRange(dateStr, draft) {
  const { deleteStartDate, deleteEndDate } = draft;
  if (!deleteStartDate) return false;
  if (!deleteEndDate) return dateStr === deleteStartDate;
  const [from, to] = deleteStartDate <= deleteEndDate
    ? [deleteStartDate, deleteEndDate]
    : [deleteEndDate, deleteStartDate];
  return dateStr >= from && dateStr <= to;
}

function getFormRangeBounds(draft) {
  const { startDate, endDate } = draft;
  if (!startDate || !endDate) return null;
  return startDate <= endDate
    ? { from: startDate, to: endDate }
    : { from: endDate, to: startDate };
}

function isDateInFormRange(dateStr, draft) {
  const { startDate, endDate } = draft;
  if (!startDate) return false;
  if (!endDate) return dateStr === startDate;
  const [from, to] = startDate <= endDate ? [startDate, endDate] : [endDate, startDate];
  return dateStr >= from && dateStr <= to;
}

function getDayClass(dateStr, draft, deleteMode, today) {
  const excluded = new Set(draft.excludedDates || []);
  let cls = 'form-cal-day';

  if (deleteMode) {
    const deleteBounds = getDeleteRangeBounds(draft);
    const { deleteStartDate, deleteEndDate } = draft;
    if (excluded.has(dateStr)) cls += ' form-cal-day--excluded';
    if (deleteBounds && isDateInDeleteRange(dateStr, draft)) {
      cls += ' form-cal-day--delete-range';
      if (dateStr === deleteBounds.from) cls += ' form-cal-day--delete-start';
      if (dateStr === deleteBounds.to) cls += ' form-cal-day--delete-end';
    } else if (deleteStartDate && !deleteEndDate && dateStr === deleteStartDate) {
      cls += ' form-cal-day--delete-selected';
    }
    if (dateStr === today) cls += ' form-cal-day--today';
    return cls;
  }

  const bounds = getFormRangeBounds(draft);
  const { startDate, endDate } = draft;
  if (bounds && isDateInFormRange(dateStr, draft)) {
    cls += ' form-cal-day--range';
    if (dateStr === bounds.from) cls += ' form-cal-day--range-start';
    if (dateStr === bounds.to) cls += ' form-cal-day--range-end';
  } else if (startDate && !endDate && dateStr === startDate) {
    cls += ' form-cal-day--selected';
  }
  if (dateStr === today) cls += ' form-cal-day--today';
  return cls;
}

export function getSelectedDatesLabel(draft, deleteMode) {
  if (deleteMode) {
    const { deleteStartDate, deleteEndDate } = draft;
    if (deleteStartDate && deleteEndDate) {
      return deleteStartDate === deleteEndDate
        ? `삭제할 날짜: ${deleteStartDate} (당일만)`
        : `삭제할 날짜: ${deleteStartDate} ~ ${deleteEndDate}`;
    }
    if (deleteStartDate) return `삭제할 날짜: ${deleteStartDate} (당일만)`;
    return '삭제할 날짜를 선택하세요';
  }

  const { startDate, endDate, applyFromToday } = draft;
  if (startDate && endDate) {
    return startDate === endDate
      ? `적용 기간: ${startDate}`
      : `적용 기간: ${startDate} ~ ${endDate}`;
  }
  if (startDate) return `적용 기간: ${startDate} (당일만)`;
  return applyFromToday ? '적용 기간: 오늘부터' : '적용 기간: 없음';
}

export function toggleFormDate(dateStr, draft, deleteMode) {
  if (deleteMode) {
    const { deleteStartDate, deleteEndDate } = draft;
    if (!deleteStartDate || (deleteStartDate && deleteEndDate)) {
      return { ...draft, deleteStartDate: dateStr, deleteEndDate: null };
    }
    if (dateStr === deleteStartDate) {
      return { ...draft, deleteStartDate: null, deleteEndDate: null };
    }
    return { ...draft, deleteEndDate: dateStr };
  }

  const { startDate, endDate } = draft;
  if (!startDate || (startDate && endDate)) {
    return { ...draft, startDate: dateStr, endDate: null };
  }
  if (dateStr === startDate) {
    return { ...draft, startDate: null, endDate: null };
  }
  return { ...draft, endDate: dateStr };
}

export default function FormCalendar({ anchor, draft, deleteMode, onToggleDate }) {
  const year = anchor.getFullYear();
  const month = anchor.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDate = new Date(year, month + 1, 0).getDate();
  const startOffset = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
  const today = getTodayStr();

  const cells = [];

  DAY_LABELS.forEach((label) => {
    cells.push(
      <span
        key={`h-${label}`}
        className="form-cal-day form-cal-day--empty"
        style={{ visibility: 'visible', fontSize: '0.65rem', opacity: 0.6, pointerEvents: 'none' }}
      >
        {label}
      </span>
    );
  });

  for (let i = 0; i < startOffset; i++) {
    cells.push(<span key={`e-${i}`} className="form-cal-day form-cal-day--empty" />);
  }

  for (let d = 1; d <= lastDate; d++) {
    const date = new Date(year, month, d);
    const dateStr = formatDate(date);
    cells.push(
      <button
        key={dateStr}
        type="button"
        className={getDayClass(dateStr, draft, deleteMode, today)}
        onClick={() => onToggleDate(dateStr)}
      >
        {d}
      </button>
    );
  }

  return <div className="form-calendar__grid">{cells}</div>;
}

export { getDatesInRange };
