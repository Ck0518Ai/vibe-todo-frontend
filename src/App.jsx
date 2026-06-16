import { AppProvider, useApp } from './context/AppContext';
import MainScreen from './components/screens/MainScreen';
import CategoryFormScreen from './components/screens/CategoryFormScreen';
import CategoryManageScreen from './components/screens/CategoryManageScreen';
import RoutineScreen from './components/screens/RoutineScreen';
import ReminderScreen from './components/screens/ReminderScreen';
import AddTodoModal from './components/modals/AddTodoModal';
import EditTodoModal from './components/modals/EditTodoModal';
import RoutineAddModal from './components/modals/RoutineAddModal';
import ColorSheet from './components/sheets/ColorSheet';
import PrivacySheet from './components/sheets/PrivacySheet';
import TimeSheet from './components/sheets/TimeSheet';

// 환경변수에서 API_URL 읽기
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/todos';

function AppRoutes() {
  const { screen } = useApp();

  return (
    <>
      {screen === 'main' && <MainScreen />}
      {screen === 'categoryForm' && <CategoryFormScreen />}
      {screen === 'categoryManage' && <CategoryManageScreen />}
      {screen === 'routine' && <RoutineScreen />}
      {screen === 'reminder' && <ReminderScreen />}

      <AddTodoModal />
      <EditTodoModal />
      <RoutineAddModal />
      <ColorSheet />
      <PrivacySheet />
      <TimeSheet />
    </>
  );
}

export default function App() {
  return (
    <AppProvider apiUrl={API_URL}>
      <AppRoutes />
    </AppProvider>
  );
}
