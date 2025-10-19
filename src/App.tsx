import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { Sidebar } from "@/components/Layout/Sidebar";
import { Header } from "@/components/Layout/Header";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import GlobalSearch from "./pages/GlobalSearch";
import Students from "./pages/Students";
import StudentForm from "./pages/StudentForm";
import Staff from "./pages/Staff";
import StaffForm from "./pages/StaffForm";
import Faculty from "./pages/Faculty";
import FacultyForm from "./pages/FacultyForm";
import Cases from "./pages/Cases";
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