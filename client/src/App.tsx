import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Paintings from "./pages/Paintings";
import PaintingDetail from "./pages/PaintingDetail";
import WallBooking from "./pages/WallBooking";
import Pottery from "./pages/Pottery";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";

function Router() {
  return <Switch>
    <Route path="/" component={Home} />
    <Route path="/login" component={Login} />
    <Route path="/paintings" component={Paintings} />
    <Route path="/paintings/:id" component={PaintingDetail} />
    <Route path="/book-wall" component={WallBooking} />
    <Route path="/pottery" component={Pottery} />
    <Route path="/dashboard" component={Dashboard} />
    <Route path="/admin" component={AdminDashboard} />
    <Route path="/404" component={NotFound} />
    <Route component={NotFound} />
  </Switch>;
}

export default function App() {
  return <ErrorBoundary><ThemeProvider defaultTheme="light"><TooltipProvider><Toaster /><Router /></TooltipProvider></ThemeProvider></ErrorBoundary>;
}
