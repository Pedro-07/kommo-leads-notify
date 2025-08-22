import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MessageSquare, Settings, Activity, Phone, CheckCircle, AlertTriangle, Clock } from 'lucide-react';
import { NotificationConfig } from './NotificationConfig';
import { NotificationLogs } from './NotificationLogs';
import { TestNotification } from './TestNotification';
import { LiveMonitor } from './LiveMonitor';
import dashboardHero from '@/assets/dashboard-hero.jpg';

interface DashboardStats {
  totalSent: number;
  successRate: number;
  pendingLeads: number;
  activeVendors: number;
}

export function Dashboard() {
  const [stats] = useState<DashboardStats>({
    totalSent: 247,
    successRate: 98.2,
    pendingLeads: 12,
    activeVendors: 3
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-gradient-dark relative overflow-hidden">
        <div 
          className="absolute inset-0 opacity-20 bg-cover bg-center"
          style={{ backgroundImage: `url(${dashboardHero})` }}
        />
        <div className="container mx-auto px-4 py-8 relative z-10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">Sistema de Notificações</h1>
              <p className="text-muted-foreground text-lg">Kommo + WhatsApp via Twilio</p>
              <p className="text-muted-foreground text-sm mt-1">
                Automatize notificações de leads do seu CRM Kommo diretamente no WhatsApp
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="border-success text-success px-4 py-2">
                <div className="w-2 h-2 bg-success rounded-full mr-2 animate-pulse"></div>
                Online
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-card-foreground">
                Notificações Enviadas
              </CardTitle>
              <MessageSquare className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-card-foreground">{stats.totalSent}</div>
              <p className="text-xs text-muted-foreground">
                +12% desde ontem
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-card-foreground">
                Taxa de Sucesso
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-card-foreground">{stats.successRate}%</div>
              <p className="text-xs text-muted-foreground">
                +0.5% desde ontem
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-card-foreground">
                Atendimentos Pendentes
              </CardTitle>
              <Clock className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-card-foreground">{stats.pendingLeads}</div>
              <p className="text-xs text-muted-foreground">
                Aguardando contato
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-card-foreground">
                Vendedores Ativos
              </CardTitle>
              <Phone className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-card-foreground">{stats.activeVendors}</div>
              <p className="text-xs text-muted-foreground">
                Recebendo notificações
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="monitor" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4 bg-muted">
            <TabsTrigger value="monitor" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Activity className="mr-2 h-4 w-4" />
              Monitor
            </TabsTrigger>
            <TabsTrigger value="config" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Settings className="mr-2 h-4 w-4" />
              Configuração
            </TabsTrigger>
            <TabsTrigger value="logs" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <MessageSquare className="mr-2 h-4 w-4" />
              Logs
            </TabsTrigger>
            <TabsTrigger value="test" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Phone className="mr-2 h-4 w-4" />
              Teste
            </TabsTrigger>
          </TabsList>

          <TabsContent value="monitor" className="space-y-4">
            <LiveMonitor />
          </TabsContent>

          <TabsContent value="config" className="space-y-4">
            <NotificationConfig />
          </TabsContent>

          <TabsContent value="logs" className="space-y-4">
            <NotificationLogs />
          </TabsContent>

          <TabsContent value="test" className="space-y-4">
            <TestNotification />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}