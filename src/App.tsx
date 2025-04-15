
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "@/contexts/AppContext";
import { AppLayout } from "@/components/layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import Staff from "./pages/Staff";
import Schedule from "./pages/Schedule";
import Hours from "./pages/Hours";
import Payroll from "./pages/Payroll";
import Availability from "./pages/Availability";
import Timesheets from "./pages/Timesheets";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AppProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppLayout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/staff" element={<Staff />} />
              <Route path="/schedule" element={<Schedule />} />
              <Route path="/availability" element={<Availability />} />
              <Route path="/timesheets" element={<Timesheets />} />
              <Route path="/hours" element={<Hours />} />
              <Route path="/payroll" element={<Payroll />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AppLayout>
        </BrowserRouter>
      </TooltipProvider>
    </AppProvider>
  </QueryClientProvider>
);

export default App;
