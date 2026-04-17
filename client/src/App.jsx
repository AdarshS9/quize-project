import React, { createContext, useContext, useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider, useToast } from './context/ToastContext';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/Admin/Dashboard';
import ManageExams from './pages/Admin/ManageExams';
import CreateExam from './pages/Admin/CreateExam';
import AdminResults from './pages/Admin/Results';
import StudentDashboard from './pages/Student/Dashboard';
import StudentExams from './pages/Student/Exams';
import StudentHistory from './pages/Student/History';
import StudentProfile from './pages/Student/Profile';
import Leaderboard from './pages/Student/Leaderboard';
import ExamView from './pages/Student/ExamView';
import Results from './pages/Student/Results';
import Sidebar from './components/Sidebar';
import StudentManagement from './pages/Admin/StudentManagement';
import ResultDetail from './pages/Admin/ResultDetail';
import EditExam from './pages/Admin/EditExam';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

const ProtectedRoute = ({ children, role }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface-light)' }}>
       <div style={{ width: '48px', height: '48px', border: '3px solid var(--bg-light)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
    </div>
  );
  if (!user) return <Navigate to="/login" />;
  if (role && user.role !== role) return <Navigate to={user.role === 'ADMIN' ? '/admin' : '/student'} />;
  return children;
};

const AppContent = () => {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));
  const [loading, setLoading] = useState(false);

  const login = (userData) => {
    setUser(userData.user);
    localStorage.setItem('token', userData.token);
    localStorage.setItem('user', JSON.stringify(userData.user));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route path="/admin/*" element={
            <ProtectedRoute role="ADMIN">
              <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--surface-light)' }}>
                <Sidebar role="ADMIN" />
                <main style={{ flex: 1, overflowY: 'auto' }}>
                  <Routes>
                    <Route path="/" element={<AdminDashboard />} />
                    <Route path="/exams" element={<ManageExams />} />
                    <Route path="/exams/create" element={<CreateExam />} />
                    <Route path="/exams/edit/:id" element={<EditExam />} />
                    <Route path="/reports" element={<AdminResults />} />
                    <Route path="/reports/:attemptId" element={<ResultDetail />} />
                    <Route path="/students" element={<StudentManagement />} />
                  </Routes>
                </main>
              </div>
            </ProtectedRoute>
          } />

          <Route path="/student/*" element={
            <ProtectedRoute role="STUDENT">
              <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--surface-light)' }}>
                <Sidebar role="STUDENT" />
                <main style={{ flex: 1, overflowY: 'auto' }}>
                  <Routes>
                    <Route path="/" element={<StudentDashboard />} />
                    <Route path="/exams" element={<StudentExams />} />
                    <Route path="/history" element={<StudentHistory />} />
                    <Route path="/profile" element={<StudentProfile />} />
                    <Route path="/leaderboard" element={<Leaderboard />} />
                    <Route path="/exam/:id" element={<ExamView />} />
                    <Route path="/results/:attemptId" element={<Results />} />
                  </Routes>
                </main>
              </div>
            </ProtectedRoute>
          } />

          <Route path="/" element={
            user ? (
              <Navigate to={user.role === 'ADMIN' ? '/admin' : '/student'} />
            ) : (
              <Navigate to="/login" />
            )
          } />
        </Routes>
      </Router>
    </AuthContext.Provider>
  );
};

const App = () => (
  <ToastProvider>
    <AppContent />
  </ToastProvider>
);

export default App;

