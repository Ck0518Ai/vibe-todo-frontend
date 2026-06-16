import { useApp } from '../../context/AppContext';
import { DELETED_CATEGORY_COLOR } from '../../constants';
import { useLongPress } from '../../hooks/useLongPress';
import { weekdayLabel } from '../../utils/date';

function TodoItem({ todo, cat }) {
  const { toggleTodo, openEditTodoModal, deleteTodo } = useApp();
  const color = cat?.color || DELETED_CATEGORY_COLOR;

  return (
    <li className={`todo-item${todo.done ? ' todo-item--done' : ''}`}>
      <button
        type="button"
        className={`todo-item__check${todo.done ? ' todo-item__check--done' : ''}`}
        style={todo.done ? { background: color } : undefined}
        onClick={() => toggleTodo(todo.id)}
        aria-label={todo.done ? '완료 취소' : '완료'}
      />
      <span className="todo-item__text">{todo.text}</span>
      <div className="todo-item__actions">
        <button type="button" className="todo-item__btn" onClick={() => openEditTodoModal(todo.id)}>
          수정
        </button>
        <button type="button" className="todo-item__btn" onClick={() => deleteTodo(todo.id)}>
          삭제
        </button>
      </div>
    </li>
  );
}

function CategoryBlock({ cat }) {
  const { todos, selectedDate, toggleCategoryLock, openAddTodoModal, openEditCategoryForm } = useApp();
  const longPress = useLongPress(() => openEditCategoryForm(cat, 'main'));
  const dayTodos = todos.filter((t) => t.date === selectedDate && t.categoryId === cat.id);

  return (
    <div className="category-block">
      <div className="category-pill category-pill--pressable" {...longPress}>
        <button
          type="button"
          className="category-pill__lock"
          title={cat.locked !== false ? '잠금 해제' : '잠금'}
          onClick={(e) => { e.stopPropagation(); toggleCategoryLock(cat); }}
        >
          {cat.locked !== false ? '🔒' : '🔓'}
        </button>
        <span className="category-pill__name" style={{ color: cat.color }}>{cat.name}</span>
        <button
          type="button"
          className="category-pill__add"
          title="할일 추가"
          onClick={(e) => { e.stopPropagation(); openAddTodoModal(cat); }}
        >
          +
        </button>
      </div>
      <ul className="todo-list">
        {dayTodos.map((todo) => (
          <TodoItem key={todo.id} todo={todo} cat={cat} />
        ))}
      </ul>
    </div>
  );
}

function DeletedCategoryBlock({ categoryId, orphanTodos }) {
  const cat = { id: categoryId, name: '삭제된 카테고리', color: DELETED_CATEGORY_COLOR, deleted: true };

  return (
    <div className="category-block category-block--deleted">
      <div className="category-pill category-pill--deleted">
        <span className="category-pill__name" style={{ color: cat.color }}>{cat.name}</span>
      </div>
      <ul className="todo-list">
        {orphanTodos.map((todo) => (
          <TodoItem key={todo.id} todo={todo} cat={cat} />
        ))}
      </ul>
    </div>
  );
}

export default function CategoryList() {
  const {
    todos, categories, selectedDate, openAddCategoryForm, getDayCategories,
  } = useApp();

  const dayTodos = todos.filter((t) => t.date === selectedDate);
  const dayCats = getDayCategories(selectedDate);
  const orphanTodos = dayTodos.filter(
    (t) => t.categoryId && !categories.some((c) => c.id === t.categoryId)
  );
  const orphanGroups = {};
  orphanTodos.forEach((t) => {
    if (!orphanGroups[t.categoryId]) orphanGroups[t.categoryId] = [];
    orphanGroups[t.categoryId].push(t);
  });

  return (
    <section className="categories">
      <button type="button" className="category-add-btn home-add-category" onClick={() => openAddCategoryForm('main')}>
        + 카테고리 만들기
      </button>

      {dayCats.length === 0 && orphanTodos.length === 0 ? (
        <p className="weekday-empty">
          {weekdayLabel(selectedDate)}요일({selectedDate})에 적용된 카테고리가 없습니다.
        </p>
      ) : (
        <>
          {dayCats.map((cat) => (
            <CategoryBlock key={cat.id} cat={cat} />
          ))}
          {Object.entries(orphanGroups).map(([categoryId, items]) => (
            <DeletedCategoryBlock key={categoryId} categoryId={categoryId} orphanTodos={items} />
          ))}
        </>
      )}
    </section>
  );
}
