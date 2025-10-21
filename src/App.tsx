import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { Sidebar } from "@/components/Layout/Sidebar";
import { Header } from "@/components/Layout/Header";
import UserManagement from "./pages/UserManagement";
import AuditLog from "./pages/AuditLog";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import GlobalSearch from "./pages/GlobalSearch";
import Incidents from "./pages/Incidents";
import IncidentForm from "./pages/IncidentForm";
import IncidentDetail from "./pages/IncidentDetail";
import Students from "./pages/Students";
import StudentForm from "./pages/StudentForm";
import Staff from "./pages/Staff";
import StaffForm from "./pages/StaffForm";
import Faculty from "./pages/Faculty";
import FacultyForm from "./pages/FacultyForm";
import Cases from "./pages/Cases";
import CaseDetail from "./pages/CaseDetail";
import CaseForm from "./pages/CaseForm";
import PersonDetail from "./pages/PersonDetail";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import { useState } from "react";

const queryClient = new QueryClient();

const ProtectedLayout = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      <div
        className={`transition-all duration-300 ${
          sidebarOpen ? 'mr-64' : 'mr-20'
        }`}
      >
        <Header />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
};

const AppRoutes = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/" replace /> : <Login />}
      />
      <Route
        path="/"
        element={
          <ProtectedLayout>
            <Dashboard />
          </ProtectedLayout>
        }
      />
      <Route
        path="/search"
        element={
          <ProtectedLayout>
            <GlobalSearch />
          </ProtectedLayout>
        }
      />
      <Route
        path="/incidents"
        element={
          <ProtectedLayout>
            <Incidents />
          </ProtectedLayout>
        }
      />
      <Route
        path="/incidents/new"
        element={
          <ProtectedLayout>
            <IncidentForm />
          </ProtectedLayout>
        }
      />
      <Route
        path="/incidents/:id"
        element={
          <ProtectedLayout>
            <IncidentDetail />
          </ProtectedLayout>
        }
      />
      <Route
        path="/incidents/:id/edit"
        element={
          <ProtectedLayout>
            <IncidentForm />
          </ProtectedLayout>
        }
      />
      <Route
        path="/students"
        element={
          <ProtectedLayout>
            <Students />
          </ProtectedLayout>
        }
      />
      <Route
        path="/students/new"
        element={
          <ProtectedLayout>
            <StudentForm />
          </ProtectedLayout>
        }
      />
      <Route
        path="/students/:id"
        element={
          <ProtectedLayout>
            <PersonDetail />
          </ProtectedLayout>
        }
      />
      <Route
        path="/students/:id/edit"
        element={
          <ProtectedLayout>
            <StudentForm />
          </ProtectedLayout>
        }
      />
      <Route
        path="/staff"
        element={
          <ProtectedLayout>
            <Staff />
          </ProtectedLayout>
        }
      />
      <Route
        path="/staff/new"
        element={
          <ProtectedLayout>
            <StaffForm />
          </ProtectedLayout>
        }
      />
      <Route
        path="/staff/:id"
        element={
          <ProtectedLayout>
            <PersonDetail />
          </ProtectedLayout>
        }
      />
      <Route
        path="/staff/:id/edit"
        element={
          <ProtectedLayout>
            <StaffForm />
          </ProtectedLayout>
        }
      />
      <Route
        path="/faculty"
        element={
          <ProtectedLayout>
            <Faculty />
          </ProtectedLayout>
        }
      />
      <Route
        path="/faculty/new"
        element={
          <ProtectedLayout>
            <FacultyForm />
          </ProtectedLayout>
        }
      />
      <Route
        path="/faculty/:id"
        element={
          <ProtectedLayout>
            <PersonDetail />
          </ProtectedLayout>
        }
      />
      <Route
        path="/faculty/:id/edit"
        element={
          <ProtectedLayout>
            <FacultyForm />
          </ProtectedLayout>
        }
      />
      <Route
        path="/cases"
        element={
          <ProtectedLayout>
            <Cases />
          </ProtectedLayout>
        }
      />
      <Route
        path="/cases/new"
        element={
          <ProtectedLayout>
            <CaseForm />
          </ProtectedLayout>
        }
      />
      <Route
        path="/cases/:id"
        element={
          <ProtectedLayout>
            <CaseDetail />
          </ProtectedLayout>
        }
      />
      <Route
        path="/cases/:id/edit"
        element={
          <ProtectedLayout>
            <CaseForm />
          </ProtectedLayout>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedLayout>
            <Settings />
          </ProtectedLayout>
        }
      />
      <Route
        path="/users"
        element={
          <ProtectedLayout>
            <UserManagement />
          </ProtectedLayout>
        }
      />
      <Route
        path="/audit-log"
        element={
          <ProtectedLayout>
            <AuditLog />
          </ProtectedLayout>
        }
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;