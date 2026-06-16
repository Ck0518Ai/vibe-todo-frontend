import { useEffect, useRef, useState } from 'react';
import { useApp } from '../../context/AppContext';
import FormCalendar, { getSelectedDatesLabel, toggleFormDate } from '../category/FormCalendar';

export default function CategoryFormScreen() {
  const {
    editingCategoryId,
    categoryFormDraft,
    setCategoryFormDraft,
    formCalendarAnchor,
    setFormCalendarAnchor,
    categoryFormDeleteMode,
    setCategoryFormDeleteMode,
    handleSaveCategoryForm,
    setScreen,
    setColorSheetOpen,
    setPrivacySheetOpen,
  } = useApp();

  const [name, setName] = useState('');
  const nameRef = useRef(null);

  useEffect(() => {
    setName(categoryFormDraft.name);
    nameRef.current?.focus();
  }, [editingCategoryId, categoryFormDraft.name]);

  const datesLabel = getSelectedDatesLabel(categoryFormDraft, categoryFormDeleteMode);

  async function onSave() {
    await handleSaveCategoryForm(name);
  }

  return (
    <div className="screen screen--active">
      <header className="sub-header">
        <button type="button" className="sub-header__back" onClick={() => setScreen('main')}>‹</button>
        <h1 className="sub-header__title">{editingCategoryId ? '카테고리 편집' : '카테고리 등록'}</h1>
        <button type="button" className="sub-header__done" onClick={onSave}>완료</button>
      </header>
      <div className="sub-body">
        <input
          ref={nameRef}
          type="text"
          className="underline-input"
          placeholder="카테고리 입력"
          maxLength={30}
          autoComplete="off"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <div className="settings-card">
          <button type="button" className="settings-row" onClick={() => setPrivacySheetOpen(true)}>
            <span className="settings-row__label">공개설정</span>
            <span className="settings-row__value">
              <span>{categoryFormDraft.isPrivate ? '🔒 나만 보기' : '🌐 전체 공개'}</span>
              <span className="settings-row__arrow">›</span>
            </span>
          </button>
          <button type="button" className="settings-row" onClick={() => setColorSheetOpen(true)}>
            <span className="settings-row__label">색상</span>
            <span className="settings-row__value">
              <span className="color-dot" style={{ background: categoryFormDraft.color }} />
              <span className="settings-row__arrow">›</span>
            </span>
          </button>
        </div>

        <p className="field-label">적용 시점</p>
        <div className="scope-checks">
          <label className="scope-check">
            <input
              type="checkbox"
              checked={categoryFormDraft.applyFromToday}
              onChange={(e) => {
                setCategoryFormDraft({ ...categoryFormDraft, applyFromToday: e.target.checked });
              }}
            />
            오늘부터
          </label>
        </div>

        <p className={`field-label${categoryFormDeleteMode ? ' field-label--danger' : ''}`}>
          {categoryFormDeleteMode ? (
            <>삭제할 날짜 <span className="field-hint">(한 번 탭: 당일만 · 두 번 탭: 기간 · 완료로 저장)</span></>
          ) : (
            <>적용 기간 <span className="field-hint">(한 번 탭: 당일만 · 두 번 탭: 기간)</span></>
          )}
        </p>
        <div className={`form-calendar${categoryFormDeleteMode ? ' form-calendar--delete-mode' : ''}`} id="formCalendarWrap">
          <div className="form-calendar__nav">
            <button
              type="button"
              className="form-calendar__btn"
              onClick={() => {
                const next = new Date(formCalendarAnchor);
                next.setMonth(next.getMonth() - 1);
                setFormCalendarAnchor(next);
              }}
            >
              ‹
            </button>
            <span className="form-calendar__title">
              {formCalendarAnchor.getFullYear()}년 {formCalendarAnchor.getMonth() + 1}월
            </span>
            <button
              type="button"
              className="form-calendar__btn"
              onClick={() => {
                const next = new Date(formCalendarAnchor);
                next.setMonth(next.getMonth() + 1);
                setFormCalendarAnchor(next);
              }}
            >
              ›
            </button>
          </div>
          <FormCalendar
            anchor={formCalendarAnchor}
            draft={categoryFormDraft}
            deleteMode={categoryFormDeleteMode}
            onToggleDate={(dateStr) => {
              setCategoryFormDraft(toggleFormDate(dateStr, categoryFormDraft, categoryFormDeleteMode));
            }}
          />
        </div>
        <p className={`selected-dates${categoryFormDeleteMode ? ' selected-dates--danger' : ''}`}>
          {datesLabel}
        </p>
        {editingCategoryId && (
          <button
            type="button"
            className={`btn btn--ghost btn--full${categoryFormDeleteMode ? ' btn--danger-outline' : ''}`}
            onClick={() => setCategoryFormDeleteMode(!categoryFormDeleteMode)}
          >
            {categoryFormDeleteMode ? '삭제 취소' : '적용 삭제'}
          </button>
        )}
      </div>
    </div>
  );
}
