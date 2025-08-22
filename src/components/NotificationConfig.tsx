import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Save, Key, Phone, MessageSquare, Eye, EyeOff } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface TwilioConfig {
  accountSid: string;
  authToken: string;
  whatsappNumber: string;
  isActive: boolean;
}

interface VendorConfig {
  name: string;
  whatsappNumber: string;
  isActive: boolean;
}

export function NotificationConfig() {
  const [twilioConfig, setTwilioConfig] = useState<TwilioConfig>({
    accountSid: '',
    authToken: '',
    whatsappNumber: 'whatsapp:+14155238886',
    isActive: true
  });

  const [vendors, setVendors] = useState<VendorConfig[]>([
    { name: 'Vendedor Principal', whatsappNumber: '+5598984865648', isActive: true }
  ]);

  const [messageTemplate, setMessageTemplate] = useState(`🔔 *NOVO ATENDIMENTO PENDENTE*
  
👤 *Cliente:* {{cliente_nome}}
📱 *WhatsApp:* {{cliente_numero}}
🛍️ *Produto:* {{produto}}
🏢 *CNPJ:* {{cnpj}}

⚡ *Ação necessária:* Entre em contato com o cliente para dar continuidade ao atendimento.

_Mensagem automática do sistema Kommo_`);

  const [showAuthToken, setShowAuthToken] = useState(false);

  const handleSaveConfig = () => {
    toast({
      title: "Configuração salva",
      description: "As configurações foram atualizadas com sucesso.",
      className: "border-success"
    });
  };

  const addVendor = () => {
    setVendors([...vendors, { name: '', whatsappNumber: '', isActive: true }]);
  };

  const updateVendor = (index: number, field: keyof VendorConfig, value: string | boolean) => {
    const updatedVendors = vendors.map((vendor, i) => 
      i === index ? { ...vendor, [field]: value } : vendor
    );
    setVendors(updatedVendors);
  };

  const removeVendor = (index: number) => {
    setVendors(vendors.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      {/* Twilio Configuration */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-card-foreground">
            <Key className="h-5 w-5 text-primary" />
            Configuração Twilio
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Configure suas credenciais do Twilio para envio de WhatsApp
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="accountSid" className="text-card-foreground">Account SID</Label>
              <Input
                id="accountSid"
                placeholder="AC..."
                value={twilioConfig.accountSid}
                onChange={(e) => setTwilioConfig({ ...twilioConfig, accountSid: e.target.value })}
                className="bg-input border-border text-foreground"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="authToken" className="text-card-foreground">Auth Token</Label>
              <div className="relative">
                <Input
                  id="authToken"
                  type={showAuthToken ? "text" : "password"}
                  placeholder="••••••••"
                  value={twilioConfig.authToken}
                  onChange={(e) => setTwilioConfig({ ...twilioConfig, authToken: e.target.value })}
                  className="bg-input border-border text-foreground pr-10"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAuthToken(!showAuthToken)}
                  className="absolute right-0 top-0 h-full px-3 text-muted-foreground hover:text-foreground"
                >
                  {showAuthToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="whatsappNumber" className="text-card-foreground">Número WhatsApp Twilio</Label>
            <Input
              id="whatsappNumber"
              placeholder="whatsapp:+14155238886"
              value={twilioConfig.whatsappNumber}
              onChange={(e) => setTwilioConfig({ ...twilioConfig, whatsappNumber: e.target.value })}
              className="bg-input border-border text-foreground"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="twilioActive"
              checked={twilioConfig.isActive}
              onCheckedChange={(checked) => setTwilioConfig({ ...twilioConfig, isActive: checked })}
            />
            <Label htmlFor="twilioActive" className="text-card-foreground">
              Ativar integração Twilio
            </Label>
          </div>
        </CardContent>
      </Card>

      {/* Vendors Configuration */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-card-foreground">
            <Phone className="h-5 w-5 text-primary" />
            Vendedores
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Configure os vendedores que receberão as notificações
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {vendors.map((vendor, index) => (
            <div key={index} className="flex items-center gap-4 p-4 border border-border rounded-lg bg-muted/20">
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  placeholder="Nome do vendedor"
                  value={vendor.name}
                  onChange={(e) => updateVendor(index, 'name', e.target.value)}
                  className="bg-input border-border text-foreground"
                />
                <Input
                  placeholder="+55..."
                  value={vendor.whatsappNumber}
                  onChange={(e) => updateVendor(index, 'whatsappNumber', e.target.value)}
                  className="bg-input border-border text-foreground"
                />
              </div>
              <Switch
                checked={vendor.isActive}
                onCheckedChange={(checked) => updateVendor(index, 'isActive', checked)}
              />
              <Button
                variant="destructive"
                size="sm"
                onClick={() => removeVendor(index)}
              >
                Remover
              </Button>
            </div>
          ))}
          <Button variant="outline" onClick={addVendor} className="border-border text-foreground">
            + Adicionar Vendedor
          </Button>
        </CardContent>
      </Card>

      {/* Message Template */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-card-foreground">
            <MessageSquare className="h-5 w-5 text-primary" />
            Template de Mensagem
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Personalize a mensagem enviada para os vendedores
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="messageTemplate" className="text-card-foreground">Template</Label>
            <Textarea
              id="messageTemplate"
              rows={12}
              value={messageTemplate}
              onChange={(e) => setMessageTemplate(e.target.value)}
              className="bg-input border-border text-foreground font-mono"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">{"{{cliente_nome}}"}</Badge>
            <Badge variant="secondary">{"{{cliente_numero}}"}</Badge>
            <Badge variant="secondary">{"{{produto}}"}</Badge>
            <Badge variant="secondary">{"{{cnpj}}"}</Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Use as variáveis acima no seu template. Elas serão substituídas pelos dados reais do cliente.
          </p>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button 
          onClick={handleSaveConfig}
          className="bg-gradient-primary hover:shadow-success"
        >
          <Save className="mr-2 h-4 w-4" />
          Salvar Configurações
        </Button>
      </div>
    </div>
  );
}