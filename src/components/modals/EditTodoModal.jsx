import { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';

export default function EditTodoModal() {
  const {
    editModalOpen, closeEditTodoModal, updateTodo, editingTodoId, todos,
  } = useApp();
  const [text, setText] = useState('');

  useEffect(() => {
    if (editModalOpen && editingTodoId) {
      const todo = todos.find((t) => t.id === editingTodoId);
      setText(todo?.text || '');
    }
  }, [editModalOpen, editingTodoId, todos]);

  if (!editModalOpen) return null;

  async function handleSave() {
    if (editingTodoId && (await updateTodo(editingTodoId, text))) {
      closeEditTodoModal();
    }
  }

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) closeEditTodoModal(); }}>
      <div className="modal">
        <h2 className="modal__title">할일 수정</h2>
        <input
          type="text"
          className="input"
          maxLength={200}
          autoComplete="off"
          value={text}
          onChange={(e) => setText(e.target.value)}
          autoFocus
        />
        <div className="modal__actions">
          <button type="button" className="btn btn--ghost" onClick={closeEditTodoModal}>취소</button>
          <button type="button" className="btn btn--primary" onClick={handleSave}>저장</button>
        </div>
      </div>
    </div>
  );
}
