# 🚀 GUIA COMPLETO: Kommo + WhatsApp + Twilio

## 📋 ÍNDICE
1. [Preparação do Ambiente](#1-preparação-do-ambiente)
2. [Configuração do Backend](#2-configuração-do-backend)
3. [Configuração das Credenciais](#3-configuração-das-credenciais)
4. [Integração com Frontend](#4-integração-com-frontend)
5. [Configuração do Kommo](#5-configuração-do-kommo)
6. [Testes e Validação](#6-testes-e-validação)
7. [Deploy e Produção](#7-deploy-e-produção)

---

## 1. PREPARAÇÃO DO AMBIENTE

### 1.1 Requisitos
- Node.js (versão 18+)
- NPM ou Yarn
- Conta Twilio
- Acesso ao Kommo
- Editor de código (VS Code recomendado)

### 1.2 Estrutura de Pastas
```
meu-projeto/
├── backend/                 # API Node.js
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── services/
│   │   └── utils/
│   ├── .env
│   ├── package.json
│   └── server.js
├── frontend/               # Dashboard React (já criado)
└── shared/                # Tipos compartilhados
    └── types.ts
```

---

## 2. CONFIGURAÇÃO DO BACKEND

### 2.1 Criar o Backend

**Passo 1: Criar pasta e inicializar**
```bash
mkdir backend
cd backend
npm init -y
```

**Passo 2: Instalar dependências**
```bash
npm install express cors dotenv twilio helmet morgan
npm install -D nodemon @types/node
```

### 2.2 Arquivo package.json
```json
{
  "name": "kommo-whatsapp-backend",
  "version": "1.0.0",
  "description": "Backend para notificações WhatsApp do Kommo",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "test": "node test.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "twilio": "^4.19.0",
    "helmet": "^7.1.0",
    "morgan": "^1.10.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.2",
    "@types/node": "^20.10.0"
  }
}
```

### 2.3 Seu Código Melhorado (whatsapp-service.js)
```javascript
// backend/src/services/whatsapp-service.js
require('dotenv').config();
const twilio = require('twilio');

// Configuração do cliente Twilio
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// Logs para armazenar histórico
let notificationLogs = [];

/**
 * Função principal para enviar notificação ao vendedor
 */
async function sendWhatsAppToSeller(params) {
  const { cliente_nome, produto, cnpj, cliente_numero, vendedor_numero } = params;
  
  const logId = Date.now().toString();
  
  try {
    // Validações
    if (!cliente_nome || !cliente_numero || !vendedor_numero) {
      throw new Error('Campos obrigatórios não preenchidos');
    }

    // Formata o número do cliente para exibição
    const numeroFormatado = formatPhoneNumber(cliente_numero);
    
    // Monta a mensagem
    const message = `🔔 *NOVO ATENDIMENTO PENDENTE*
    
👤 *Cliente:* ${cliente_nome}
📱 *WhatsApp:* ${numeroFormatado}
🛍️ *Produto:* ${produto}
🏢 *CNPJ:* ${cnpj || 'Não informado'}

⚡ *Ação necessária:* Entre em contato com o cliente para dar continuidade ao atendimento.

_Mensagem automática do sistema Kommo_`;

    console.log(`📤 Enviando notificação para ${vendedor_numero}`);
    console.log(`📝 Mensagem: ${message}`);

    // Envia via Twilio
    const twilioMessage = await client.messages.create({
      from: process.env.TWILIO_WHATSAPP_NUMBER,
      to: `whatsapp:${vendedor_numero}`,
      body: message
    });

    // Log de sucesso
    const successLog = {
      id: logId,
      timestamp: new Date().toISOString(),
      cliente_nome,
      cliente_numero,
      produto,
      vendedor_numero,
      status: 'success',
      twilio_sid: twilioMessage.sid,
      message: 'Notificação enviada com sucesso'
    };

    notificationLogs.unshift(successLog);
    console.log('✅ Notificação enviada com sucesso!');
    console.log('📋 SID:', twilioMessage.sid);

    return {
      success: true,
      sid: twilioMessage.sid,
      message: 'Notificação enviada com sucesso',
      log: successLog
    };

  } catch (error) {
    // Log de erro
    const errorLog = {
      id: logId,
      timestamp: new Date().toISOString(),
      cliente_nome,
      cliente_numero: cliente_numero || 'Não informado',
      produto: produto || 'Não informado',
      vendedor_numero: vendedor_numero || 'Não informado',
      status: 'failed',
      error: error.message,
      message: 'Falha no envio da notificação'
    };

    notificationLogs.unshift(errorLog);
    console.error('❌ Erro ao enviar notificação:', error.message);

    return {
      success: false,
      error: error.message,
      message: 'Falha no envio da notificação',
      log: errorLog
    };
  }
}

/**
 * Função para formatar número de telefone brasileiro
 */
function formatPhoneNumber(numero) {
  if (!numero) return 'Número não informado';
  
  const cleaned = numero.replace(/\D/g, '');
  
  if (cleaned.length === 13 && cleaned.startsWith('55')) {
    return `+${cleaned.substring(0, 2)} (${cleaned.substring(2, 4)}) ${cleaned.substring(4, 9)}-${cleaned.substring(9)}`;
  } else if (cleaned.length === 11) {
    return `(${cleaned.substring(0, 2)}) ${cleaned.substring(2, 7)}-${cleaned.substring(7)}`;
  }
  
  return numero;
}

/**
 * Processa dados vindos do Kommo
 */
async function processKommoLead(kommoData) {
  try {
    console.log('📥 Processando lead do Kommo:', JSON.stringify(kommoData, null, 2));

    const leadData = {
      cliente_nome: kommoData.name || kommoData.contact?.name || 'Cliente não identificado',
      produto: kommoData.custom_fields?.produto || kommoData.produto || 'Produto não especificado',
      cnpj: kommoData.custom_fields?.cnpj || kommoData.cnpj || null,
      cliente_numero: kommoData.contact?.phone || kommoData.phone || kommoData.cliente_numero,
      vendedor_numero: process.env.VENDEDOR_WHATSAPP || '+5598984865648'
    };

    console.log('📋 Dados processados:', leadData);

    if (!leadData.cliente_numero) {
      throw new Error('Número do cliente não encontrado nos dados do Kommo');
    }

    const result = await sendWhatsAppToSeller(leadData);
    
    if (result.success) {
      console.log('🎯 Lead processado com sucesso:', leadData.cliente_nome);
    }
    
    return result;
    
  } catch (error) {
    console.error('❌ Erro ao processar lead do Kommo:', error.message);
    return { 
      success: false, 
      error: error.message,
      message: 'Erro ao processar dados do Kommo'
    };
  }
}

/**
 * Retorna logs de notificação
 */
function getNotificationLogs(limit = 50) {
  return notificationLogs.slice(0, limit);
}

/**
 * Retorna estatísticas
 */
function getStats() {
  const total = notificationLogs.length;
  const success = notificationLogs.filter(log => log.status === 'success').length;
  const failed = notificationLogs.filter(log => log.status === 'failed').length;
  
  return {
    totalSent: total,
    successCount: success,
    failedCount: failed,
    successRate: total > 0 ? ((success / total) * 100).toFixed(1) : 0,
    pendingLeads: 0, // Implementar se necessário
    activeVendors: 1
  };
}

module.exports = {
  sendWhatsAppToSeller,
  processKommoLead,
  formatPhoneNumber,
  getNotificationLogs,
  getStats
};
```

### 2.4 Servidor Principal (server.js)
```javascript
// backend/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const { 
  sendWhatsAppToSeller, 
  processKommoLead, 
  getNotificationLogs, 
  getStats 
} = require('./src/services/whatsapp-service');

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(helmet());
app.use(morgan('combined'));
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:8080',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// Middleware para logs de requisições
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// ==================== ROTAS DA API ====================

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'Kommo WhatsApp Notifications'
  });
});

// Estatísticas para o dashboard
app.get('/api/stats', (req, res) => {
  try {
    const stats = getStats();
    res.json(stats);
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Teste de notificação
app.post('/api/test-notification', async (req, res) => {
  try {
    console.log('🧪 Teste de notificação recebido:', req.body);
    
    const result = await sendWhatsAppToSeller(req.body);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Erro no teste de notificação:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Erro interno do servidor'
    });
  }
});

// Logs de notificação
app.get('/api/logs', (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const logs = getNotificationLogs(limit);
    res.json(logs);
  } catch (error) {
    console.error('Erro ao buscar logs:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Webhook do Kommo
app.post('/webhook/kommo', async (req, res) => {
  try {
    console.log('📥 Webhook do Kommo recebido');
    console.log('Headers:', req.headers);
    console.log('Body:', JSON.stringify(req.body, null, 2));
    
    const result = await processKommoLead(req.body);
    
    res.json({
      success: result.success,
      message: result.success ? 'Notificação processada' : 'Falha no processamento',
      details: result
    });
  } catch (error) {
    console.error('❌ Erro no webhook do Kommo:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
});

// Configuração (placeholder para futuras implementações)
app.get('/api/config', (req, res) => {
  res.json({
    twilioConfigured: !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN),
    vendorWhatsApp: process.env.VENDEDOR_WHATSAPP || null
  });
});

app.post('/api/config', (req, res) => {
  // Implementar salvamento de configurações se necessário
  res.json({ message: 'Configuração salva (implementar persistence)' });
});

// Middleware para rotas não encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Rota não encontrada',
    path: req.originalUrl,
    method: req.method
  });
});

// Middleware para tratamento de erros
app.use((error, req, res, next) => {
  console.error('Erro não tratado:', error);
  res.status(500).json({
    error: 'Erro interno do servidor',
    message: error.message
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📊 Dashboard: http://localhost:8080`);
  console.log(`🔌 API: http://localhost:${PORT}`);
  console.log(`🎯 Webhook Kommo: http://localhost:${PORT}/webhook/kommo`);
  console.log(`💚 Health check: http://localhost:${PORT}/health`);
  
  // Verificar configurações
  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
    console.log('✅ Twilio configurado');
  } else {
    console.log('⚠️ Twilio NÃO configurado - verifique .env');
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 Recebido SIGTERM, encerrando servidor...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 Recebido SIGINT, encerrando servidor...');
  process.exit(0);
});
```

---

## 3. CONFIGURAÇÃO DAS CREDENCIAIS

### 3.1 Arquivo .env (backend/.env)
```env
# Credenciais do Twilio
TWILIO_ACCOUNT_SID=seu_account_sid_aqui
TWILIO_AUTH_TOKEN=seu_auth_token_aqui
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886

# Configurações do vendedor
VENDEDOR_WHATSAPP=+5598984865648

# Configurações do servidor
PORT=3001
NODE_ENV=development

# Frontend URL (para CORS)
FRONTEND_URL=http://localhost:8080

# Outras configurações
LOG_LEVEL=info
```

### 3.2 Como obter credenciais do Twilio

**Passo 1: Criar conta no Twilio**
1. Acesse https://www.twilio.com/
2. Crie uma conta gratuita
3. Verifique seu número de telefone

**Passo 2: Configurar WhatsApp Sandbox**
1. Vá para Console → Messaging → Try it out → Send a WhatsApp message
2. Siga as instruções para configurar o sandbox
3. Anote o número do WhatsApp Sandbox (ex: +14155238886)

**Passo 3: Obter credenciais**
1. No Console do Twilio, vá para Account → Account Info
2. Copie o "Account SID"
3. Copie o "Auth Token"
4. Cole no arquivo .env

---

## 4. INTEGRAÇÃO COM FRONTEND

### 4.1 Atualizar TestNotification.tsx
```typescript
// src/components/TestNotification.tsx (substituir função simulateNotificationSend)

const sendRealNotification = async (testData: TestData): Promise<TestResult> => {
  try {
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
    return {
      success: false,
      message: 'Erro de conexão com o servidor',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    };
  }
};
```

### 4.2 Atualizar ConnectionStatus.tsx
```typescript
// src/components/ConnectionStatus.tsx (adicionar verificação real)

import { useEffect, useState } from 'react';

export function ConnectionStatus() {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const response = await fetch('http://localhost:3001/health');
        setIsConnected(response.ok);
      } catch (error) {
        setIsConnected(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkConnection();
    const interval = setInterval(checkConnection, 30000); // Verifica a cada 30s

    return () => clearInterval(interval);
  }, []);

  // Resto do componente...
  const connectionStatus = isLoading ? 'Verificando...' : (isConnected ? 'Conectado' : 'Desconectado');
  const statusColor = isLoading ? 'warning' : (isConnected ? 'success' : 'destructive');

  // ... resto do JSX
}
```

---

## 5. CONFIGURAÇÃO DO KOMMO

### 5.1 Configurar Campos Customizados

**No painel do Kommo:**
1. Vá para Configurações → Campos customizados
2. Crie os campos:
   - `produto` (Texto) - Produto de interesse
   - `cnpj` (Texto) - CNPJ da empresa

### 5.2 Configurar Robot/Automação

**Passo 1: Criar novo Robot**
1. Vá para Configurações → Robots
2. Clique em "Criar robot"
3. Nome: "Notificação WhatsApp Vendedor"

**Passo 2: Configurar Trigger**
- **Quando:** Contato adicionado OU Status alterado
- **Condição:** Todos os leads que precisam de notificação

**Passo 3: Configurar Ação**
1. Adicione ação "Webhook"
2. URL: `http://SEU_SERVIDOR.com/webhook/kommo` (ou localhost:3001 para testes)
3. Método: POST
4. Headers: `Content-Type: application/json`

**Passo 4: Configurar Payload**
```json
{
  "name": "{{contact.name}}",
  "phone": "{{contact.phone}}",
  "produto": "{{contact.custom_fields.produto}}",
  "cnpj": "{{contact.custom_fields.cnpj}}",
  "lead_id": "{{lead.id}}",
  "timestamp": "{{current_datetime}}"
}
```

### 5.3 Testar Webhook (Localmente)

**Usando ngrok para expor localhost:**
```bash
# Instalar ngrok
npm install -g ngrok

# Expor porta 3001
ngrok http 3001

# Usar URL do ngrok no Kommo (ex: https://abc123.ngrok.io/webhook/kommo)
```

---

## 6. TESTES E VALIDAÇÃO

### 6.1 Script de Teste Completo
```javascript
// backend/test.js
require('dotenv').config();
const { sendWhatsAppToSeller, processKommoLead } = require('./src/services/whatsapp-service');

async function runTests() {
  console.log('🧪 Iniciando testes...\n');

  // Teste 1: Envio direto
  console.log('📱 Teste 1: Envio direto de notificação');
  const testData1 = {
    cliente_nome: 'João Silva (TESTE)',
    cliente_numero: '+5511987654321',
    produto: 'Sistema ERP Premium',
    cnpj: '12.345.678/0001-90',
    vendedor_numero: process.env.VENDEDOR_WHATSAPP || '+5598984865648'
  };

  const result1 = await sendWhatsAppToSeller(testData1);
  console.log('Resultado:', result1);
  console.log('---\n');

  // Teste 2: Processamento de lead do Kommo
  console.log('📥 Teste 2: Processamento de dados do Kommo');
  const kommoData = {
    name: 'Maria Santos (TESTE KOMMO)',
    contact: {
      phone: '+5511876543210'
    },
    custom_fields: {
      produto: 'CRM Premium',
      cnpj: '98.765.432/0001-10'
    }
  };

  const result2 = await processKommoLead(kommoData);
  console.log('Resultado:', result2);
  console.log('---\n');

  console.log('✅ Testes concluídos!');
}

runTests().catch(console.error);
```

### 6.2 Comandos para Testar

```bash
# No backend/
npm run dev          # Iniciar servidor

# Em outro terminal
node test.js         # Executar testes

# Testar API manualmente
curl -X POST http://localhost:3001/api/test-notification \
  -H "Content-Type: application/json" \
  -d '{
    "cliente_nome": "Teste API",
    "cliente_numero": "+5511999999999",
    "produto": "Teste",
    "vendedor_numero": "+5598984865648"
  }'
```

---

## 7. DEPLOY E PRODUÇÃO

### 7.1 Preparar para Produção

**Variáveis de ambiente para produção:**
```env
NODE_ENV=production
PORT=3001
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
VENDEDOR_WHATSAPP=+5598984865648
FRONTEND_URL=https://seu-dominio.com
```

### 7.2 Deploy Simples (VPS/Cloud)

**Usando PM2:**
```bash
# Instalar PM2
npm install -g pm2

# Iniciar aplicação
pm2 start server.js --name "kommo-whatsapp"

# Ver status
pm2 status

# Logs
pm2 logs kommo-whatsapp
```

### 7.3 Nginx (Reverse Proxy)
```nginx
server {
    listen 80;
    server_name seu-dominio.com;

    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    location /webhook {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## 🔧 TROUBLESHOOTING

### Problema: "Número não recebe mensagem"
**Soluções:**
1. Verificar se o número está no formato correto (`+55...`)
2. Confirmar que o número está registrado no Twilio Sandbox
3. Verificar logs do Twilio Console

### Problema: "Webhook não funciona"
**Soluções:**
1. Verificar se a URL está correta no Kommo
2. Usar ngrok para teste local
3. Verificar logs do servidor

### Problema: "Credenciais inválidas"
**Soluções:**
1. Revisar Account SID e Auth Token no .env
2. Verificar se as variáveis estão sendo carregadas
3. Testar credenciais no Twilio Console

### Comandos de Debug
```bash
# Ver logs em tempo real
tail -f /var/log/kommo-whatsapp.log

# Testar conexão Twilio
curl -X GET "https://api.twilio.com/2010-04-01/Accounts/$TWILIO_ACCOUNT_SID.json" \
  -u $TWILIO_ACCOUNT_SID:$TWILIO_AUTH_TOKEN

# Testar webhook local
curl -X POST http://localhost:3001/webhook/kommo \
  -H "Content-Type: application/json" \
  -d '{"name":"Teste","contact":{"phone":"+5511999999999"}}'
```

---

## ✅ CHECKLIST FINAL

- [ ] Backend Node.js funcionando
- [ ] Credenciais Twilio configuradas
- [ ] Teste de envio funcionando
- [ ] Webhook do Kommo configurado
- [ ] Frontend conectado ao backend
- [ ] Números de telefone testados
- [ ] Deploy em produção (se aplicável)
- [ ] Monitoramento configurado

---

## 📞 SUPORTE

Se tiver dúvidas, verifique:
1. Logs do servidor (`npm run dev`)
2. Console do navegador (F12)
3. Twilio Console para logs de mensagens
4. Este guia completo

**Sucesso! Seu sistema está pronto para funcionar!** 🚀