import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Send, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface TestData {
  clienteName: string;
  clienteNumber: string;
  produto: string;
  cnpj: string;
  vendorNumber: string;
}

interface TestResult {
  success: boolean;
  message: string;
  twilioSid?: string;
  error?: string;
}

export function TestNotification() {
  const [testData, setTestData] = useState<TestData>({
    clienteName: 'João Silva (TESTE)',
    clienteNumber: '+5511987654321',
    produto: 'Sistema ERP Premium',
    cnpj: '12.345.678/0001-90',
    vendorNumber: '+5598984865648'
  });

  const [isLoading, setIsLoading] = useState(false);
  const [lastResult, setLastResult] = useState<TestResult | null>(null);

  const handleInputChange = (field: keyof TestData, value: string) => {
    setTestData(prev => ({ ...prev, [field]: value }));
  };

  const simulateNotificationSend = async (): Promise<TestResult> => {
    try {
      // Tentar se conectar ao backend real primeiro
      const response = await fetch('http://localhost:3001/api/test-notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cliente_nome: testData.clienteName,
          cliente_numero: testData.clienteNumber,
          produto: testData.produto,
          cnpj: testData.cnpj,
          vendedor_numero: testData.vendorNumber
        })
      });

      const result = await response.json();
      
      if (response.ok && result.success) {
        return {
          success: true,
          message: result.message || 'Notificação enviada com sucesso!',
          twilioSid: result.sid
        };
      } else {
        return {
          success: false,
          message: result.message || 'Falha no envio da notificação',
          error: result.error || 'Erro desconhecido'
        };
      }
    } catch (error) {
      // Se não conseguir conectar ao backend, mostrar mensagem educativa
      return {
        success: false,
        message: '⚠️ Backend não encontrado',
        error: 'Para enviar mensagens reais, configure o backend conforme GUIA_COMPLETO_INSTALACAO.md ou INICIO_RAPIDO.md'
      };
    }
  };

  const handleSendTest = async () => {
    setIsLoading(true);
    setLastResult(null);

    try {
      // Validação básica
      if (!testData.clienteName || !testData.clienteNumber || !testData.vendorNumber) {
        throw new Error('Campos obrigatórios não preenchidos');
      }

      const result = await simulateNotificationSend();
      setLastResult(result);

      if (result.success) {
        toast({
          title: "✅ Teste enviado com sucesso!",
          description: `SID: ${result.twilioSid}`,
          className: "border-success"
        });
      } else {
        toast({
          title: "❌ Falha no teste",
          description: result.error || "Erro desconhecido",
          variant: "destructive"
        });
      }
    } catch (error) {
      const errorResult = {
        success: false,
        message: 'Erro na validação',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
      setLastResult(errorResult);
      
      toast({
        title: "❌ Erro na validação",
        description: errorResult.error,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generatePreviewMessage = () => {
    return `🔔 *NOVO ATENDIMENTO PENDENTE*
  
👤 *Cliente:* ${testData.clienteName}
📱 *WhatsApp:* ${testData.clienteNumber}
🛍️ *Produto:* ${testData.produto}
🏢 *CNPJ:* ${testData.cnpj || 'Não informado'}

⚡ *Ação necessária:* Entre em contato com o cliente para dar continuidade ao atendimento.

_Mensagem automática do sistema Kommo_`;
  };

  return (
    <div className="space-y-6">
      {/* Test Form */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-card-foreground">
            <Send className="h-5 w-5 text-primary" />
            Teste de Notificação
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Envie uma notificação de teste para verificar a integração
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="clienteName" className="text-card-foreground">Nome do Cliente</Label>
              <Input
                id="clienteName"
                value={testData.clienteName}
                onChange={(e) => handleInputChange('clienteName', e.target.value)}
                className="bg-input border-border text-foreground"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="clienteNumber" className="text-card-foreground">WhatsApp do Cliente</Label>
              <Input
                id="clienteNumber"
                placeholder="+5511999999999"
                value={testData.clienteNumber}
                onChange={(e) => handleInputChange('clienteNumber', e.target.value)}
                className="bg-input border-border text-foreground"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="produto" className="text-card-foreground">Produto</Label>
              <Input
                id="produto"
                value={testData.produto}
                onChange={(e) => handleInputChange('produto', e.target.value)}
                className="bg-input border-border text-foreground"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="cnpj" className="text-card-foreground">CNPJ (opcional)</Label>
              <Input
                id="cnpj"
                placeholder="00.000.000/0000-00"
                value={testData.cnpj}
                onChange={(e) => handleInputChange('cnpj', e.target.value)}
                className="bg-input border-border text-foreground"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="vendorNumber" className="text-card-foreground">WhatsApp do Vendedor</Label>
            <Input
              id="vendorNumber"
              placeholder="+5598999999999"
              value={testData.vendorNumber}
              onChange={(e) => handleInputChange('vendorNumber', e.target.value)}
              className="bg-input border-border text-foreground"
            />
          </div>

          <Button
            onClick={handleSendTest}
            disabled={isLoading}
            className="w-full bg-gradient-primary hover:shadow-success"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enviando teste...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Enviar Notificação de Teste
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Message Preview */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-card-foreground">Preview da Mensagem</CardTitle>
          <CardDescription className="text-muted-foreground">
            Visualize como a mensagem será enviada
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-muted/20 border border-border rounded-lg p-4">
            <pre className="whitespace-pre-wrap text-sm text-card-foreground font-mono">
              {generatePreviewMessage()}
            </pre>
          </div>
        </CardContent>
      </Card>

      {/* Last Result */}
      {lastResult && (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-card-foreground">
              {lastResult.success ? (
                <CheckCircle className="h-5 w-5 text-success" />
              ) : (
                <XCircle className="h-5 w-5 text-destructive" />
              )}
              Resultado do Último Teste
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge className={lastResult.success ? "bg-success text-success-foreground" : "bg-destructive text-destructive-foreground"}>
                {lastResult.success ? 'Sucesso' : 'Falha'}
              </Badge>
              <span className="text-sm text-card-foreground">{lastResult.message}</span>
            </div>
            
            {lastResult.twilioSid && (
              <div className="text-sm">
                <span className="text-muted-foreground">Twilio SID: </span>
                <span className="font-mono text-card-foreground">{lastResult.twilioSid}</span>
              </div>
            )}
            
            {lastResult.error && (
              <div className="text-sm text-destructive">
                <span className="font-medium">Erro: </span>
                {lastResult.error}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}