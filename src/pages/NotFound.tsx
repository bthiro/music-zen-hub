import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-4xl font-bold">404</CardTitle>
          <p className="text-xl text-muted-foreground">Página não encontrada</p>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">
            A página <code className="bg-muted px-2 py-1 rounded text-sm">{location.pathname}</code> não existe.
          </p>
          
          <div className="flex flex-col gap-2">
            <Button asChild className="w-full">
              <Link to="/auth">
                <Home className="h-4 w-4 mr-2" />
                Voltar ao Início
              </Link>
            </Button>
            
            <Button variant="outline" onClick={() => window.history.back()} className="w-full">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </div>
          
          <p className="text-xs text-muted-foreground mt-4">
            Se você acredita que esta página deveria existir, entre em contato com o suporte.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotFound;
