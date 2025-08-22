# Como Integrar seu Código com este Dashboard

Este dashboard foi criado para complementar seu sistema de notificações WhatsApp + Kommo. Aqui está como integrar sua lógica backend com esta interface.

## 📋 Visão Geral

O dashboard fornece uma interface completa para:
- **Configurar** credenciais do Twilio
- **Monitorar** notificações em tempo real
- **Testar** envios de notificação
- **Visualizar** logs de atividade

## 🔧 Integração Backend

### 1. Usar seu código como API Backend

Crie um servidor Express.js usando seu código:

```javascript
// server.js
const express = require('express');
const cors = require('cors');
const { sendWhatsAppToSeller, processKommoLead, setupWebhook } = require('./whatsapp-notification');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes para o dashboard
app.get('/api/stats', (req, res) => {
  res.json({
    totalSent: 247,
    successRate: 98.2,
    pendingLeads: 12,
    activeVendors: 3
  });
});

app.post('/api/test-notification', async (req, res) => {
  try {
    const result = await sendWhatsAppToSeller(req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/logs', (req, res) => {
  // Retorna logs das notificações (implementar storage)
  res.json([]);
});

// Webhook do Kommo (seu código existente)
setupWebhook(app);

app.listen(3001, () => {
  console.log('🚀 API rodando na porta 3001');
});
```

### 2. Conectar Frontend com Backend

No dashboard React, adicione as chamadas para sua API:

```typescript
// src/services/api.ts
const API_BASE = 'http://localhost:3001/api';

export const api = {
  async getStats() {
    const response = await fetch(`${API_BASE}/stats`);
    return response.json();
  },

  async testNotification(data: any) {
    const response = await fetch(`${API_BASE}/test-notification`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();
  },

  async getLogs() {
    const response = await fetch(`${API_BASE}/logs`);
    return response.json();
  }
};
```

## 🏗️ Estrutura de Integração Recomendada

```
projeto/
├── frontend/          # Este dashboard React
│   ├── src/
│   │   ├── components/
│   │   ├── services/  # Comunicação com backend
│   │   └── hooks/     # Estado da aplicação
│   └── package.json
│
├── backend/           # Seu código Node.js
│   ├── whatsapp-notification.js  # Seu código original
│   ├── server.js      # Express server
│   ├── routes/        # APIs para o dashboard
│   └── package.json
│
└── shared/            # Tipos TypeScript compartilhados
    └── types.ts
```

## 🔌 Endpoints Necessários

### Para o Dashboard funcionar completamente, implemente:

1. **GET /api/stats** - Estatísticas em tempo real
2. **POST /api/test-notification** - Teste de envio
3. **GET /api/logs** - Histórico de notificações
4. **POST /api/config** - Salvar configurações
5. **GET /api/config** - Obter configurações
6. **POST /webhook/kommo** - Webhook do Kommo (já implementado)

## 📊 Estrutura de Dados

### Configuração do Twilio
```typescript
interface TwilioConfig {
  accountSid: string;
  authToken: string;
  whatsappNumber: string;
  isActive: boolean;
}
```

### Log de Notificação
```typescript
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
```

## 🚀 Próximos Passos

1. **Configurar backend** usando seu código
2. **Implementar storage** para logs (SQLite, MongoDB, etc.)
3. **Configurar webhook** do Kommo apontando para sua API
4. **Testar integração** usando a aba "Teste" do dashboard
5. **Configurar produção** com HTTPS e domínio próprio

## 💾 Storage Recomendado

Para persistir logs e configurações:

```javascript
// Exemplo com SQLite
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('notifications.db');

// Tabela para logs
db.run(`CREATE TABLE IF NOT EXISTS notification_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  cliente_nome TEXT,
  cliente_numero TEXT,
  produto TEXT,
  vendedor_nome TEXT,
  vendedor_numero TEXT,
  status TEXT,
  twilio_sid TEXT,
  error_message TEXT
)`);

// Função para salvar log
function saveNotificationLog(logData) {
  const stmt = db.prepare(`INSERT INTO notification_logs 
    (cliente_nome, cliente_numero, produto, vendedor_nome, vendedor_numero, status, twilio_sid, error_message) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`);
  
  stmt.run([
    logData.cliente_nome,
    logData.cliente_numero,
    logData.produto,
    logData.vendedor_nome,
    logData.vendedor_numero,
    logData.status,
    logData.twilioSid,
    logData.error
  ]);
  
  stmt.finalize();
}
```

## 🔧 Configuração do Kommo

No seu Robot/Automação do Kommo, configure para enviar dados para:

```
URL: https://seu-dominio.com/webhook/kommo
Método: POST
Headers: Content-Type: application/json
```

O payload deve incluir:
- `name` ou `contact.name` - Nome do cliente
- `contact.phone` ou `phone` - WhatsApp do cliente
- `custom_fields.produto` - Produto de interesse
- `custom_fields.cnpj` - CNPJ (opcional)

## 📱 Testando a Integração

1. Use a aba **"Teste"** para enviar notificações de teste
2. Verifique os **logs** na aba "Logs"
3. Monitore atividade em **tempo real** na aba "Monitor"
4. Configure **credenciais** na aba "Configuração"

## 🆘 Troubleshooting

- **Erro 404**: Verifique se o backend está rodando na porta correta
- **CORS**: Configure CORS no Express para permitir requisições do frontend
- **Webhook não funciona**: Verifique URL, método HTTP e estrutura de dados
- **Notificações não chegam**: Confirme credenciais do Twilio e números formatados

---

Este dashboard está pronto para usar com seu código! Basta implementar as APIs backend e configurar as integrações.