import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Layout from "./components/Layout";
import { SessionContextProvider } from "./integrations/supabase/auth";
import Dashboard from "./pages/Dashboard";
import StudentManagement from "./pages/StudentManagement";
import TeacherManagement from "./pages/TeacherManagement";
import ClassManagement from "./pages/ClassManagement";
import AttendanceTracking from "./pages/AttendanceTracking";
import GradesExams from "./pages/GradesExams";
import ParentPortal from "./pages/ParentPortal";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <SessionContextProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Layout><Dashboard /></Layout>} />
            <Route path="/students" element={<Layout><StudentManagement /></Layout>} />
            <Route path="/teachers" element={<Layout><TeacherManagement /></Layout>} />
            <Route path="/classes" element={<Layout><ClassManagement /></Layout>} />
            <Route path="/attendance" element={<Layout><AttendanceTracking /></Layout>} />
            <Route path="/grades" element={<Layout><GradesExams /></Layout>} />
            <Route path="/parent-portal" element={<Layout><ParentPortal /></Layout>} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </SessionContextProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;