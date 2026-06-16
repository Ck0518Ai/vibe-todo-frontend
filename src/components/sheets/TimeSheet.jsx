import { useApp } from '../../context/AppContext';

export default function TimeSheet() {
  const {
    timeSheetOpen, setTimeSheetOpen, timePickerDraft, setTimePickerDraft, saveReminderTime,
  } = useApp();

  if (!timeSheetOpen) return null;

  const hours = Array.from({ length: 12 }, (_, i) => i + 1);
  const minutes = Array.from({ length: 12 }, (_, i) => i * 5);

  return (
    <div className="sheet-overlay" onClick={(e) => { if (e.target === e.currentTarget) setTimeSheetOpen(false); }}>
      <div className="sheet sheet--time">
        <h3 className="sheet__title">리마인더 시간</h3>
        <div className="ampm-toggle">
          {['AM', 'PM'].map((period) => (
            <button
              key={period}
              type="button"
              className={`ampm-btn${timePickerDraft.period === period ? ' ampm-btn--active' : ''}`}
              onClick={() => setTimePickerDraft({ ...timePickerDraft, period })}
            >
              {period === 'AM' ? '오전' : '오후'}
            </button>
          ))}
        </div>
        <p className="time-label">시</p>
        <div className="time-grid">
          {hours.map((h) => (
            <button
              key={h}
              type="button"
              className={`time-btn${timePickerDraft.hour === h ? ' time-btn--active' : ''}`}
              onClick={() => setTimePickerDraft({ ...timePickerDraft, hour: h })}
            >
              {h}
            </button>
          ))}
        </div>
        <p className="time-label">분</p>
        <div className="time-grid time-grid--minutes">
          {minutes.map((m) => (
            <button
              key={m}
              type="button"
              className={`time-btn${timePickerDraft.minute === m ? ' time-btn--active' : ''}`}
              onClick={() => setTimePickerDraft({ ...timePickerDraft, minute: m })}
            >
              {String(m).padStart(2, '0')}
            </button>
          ))}
        </div>
        <button type="button" className="btn btn--primary btn--full" onClick={saveReminderTime}>
          완료
        </button>
      </div>
    </div>
  );
}
