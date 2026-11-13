import { useCallback, useState } from 'react';
import { Navigate, Route, Routes, useSearchParams } from 'react-router-dom';
import './App.css';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { Navbar } from './components/layout/Navbar/Navbar';
import { Sidebar } from './components/layout/Sidebar/Sidebar';
import { useAuth } from './contexts/AuthContext';
import { AdminPage } from './pages/Admin/AdminPage';
import { AssignmentsPage } from './pages/Assignments/AssignmentsPage';
import { DashboardPage } from './pages/Dashboard/DashboardPage';
import { LessonPage } from './pages/Lessons/LessonPage';
import { LandingPage } from './pages/Landing/LandingPage';
import { LessonsPage } from './pages/Lessons/LessonsPage';
import { LoginPage } from './pages/Login/LoginPage';
import { QuizPage } from './pages/Quiz/QuizPage';
import { QuizListPage } from './pages/QuizList/QuizListPage';
import { ReadingPage } from './pages/Reading/ReadingPage';
import { ReceiptPage } from './pages/Receipt/ReceiptPage';
import { ReadingTextPage } from './pages/Reading/ReadingTextPage';
import { RegisterPage } from './pages/Register/RegisterPage';
import { VocabPage } from './pages/Vocab/VocabPage';
import { StudyGuidePage } from './pages/StudyGuide/StudyGuidePage';

/** Top bar across the page; navigation on the start edge; content fills the rest. */
function AppFrame({ children }: { children: React.ReactNode }) {
    // On phones the sidebar is a slide-out drawer that the top bar opens.
    const [menuOpen, setMenuOpen] = useState(false);
    const closeMenu = useCallback(() => setMenuOpen(false), []);

    return (
        <div className="appFrame">
            <Navbar menuOpen={menuOpen} onOpenMenu={() => setMenuOpen(true)} />
            <div className="appBody">
                <Sidebar open={menuOpen} onClose={closeMenu} />
                <main className="appMain">{children}</main>
            </div>
        </div>
    );
}

function ProtectedPage({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    if (user?.role === 'teacher') {
        return <Navigate to="/admin" replace />;
    }
    return (
        <ProtectedRoute>
            <AppFrame>{children}</AppFrame>
        </ProtectedRoute>
    );
}

function AdminProtectedPage() {
    return (
        <ProtectedRoute>
            <AppFrame>
                <AdminPage />
            </AppFrame>
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
    const { isAuthenticated, user } = useAuth();
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
                path="/register"
                element={
                    isAuthenticated ? (
                        <LoginRoute isTeacher={isTeacher} />
                    ) : (
                        <RegisterPage />
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
                path="/assignments"
                element={
                    <ProtectedPage>
                        <AssignmentsPage />
                    </ProtectedPage>
                }
            />
            <Route
                path="/lessons"
                element={
                    <ProtectedPage>
                        <LessonsPage />
                    </ProtectedPage>
                }
            />
            <Route
                path="/lessons/:lessonId"
                element={
                    <ProtectedPage>
                        <LessonPage />
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
                path="/reading/:textId"
                element={
                    <ProtectedPage>
                        <ReadingTextPage />
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
            <Route
                path="/quiz/:quizId/guide/:guideId"
                element={
                    <ProtectedPage>
                        <StudyGuidePage />
                    </ProtectedPage>
                }
            />
            <Route path="/admin" element={<AdminProtectedPage />} />
            <Route
                path="/receipt"
                element={
                    <ProtectedRoute>
                        <AppFrame>
                            <ReceiptPage />
                        </AppFrame>
                    </ProtectedRoute>
                }
            />
            <Route path="/landing-page" element={<LandingPage />} />
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
