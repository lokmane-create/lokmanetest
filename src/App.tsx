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
import ClassManagement from "./pages/ClassManagement"; // This will now be for Timetable
import AttendanceTracking from "./pages/AttendanceTracking";
import GradesExams from "./pages/GradesExams";
import ParentPortal from "./pages/ParentPortal";
import Finance from "./pages/Finance";
import HR from "./pages/HR";
import Chat from "./pages/Chat";
import Notifications from "./pages/Notifications";
import Reports from "./pages/Reports";
import OnlineClasses from "./pages/OnlineClasses"; // New import
import Library from "./pages/Library"; // New import
import Gamification from "./pages/Gamification"; // New import

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
            <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
            <Route path="/students" element={<Layout><StudentManagement /></Layout>} />
            <Route path="/teachers" element={<Layout><TeacherManagement /></Layout>} />
            <Route path="/timetable" element={<Layout><ClassManagement /></Layout>} />
            <Route path="/attendance" element={<Layout><AttendanceTracking /></Layout>} />
            <Route path="/grades" element={<Layout><GradesExams /></Layout>} />
            <Route path="/parent-portal" element={<Layout><ParentPortal /></Layout>} />
            <Route path="/finance" element={<Layout><Finance /></Layout>} />
            <Route path="/hr" element={<Layout><HR /></Layout>} />
            <Route path="/chat" element={<Layout><Chat /></Layout>} />
            <Route path="/notifications" element={<Layout><Notifications /></Layout>} />
            <Route path="/reports" element={<Layout><Reports /></Layout>} />
            <Route path="/online-classes" element={<Layout><OnlineClasses /></Layout>} /> {/* New route */}
            <Route path="/library" element={<Layout><Library /></Layout>} /> {/* New route */}
            <Route path="/gamification" element={<Layout><Gamification /></Layout>} /> {/* New route */}
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </SessionContextProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;