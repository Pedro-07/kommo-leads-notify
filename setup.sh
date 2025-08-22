#!/bin/bash

echo "🚀 CONFIGURAÇÃO AUTOMÁTICA - Kommo + WhatsApp + Twilio"
echo "======================================================="

# Criar estrutura de pastas
echo "📁 Criando estrutura de pastas..."
mkdir -p backend/src/services
mkdir -p backend/src/controllers
mkdir -p backend/src/routes

# Navegar para backend
cd backend

# Inicializar package.json
echo "📦 Inicializando projeto Node.js..."
npm init -y

# Instalar dependências
echo "⬇️ Instalando dependências..."
npm install express cors dotenv twilio helmet morgan
npm install -D nodemon @types/node

# Criar arquivo .env template
echo "📝 Criando arquivo .env..."
cat > .env << EOF
# Credenciais do Twilio (PREENCHER COM SUAS CREDENCIAIS)
TWILIO_ACCOUNT_SID=SEU_ACCOUNT_SID_AQUI
TWILIO_AUTH_TOKEN=SEU_AUTH_TOKEN_AQUI
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886

# Configurações do vendedor
VENDEDOR_WHATSAPP=+5598984865648

# Configurações do servidor
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:8080
EOF

# Criar server.js básico
echo "🖥️ Criando servidor..."
cat > server.js << 'EOF'
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const twilio = require('twilio');

const app = express();
const PORT = process.env.PORT || 3001;

// Verificar se credenciais estão configuradas
if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
  console.error('❌ ERRO: Configure as credenciais do Twilio no arquivo .env');
  process.exit(1);
}

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// Middlewares
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:8080',
  credentials: true
}));
app.use(express.json());

// Log de requisições
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'Kommo WhatsApp Notifications'
  });
});

// Teste de notificação
app.post('/api/test-notification', async (req, res) => {
  try {
    console.log('🧪 Teste recebido:', req.body);
    
    const { cliente_nome, cliente_numero, produto, cnpj, vendedor_numero } = req.body;
    
    if (!cliente_nome || !cliente_numero || !vendedor_numero) {
      return res.status(400).json({
        success: false,
        error: 'Campos obrigatórios: cliente_nome, cliente_numero, vendedor_numero'
      });
    }
    
    const message = `🔔 *NOVO ATENDIMENTO PENDENTE*
    
👤 *Cliente:* ${cliente_nome}
📱 *WhatsApp:* ${cliente_numero}
🛍️ *Produto:* ${produto || 'Não especificado'}
🏢 *CNPJ:* ${cnpj || 'Não informado'}

⚡ *Ação necessária:* Entre em contato com o cliente para dar continuidade ao atendimento.

_Mensagem automática do sistema Kommo_`;

    console.log(`📤 Enviando para ${vendedor_numero}`);
    
    const result = await client.messages.create({
      from: process.env.TWILIO_WHATSAPP_NUMBER,
      to: `whatsapp:${vendedor_numero}`,
      body: message
    });

    console.log('✅ Enviado! SID:', result.sid);
    
    res.json({ 
      success: true, 
      sid: result.sid,
      message: 'Notificação enviada com sucesso!'
    });
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Webhook do Kommo
app.post('/webhook/kommo', async (req, res) => {
  try {
    console.log('📥 Webhook Kommo recebido:');
    console.log(JSON.stringify(req.body, null, 2));
    
    const { name, contact, custom_fields, phone } = req.body;
    
    const leadData = {
      cliente_nome: name || contact?.name || 'Cliente não identificado',
      cliente_numero: contact?.phone || phone,
      produto: custom_fields?.produto || 'Produto não especificado',
      cnpj: custom_fields?.cnpj || null,
      vendedor_numero: process.env.VENDEDOR_WHATSAPP
    };
    
    if (!leadData.cliente_numero) {
      throw new Error('Número do cliente não encontrado nos dados do Kommo');
    }
    
    // Enviar notificação
    const message = `🔔 *NOVO LEAD DO KOMMO*
    
👤 *Cliente:* ${leadData.cliente_nome}
📱 *WhatsApp:* ${leadData.cliente_numero}
🛍️ *Produto:* ${leadData.produto}
🏢 *CNPJ:* ${leadData.cnpj || 'Não informado'}

⚡ *Ação necessária:* Novo lead recebido! Entre em contato.

_Automação Kommo → WhatsApp_`;

    const result = await client.messages.create({
      from: process.env.TWILIO_WHATSAPP_NUMBER,
      to: `whatsapp:${leadData.vendedor_numero}`,
      body: message
    });
    
    console.log('✅ Notificação automática enviada! SID:', result.sid);
    
    res.json({ 
      success: true, 
      sid: result.sid,
      message: 'Lead processado e notificação enviada'
    });
    
  } catch (error) {
    console.error('❌ Erro no webhook:', error.message);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Estatísticas básicas
app.get('/api/stats', (req, res) => {
  res.json({
    totalSent: 0,
    successRate: 100,
    pendingLeads: 0,
    activeVendors: 1
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log('🚀 Servidor Kommo WhatsApp iniciado!');
  console.log(`🌐 Servidor: http://localhost:${PORT}`);
  console.log(`🎯 Webhook: http://localhost:${PORT}/webhook/kommo`);
  console.log(`💚 Health: http://localhost:${PORT}/health`);
  console.log('');
  
  if (process.env.TWILIO_ACCOUNT_SID.includes('SEU_')) {
    console.log('⚠️  ATENÇÃO: Configure suas credenciais no arquivo .env');
  } else {
    console.log('✅ Twilio configurado - pronto para enviar!');
  }
});
EOF

# Criar script de teste
echo "🧪 Criando script de teste..."
cat > test.js << 'EOF'
require('dotenv').config();

async function testarNotificacao() {
  const url = 'http://localhost:3001/api/test-notification';
  const dados = {
    cliente_nome: 'João Silva (TESTE)',
    cliente_numero: '+5511987654321',
    produto: 'Sistema ERP Premium',
    cnpj: '12.345.678/0001-90',
    vendedor_numero: process.env.VENDEDOR_WHATSAPP || '+5598984865648'
  };
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dados)
    });
    
    const resultado = await response.json();
    console.log('📱 Resultado do teste:', resultado);
  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
  }
}

testarNotificacao();
EOF

# Atualizar package.json com scripts
echo "📝 Configurando scripts..."
npm pkg set scripts.start="node server.js"
npm pkg set scripts.dev="nodemon server.js"
npm pkg set scripts.test="node test.js"

# Voltar para pasta principal
cd ..

echo "✅ CONFIGURAÇÃO CONCLUÍDA!"
echo ""
echo "🔧 PRÓXIMOS PASSOS:"
echo "1. Edite backend/.env com suas credenciais do Twilio"
echo "2. Execute: cd backend && npm run dev"
echo "3. Teste: cd backend && npm run test"
echo "4. Configure webhook do Kommo: http://localhost:3001/webhook/kommo"
echo ""
echo "📖 Para mais detalhes, veja GUIA_COMPLETO_INSTALACAO.md"