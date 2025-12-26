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
  ChevronLeft,
  ChevronRight,
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
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showValues, setShowValues] = useState(true);

  const handleLogout = () => {
    navigate("/");
  };

  // Pages that should show the header (only Dashboard now)
  const showHeader = location.pathname === "/app";

  return (
    <ValuesVisibilityContext.Provider value={{ showValues, setShowValues }}>
      <div className="min-h-screen bg-background flex w-full">
        {/* Sidebar - Always fixed */}
        <aside
          className={`
            fixed inset-y-0 left-0 z-50
            ${isSidebarCollapsed ? "w-16" : "w-64"} bg-sidebar border-r border-sidebar-border
            transform transition-all duration-300 ease-in-out
            ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
            flex flex-col h-screen
          `}
        >
          {/* Logo */}
          <div className="h-16 flex items-center justify-center px-4 border-b border-sidebar-border shrink-0">
            {!isSidebarCollapsed ? (
              <>
                <Link to="/app" className="flex items-center gap-2 flex-1">
                  <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center shrink-0">
                    <span className="text-accent-foreground font-semibold text-sm">t</span>
                  </div>
                  <span className="font-semibold text-lg">tMoney</span>
                </Link>
                <button
                  className="hidden lg:flex text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-sidebar-accent transition-colors"
                  onClick={() => setIsSidebarCollapsed(true)}
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  className="lg:hidden text-muted-foreground hover:text-foreground"
                  onClick={() => setIsSidebarOpen(false)}
                >
                  <X className="w-5 h-5" />
                </button>
              </>
            ) : (
              <button
                className="hidden lg:flex text-muted-foreground hover:text-foreground p-2 rounded-lg hover:bg-sidebar-accent transition-colors"
                onClick={() => setIsSidebarCollapsed(false)}
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Navigation - Scrollable */}
          <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
            {!isSidebarCollapsed && (
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-3 mb-2">Menu</p>
            )}
            {menuItems.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setIsSidebarOpen(false)}
                  title={isSidebarCollapsed ? item.label : undefined}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-lg
                    transition-all duration-200
                    ${isSidebarCollapsed ? "justify-center" : ""}
                    ${
                      isActive
                        ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                        : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-foreground"
                    }
                  `}
                >
                  <item.icon className="w-5 h-5 shrink-0" />
                  {!isSidebarCollapsed && <span>{item.label}</span>}
                </Link>
              );
            })}
          </nav>

          {/* Bottom Navigation - Always Fixed at Bottom */}
          <div className="px-2 py-4 border-t border-sidebar-border space-y-1 shrink-0 mt-auto">
          {/* User Profile */}
            {!isSidebarCollapsed && (
              <div className="flex flex-col items-center text-center p-2 rounded-lg mb-2">
                <p className="text-sm font-medium truncate">João da Silva</p>
                <p className="text-xs text-muted-foreground truncate">joao@email.com</p>
              </div>
            )}

            {bottomMenuItems.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setIsSidebarOpen(false)}
                  title={isSidebarCollapsed ? item.label : undefined}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-lg
                    transition-all duration-200
                    ${isSidebarCollapsed ? "justify-center" : ""}
                    ${
                      isActive
                        ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                        : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-foreground"
                    }
                  `}
                >
                  <item.icon className="w-5 h-5 shrink-0" />
                  {!isSidebarCollapsed && <span>{item.label}</span>}
                </Link>
              );
            })}
            <button
              onClick={handleLogout}
              title={isSidebarCollapsed ? "Sair" : undefined}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg w-full text-left text-destructive hover:bg-destructive/10 transition-all duration-200 ${isSidebarCollapsed ? "justify-center" : ""}`}
            >
              <LogOut className="w-5 h-5 shrink-0" />
              {!isSidebarCollapsed && <span>Sair</span>}
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
        <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${isSidebarCollapsed ? "lg:ml-16" : "lg:ml-64"}`}>
          {/* Top Header - Mobile or Dashboard/Configurações */}
          {(showHeader || true) && (
            <header className={`h-16 flex items-center justify-between px-4 lg:px-8 border-b border-border bg-surface ${!showHeader ? "lg:hidden" : ""}`}>
              <div className="flex items-center gap-4">
                <button className="text-foreground lg:hidden" onClick={() => setIsSidebarOpen(true)}>
                  <Menu className="w-6 h-6" />
                </button>
                {showHeader && (
                  <h1 className="text-lg font-semibold hidden lg:block">
                    {location.pathname === "/app" ? "Dashboard" : "Configurações"}
                  </h1>
                )}
              </div>
              {showHeader && (
                <div className="hidden lg:flex items-center gap-2">
                  <Button variant="ghost" size="icon" onClick={() => setShowValues(!showValues)}>
                    {showValues ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                  </Button>
                  <ThemeToggle />
                </div>
              )}
            </header>
          )}

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto p-4 lg:p-8">{children}</main>
        </div>
      </div>
    </ValuesVisibilityContext.Provider>
  );
};
