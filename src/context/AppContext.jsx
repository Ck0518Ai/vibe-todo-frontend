import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { apiFetch } from '../api/client';
import { COLOR_PRESETS } from '../constants';
import {
  getCategoriesForDate,
  getCategoryDateSettings,
  getFutureDatesWithCategory,
} from '../utils/categories';
import { normalizeList, normalizeTodo } from '../utils/document';
import { formatDate } from '../utils/date';
import { to24Hour } from '../utils/reminder';

const AppContext = createContext(null);

const emptyFormDraft = () => ({
  name: '',
  color: COLOR_PRESETS[0],
  isPrivate: true,
  applyFromToday: true,
  startDate: null,
  endDate: null,
  excludedDates: [],
  deleteStartDate: null,
  deleteEndDate: null,
});

export function AppProvider({ children, apiUrl }) {
  const [todos, setTodos] = useState([]);
  const [categories, setCategories] = useState([]);
  const [routines, setRoutines] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [weekdayDefaults, setWeekdayDefaults] = useState({});
  const [dateCategories, setDateCategories] = useState({});
  const [selectedDate, setSelectedDate] = useState(() => formatDate());
  const [weekAnchor, setWeekAnchor] = useState(() => new Date());
  const [screen, setScreen] = useState('main');
  const [returnScreen, setReturnScreen] = useState('main');
  const [loading, setLoading] = useState(true);

  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [categoryFormDraft, setCategoryFormDraft] = useState(emptyFormDraft);
  const [formCalendarAnchor, setFormCalendarAnchor] = useState(() => new Date());
  const [categoryFormDeleteMode, setCategoryFormDeleteModeState] = useState(false);

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addingCategoryId, setAddingCategoryId] = useState(null);
  const [addFutureDates, setAddFutureDates] = useState([]);
  const [addFutureChecked, setAddFutureChecked] = useState(false);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingTodoId, setEditingTodoId] = useState(null);

  const [routineAddOpen, setRoutineAddOpen] = useState(false);
  const [addingRoutineCategoryId, setAddingRoutineCategoryId] = useState(null);

  const [timeSheetOpen, setTimeSheetOpen] = useState(false);
  const [editingReminderId, setEditingReminderId] = useState(null);
  const [timePickerDraft, setTimePickerDraft] = useState({ period: 'PM', hour: 4, minute: 30 });

  const [colorSheetOpen, setColorSheetOpen] = useState(false);
  const [privacySheetOpen, setPrivacySheetOpen] = useState(false);
  const [topMenuOpen, setTopMenuOpen] = useState(false);

  const applyData = useCallback((todoData, catData, routineData, reminderData, wdData, dcData) => {
    setTodos(normalizeList(todoData).map(normalizeTodo));
    setCategories(normalizeList(catData).sort((a, b) => (a.order ?? 0) - (b.order ?? 0)));
    setRoutines(normalizeList(routineData).sort((a, b) => (a.order ?? 0) - (b.order ?? 0)));
    setReminders(normalizeList(reminderData).sort((a, b) => (a.order ?? 0) - (b.order ?? 0)));
    setWeekdayDefaults(wdData || {});
    setDateCategories(dcData || {});
  }, []);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [todoData, catData, routineData, reminderData, wdData, dcData] = await Promise.all([
        apiFetch('todos', '/'),
        apiFetch('categories', '/'),
        apiFetch('routines', '/'),
        apiFetch('reminders', '/'),
        apiFetch('weekday-defaults', '/'),
        apiFetch('date-categories', '/'),
      ]);
      applyData(todoData, catData, routineData, reminderData, wdData, dcData);
    } catch (err) {
      console.error('데이터 로드 실패:', err);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }, [applyData]);

  const loadTodos = useCallback(async () => {
    try {
      const data = await apiFetch('todos', '/');
      setTodos(normalizeList(data).map(normalizeTodo));
    } catch (err) {
      console.error('할일 목록 로드 실패:', err);
      alert(err.message);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const getDayCategories = useCallback(
    (dateStr) => getCategoriesForDate(dateStr, categories, dateCategories, weekdayDefaults),
    [categories, dateCategories, weekdayDefaults]
  );

  const resetCategoryFormDraft = useCallback((cat = null) => {
    if (cat) {
      const dateSettings = getCategoryDateSettings(cat);
      setCategoryFormDraft({
        name: cat.name,
        color: cat.color,
        isPrivate: cat.isPrivate !== false,
        excludedDates: [...(cat.excludedDates || [])],
        deleteStartDate: null,
        deleteEndDate: null,
        ...dateSettings,
      });
    } else {
      setCategoryFormDraft({
        ...emptyFormDraft(),
        color: COLOR_PRESETS[categories.length % COLOR_PRESETS.length],
      });
    }
    setFormCalendarAnchor(new Date());
    setCategoryFormDeleteModeState(false);
  }, [categories.length]);

  const setCategoryFormDeleteMode = useCallback((enabled) => {
    setCategoryFormDeleteModeState(enabled);
    setCategoryFormDraft((d) => ({ ...d, deleteStartDate: null, deleteEndDate: null }));
  }, []);

  const openAddCategoryForm = useCallback((from = 'main') => {
    setReturnScreen(from);
    setEditingCategoryId(null);
    resetCategoryFormDraft();
    setScreen('categoryForm');
  }, [resetCategoryFormDraft]);

  const openEditCategoryForm = useCallback((cat, from = 'main') => {
    setReturnScreen(from);
    setEditingCategoryId(cat.id);
    resetCategoryFormDraft(cat);
    setScreen('categoryForm');
  }, [resetCategoryFormDraft]);

  const syncDateCategoriesForCategory = useCallback(async (catId) => {
    await apiFetch('categories', `/${catId}/date-categories`, { method: 'DELETE' });
  }, []);

  const handleSaveCategoryForm = useCallback(async (name) => {
    const trimmed = name.trim();
    if (!trimmed) return false;

    let draft = { ...categoryFormDraft, applyFromToday: categoryFormDraft.applyFromToday };

    if (categoryFormDeleteMode && editingCategoryId) {
      const { deleteStartDate, deleteEndDate } = draft;
      let datesToExclude = [];
      if (deleteStartDate) {
        if (!deleteEndDate) datesToExclude = [deleteStartDate];
        else {
          const from = deleteStartDate <= deleteEndDate ? deleteStartDate : deleteEndDate;
          const to = deleteStartDate <= deleteEndDate ? deleteEndDate : deleteStartDate;
          const cursor = new Date(`${from}T12:00:00`);
          const end = new Date(`${to}T12:00:00`);
          while (cursor <= end) {
            datesToExclude.push(formatDate(cursor));
            cursor.setDate(cursor.getDate() + 1);
          }
        }
      }
      if (datesToExclude.length === 0) return false;
      draft = {
        ...draft,
        excludedDates: [...new Set([...(draft.excludedDates || []), ...datesToExclude])].sort(),
        deleteStartDate: null,
        deleteEndDate: null,
      };
      setCategoryFormDeleteModeState(false);
    }

    let { startDate, endDate } = draft;
    if (startDate && !endDate) endDate = startDate;
    if (startDate && endDate && startDate > endDate) {
      [startDate, endDate] = [endDate, startDate];
    }

    const data = {
      name: trimmed,
      color: draft.color,
      isPrivate: draft.isPrivate,
      locked: true,
      applyFromToday: draft.applyFromToday,
      startDate: startDate || null,
      endDate: endDate || null,
    };
    if (editingCategoryId) data.excludedDates = draft.excludedDates || [];

    try {
      if (editingCategoryId) {
        await apiFetch('categories', `/${editingCategoryId}`, {
          method: 'PATCH',
          body: JSON.stringify(data),
        });
        await syncDateCategoriesForCategory(editingCategoryId);
      } else {
        await apiFetch('categories', '/', {
          method: 'POST',
          body: JSON.stringify({ ...data, order: categories.length }),
        });
      }
      await loadAll();
      setScreen(returnScreen);
      return true;
    } catch (err) {
      alert(err.message);
      return false;
    }
  }, [
    categoryFormDraft,
    categoryFormDeleteMode,
    editingCategoryId,
    categories.length,
    loadAll,
    returnScreen,
    syncDateCategoriesForCategory,
  ]);

  const deleteCategory = useCallback(async (catId) => {
    const cat = categories.find((c) => c.id === catId);
    if (!cat) return;
    const msg = `"${cat.name}" 카테고리를 삭제할까요?\n과거 할일 기록은 유지되며, 루틴은 함께 삭제됩니다.`;
    if (!confirm(msg)) return;
    try {
      await apiFetch('categories', `/${catId}`, { method: 'DELETE' });
      await loadAll();
    } catch (err) {
      alert(err.message);
    }
  }, [categories, loadAll]);

  const reorderCategories = useCallback(async (dragId, targetId) => {
    const list = [...categories];
    const fromIdx = list.findIndex((c) => c.id === dragId);
    const toIdx = list.findIndex((c) => c.id === targetId);
    if (fromIdx < 0 || toIdx < 0) return;
    const [moved] = list.splice(fromIdx, 1);
    list.splice(toIdx, 0, moved);
    try {
      await apiFetch('categories', '/reorder', {
        method: 'PUT',
        body: JSON.stringify({ orderedIds: list.map((c) => c.id) }),
      });
      await loadAll();
    } catch (err) {
      alert(err.message);
    }
  }, [categories, loadAll]);

  const toggleCategoryLock = useCallback(async (cat) => {
    try {
      await apiFetch('categories', `/${cat.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ locked: cat.locked === false }),
      });
      await loadAll();
    } catch (err) {
      alert(err.message);
    }
  }, [loadAll]);

  const openAddTodoModal = useCallback((cat) => {
    const futureDates = getFutureDatesWithCategory(
      cat.id, selectedDate, categories, dateCategories, weekdayDefaults
    );
    setAddingCategoryId(cat.id);
    setAddFutureDates(futureDates);
    setAddFutureChecked(false);
    setAddModalOpen(true);
  }, [selectedDate, categories, dateCategories, weekdayDefaults]);

  const closeAddTodoModal = useCallback(() => {
    setAddModalOpen(false);
    setAddingCategoryId(null);
    setAddFutureDates([]);
    setAddFutureChecked(false);
  }, []);

  const addTodo = useCallback(async (text, alsoAddFuture = false) => {
    const trimmed = text.trim();
    if (!trimmed || !addingCategoryId) return false;
    const dates = [selectedDate];
    if (alsoAddFuture && addFutureDates.length > 0) dates.push(...addFutureDates);
    try {
      await Promise.all(dates.map((date) =>
        apiFetch('todos', '/', {
          method: 'POST',
          body: JSON.stringify({ text: trimmed, done: false, categoryId: addingCategoryId, date }),
        })
      ));
      await loadTodos();
      return true;
    } catch (err) {
      alert(err.message);
      return false;
    }
  }, [addingCategoryId, selectedDate, addFutureDates, loadTodos]);

  const deleteTodo = useCallback(async (id) => {
    try {
      await apiFetch('todos', `/${id}`, { method: 'DELETE' });
      await loadTodos();
    } catch (err) {
      alert(err.message);
    }
  }, [loadTodos]);

  const toggleTodo = useCallback(async (id) => {
    const todo = todos.find((t) => t.id === id);
    if (!todo) return;
    try {
      await apiFetch('todos', `/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ done: !todo.done }),
      });
      await loadTodos();
    } catch (err) {
      alert(err.message);
    }
  }, [todos, loadTodos]);

  const updateTodo = useCallback(async (id, text) => {
    const trimmed = text.trim();
    if (!trimmed) return false;
    try {
      await apiFetch('todos', `/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ text: trimmed }),
      });
      await loadTodos();
      return true;
    } catch (err) {
      alert(err.message);
      return false;
    }
  }, [loadTodos]);

  const openEditTodoModal = useCallback((id) => {
    setEditingTodoId(id);
    setEditModalOpen(true);
  }, []);

  const closeEditTodoModal = useCallback(() => {
    setEditingTodoId(null);
    setEditModalOpen(false);
  }, []);

  const openRoutineAddModal = useCallback((cat) => {
    setAddingRoutineCategoryId(cat.id);
    setRoutineAddOpen(true);
  }, []);

  const closeRoutineAddModal = useCallback(() => {
    setAddingRoutineCategoryId(null);
    setRoutineAddOpen(false);
  }, []);

  const saveRoutine = useCallback(async (text) => {
    const trimmed = text.trim();
    if (!trimmed || !addingRoutineCategoryId) return false;
    const count = routines.filter((r) => r.categoryId === addingRoutineCategoryId).length;
    try {
      await apiFetch('routines', '/', {
        method: 'POST',
        body: JSON.stringify({ text: trimmed, categoryId: addingRoutineCategoryId, order: count }),
      });
      await loadAll();
      return true;
    } catch (err) {
      alert(err.message);
      return false;
    }
  }, [addingRoutineCategoryId, routines, loadAll]);

  const deleteRoutine = useCallback(async (id) => {
    try {
      await apiFetch('routines', `/${id}`, { method: 'DELETE' });
      await loadAll();
    } catch (err) {
      alert(err.message);
    }
  }, [loadAll]);

  const openTimePicker = useCallback((reminder = null) => {
    setEditingReminderId(reminder?.id || null);
    if (reminder) {
      const [h24, m] = reminder.time24.split(':');
      const h = parseInt(h24, 10);
      setTimePickerDraft({
        period: h >= 12 ? 'PM' : 'AM',
        hour: h % 12 || 12,
        minute: parseInt(m, 10),
      });
    } else {
      setTimePickerDraft({ period: 'PM', hour: 4, minute: 30 });
    }
    setTimeSheetOpen(true);
  }, []);

  const saveReminderTime = useCallback(async () => {
    const time24 = to24Hour(timePickerDraft.period, timePickerDraft.hour, timePickerDraft.minute);
    const body = {
      time24,
      period: timePickerDraft.period,
      hour: timePickerDraft.hour,
      minute: timePickerDraft.minute,
    };
    try {
      if (editingReminderId) {
        await apiFetch('reminders', `/${editingReminderId}`, { method: 'PATCH', body: JSON.stringify(body) });
      } else {
        await apiFetch('reminders', '/', {
          method: 'POST',
          body: JSON.stringify({ ...body, order: reminders.length, enabled: true }),
        });
      }
      await loadAll();
      setTimeSheetOpen(false);
      setEditingReminderId(null);
    } catch (err) {
      alert(err.message);
    }
  }, [timePickerDraft, editingReminderId, reminders.length, loadAll]);

  const deleteReminder = useCallback(async (id) => {
    try {
      await apiFetch('reminders', `/${id}`, { method: 'DELETE' });
      await loadAll();
    } catch (err) {
      alert(err.message);
    }
  }, [loadAll]);

  const shiftWeek = useCallback((delta) => {
    setWeekAnchor((prev) => {
      const next = new Date(prev);
      next.setDate(next.getDate() + delta);
      return next;
    });
  }, []);

  const value = useMemo(() => ({
    apiUrl,
    todos,
    categories,
    routines,
    reminders,
    weekdayDefaults,
    dateCategories,
    selectedDate,
    setSelectedDate,
    weekAnchor,
    shiftWeek,
    screen,
    setScreen,
    returnScreen,
    loading,
    loadAll,
    getDayCategories,
    editingCategoryId,
    categoryFormDraft,
    setCategoryFormDraft,
    formCalendarAnchor,
    setFormCalendarAnchor,
    categoryFormDeleteMode,
    setCategoryFormDeleteMode,
    openAddCategoryForm,
    openEditCategoryForm,
    handleSaveCategoryForm,
    deleteCategory,
    reorderCategories,
    toggleCategoryLock,
    addModalOpen,
    addingCategoryId,
    addFutureDates,
    addFutureChecked,
    setAddFutureChecked,
    openAddTodoModal,
    closeAddTodoModal,
    addTodo,
    deleteTodo,
    toggleTodo,
    updateTodo,
    editModalOpen,
    editingTodoId,
    openEditTodoModal,
    closeEditTodoModal,
    routineAddOpen,
    addingRoutineCategoryId,
    openRoutineAddModal,
    closeRoutineAddModal,
    saveRoutine,
    deleteRoutine,
    timeSheetOpen,
    setTimeSheetOpen,
    timePickerDraft,
    setTimePickerDraft,
    openTimePicker,
    saveReminderTime,
    deleteReminder,
    colorSheetOpen,
    setColorSheetOpen,
    privacySheetOpen,
    setPrivacySheetOpen,
    topMenuOpen,
    setTopMenuOpen,
  }), [
    apiUrl,
    todos, categories, routines, reminders, weekdayDefaults, dateCategories,
    selectedDate, weekAnchor, shiftWeek, screen, returnScreen, loading, loadAll,
    getDayCategories, editingCategoryId, categoryFormDraft, formCalendarAnchor,
    categoryFormDeleteMode, setCategoryFormDeleteMode, openAddCategoryForm,
    openEditCategoryForm, handleSaveCategoryForm, deleteCategory, reorderCategories,
    toggleCategoryLock, addModalOpen, addingCategoryId, addFutureDates, addFutureChecked,
    openAddTodoModal, closeAddTodoModal, addTodo, deleteTodo, toggleTodo, updateTodo,
    editModalOpen, editingTodoId, openEditTodoModal, closeEditTodoModal,
    routineAddOpen, addingRoutineCategoryId, openRoutineAddModal, closeRoutineAddModal,
    saveRoutine, deleteRoutine, timeSheetOpen, timePickerDraft, openTimePicker,
    saveReminderTime, deleteReminder, colorSheetOpen, privacySheetOpen, topMenuOpen,
  ]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
