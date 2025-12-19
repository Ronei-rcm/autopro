import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const HelpAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Olá! Sou o assistente virtual do AutoPro. Como posso ajudá-lo hoje?',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getAIResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();

    // Respostas baseadas em palavras-chave
    if (lowerMessage.includes('cliente') || lowerMessage.includes('cadastrar cliente')) {
      return 'Para cadastrar um cliente:\n1. Acesse o menu "Clientes" no lado esquerdo\n2. Clique no botão "Novo Cliente"\n3. Preencha os dados (Nome, CPF/CNPJ, contatos)\n4. Clique em "Criar"\n\nVocê pode cadastrar tanto Pessoa Física (CPF) quanto Pessoa Jurídica (CNPJ).';
    }

    if (lowerMessage.includes('veículo') || lowerMessage.includes('cadastrar veículo')) {
      return 'Para cadastrar um veículo:\n1. Acesse o menu "Veículos"\n2. Clique em "Novo Veículo"\n3. Selecione o cliente proprietário\n4. Preencha marca, modelo, placa, etc.\n5. Clique em "Criar"\n\nLembre-se: o veículo precisa estar vinculado a um cliente cadastrado.';
    }

    if (lowerMessage.includes('ordem de serviço') || lowerMessage.includes('os')) {
      return 'As Ordens de Serviço (OS) permitem gerenciar os serviços realizados na oficina:\n\n• Crie uma OS vinculada a um cliente e veículo\n• Adicione produtos e serviços\n• Acompanhe o status (Aberta, Em andamento, Finalizada)\n• Gere relatórios e documentos\n\nAcesse pelo menu "Ordens de Serviço".';
    }

    if (lowerMessage.includes('estoque') || lowerMessage.includes('produto')) {
      return 'No módulo de Estoque você pode:\n\n• Cadastrar produtos e peças\n• Controlar quantidade em estoque\n• Definir quantidade mínima (recebe alertas)\n• Registrar entradas e saídas\n• Visualizar histórico de movimentações\n\nAcesse pelo menu "Estoque".';
    }

    if (lowerMessage.includes('financeiro') || lowerMessage.includes('pagamento') || lowerMessage.includes('receber')) {
      return 'O módulo Financeiro inclui:\n\n• Contas a Pagar (fornecedores)\n• Contas a Receber (clientes)\n• Fluxo de Caixa (entradas e saídas)\n• Relatórios financeiros\n• Filtros por período\n\nAcesse pelo menu "Financeiro".';
    }

    if (lowerMessage.includes('agenda') || lowerMessage.includes('agendamento')) {
      return 'Na Agenda você pode:\n\n• Agendar serviços para clientes\n• Visualizar calendário diário, semanal ou mensal\n• Definir mecânico responsável\n• Receber lembretes automáticos\n• Sincronizar com Google Calendar\n\nAcesse pelo menu "Agenda".';
    }

    if (lowerMessage.includes('relatório') || lowerMessage.includes('relatórios')) {
      return 'Os Relatórios fornecem insights sobre:\n\n• Faturamento por período\n• Serviços mais realizados\n• Produtos mais vendidos\n• Clientes recorrentes\n• Desempenho financeiro\n\nAcesse pelo menu "Relatórios".';
    }

    if (lowerMessage.includes('dashboard') || lowerMessage.includes('início')) {
      return 'O Dashboard mostra uma visão geral do negócio:\n\n• KPIs principais (Clientes, OS Ativas, Faturamento)\n• Gráficos de receitas vs despesas\n• Distribuição de serviços realizados\n• Alertas importantes\n\nAcesse pelo menu "Dashboard" ou clique no logo.';
    }

    if (lowerMessage.includes('buscar') || lowerMessage.includes('pesquisar')) {
      return 'Você pode buscar em vários módulos:\n\n• Clientes: por nome, email, telefone, CPF/CNPJ\n• Veículos: por marca, modelo, placa, chassi\n• Use a barra de busca no topo da página\n• Os resultados aparecem em tempo real';
    }

    if (lowerMessage.includes('ajuda') || lowerMessage.includes('help') || lowerMessage.includes('como')) {
      return 'Posso ajudá-lo com:\n\n• Como usar cada módulo do sistema\n• Cadastros e edições\n• Relatórios e consultas\n• Configurações\n\nFaça uma pergunta específica ou digite o nome de um módulo!';
    }

    if (lowerMessage.includes('olá') || lowerMessage.includes('oi') || lowerMessage.includes('bom dia') || lowerMessage.includes('boa tarde')) {
      return 'Olá! Como posso ajudá-lo hoje? Posso explicar como usar os módulos do sistema, ajudar com cadastros ou tirar dúvidas. O que você gostaria de saber?';
    }

    // Resposta padrão
    return 'Desculpe, não entendi completamente sua pergunta. Posso ajudá-lo com:\n\n• Cadastro de clientes e veículos\n• Ordens de serviço\n• Estoque e produtos\n• Financeiro\n• Agenda e agendamentos\n• Relatórios\n\nTente fazer uma pergunta mais específica sobre algum desses tópicos!';
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    // Simular delay da IA
    setTimeout(() => {
      const aiResponse = getAIResponse(userMessage);
      setMessages((prev) => [...prev, { role: 'assistant', content: aiResponse }]);
      setLoading(false);
    }, 500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Botão flutuante */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            position: 'fixed',
            bottom: '2rem',
            right: '2rem',
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            backgroundColor: '#f97316',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 999,
            transition: 'transform 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
          }}
          title="Assistente Virtual"
        >
          <MessageCircle size={24} />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: '2rem',
            right: '2rem',
            width: '400px',
            height: '600px',
            backgroundColor: 'white',
            borderRadius: '16px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 1000,
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div
            style={{
              backgroundColor: '#f97316',
              color: 'white',
              padding: '1rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Bot size={24} />
              <div>
                <div style={{ fontWeight: '600' }}>Assistente Virtual</div>
                <div style={{ fontSize: '0.75rem', opacity: 0.9 }}>AutoPro Sistema de Gestão</div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                color: 'white',
                cursor: 'pointer',
                padding: '0.25rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '1rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              backgroundColor: '#f8fafc',
            }}
          >
            {messages.map((message, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start',
                }}
              >
                <div
                  style={{
                    maxWidth: '80%',
                    padding: '0.75rem 1rem',
                    borderRadius: '12px',
                    backgroundColor: message.role === 'user' ? '#f97316' : 'white',
                    color: message.role === 'user' ? 'white' : '#1e293b',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                    whiteSpace: 'pre-line',
                    fontSize: '0.9rem',
                    lineHeight: '1.5',
                  }}
                >
                  {message.content}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <div
                  style={{
                    padding: '0.75rem 1rem',
                    borderRadius: '12px',
                    backgroundColor: 'white',
                    color: '#64748b',
                    fontSize: '0.9rem',
                  }}
                >
                  Digitando...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div
            style={{
              padding: '1rem',
              borderTop: '1px solid #e2e8f0',
              backgroundColor: 'white',
              display: 'flex',
              gap: '0.5rem',
            }}
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Digite sua pergunta..."
              style={{
                flex: 1,
                padding: '0.75rem',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '0.9rem',
                outline: 'none',
              }}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || loading}
              style={{
                padding: '0.75rem',
                backgroundColor: '#f97316',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
                opacity: input.trim() && !loading ? 1 : 0.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default HelpAssistant;

