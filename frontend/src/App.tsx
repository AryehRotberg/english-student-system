import { Navigate, Route, Routes } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar/Navbar';
import { useAuthUser } from './hooks/queries';
import { AdminPage } from './pages/Admin/AdminPage';
import { DashboardPage } from './pages/Dashboard/DashboardPage';
import { LoginPage } from './pages/Login/LoginPage';
import { PracticePage } from './pages/Practice/PracticePage';
import { QuizPage } from './pages/Quiz/QuizPage';
import { QuizListPage } from './pages/QuizList/QuizListPage';
import { ReadingPage } from './pages/Reading/ReadingPage';
import { VocabPage } from './pages/Vocab/VocabPage';
import './App.css';

function App() {
  const { data: user, isLoading } = useAuthUser();

  if (isLoading) {
    return <div className="loadingState">Loading...</div>;
  }

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <div className="appShell">
      <Navbar />

      <main className="appMain">
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/reading" element={<ReadingPage />} />
          <Route path="/practice" element={<PracticePage />} />
          <Route path="/vocab" element={<VocabPage />} />
          <Route path="/quiz" element={<QuizListPage />} />
          <Route path="/quiz/:quizId" element={<QuizPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/login" element={<Navigate to="/" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
