import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MetronomeAfinador } from "@/components/MetronomeAfinador";
import { Music, Headphones, Volume2 } from "lucide-react";

export default function Ferramentas() {
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Ferramentas Musicais</h2>
          <p className="text-muted-foreground">
            Recursos essenciais para suas aulas: metrônomo, afinador e muito mais
          </p>
        </div>

        {/* Metrônomo e Afinador */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Music className="h-5 w-5" />
              Metrônomo e Afinador Digital
            </CardTitle>
          </CardHeader>
          <CardContent>
            <MetronomeAfinador />
          </CardContent>
        </Card>

        {/* Gravador de Aula (Futuro) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Headphones className="h-5 w-5" />
              Gravador de Aula
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <Volume2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">Em Desenvolvimento</p>
              <p>Gravação e reprodução de áudio durante as aulas</p>
            </div>
          </CardContent>
        </Card>

        {/* Biblioteca de Exercícios (Futuro) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Music className="h-5 w-5" />
              Biblioteca de Exercícios
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <Music className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">Em Desenvolvimento</p>
              <p>Coleção de exercícios organizados por nível e instrumento</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}