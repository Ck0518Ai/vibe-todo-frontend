import { useApp } from '../../context/AppContext';

export default function RoutineScreen() {
  const {
    categories, routines, setScreen, openRoutineAddModal, deleteRoutine,
  } = useApp();

  return (
    <div className="screen screen--active">
      <header className="sub-header">
        <button type="button" className="sub-header__back" onClick={() => setScreen('main')}>‹</button>
        <h1 className="sub-header__title">루틴 관리</h1>
        <span className="sub-header__spacer" />
      </header>
      <div className="sub-body">
        <p className="sub-desc">
          카테고리를 탭하여 루틴을 추가하거나 항목을 드래그하여 순서를 변경할 수 있습니다.
        </p>
        <div className="drag-list">
          {categories.length === 0 ? (
            <p className="weekday-empty">먼저 카테고리를 등록하세요.</p>
          ) : (
            categories.map((cat) => {
              const catRoutines = routines.filter((r) => r.categoryId === cat.id);
              return (
                <div key={cat.id} className="routine-block">
                  <div className="drag-item" data-id={cat.id}>
                    <span className="drag-item__handle">|||</span>
                    <span className="drag-item__name" style={{ color: cat.color }}>{cat.name}</span>
                    <button
                      type="button"
                      className="drag-item__add"
                      onClick={() => openRoutineAddModal(cat)}
                    >
                      +
                    </button>
                  </div>
                  {catRoutines.length > 0 && (
                    <ul className="routine-sublist">
                      {catRoutines.map((r) => (
                        <li key={r.id} className="routine-subitem">
                          {r.text}
                          <button
                            type="button"
                            className="routine-subitem__delete"
                            onClick={() => deleteRoutine(r.id)}
                          >
                            삭제
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
