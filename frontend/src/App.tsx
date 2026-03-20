import { Navigate, Route, Routes } from "react-router-dom";
import "./App.css";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { Navbar } from "./components/layout/Navbar/Navbar";
import { useAuth } from "./contexts/AuthContext";
import { AdminPage } from "./pages/Admin/AdminPage";
import { DashboardPage } from "./pages/Dashboard/DashboardPage";
import { LoginPage } from "./pages/Login/LoginPage";
import { PracticePage } from "./pages/Practice/PracticePage";
import { QuizPage } from "./pages/Quiz/QuizPage";
import { QuizListPage } from "./pages/QuizList/QuizListPage";
import { ReadingPage } from "./pages/Reading/ReadingPage";
import { VocabPage } from "./pages/Vocab/VocabPage";

function ProtectedPage({ children }: { children: React.ReactNode }) {
    return (
        <ProtectedRoute>
            <div className="appShell">
                <Navbar />

                <main className="appMain">{children}</main>
            </div>
        </ProtectedRoute>
    );
}

function App() {
    const { isAuthenticated } = useAuth();

    return (
        <Routes>
            <Route
                path="/login"
                element={
                    isAuthenticated ? (
                        <Navigate to="/" replace />
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
            <Route
                path="/admin"
                element={
                    <ProtectedPage>
                        <AdminPage />
                    </ProtectedPage>
                }
            />
            <Route
                path="*"
                element={
                    <Navigate to={isAuthenticated ? "/" : "/login"} replace />
                }
            />
        </Routes>
    );
}

export default App;
