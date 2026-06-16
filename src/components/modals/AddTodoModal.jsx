import { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';

export default function AddTodoModal() {
  const {
    addModalOpen, closeAddTodoModal, addTodo, categories, addingCategoryId,
    addFutureDates, addFutureChecked, setAddFutureChecked,
  } = useApp();
  const [text, setText] = useState('');

  useEffect(() => {
    if (addModalOpen) setText('');
  }, [addModalOpen]);

  if (!addModalOpen) return null;

  const cat = categories.find((c) => c.id === addingCategoryId);

  async function handleConfirm() {
    const ok = await addTodo(text, addFutureChecked);
    if (ok) closeAddTodoModal();
  }

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) closeAddTodoModal(); }}>
      <div className="modal">
        <h2 className="modal__title">{cat ? `${cat.name} — 할일 추가` : '할일 추가'}</h2>
        <input
          type="text"
          className="input"
          placeholder="할일을 입력하세요..."
          maxLength={200}
          autoComplete="off"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleConfirm(); }}
          autoFocus
        />
        {addFutureDates.length > 0 && (
          <label className="modal-check">
            <input
              type="checkbox"
              checked={addFutureChecked}
              onChange={(e) => setAddFutureChecked(e.target.checked)}
            />
            <span>{`미래 ${addFutureDates.length}일에도 같은 할일 추가`}</span>
          </label>
        )}
        <div className="modal__actions">
          <button type="button" className="btn btn--ghost" onClick={closeAddTodoModal}>취소</button>
          <button type="button" className="btn btn--primary" onClick={handleConfirm}>추가</button>
        </div>
      </div>
    </div>
  );
}
