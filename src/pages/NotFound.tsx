import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft, Search, MapPin } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-8">
        {/* Animated illustration */}
        <div className="relative">
          <div className="text-[120px] md:text-[160px] font-bold text-primary/10 select-none leading-none">
            404
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative">
              <div className="w-20 h-20 md:w-24 md:h-24 bg-primary/10 rounded-full flex items-center justify-center animate-pulse">
                <MapPin className="w-10 h-10 md:w-12 md:h-12 text-primary" />
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-destructive rounded-full flex items-center justify-center">
                <span className="text-destructive-foreground text-xs font-bold">?</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-4">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            Página não encontrada
          </h1>
          <p className="text-muted-foreground text-base md:text-lg">
            Ops! Parece que você se perdeu. A página que você está procurando não existe ou foi movida.
          </p>
          <p className="text-sm text-muted-foreground/70">
            Caminho tentado: <code className="bg-secondary px-2 py-1 rounded text-xs">{location.pathname}</code>
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
          <Link to="/">
            <Button variant="default" size="lg" className="w-full sm:w-auto gap-2">
              <Home className="w-4 h-4" />
              Ir para o início
            </Button>
          </Link>
          <Button 
            variant="outline" 
            size="lg" 
            className="w-full sm:w-auto gap-2"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Button>
        </div>

        {/* Footer tip */}
        <div className="pt-8 border-t border-border">
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Search className="w-4 h-4" />
            <span>Dica: verifique se o endereço está correto</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
