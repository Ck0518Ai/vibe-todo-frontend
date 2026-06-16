import { useApp } from '../../context/AppContext';
import { formatReminderTime } from '../../utils/reminder';

export default function ReminderScreen() {
  const { reminders, setScreen, openTimePicker, deleteReminder } = useApp();

  return (
    <div className="screen screen--active">
      <header className="sub-header">
        <button type="button" className="sub-header__back" onClick={() => setScreen('main')}>‹</button>
        <h1 className="sub-header__title">리마인더 관리</h1>
        <span className="sub-header__spacer" />
      </header>
      <div className="sub-body">
        <p className="sub-desc">
          오늘 할 일의 알림을 받을 시간을 설정할 수 있습니다. 알림은 매일 발송됩니다.
        </p>
        <div className="section-bar">
          <span className="section-bar__label">리마인더 관리</span>
          <button type="button" className="section-bar__add" onClick={() => openTimePicker()}>
            + 추가하기
          </button>
        </div>
        <div className="reminder-list">
          {reminders.length === 0 ? (
            <p className="weekday-empty">등록된 리마인더가 없습니다. + 추가하기를 눌러주세요.</p>
          ) : (
            reminders.map((r) => (
              <div key={r.id} className="reminder-item">
                <span className="reminder-item__time" onClick={() => openTimePicker(r)} role="button" tabIndex={0}>
                  {formatReminderTime(r)}
                </span>
                <button type="button" className="reminder-item__delete" onClick={() => deleteReminder(r.id)}>
                  삭제
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
