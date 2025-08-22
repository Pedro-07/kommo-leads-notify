import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Server, Code, ExternalLink } from 'lucide-react';

export function ConnectionStatus() {
  const isBackendConnected = false; // Sempre false até implementar backend real

  return (
    <Card className="bg-card border-border border-2 border-accent">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-card-foreground">
          <Server className="h-5 w-5 text-accent" />
          Status da Integração
          <Badge variant="destructive" className="ml-auto">
            Desconectado
          </Badge>
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Backend Node.js necessário para envios reais
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start gap-3 p-4 border border-accent rounded-lg bg-accent/10">
          <AlertTriangle className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
          <div className="space-y-2">
            <p className="text-sm font-medium text-card-foreground">
              ⚠️ Dashboard em modo de demonstração
            </p>
            <p className="text-sm text-muted-foreground">
              Este dashboard é apenas a interface visual. Para enviar mensagens reais via Twilio, 
              você precisa configurar o backend usando seu código Node.js existente.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="font-medium text-card-foreground">Para conectar seu backend:</h4>
          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium">1</div>
              <span>Crie um servidor Express.js usando seu código</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium">2</div>
              <span>Configure as rotas da API (/api/test-notification, /api/stats, etc.)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium">3</div>
              <span>Atualize as chamadas da API no frontend</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium">4</div>
              <span>Configure o webhook do Kommo para sua API</span>
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => window.open('/INTEGRATION.md', '_blank')}
            className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
          >
            <Code className="mr-2 h-4 w-4" />
            Ver Guia de Integração
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => window.open('https://docs.lovable.dev/tips-tricks/troubleshooting', '_blank')}
            className="border-muted-foreground text-muted-foreground"
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            Documentação
          </Button>
        </div>

        {/* Status técnico */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
          <div className="text-center">
            <div className="text-lg font-bold text-destructive">❌</div>
            <div className="text-xs text-muted-foreground">Backend API</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-destructive">❌</div>
            <div className="text-xs text-muted-foreground">Webhook Kommo</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}