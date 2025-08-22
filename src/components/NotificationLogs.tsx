import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CheckCircle, XCircle, Clock, Search, Filter, Download } from 'lucide-react';

interface NotificationLog {
  id: string;
  timestamp: string;
  clienteName: string;
  clienteNumber: string;
  produto: string;
  vendorName: string;
  vendorNumber: string;
  status: 'success' | 'failed' | 'pending';
  twilioSid?: string;
  error?: string;
}

export function NotificationLogs() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  
  const [logs] = useState<NotificationLog[]>([
    {
      id: '1',
      timestamp: '2024-01-15 14:30:25',
      clienteName: 'João Silva',
      clienteNumber: '+5511987654321',
      produto: 'Sistema ERP',
      vendorName: 'Vendedor Principal',
      vendorNumber: '+5598984865648',
      status: 'success',
      twilioSid: 'SM1234567890'
    },
    {
      id: '2',
      timestamp: '2024-01-15 14:25:10',
      clienteName: 'Maria Santos',
      clienteNumber: '+5511876543210',
      produto: 'CRM Premium',
      vendorName: 'Vendedor Principal',
      vendorNumber: '+5598984865648',
      status: 'success',
      twilioSid: 'SM0987654321'
    },
    {
      id: '3',
      timestamp: '2024-01-15 14:20:45',
      clienteName: 'Pedro Costa',
      clienteNumber: '+5511765432109',
      produto: 'Sistema Financeiro',
      vendorName: 'Vendedor Principal',
      vendorNumber: '+5598984865648',
      status: 'failed',
      error: 'Número inválido'
    },
    {
      id: '4',
      timestamp: '2024-01-15 14:15:33',
      clienteName: 'Ana Oliveira',
      clienteNumber: '+5511654321098',
      produto: 'Automação Comercial',
      vendorName: 'Vendedor Principal',
      vendorNumber: '+5598984865648',
      status: 'pending'
    }
  ]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-destructive" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-accent" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-success text-success-foreground">Enviado</Badge>;
      case 'failed':
        return <Badge variant="destructive">Falha</Badge>;
      case 'pending':
        return <Badge className="bg-accent text-accent-foreground">Pendente</Badge>;
      default:
        return null;
    }
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.clienteName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.produto.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.vendorName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || log.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const exportLogs = () => {
    const csvContent = [
      ['Data/Hora', 'Cliente', 'Telefone', 'Produto', 'Vendedor', 'Status', 'Twilio SID', 'Erro'].join(','),
      ...filteredLogs.map(log => [
        log.timestamp,
        log.clienteName,
        log.clienteNumber,
        log.produto,
        log.vendorName,
        log.status,
        log.twilioSid || '',
        log.error || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `notification-logs-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-card-foreground">
          <Search className="h-5 w-5 text-primary" />
          Logs de Notificações
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Histórico completo de todas as notificações enviadas
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Buscar por cliente, produto ou vendedor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-input border-border text-foreground"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={filterStatus === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterStatus('all')}
            >
              Todos
            </Button>
            <Button
              variant={filterStatus === 'success' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterStatus('success')}
            >
              Sucesso
            </Button>
            <Button
              variant={filterStatus === 'failed' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterStatus('failed')}
            >
              Falha
            </Button>
            <Button
              variant={filterStatus === 'pending' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterStatus('pending')}
            >
              Pendente
            </Button>
            <Button variant="outline" size="sm" onClick={exportLogs}>
              <Download className="h-4 w-4 mr-1" />
              Exportar
            </Button>
          </div>
        </div>

        {/* Logs Table */}
        <ScrollArea className="h-[600px] border border-border rounded-lg">
          <div className="space-y-2 p-4">
            {filteredLogs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum log encontrado
              </div>
            ) : (
              filteredLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 border border-border rounded-lg bg-muted/20 hover:bg-muted/40 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    {getStatusIcon(log.status)}
                    {getStatusBadge(log.status)}
                  </div>
                  
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-sm">
                    <div>
                      <p className="font-medium text-card-foreground">{log.clienteName}</p>
                      <p className="text-muted-foreground">{log.clienteNumber}</p>
                    </div>
                    <div>
                      <p className="font-medium text-card-foreground">{log.produto}</p>
                      <p className="text-muted-foreground">{log.vendorName}</p>
                    </div>
                    <div>
                      <p className="font-medium text-card-foreground">{log.timestamp}</p>
                      {log.twilioSid && (
                        <p className="text-muted-foreground font-mono text-xs">{log.twilioSid}</p>
                      )}
                    </div>
                    <div>
                      {log.error && (
                        <p className="text-destructive text-xs">{log.error}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}