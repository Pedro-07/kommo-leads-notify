import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Activity, Clock, Phone, MessageCircle, TrendingUp, Users } from 'lucide-react';

interface LiveActivity {
  id: string;
  timestamp: string;
  type: 'new_lead' | 'notification_sent' | 'vendor_response' | 'system_event';
  title: string;
  description: string;
  status: 'success' | 'pending' | 'info';
  clienteName?: string;
  vendorName?: string;
}

interface ActiveLead {
  id: string;
  clienteName: string;
  produto: string;
  timestamp: string;
  status: 'waiting_contact' | 'in_progress' | 'contacted';
  vendorName: string;
  elapsedTime: string;
}

export function LiveMonitor() {
  const [activities, setActivities] = useState<LiveActivity[]>([
    {
      id: '1',
      timestamp: '14:35:22',
      type: 'new_lead',
      title: 'Novo Lead Recebido',
      description: 'João Silva interessado em Sistema ERP',
      status: 'info',
      clienteName: 'João Silva'
    },
    {
      id: '2',
      timestamp: '14:35:25',
      type: 'notification_sent',
      title: 'Notificação Enviada',
      description: 'WhatsApp enviado para Vendedor Principal',
      status: 'success',
      vendorName: 'Vendedor Principal'
    },
    {
      id: '3',
      timestamp: '14:30:15',
      type: 'vendor_response',
      title: 'Vendedor Respondeu',
      description: 'Maria Santos - Contato realizado com sucesso',
      status: 'success',
      clienteName: 'Maria Santos',
      vendorName: 'Vendedor Principal'
    }
  ]);

  const [activeLeads, setActiveLeads] = useState<ActiveLead[]>([
    {
      id: '1',
      clienteName: 'João Silva',
      produto: 'Sistema ERP',
      timestamp: '14:35:22',
      status: 'waiting_contact',
      vendorName: 'Vendedor Principal',
      elapsedTime: '5 min'
    },
    {
      id: '2',
      clienteName: 'Ana Costa',
      produto: 'CRM Premium',
      timestamp: '14:20:10',
      status: 'in_progress',
      vendorName: 'Vendedor Principal',
      elapsedTime: '20 min'
    },
    {
      id: '3',
      clienteName: 'Pedro Santos',
      produto: 'Sistema Financeiro',
      timestamp: '14:10:45',
      status: 'waiting_contact',
      vendorName: 'Vendedor Principal',
      elapsedTime: '30 min'
    }
  ]);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Update elapsed times
      setActiveLeads(prev => prev.map(lead => ({
        ...lead,
        elapsedTime: updateElapsedTime(lead.timestamp)
      })));
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  const updateElapsedTime = (timestamp: string): string => {
    // This is a simplified calculation for demo purposes
    const now = new Date();
    const leadTime = new Date();
    const [hours, minutes] = timestamp.split(':');
    leadTime.setHours(parseInt(hours), parseInt(minutes), 0);
    
    const diffMs = now.getTime() - leadTime.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 60) {
      return `${diffMins} min`;
    } else {
      const diffHours = Math.floor(diffMins / 60);
      const remainingMins = diffMins % 60;
      return `${diffHours}h ${remainingMins}min`;
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'new_lead':
        return <Users className="h-4 w-4 text-primary" />;
      case 'notification_sent':
        return <MessageCircle className="h-4 w-4 text-success" />;
      case 'vendor_response':
        return <Phone className="h-4 w-4 text-accent" />;
      case 'system_event':
        return <Activity className="h-4 w-4 text-muted-foreground" />;
      default:
        return <Activity className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'waiting_contact':
        return <Badge className="bg-accent text-accent-foreground">Aguardando Contato</Badge>;
      case 'in_progress':
        return <Badge className="bg-primary text-primary-foreground">Em Andamento</Badge>;
      case 'contacted':
        return <Badge className="bg-success text-success-foreground">Contatado</Badge>;
      default:
        return <Badge variant="outline">Desconhecido</Badge>;
    }
  };

  const getActivityStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-success text-success-foreground">✓</Badge>;
      case 'pending':
        return <Badge className="bg-accent text-accent-foreground">⏳</Badge>;
      case 'info':
        return <Badge variant="outline">ℹ</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Live Activity Feed */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-card-foreground">
            <Activity className="h-5 w-5 text-primary" />
            Atividade em Tempo Real
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Feed ao vivo de todas as atividades do sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            <div className="space-y-3">
              {activities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 p-3 border border-border rounded-lg bg-muted/20"
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-card-foreground">
                        {activity.title}
                      </p>
                      <div className="flex items-center gap-2">
                        {getActivityStatusBadge(activity.status)}
                        <span className="text-xs text-muted-foreground">
                          {activity.timestamp}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {activity.description}
                    </p>
                    {(activity.clienteName || activity.vendorName) && (
                      <div className="flex gap-2 mt-2">
                        {activity.clienteName && (
                          <Badge variant="outline" className="text-xs">
                            Cliente: {activity.clienteName}
                          </Badge>
                        )}
                        {activity.vendorName && (
                          <Badge variant="outline" className="text-xs">
                            Vendedor: {activity.vendorName}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Active Leads */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-card-foreground">
            <Clock className="h-5 w-5 text-primary" />
            Atendimentos Ativos
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Leads que estão aguardando ou em atendimento
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            <div className="space-y-3">
              {activeLeads.map((lead) => (
                <div
                  key={lead.id}
                  className="p-4 border border-border rounded-lg bg-muted/20 hover:bg-muted/40 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-card-foreground">{lead.clienteName}</h4>
                    {getStatusBadge(lead.status)}
                  </div>
                  
                  <div className="space-y-1 text-sm">
                    <p className="text-muted-foreground">
                      <span className="font-medium">Produto:</span> {lead.produto}
                    </p>
                    <p className="text-muted-foreground">
                      <span className="font-medium">Vendedor:</span> {lead.vendorName}
                    </p>
                    <p className="text-muted-foreground">
                      <span className="font-medium">Tempo decorrido:</span> {lead.elapsedTime}
                    </p>
                  </div>
                  
                  <div className="flex gap-2 mt-3">
                    <Button size="sm" variant="outline" className="text-xs">
                      Ver Detalhes
                    </Button>
                    {lead.status === 'waiting_contact' && (
                      <Button size="sm" className="text-xs bg-gradient-primary">
                        Marcar como Contatado
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Real-time Stats */}
      <div className="lg:col-span-2">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-card-foreground">
              <TrendingUp className="h-5 w-5 text-primary" />
              Estatísticas em Tempo Real
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-success">12</div>
                <div className="text-sm text-muted-foreground">Notificações Hoje</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-accent">3</div>
                <div className="text-sm text-muted-foreground">Pendentes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">98%</div>
                <div className="text-sm text-muted-foreground">Taxa de Entrega</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-card-foreground">15min</div>
                <div className="text-sm text-muted-foreground">Tempo Médio</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}