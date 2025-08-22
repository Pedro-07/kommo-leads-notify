# 🚀 INÍCIO RÁPIDO - 5 MINUTOS

## 1️⃣ CONFIGURAR BACKEND (2 minutos)

```bash
# Criar pasta e instalar
mkdir backend && cd backend
npm init -y
npm install express cors dotenv twilio helmet morgan
```

**Criar arquivo `.env`:**
```env
TWILIO_ACCOUNT_SID=seu_sid_aqui
TWILIO_AUTH_TOKEN=seu_token_aqui  
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
VENDEDOR_WHATSAPP=+5598984865648
PORT=3001
FRONTEND_URL=http://localhost:8080
```

**Criar arquivo `server.js`:**
```javascript
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const twilio = require('twilio');

const app = express();
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

app.use(cors());
app.use(express.json());

// Teste de notificação
app.post('/api/test-notification', async (req, res) => {
  try {
    const { cliente_nome, cliente_numero, produto, cnpj, vendedor_numero } = req.body;
    
    const message = `🔔 *NOVO ATENDIMENTO PENDENTE*
    
👤 *Cliente:* ${cliente_nome}
📱 *WhatsApp:* ${cliente_numero}
🛍️ *Produto:* ${produto}
🏢 *CNPJ:* ${cnpj || 'Não informado'}

⚡ Entre em contato com o cliente!`;

    const result = await client.messages.create({
      from: process.env.TWILIO_WHATSAPP_NUMBER,
      to: `whatsapp:${vendedor_numero}`,
      body: message
    });

    res.json({ success: true, sid: result.sid });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Webhook Kommo
app.post('/webhook/kommo', async (req, res) => {
  try {
    console.log('Dados do Kommo:', req.body);
    // Processar dados do Kommo aqui
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(3001, () => {
  console.log('🚀 Backend rodando em http://localhost:3001');
});
```

## 2️⃣ TESTAR CONEXÃO (1 minuto)

```bash
# Iniciar servidor
node server.js

# Em outro terminal, testar:
curl -X POST http://localhost:3001/api/test-notification \
  -H "Content-Type: application/json" \
  -d '{
    "cliente_nome": "TESTE",
    "cliente_numero": "+5511999999999",
    "produto": "Teste Sistema",
    "vendedor_numero": "+5598984865648"
  }'
```

## 3️⃣ ATUALIZAR FRONTEND (1 minuto)

No arquivo `src/components/TestNotification.tsx`, substituir a função `simulateNotificationSend`:

```typescript
const simulateNotificationSend = async (): Promise<TestResult> => {
  try {
    const response = await fetch('http://localhost:3001/api/test-notification', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cliente_nome: testData.clienteName,
        cliente_numero: testData.clienteNumber,
        produto: testData.produto,
        cnpj: testData.cnpj,
        vendedor_numero: testData.vendorNumber
      })
    });
    
    const result = await response.json();
    return result.success 
      ? { success: true, message: 'Enviado!', twilioSid: result.sid }
      : { success: false, message: 'Erro', error: result.error };
  } catch (error) {
    return { success: false, message: 'Erro conexão', error: error.message };
  }
};
```

## 4️⃣ CONFIGURAR TWILIO (1 minuto)

1. Acesse https://console.twilio.com/
2. Pegue Account SID e Auth Token
3. Vá em Messaging → Try WhatsApp → Configure sandbox
4. Envie mensagem para o número do sandbox conforme instruções
5. Coloque as credenciais no `.env`

## ✅ PRONTO!

Agora você pode:
- ✅ Testar no dashboard (aba "Teste")
- ✅ Receber mensagens reais no WhatsApp
- ✅ Configurar webhook do Kommo para http://localhost:3001/webhook/kommo

**Próximos passos:** Ver `GUIA_COMPLETO_INSTALACAO.md` para configuração completa.