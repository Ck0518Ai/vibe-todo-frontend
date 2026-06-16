import { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';

export default function RoutineAddModal() {
  const {
    routineAddOpen, closeRoutineAddModal, saveRoutine, categories, addingRoutineCategoryId,
  } = useApp();
  const [text, setText] = useState('');

  useEffect(() => {
    if (routineAddOpen) setText('');
  }, [routineAddOpen]);

  if (!routineAddOpen) return null;

  const cat = categories.find((c) => c.id === addingRoutineCategoryId);

  async function handleConfirm() {
    if (await saveRoutine(text)) closeRoutineAddModal();
  }

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) closeRoutineAddModal(); }}>
      <div className="modal">
        <h2 className="modal__title">{cat ? `${cat.name} — 루틴 추가` : '루틴 추가'}</h2>
        <input
          type="text"
          className="input"
          placeholder="루틴을 입력하세요..."
          maxLength={200}
          autoComplete="off"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleConfirm(); }}
          autoFocus
        />
        <div className="modal__actions">
          <button type="button" className="btn btn--ghost" onClick={closeRoutineAddModal}>취소</button>
          <button type="button" className="btn btn--primary" onClick={handleConfirm}>추가</button>
        </div>
      </div>
    </div>
  );
}
