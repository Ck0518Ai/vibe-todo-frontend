import { useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { useDragReorder } from '../../hooks/useDragReorder';

export default function CategoryManageScreen() {
  const {
    categories, setScreen, openAddCategoryForm, openEditCategoryForm, deleteCategory, reorderCategories,
  } = useApp();
  const listRef = useRef(null);

  useDragReorder(listRef, '.drag-item', reorderCategories);

  return (
    <div className="screen screen--active">
      <header className="sub-header">
        <button type="button" className="sub-header__back" onClick={() => setScreen('main')}>‹</button>
        <h1 className="sub-header__title">카테고리 관리</h1>
        <span className="sub-header__spacer" />
      </header>
      <div className="sub-body">
        <p className="sub-desc">
          항목을 누른 채 드래그하면 순서를 바꿀 수 있습니다. 편집·삭제 버튼으로 카테고리를 관리하세요.
        </p>
        <div className="section-bar">
          <span className="section-bar__label">일반</span>
          <button type="button" className="section-bar__add" onClick={() => openAddCategoryForm('categoryManage')}>
            + 추가하기
          </button>
        </div>
        <div className="drag-list" ref={listRef}>
          {categories.length === 0 ? (
            <p className="weekday-empty">등록된 카테고리가 없습니다.</p>
          ) : (
            categories.map((cat) => (
              <div key={cat.id} className="drag-item" data-id={cat.id}>
                <span className="drag-item__handle">|||</span>
                <span className="drag-item__lock">{cat.locked !== false ? '🔒' : ''}</span>
                <span className="drag-item__name" style={{ color: cat.color }}>{cat.name}</span>
                <button
                  type="button"
                  className="drag-item__edit"
                  onClick={(e) => { e.stopPropagation(); openEditCategoryForm(cat, 'categoryManage'); }}
                >
                  편집
                </button>
                <button
                  type="button"
                  className="drag-item__delete"
                  onClick={(e) => { e.stopPropagation(); deleteCategory(cat.id); }}
                >
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
