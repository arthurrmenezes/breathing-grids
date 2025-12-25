import { ReactNode, useState, createContext, useContext } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  ArrowLeftRight,
  Tags,
  Bell,
  Repeat,
  CreditCard,
  Settings,
  LogOut,
  Menu,
  X,
  Eye,
  EyeOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";

interface AppLayoutProps {
  children: ReactNode;
}

// Context for sharing showValues state
interface ValuesVisibilityContextType {
  showValues: boolean;
  setShowValues: (show: boolean) => void;
}

const ValuesVisibilityContext = createContext<ValuesVisibilityContextType>({
  showValues: true,
  setShowValues: () => {},
});

export const useValuesVisibility = () => useContext(ValuesVisibilityContext);

const menuItems = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/app" },
  { label: "Transações", icon: ArrowLeftRight, href: "/app/transacoes" },
  { label: "Recorrentes", icon: Repeat, href: "/app/recorrentes" },
  { label: "Lembretes", icon: Bell, href: "/app/lembretes" },
  { label: "Categorias", icon: Tags, href: "/app/categorias" },
  { label: "Cartões", icon: CreditCard, href: "/app/cartoes" },
];

const bottomMenuItems = [{ label: "Configurações", icon: Settings, href: "/app/configuracoes" }];

export const AppLayout = ({ children }: AppLayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showValues, setShowValues] = useState(true);

  const handleLogout = () => {
    navigate("/");
  };

  return (
    <ValuesVisibilityContext.Provider value={{ showValues, setShowValues }}>
      <div className="min-h-screen bg-background flex w-full">
        {/* Sidebar - Always fixed */}
        <aside
          className={`
            fixed inset-y-0 left-0 z-50
            w-64 bg-sidebar border-r border-sidebar-border
            transform transition-transform duration-300 ease-in-out
            ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
            flex flex-col h-screen
          `}
        >
          {/* Logo */}
          <div className="h-16 flex items-center justify-between px-6 border-b border-sidebar-border shrink-0">
            <Link to="/app" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
                <span className="text-accent-foreground font-semibold text-sm">t</span>
              </div>
              <span className="font-semibold text-lg">tMoney</span>
            </Link>
            <button
              className="lg:hidden text-muted-foreground hover:text-foreground"
              onClick={() => setIsSidebarOpen(false)}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation - Scrollable */}
          <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-3 mb-2">Menu</p>
            {menuItems.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setIsSidebarOpen(false)}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-lg
                    transition-all duration-200
                    ${
                      isActive
                        ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                        : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-foreground"
                    }
                  `}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Bottom Navigation - Always Fixed at Bottom */}
          <div className="px-4 py-4 border-t border-sidebar-border space-y-1 shrink-0 mt-auto">
            {/* User Profile - Centered */}
            <div className="flex flex-col items-center p-2 rounded-lg hover:bg-sidebar-accent cursor-pointer transition-colors mb-2">
              <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center mb-2">
                <span className="text-sm font-medium text-accent">JD</span>
              </div>
              <p className="text-sm font-medium truncate text-center">João da Silva</p>
              <p className="text-xs text-muted-foreground truncate text-center">joao@email.com</p>
            </div>

            {bottomMenuItems.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setIsSidebarOpen(false)}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-lg
                    transition-all duration-200
                    ${
                      isActive
                        ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                        : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-foreground"
                    }
                  `}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg w-full text-left text-destructive hover:bg-destructive/10 transition-all duration-200"
            >
              <LogOut className="w-5 h-5" />
              <span>Sair</span>
            </button>
          </div>
        </aside>

        {/* Backdrop */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0 lg:ml-64">
          {/* Top Header - Only for mobile toggle */}
          <header className="h-16 flex items-center px-4 lg:px-8 border-b border-border bg-surface lg:hidden">
            <button className="text-foreground" onClick={() => setIsSidebarOpen(true)}>
              <Menu className="w-6 h-6" />
            </button>
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto p-4 lg:p-8">{children}</main>
        </div>
      </div>
    </ValuesVisibilityContext.Provider>
  );
};