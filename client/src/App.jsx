import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from './components/shared/Toast';
import ProtectedRoute from './components/auth/ProtectedRoute';

import Login           from './components/auth/Login';
import Register        from './components/auth/Register';
import Home            from './pages/Home';
import NewChild        from './pages/NewChild';
import ChildDetail     from './pages/ChildDetail';
import GenerateProgram from './pages/GenerateProgram';
import ProgramView     from './pages/ProgramView';
import ProgramHistory  from './pages/ProgramHistory';
import LiveSession     from './pages/LiveSession';
import SessionSummary  from './pages/SessionSummary';
import Analytics       from './pages/Analytics';

const qc = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
});

export default function App() {
  return (
    <QueryClientProvider client={qc}>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            {/* Public */}
            <Route path="/login"    element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected */}
            <Route path="/"                        element={<ProtectedRoute><Home /></ProtectedRoute>} />
            <Route path="/children/new"            element={<ProtectedRoute><NewChild /></ProtectedRoute>} />
            <Route path="/children/:id"            element={<ProtectedRoute><ChildDetail /></ProtectedRoute>} />
            <Route path="/children/:id/generate"   element={<ProtectedRoute><GenerateProgram /></ProtectedRoute>} />
            <Route path="/children/:id/programs"   element={<ProtectedRoute><ProgramHistory /></ProtectedRoute>} />
            <Route path="/programs/:id"            element={<ProtectedRoute><ProgramView /></ProtectedRoute>} />
            <Route path="/sessions/:id"            element={<ProtectedRoute><LiveSession /></ProtectedRoute>} />
            <Route path="/sessions/:id/summary"    element={<ProtectedRoute><SessionSummary /></ProtectedRoute>} />
            <Route path="/analytics"               element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
            <Route path="*"                        element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </QueryClientProvider>
  );
}
