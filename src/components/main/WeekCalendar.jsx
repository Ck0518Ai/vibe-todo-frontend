import CloverSVG from '../CloverSVG';
import { useApp } from '../../context/AppContext';
import { DAY_LABELS } from '../../constants';
import { formatDate, getWeekDays, getWeekLabel } from '../../utils/date';

export default function WeekCalendar() {
  const {
    weekAnchor, shiftWeek, selectedDate, setSelectedDate, getDayCategories, todos,
  } = useApp();

  const days = getWeekDays(weekAnchor);

  return (
    <section className="calendar">
      <div className="calendar__header">
        <button type="button" className="calendar__nav" onClick={() => shiftWeek(-7)} aria-label="이전 주">
          ‹
        </button>
        <h2 className="calendar__title">{getWeekLabel(weekAnchor)}</h2>
        <button type="button" className="calendar__nav" onClick={() => shiftWeek(7)} aria-label="다음 주">
          ›
        </button>
      </div>
      <div className="calendar__week">
        {days.map((date, i) => {
          const dateStr = formatDate(date);
          const isSelected = dateStr === selectedDate;
          const dayCats = getDayCategories(dateStr);
          const cloverSize = dayCats.length === 1 ? 32 : 28;

          return (
            <button
              key={dateStr}
              type="button"
              className={`day-col${isSelected ? ' day-col--selected' : ''}`}
              onClick={() => setSelectedDate(dateStr)}
            >
              <span className={`day-col__label${i === 5 ? ' day-col__label--sat' : ''}${i === 6 ? ' day-col__label--sun' : ''}`}>
                {DAY_LABELS[i]}
              </span>
              <div className={`day-col__clover${dayCats.length === 1 ? ' day-col__clover--single' : ''}`}>
                <CloverSVG cats={dayCats} dateStr={dateStr} todos={todos} size={cloverSize} />
              </div>
              <span
                className={`day-col__date${isSelected ? ' day-col__date--selected' : ''}${i === 5 ? ' day-col__date--sat' : ''}${i === 6 ? ' day-col__date--sun' : ''}`}
              >
                {date.getDate()}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
