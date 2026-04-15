import { Navigate, Route, Routes, useSearchParams } from 'react-router-dom';
import './App.css';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { Navbar } from './components/layout/Navbar/Navbar';
import { useAuth } from './contexts/AuthContext';
import { useAuthUser } from './hooks/queries';
import { AdminPage } from './pages/Admin/AdminPage';
import { DashboardPage } from './pages/Dashboard/DashboardPage';
import { LoginPage } from './pages/Login/LoginPage';
import { PracticePage } from './pages/Practice/PracticePage';
import { QuizPage } from './pages/Quiz/QuizPage';
import { QuizListPage } from './pages/QuizList/QuizListPage';
import { ReadingPage } from './pages/Reading/ReadingPage';
import { VocabPage } from './pages/Vocab/VocabPage';

function ProtectedPage({ children }: { children: React.ReactNode }) {
    const { data: user } = useAuthUser();
    if (user?.role === 'teacher') {
        return <Navigate to="/admin" replace />;
    }
    return (
        <ProtectedRoute>
            <div className="appShell">
                <Navbar />

                <main className="appMain">{children}</main>
            </div>
        </ProtectedRoute>
    );
}

function AdminProtectedPage() {
    return (
        <ProtectedRoute>
            <div className="adminShell">
                <Navbar />
                <div className="adminBody">
                    <AdminPage />
                </div>
            </div>
        </ProtectedRoute>
    );
}

function LoginRoute({ isTeacher }: { isTeacher: boolean }) {
    const [searchParams] = useSearchParams();
    const redirect =
        searchParams.get('redirect') ?? (isTeacher ? '/admin' : '/');
    return <Navigate to={redirect} replace />;
}

function App() {
    const { isAuthenticated } = useAuth();
    const { data: user } = useAuthUser();
    const isTeacher = user?.role === 'teacher';

    return (
        <Routes>
            <Route
                path="/login"
                element={
                    isAuthenticated ? (
                        <LoginRoute isTeacher={isTeacher} />
                    ) : (
                        <LoginPage />
                    )
                }
            />
            <Route
                path="/"
                element={
                    <ProtectedPage>
                        <DashboardPage />
                    </ProtectedPage>
                }
            />
            <Route
                path="/reading"
                element={
                    <ProtectedPage>
                        <ReadingPage />
                    </ProtectedPage>
                }
            />
            <Route
                path="/practice"
                element={
                    <ProtectedPage>
                        <PracticePage />
                    </ProtectedPage>
                }
            />
            <Route
                path="/vocab"
                element={
                    <ProtectedPage>
                        <VocabPage />
                    </ProtectedPage>
                }
            />
            <Route
                path="/quiz"
                element={
                    <ProtectedPage>
                        <QuizListPage />
                    </ProtectedPage>
                }
            />
            <Route
                path="/quiz/:quizId"
                element={
                    <ProtectedPage>
                        <QuizPage />
                    </ProtectedPage>
                }
            />
            <Route path="/admin" element={<AdminProtectedPage />} />
            <Route
                path="*"
                element={
                    <Navigate
                        to={
                            isAuthenticated
                                ? isTeacher
                                    ? '/admin'
                                    : '/'
                                : '/login'
                        }
                        replace
                    />
                }
            />
        </Routes>
    );
}

export default App;
