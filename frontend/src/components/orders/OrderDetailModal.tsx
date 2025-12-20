import { useState, useEffect } from 'react';
import { X, Printer, Clock, User, Car, DollarSign, Package, Wrench, Play, CheckCircle, AlertCircle, XCircle, RotateCcw, Receipt, CheckSquare, Plus as PlusIcon, PenTool, Image as ImageIcon, FileText as FileTextIcon, Upload, Trash2 } from 'lucide-react';
import SignaturePad from './SignaturePad';
import api from '../../services/api';
import toast from 'react-hot-toast';

interface Order {
  id: number;
  order_number: string;
  client_id: number;
  client_name?: string;
  vehicle_id: number;
  brand?: string;
  model?: string;
  plate?: string;
  mechanic_id?: number;
  mechanic_name?: string;
  status: string;
  subtotal: number;
  discount: number;
  total: number;
  started_at?: string;
  finished_at?: string;
  technical_notes?: string;
  client_signature?: string;
  signature_date?: string;
  signed_by_name?: string;
  created_at: string;
  items?: OrderItem[];
  history?: OrderHistory[];
  files?: OrderFile[];
}

interface OrderFile {
  id: number;
  order_id: number;
  file_name: string;
  file_path: string;
  file_type: 'photo' | 'document' | 'other';
  file_size?: number;
  description?: string;
  uploaded_by?: number;
  created_at: string;
  uploaded_by_name?: string;
}

interface OrderItem {
  id: number;
  product_id?: number;
  labor_id?: number;
  product_name?: string;
  labor_name?: string;
  description: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  item_type: 'product' | 'labor';
}

interface OrderHistory {
  id: number;
  field_changed: string;
  old_value?: string;
  new_value?: string;
  changed_by_name?: string;
  notes?: string;
  created_at: string;
}

interface OrderDetailModalProps {
  orderId: number | null;
  onClose: () => void;
  onUpdate: () => void;
}

const OrderDetailModal = ({ orderId, onClose, onUpdate }: OrderDetailModalProps) => {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'details' | 'items' | 'history' | 'checklists' | 'signature' | 'files'>('details');
  const [showReceivableModal, setShowReceivableModal] = useState(false);
  const [receivableForm, setReceivableForm] = useState({
    use_installments: false,
    installment_count: 2,
    first_due_date: '',
    payment_method: '',
  });
  const [checklists, setChecklists] = useState<any[]>([]);
  const [checklistExecutions, setChecklistExecutions] = useState<any[]>([]);
  const [showChecklistModal, setShowChecklistModal] = useState(false);
  const [selectedChecklist, setSelectedChecklist] = useState<any>(null);
  const [checklistExecutionItems, setChecklistExecutionItems] = useState<Record<number, { checked: boolean; value?: string; observation?: string }>>({});
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [showFileUploadModal, setShowFileUploadModal] = useState(false);
  const [signatureForm, setSignatureForm] = useState({ signed_by_name: '' });
  const [fileUploadForm, setFileUploadForm] = useState({ file: null as File | null, file_type: 'photo' as 'photo' | 'document' | 'other', description: '' });

  useEffect(() => {
    if (orderId) {
      loadOrder();
      loadChecklistExecutions();
    }
  }, [orderId]);

  useEffect(() => {
    if (activeTab === 'checklists' && orderId) {
      loadChecklists();
      loadChecklistExecutions();
    }
  }, [activeTab, orderId]);

  const loadOrder = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/orders/${orderId}`);
      setOrder(response.data);
    } catch (error: any) {
      toast.error('Erro ao carregar ordem de serviço');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAction = async (action: string) => {
    if (!orderId) return;

    try {
      await api.post(`/orders/${orderId}/quick-action`, { action });
      toast.success('Ação executada com sucesso!');
      loadOrder();
      onUpdate();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro ao executar ação');
    }
  };

  const loadChecklists = async () => {
    try {
      const response = await api.get('/checklists?active_only=true');
      setChecklists(response.data);
    } catch (error) {
      console.error('Erro ao carregar checklists:', error);
    }
  };

  const loadChecklistExecutions = async () => {
    if (!orderId) return;
    try {
      const response = await api.get(`/checklists/orders/${orderId}/executions`);
      setChecklistExecutions(response.data);
    } catch (error) {
      console.error('Erro ao carregar execuções de checklist:', error);
    }
  };

  const handleStartChecklist = (checklist: any) => {
    setSelectedChecklist(checklist);
    // Inicializar items com valores padrão
    const itemsMap: Record<number, { checked: boolean; value?: string; observation?: string }> = {};
    checklist.items?.forEach((item: any) => {
      itemsMap[item.id] = { checked: false };
    });
    setChecklistExecutionItems(itemsMap);
    setShowChecklistModal(true);
  };

  const handleSaveChecklistExecution = async () => {
    if (!orderId || !order || !selectedChecklist) return;

    try {
      const items = Object.entries(checklistExecutionItems).map(([itemId, data]) => ({
        checklist_item_id: parseInt(itemId),
        checked: data.checked,
        value: data.value || null,
        observation: data.observation || null,
      }));

      await api.post(`/checklists/orders/${orderId}/executions`, {
        checklist_id: selectedChecklist.id,
        vehicle_id: order.vehicle_id,
        items,
      });

      toast.success('Checklist executado com sucesso!');
      setShowChecklistModal(false);
      setSelectedChecklist(null);
      setChecklistExecutionItems({});
      loadChecklistExecutions();
      loadOrder();
      onUpdate();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro ao salvar checklist');
    }
  };

  const handleUpdateChecklistExecutionItem = async (executionId: number, itemId: number, data: { checked?: boolean; value?: string; observation?: string }) => {
    try {
      await api.put(`/checklists/executions/${executionId}/items/${itemId}`, data);
      loadChecklistExecutions();
    } catch (error: any) {
      toast.error('Erro ao atualizar item do checklist');
    }
  };

  const handleSaveSignature = async (signature: string) => {
    if (!orderId || !signatureForm.signed_by_name.trim()) {
      toast.error('Nome de quem assinou é obrigatório');
      return;
    }

    try {
      await api.post(`/orders/${orderId}/signature`, {
        signature,
        signed_by_name: signatureForm.signed_by_name,
      });
      toast.success('Assinatura salva com sucesso!');
      setShowSignatureModal(false);
      setSignatureForm({ signed_by_name: '' });
      loadOrder();
      onUpdate();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro ao salvar assinatura');
    }
  };

  const handleUploadFile = async () => {
    if (!orderId || !fileUploadForm.file) {
      toast.error('Selecione um arquivo');
      return;
    }

    try {
      // Converter arquivo para base64
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result as string;
        const base64Data = base64.split(',')[1]; // Remove o prefixo data:image/...;base64,

        try {
          await api.post(`/orders/${orderId}/files`, {
            file_data: base64Data,
            file_name: fileUploadForm.file!.name,
            file_type: fileUploadForm.file_type,
            description: fileUploadForm.description || null,
          });
          toast.success('Arquivo enviado com sucesso!');
          setShowFileUploadModal(false);
          setFileUploadForm({ file: null, file_type: 'photo', description: '' });
          loadOrder();
          onUpdate();
        } catch (error: any) {
          toast.error(error.response?.data?.error || 'Erro ao enviar arquivo');
        }
      };
      reader.onerror = () => {
        toast.error('Erro ao ler arquivo');
      };
      reader.readAsDataURL(fileUploadForm.file);
    } catch (error: any) {
      toast.error('Erro ao processar arquivo');
    }
  };

  const handleDeleteFile = async (fileId: number) => {
    if (!orderId || !confirm('Tem certeza que deseja excluir este arquivo?')) return;

    try {
      await api.delete(`/orders/${orderId}/files/${fileId}`);
      toast.success('Arquivo excluído com sucesso!');
      loadOrder();
      onUpdate();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro ao excluir arquivo');
    }
  };

  const handleGenerateReceivable = async () => {
    if (!orderId || !order) return;

    try {
      const data: any = {};
      if (receivableForm.use_installments) {
        data.use_installments = true;
        data.installment_count = receivableForm.installment_count;
        data.first_due_date = receivableForm.first_due_date || new Date().toISOString().split('T')[0];
      }
      if (receivableForm.payment_method) {
        data.payment_method = receivableForm.payment_method;
      }

      await api.post(`/orders/${orderId}/generate-receivable`, data);
      toast.success('Conta a receber gerada com sucesso!');
      setShowReceivableModal(false);
      setReceivableForm({
        use_installments: false,
        installment_count: 2,
        first_due_date: '',
        payment_method: '',
      });
      onUpdate();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro ao gerar conta a receber');
    }
  };

  const handlePrint = async () => {
    if (!order) return;

    try {
      toast.loading('Gerando PDF da OS...', { id: 'export-os-pdf' });

      // Import dinâmico
      const { default: jsPDF } = await import('jspdf');

      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = 210;
      const pageHeight = 297;
      const margin = 15;
      let yPosition = margin;

      // Função para adicionar nova página se necessário
      const checkNewPage = (requiredHeight: number) => {
        if (yPosition + requiredHeight > pageHeight - margin) {
          pdf.addPage();
          yPosition = margin;
          return true;
        }
        return false;
      };

      // Cabeçalho
      pdf.setFillColor(249, 115, 22); // Laranja #f97316
      pdf.rect(0, 0, pageWidth, 35, 'F');
      
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(24);
      pdf.setFont('helvetica', 'bold');
      pdf.text('ORDEM DE SERVIÇO', pageWidth / 2, 15, { align: 'center' });
      
      pdf.setFontSize(18);
      pdf.text(order.order_number, pageWidth / 2, 25, { align: 'center' });

      yPosition = 45;

      // Dados da OS
      pdf.setTextColor(30, 41, 59);
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Dados da Ordem de Serviço', margin, yPosition);
      yPosition += 8;

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(9);
      const osData = [
        ['Status:', getStatusLabel(order.status)],
        ['Data de Criação:', formatDateForPDF(order.created_at)],
        order.started_at ? ['Data de Início:', formatDateForPDF(order.started_at)] : null,
        order.finished_at ? ['Data de Finalização:', formatDateForPDF(order.finished_at)] : null,
      ].filter(Boolean) as string[][];

      osData.forEach(([label, value]) => {
        checkNewPage(8);
        pdf.setFont('helvetica', 'bold');
        pdf.text(label, margin, yPosition);
        pdf.setFont('helvetica', 'normal');
        pdf.text(value, margin + 40, yPosition);
        yPosition += 6;
      });

      yPosition += 5;
      checkNewPage(20);

      // Dados do Cliente
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(10);
      pdf.text('Cliente', margin, yPosition);
      yPosition += 8;

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(9);
      pdf.text(order.client_name || '-', margin, yPosition);
      yPosition += 6;

      // Dados do Veículo
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(10);
      pdf.text('Veículo', margin, yPosition);
      yPosition += 8;

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(9);
      const vehicleInfo = `${order.brand || ''} ${order.model || ''}`.trim();
      pdf.text(vehicleInfo || '-', margin, yPosition);
      if (order.plate) {
        yPosition += 6;
        pdf.text(`Placa: ${order.plate}`, margin, yPosition);
      }
      yPosition += 6;

      // Mecânico (se houver)
      if (order.mechanic_name) {
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(10);
        pdf.text('Mecânico', margin, yPosition);
        yPosition += 8;

        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(9);
        pdf.text(order.mechanic_name, margin, yPosition);
        yPosition += 6;
      }

      yPosition += 5;
      checkNewPage(30);

      // Tabela de Itens
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(10);
      pdf.text('Itens da Ordem de Serviço', margin, yPosition);
      yPosition += 8;

      if (order.items && order.items.length > 0) {
        // Cabeçalho da tabela
        pdf.setFillColor(248, 250, 252);
        pdf.rect(margin, yPosition - 5, pageWidth - 2 * margin, 8, 'F');
        
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Item', margin + 2, yPosition);
        pdf.text('Qtd', pageWidth - margin - 70, yPosition);
        pdf.text('Unit.', pageWidth - margin - 50, yPosition);
        pdf.text('Total', pageWidth - margin - 25, yPosition);
        yPosition += 8;

        pdf.setFont('helvetica', 'normal');
        order.items.forEach((item, index) => {
          checkNewPage(10);
          
          // Alternar cor de fundo
          if (index % 2 === 0) {
            pdf.setFillColor(255, 255, 255);
          } else {
            pdf.setFillColor(248, 250, 252);
          }
          pdf.rect(margin, yPosition - 4, pageWidth - 2 * margin, 7, 'F');

          pdf.setFontSize(8);
          pdf.text(item.description || '-', margin + 2, yPosition);
          pdf.text(item.quantity.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }), pageWidth - margin - 70, yPosition, { align: 'right' });
          pdf.text(formatCurrencyForPDF(item.unit_price), pageWidth - margin - 50, yPosition, { align: 'right' });
          pdf.text(formatCurrencyForPDF(item.total_price), pageWidth - margin - 25, yPosition, { align: 'right' });
          yPosition += 7;
        });
      } else {
        pdf.setFontSize(9);
        pdf.text('Nenhum item adicionado', margin, yPosition);
        yPosition += 6;
      }

      yPosition += 5;
      checkNewPage(25);

      // Totais
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(10);
      pdf.text('Resumo Financeiro', margin, yPosition);
      yPosition += 8;

      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Subtotal:', pageWidth - margin - 50, yPosition);
      pdf.text(formatCurrencyForPDF(order.subtotal), pageWidth - margin - 5, yPosition, { align: 'right' });
      yPosition += 7;

      pdf.text('Desconto:', pageWidth - margin - 50, yPosition);
      pdf.text(formatCurrencyForPDF(order.discount), pageWidth - margin - 5, yPosition, { align: 'right' });
      yPosition += 7;

      pdf.setFillColor(16, 185, 129, 0.1); // Verde claro
      pdf.rect(margin, yPosition - 5, pageWidth - 2 * margin, 8, 'F');
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(11);
      pdf.setTextColor(16, 185, 129);
      pdf.text('TOTAL:', pageWidth - margin - 50, yPosition);
      pdf.text(formatCurrencyForPDF(order.total), pageWidth - margin - 5, yPosition, { align: 'right' });
      
      pdf.setTextColor(30, 41, 59);
      yPosition += 10;
      checkNewPage(20);

      // Observações Técnicas
      if (order.technical_notes) {
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(10);
        pdf.text('Observações Técnicas', margin, yPosition);
        yPosition += 8;

        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(9);
        const notesLines = pdf.splitTextToSize(order.technical_notes, pageWidth - 2 * margin);
        notesLines.forEach((line: string) => {
          checkNewPage(6);
          pdf.text(line, margin, yPosition);
          yPosition += 6;
        });
        yPosition += 5;
      }

      // Rodapé
      const totalPages = pdf.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setTextColor(100, 116, 139);
        pdf.text(
          `Página ${i} de ${totalPages} - Gerado em ${new Date().toLocaleString('pt-BR')}`,
          pageWidth / 2,
          pageHeight - 10,
          { align: 'center' }
        );
      }

      // Salvar PDF
      const fileName = `OS_${order.order_number}_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);

      toast.success('PDF gerado com sucesso!', { id: 'export-os-pdf' });
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast.error('Erro ao gerar PDF da OS', { id: 'export-os-pdf' });
      // Fallback para impressão nativa
      window.print();
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatCurrencyForPDF = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const formatDateForPDF = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('pt-BR') + ' ' + new Date(dateString).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      open: '#64748b',
      in_progress: '#3b82f6',
      waiting_parts: '#f59e0b',
      finished: '#10b981',
      cancelled: '#ef4444',
    };
    return colors[status] || '#64748b';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      open: 'Aberta',
      in_progress: 'Em Andamento',
      waiting_parts: 'Aguardando Peças',
      finished: 'Finalizada',
      cancelled: 'Cancelada',
    };
    return labels[status] || status;
  };

  const getQuickActions = () => {
    if (!order) return [];

    const actions = [];
    if (order.status === 'open') {
      actions.push({ action: 'start', label: 'Iniciar OS', icon: Play, color: '#3b82f6' });
    }
    if (order.status === 'in_progress') {
      actions.push({ action: 'finish', label: 'Finalizar OS', icon: CheckCircle, color: '#10b981' });
      actions.push({ action: 'wait_parts', label: 'Aguardar Peças', icon: AlertCircle, color: '#f59e0b' });
    }
    if (order.status === 'waiting_parts') {
      actions.push({ action: 'start', label: 'Retomar OS', icon: Play, color: '#3b82f6' });
    }
    if (order.status === 'finished' || order.status === 'cancelled') {
      actions.push({ action: 'reopen', label: 'Reabrir OS', icon: RotateCcw, color: '#64748b' });
    }
    if (order.status !== 'cancelled' && order.status !== 'finished') {
      actions.push({ action: 'cancel', label: 'Cancelar OS', icon: XCircle, color: '#ef4444' });
    }

    return actions;
  };

  if (!orderId) return null;

  if (loading) {
    return (
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1002,
        }}
      >
        <div style={{ color: 'white' }}>Carregando...</div>
      </div>
    );
  }

  if (!order) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1002,
        padding: '1rem',
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          width: '100%',
          maxWidth: '1000px',
          maxHeight: '90vh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ padding: '1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
              {order.order_number}
            </h2>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <span
                style={{
                  padding: '0.25rem 0.75rem',
                  borderRadius: '12px',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  backgroundColor: getStatusColor(order.status) + '20',
                  color: getStatusColor(order.status),
                }}
              >
                {getStatusLabel(order.status)}
              </span>
              <span style={{ fontSize: '0.875rem', color: '#64748b' }}>
                Criada em {formatDate(order.created_at)}
              </span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={handlePrint}
              style={{
                padding: '0.5rem',
                backgroundColor: '#f1f5f9',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
              title="Gerar PDF da OS"
            >
              <Printer size={20} color="#64748b" />
              <span style={{ fontSize: '0.875rem', color: '#64748b' }}>PDF</span>
            </button>
            <button
              onClick={onClose}
              style={{
                padding: '0.5rem',
                backgroundColor: '#f1f5f9',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
              }}
            >
              <X size={20} color="#64748b" />
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        {(getQuickActions().length > 0 || order.status === 'finished') && (
          <div style={{ padding: '1rem 1.5rem', backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
            {getQuickActions().map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.action}
                  onClick={() => handleQuickAction(action.action)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem 1rem',
                    backgroundColor: action.color + '20',
                    color: action.color,
                    border: `1px solid ${action.color}40`,
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '0.875rem',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = action.color + '30';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = action.color + '20';
                  }}
                >
                  <Icon size={18} />
                  {action.label}
                </button>
              );
            })}
            {order.status === 'finished' && (
              <button
                onClick={() => setShowReceivableModal(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 1rem',
                  backgroundColor: '#f9731620',
                  color: '#f97316',
                  border: '1px solid #f9731640',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '0.875rem',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f9731630';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#f9731620';
                }}
              >
                <Receipt size={18} />
                Gerar Conta a Receber
              </button>
            )}
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0' }}>
          {[
            { id: 'details', label: 'Detalhes' },
            { id: 'items', label: 'Itens' },
            { id: 'checklists', label: 'Checklists' },
            { id: 'signature', label: 'Assinatura', icon: PenTool },
            { id: 'files', label: 'Fotos/Docs', icon: ImageIcon },
            { id: 'history', label: 'Histórico' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                padding: '1rem 1.5rem',
                border: 'none',
                backgroundColor: activeTab === tab.id ? 'white' : '#f8fafc',
                borderBottom: activeTab === tab.id ? '2px solid #f97316' : '2px solid transparent',
                cursor: 'pointer',
                fontWeight: activeTab === tab.id ? '600' : '400',
                color: activeTab === tab.id ? '#1e293b' : '#64748b',
              }}
            >
              {tab.icon && <tab.icon size={16} style={{ marginRight: '0.5rem' }} />}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
          {activeTab === 'details' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <User size={18} color="#64748b" />
                  Cliente
                </h3>
                <div style={{ padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                  <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>{order.client_name}</div>
                </div>
              </div>

              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Car size={18} color="#64748b" />
                  Veículo
                </h3>
                <div style={{ padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                  <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
                    {order.brand} {order.model}
                  </div>
                  {order.plate && (
                    <div style={{ fontSize: '0.875rem', color: '#64748b' }}>Placa: {order.plate}</div>
                  )}
                </div>
              </div>

              {order.mechanic_name && (
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Wrench size={18} color="#64748b" />
                    Mecânico
                  </h3>
                  <div style={{ padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                    <div style={{ fontWeight: '600' }}>{order.mechanic_name}</div>
                  </div>
                </div>
              )}

              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Clock size={18} color="#64748b" />
                  Datas
                </h3>
                <div style={{ padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                  {order.started_at && (
                    <div style={{ marginBottom: '0.5rem' }}>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Iniciada em:</div>
                      <div style={{ fontWeight: '600' }}>{formatDate(order.started_at)}</div>
                    </div>
                  )}
                  {order.finished_at && (
                    <div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Finalizada em:</div>
                      <div style={{ fontWeight: '600' }}>{formatDate(order.finished_at)}</div>
                    </div>
                  )}
                </div>
              </div>

              {order.technical_notes && (
                <div style={{ gridColumn: '1 / -1' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '1rem' }}>
                    Observações Técnicas
                  </h3>
                  <div style={{ padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '8px', whiteSpace: 'pre-wrap' }}>
                    {order.technical_notes}
                  </div>
                </div>
              )}

              <div style={{ gridColumn: '1 / -1' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <DollarSign size={18} color="#64748b" />
                  Valores
                </h3>
                <div style={{ padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ color: '#64748b' }}>Subtotal:</span>
                    <span style={{ fontWeight: '600' }}>{formatCurrency(order.subtotal)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ color: '#64748b' }}>Desconto:</span>
                    <span style={{ fontWeight: '600' }}>{formatCurrency(order.discount)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.5rem', borderTop: '1px solid #e2e8f0', marginTop: '0.5rem' }}>
                    <span style={{ fontWeight: '600', fontSize: '1.1rem' }}>Total:</span>
                    <span style={{ fontWeight: 'bold', fontSize: '1.2rem', color: '#10b981' }}>
                      {formatCurrency(order.total)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'items' && (
            <div>
              {order.items && order.items.length > 0 ? (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                      <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#64748b' }}>
                        Item
                      </th>
                      <th style={{ padding: '0.75rem', textAlign: 'right', fontSize: '0.875rem', fontWeight: '600', color: '#64748b' }}>
                        Qtd
                      </th>
                      <th style={{ padding: '0.75rem', textAlign: 'right', fontSize: '0.875rem', fontWeight: '600', color: '#64748b' }}>
                        Unit.
                      </th>
                      <th style={{ padding: '0.75rem', textAlign: 'right', fontSize: '0.875rem', fontWeight: '600', color: '#64748b' }}>
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items.map((item) => (
                      <tr key={item.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                        <td style={{ padding: '0.75rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            {item.item_type === 'product' ? (
                              <Package size={16} color="#3b82f6" />
                            ) : (
                              <Wrench size={16} color="#f97316" />
                            )}
                            <span style={{ fontWeight: '600' }}>{item.description}</span>
                          </div>
                        </td>
                        <td style={{ padding: '0.75rem', textAlign: 'right', color: '#64748b' }}>
                          {item.quantity}
                        </td>
                        <td style={{ padding: '0.75rem', textAlign: 'right', color: '#64748b' }}>
                          {formatCurrency(item.unit_price)}
                        </td>
                        <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: '600' }}>
                          {formatCurrency(item.total_price)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
                  Nenhum item adicionado
                </div>
              )}
            </div>
          )}

          {activeTab === 'checklists' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '600' }}>Checklists Executados</h3>
                <button
                  onClick={() => {
                    loadChecklists();
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem 1rem',
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '0.875rem',
                  }}
                >
                  <PlusIcon size={16} />
                  Executar Checklist
                </button>
              </div>

              {/* Checklists Disponíveis */}
              {checklists.length > 0 && (
                <div style={{ marginBottom: '2rem' }}>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: '600', marginBottom: '1rem', color: '#64748b' }}>
                    Checklists Disponíveis
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
                    {checklists.map((checklist) => (
                      <div
                        key={checklist.id}
                        style={{
                          padding: '1rem',
                          backgroundColor: '#f8fafc',
                          borderRadius: '8px',
                          border: '1px solid #e2e8f0',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#eff6ff';
                          e.currentTarget.style.borderColor = '#3b82f6';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = '#f8fafc';
                          e.currentTarget.style.borderColor = '#e2e8f0';
                        }}
                        onClick={() => handleStartChecklist(checklist)}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                          <CheckSquare size={18} color="#3b82f6" />
                          <span style={{ fontWeight: '600', color: '#1e293b' }}>{checklist.name}</span>
                        </div>
                        {checklist.description && (
                          <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.5rem' }}>
                            {checklist.description}
                          </div>
                        )}
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                          {checklist.items?.length || 0} itens
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Checklists Executados */}
              {checklistExecutions.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  {checklistExecutions.map((execution) => (
                    <div
                      key={execution.id}
                      style={{
                        padding: '1.5rem',
                        backgroundColor: '#f8fafc',
                        borderRadius: '12px',
                        border: '1px solid #e2e8f0',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            <CheckSquare size={20} color="#3b82f6" />
                            <span style={{ fontSize: '1rem', fontWeight: '600', color: '#1e293b' }}>
                              {execution.checklist_name}
                            </span>
                          </div>
                          <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                            Executado em {formatDate(execution.executed_at)}
                            {execution.mechanic_name && ` por ${execution.mechanic_name}`}
                          </div>
                        </div>
                      </div>

                      {execution.items && execution.items.length > 0 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                          {execution.items.map((item: any) => (
                            <div
                              key={item.id}
                              style={{
                                padding: '0.75rem',
                                backgroundColor: 'white',
                                borderRadius: '8px',
                                border: '1px solid #e2e8f0',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '1rem',
                              }}
                            >
                              <input
                                type="checkbox"
                                checked={item.checked || false}
                                onChange={(e) => {
                                  handleUpdateChecklistExecutionItem(execution.id, item.checklist_item_id, {
                                    checked: e.target.checked,
                                  });
                                }}
                                style={{
                                  width: '18px',
                                  height: '18px',
                                  cursor: 'pointer',
                                }}
                              />
                              <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '0.875rem', fontWeight: item.required ? '600' : '400', color: '#1e293b' }}>
                                  {item.item_description}
                                </div>
                                {item.item_type === 'measure' && item.value && (
                                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
                                    Valor: {item.value}
                                  </div>
                                )}
                                {item.observation && (
                                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem', fontStyle: 'italic' }}>
                                    Obs: {item.observation}
                                  </div>
                                )}
                              </div>
                              {item.item_type === 'measure' && (
                                <input
                                  type="text"
                                  placeholder="Valor"
                                  value={item.value || ''}
                                  onChange={(e) => {
                                    handleUpdateChecklistExecutionItem(execution.id, item.checklist_item_id, {
                                      value: e.target.value,
                                    });
                                  }}
                                  style={{
                                    padding: '0.5rem',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '6px',
                                    fontSize: '0.875rem',
                                    width: '120px',
                                  }}
                                />
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {execution.notes && (
                        <div style={{ marginTop: '1rem', padding: '0.75rem', backgroundColor: '#fef3c7', borderRadius: '8px', fontSize: '0.875rem', color: '#92400e' }}>
                          <strong>Observações:</strong> {execution.notes}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
                  Nenhum checklist executado ainda. Selecione um checklist acima para começar.
                </div>
              )}
            </div>
          )}

          {activeTab === 'signature' && (
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '1.5rem' }}>Assinatura do Cliente</h3>
              
              {order.client_signature ? (
                <div>
                  <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                    <div style={{ marginBottom: '0.5rem', fontSize: '0.875rem', color: '#64748b' }}>Assinatura registrada</div>
                    <img
                      src={order.client_signature}
                      alt="Assinatura do cliente"
                      style={{
                        maxWidth: '100%',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        backgroundColor: 'white',
                        padding: '1rem',
                      }}
                    />
                    {order.signed_by_name && (
                      <div style={{ marginTop: '1rem', fontSize: '0.875rem', color: '#64748b' }}>
                        Assinado por: <strong>{order.signed_by_name}</strong>
                      </div>
                    )}
                    {order.signature_date && (
                      <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#64748b' }}>
                        Em: {formatDate(order.signature_date)}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => setShowSignatureModal(true)}
                    style={{
                      padding: '0.75rem 1.5rem',
                      backgroundColor: '#3b82f6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                    }}
                  >
                    <PenTool size={18} />
                    Alterar Assinatura
                  </button>
                </div>
              ) : (
                <div>
                  <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b', marginBottom: '1.5rem', border: '1px dashed #e2e8f0', borderRadius: '8px' }}>
                    Nenhuma assinatura registrada ainda.
                  </div>
                  <button
                    onClick={() => setShowSignatureModal(true)}
                    style={{
                      padding: '0.75rem 1.5rem',
                      backgroundColor: '#10b981',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                    }}
                  >
                    <PenTool size={18} />
                    Capturar Assinatura
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'files' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '600' }}>Fotos e Documentos</h3>
                <button
                  onClick={() => setShowFileUploadModal(true)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem 1rem',
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '0.875rem',
                  }}
                >
                  <Upload size={16} />
                  Upload Arquivo
                </button>
              </div>

              {order.files && order.files.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                  {order.files.map((file) => (
                    <div
                      key={file.id}
                      style={{
                        padding: '1rem',
                        backgroundColor: '#f8fafc',
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0',
                      }}
                    >
                      {file.file_type === 'photo' && file.file_path ? (
                        <img
                          src={`data:image/jpeg;base64,${file.file_path}`}
                          alt={file.description || file.file_name}
                          style={{
                            width: '100%',
                            height: '150px',
                            objectFit: 'cover',
                            borderRadius: '6px',
                            marginBottom: '0.5rem',
                            cursor: 'pointer',
                          }}
                          onClick={() => {
                            const img = new Image();
                            img.src = `data:image/jpeg;base64,${file.file_path}`;
                            const w = window.open('');
                            if (w) {
                              w.document.write(`<img src="${img.src}" style="max-width:100%">`);
                            }
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            width: '100%',
                            height: '150px',
                            backgroundColor: '#e2e8f0',
                            borderRadius: '6px',
                            marginBottom: '0.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <FileTextIcon size={48} color="#64748b" />
                        </div>
                      )}
                      <div style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.25rem', color: '#1e293b' }}>
                        {file.file_name}
                      </div>
                      {file.description && (
                        <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.5rem' }}>
                          {file.description}
                        </div>
                      )}
                      <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.5rem' }}>
                        {formatDate(file.created_at)}
                        {file.uploaded_by_name && ` • ${file.uploaded_by_name}`}
                      </div>
                      <button
                        onClick={() => handleDeleteFile(file.id)}
                        style={{
                          width: '100%',
                          padding: '0.5rem',
                          backgroundColor: '#fee2e2',
                          color: '#ef4444',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontWeight: '600',
                          fontSize: '0.75rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.5rem',
                        }}
                      >
                        <Trash2 size={14} />
                        Excluir
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b', border: '1px dashed #e2e8f0', borderRadius: '8px' }}>
                  Nenhum arquivo enviado ainda. Clique em "Upload Arquivo" para começar.
                </div>
              )}
            </div>
          )}

          {activeTab === 'history' && (
            <div>
              {order.history && order.history.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {order.history.map((entry) => (
                    <div
                      key={entry.id}
                      style={{
                        padding: '1rem',
                        backgroundColor: '#f8fafc',
                        borderRadius: '8px',
                        borderLeft: '3px solid #f97316',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <div style={{ fontWeight: '600' }}>{entry.field_changed}</div>
                        <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                          {formatDate(entry.created_at)}
                        </div>
                      </div>
                      {entry.old_value && entry.new_value && (
                        <div style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.25rem' }}>
                          {entry.old_value} → {entry.new_value}
                        </div>
                      )}
                      {entry.notes && (
                        <div style={{ fontSize: '0.875rem', color: '#64748b', fontStyle: 'italic' }}>
                          {entry.notes}
                        </div>
                      )}
                      {entry.changed_by_name && (
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.5rem' }}>
                          Por: {entry.changed_by_name}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
                  Nenhum histórico registrado
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal Gerar Conta a Receber */}
      {showReceivableModal && order && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1003,
          }}
          onClick={() => setShowReceivableModal(false)}
        >
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '2rem',
              width: '90%',
              maxWidth: '500px',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>
              Gerar Conta a Receber
            </h2>
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '8px', marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.5rem' }}>OS: {order.order_number}</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1e293b' }}>
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(order.total)}
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', fontWeight: '600', cursor: 'pointer', marginBottom: '0.5rem' }}>
                  <input
                    type="checkbox"
                    checked={receivableForm.use_installments}
                    onChange={(e) => setReceivableForm({ ...receivableForm, use_installments: e.target.checked })}
                    style={{ cursor: 'pointer' }}
                  />
                  Dividir em parcelas
                </label>
              </div>

              {receivableForm.use_installments && (
                <>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '600' }}>
                      Número de Parcelas
                    </label>
                    <input
                      type="number"
                      min="2"
                      max="24"
                      value={receivableForm.installment_count}
                      onChange={(e) => setReceivableForm({ ...receivableForm, installment_count: parseInt(e.target.value) || 2 })}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        fontSize: '0.9rem',
                      }}
                    />
                  </div>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '600' }}>
                      Data da Primeira Parcela
                    </label>
                    <input
                      type="date"
                      value={receivableForm.first_due_date}
                      onChange={(e) => setReceivableForm({ ...receivableForm, first_due_date: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        fontSize: '0.9rem',
                      }}
                    />
                  </div>
                </>
              )}

              {!receivableForm.use_installments && (
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '600' }}>
                    Data de Vencimento (padrão: 30 dias)
                  </label>
                  <input
                    type="date"
                    value={receivableForm.first_due_date}
                    onChange={(e) => setReceivableForm({ ...receivableForm, first_due_date: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: '0.9rem',
                    }}
                  />
                </div>
              )}

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '600' }}>
                  Método de Pagamento (opcional)
                </label>
                <select
                  value={receivableForm.payment_method}
                  onChange={(e) => setReceivableForm({ ...receivableForm, payment_method: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                  }}
                >
                  <option value="">Selecione (opcional)</option>
                  <option value="cash">Dinheiro</option>
                  <option value="credit_card">Cartão de Crédito</option>
                  <option value="debit_card">Cartão de Débito</option>
                  <option value="pix">PIX</option>
                  <option value="bank_transfer">Transferência Bancária</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowReceivableModal(false)}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#f1f5f9',
                  color: '#64748b',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600',
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleGenerateReceivable}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#f97316',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600',
                }}
              >
                Gerar Conta
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Executar Checklist */}
      {showChecklistModal && selectedChecklist && order && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1003,
            padding: '1rem',
          }}
          onClick={() => {
            setShowChecklistModal(false);
            setSelectedChecklist(null);
            setChecklistExecutionItems({});
          }}
        >
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '2rem',
              width: '90%',
              maxWidth: '700px',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
              Executar Checklist: {selectedChecklist.name}
            </h2>

            {selectedChecklist.description && (
              <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '1.5rem' }}>
                {selectedChecklist.description}
              </p>
            )}

            {selectedChecklist.items && selectedChecklist.items.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                {selectedChecklist.items.map((item: any) => (
                  <div
                    key={item.id}
                    style={{
                      padding: '1rem',
                      backgroundColor: '#f8fafc',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'start', gap: '1rem' }}>
                      {item.item_type === 'check' && (
                        <input
                          type="checkbox"
                          checked={checklistExecutionItems[item.id]?.checked || false}
                          onChange={(e) => {
                            setChecklistExecutionItems({
                              ...checklistExecutionItems,
                              [item.id]: {
                                ...checklistExecutionItems[item.id],
                                checked: e.target.checked,
                              },
                            });
                          }}
                          style={{
                            width: '20px',
                            height: '20px',
                            cursor: 'pointer',
                            marginTop: '2px',
                          }}
                        />
                      )}
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                          <span style={{ fontSize: '0.875rem', fontWeight: item.required ? '600' : '400', color: '#1e293b' }}>
                            {item.description}
                          </span>
                          {item.required && (
                            <span style={{ fontSize: '0.75rem', padding: '0.125rem 0.5rem', backgroundColor: '#ef444420', color: '#ef4444', borderRadius: '4px', fontWeight: '600' }}>
                              Obrigatório
                            </span>
                          )}
                        </div>

                        {item.item_type === 'measure' && (
                          <input
                            type="text"
                            placeholder="Informe o valor medido"
                            value={checklistExecutionItems[item.id]?.value || ''}
                            onChange={(e) => {
                              setChecklistExecutionItems({
                                ...checklistExecutionItems,
                                [item.id]: {
                                  ...checklistExecutionItems[item.id],
                                  value: e.target.value,
                                },
                              });
                            }}
                            style={{
                              width: '100%',
                              padding: '0.5rem',
                              border: '1px solid #e2e8f0',
                              borderRadius: '6px',
                              fontSize: '0.875rem',
                              marginTop: '0.5rem',
                            }}
                          />
                        )}

                        {(item.item_type === 'observation' || item.item_type === 'check' || item.item_type === 'measure') && (
                          <textarea
                            placeholder="Observações (opcional)"
                            value={checklistExecutionItems[item.id]?.observation || ''}
                            onChange={(e) => {
                              setChecklistExecutionItems({
                                ...checklistExecutionItems,
                                [item.id]: {
                                  ...checklistExecutionItems[item.id],
                                  observation: e.target.value,
                                },
                              });
                            }}
                            rows={2}
                            style={{
                              width: '100%',
                              padding: '0.5rem',
                              border: '1px solid #e2e8f0',
                              borderRadius: '6px',
                              fontSize: '0.875rem',
                              marginTop: '0.5rem',
                              resize: 'vertical',
                            }}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
                Este checklist não possui itens.
              </div>
            )}

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => {
                  setShowChecklistModal(false);
                  setSelectedChecklist(null);
                  setChecklistExecutionItems({});
                }}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#f1f5f9',
                  color: '#64748b',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600',
                }}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveChecklistExecution}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600',
                }}
              >
                Salvar Checklist
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Assinatura */}
      {showSignatureModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1003,
            padding: '1rem',
          }}
          onClick={() => {
            setShowSignatureModal(false);
            setSignatureForm({ signed_by_name: '' });
          }}
        >
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '2rem',
              width: '90%',
              maxWidth: '600px',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>
              Capturar Assinatura do Cliente
            </h2>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '600' }}>
                Nome de quem está assinando *
              </label>
              <input
                type="text"
                value={signatureForm.signed_by_name}
                onChange={(e) => setSignatureForm({ signed_by_name: e.target.value })}
                placeholder="Nome completo"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                }}
              />
            </div>
            <SignaturePad
              onSave={handleSaveSignature}
              onCancel={() => {
                setShowSignatureModal(false);
                setSignatureForm({ signed_by_name: '' });
              }}
              initialSignature={order?.client_signature}
            />
          </div>
        </div>
      )}

      {/* Modal Upload Arquivo */}
      {showFileUploadModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1003,
            padding: '1rem',
          }}
          onClick={() => {
            setShowFileUploadModal(false);
            setFileUploadForm({ file: null, file_type: 'photo', description: '' });
          }}
        >
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '2rem',
              width: '90%',
              maxWidth: '500px',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>
              Upload de Arquivo
            </h2>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '600' }}>
                Tipo de Arquivo
              </label>
              <select
                value={fileUploadForm.file_type}
                onChange={(e) => setFileUploadForm({ ...fileUploadForm, file_type: e.target.value as any })}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                }}
              >
                <option value="photo">Foto</option>
                <option value="document">Documento</option>
                <option value="other">Outro</option>
              </select>
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '600' }}>
                Arquivo *
              </label>
              <input
                type="file"
                accept="image/*,.pdf,.doc,.docx"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    // Limitar tamanho (5MB)
                    if (file.size > 5 * 1024 * 1024) {
                      toast.error('Arquivo muito grande. Máximo 5MB');
                      return;
                    }
                    setFileUploadForm({ ...fileUploadForm, file });
                  }
                }}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                }}
              />
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '600' }}>
                Descrição (opcional)
              </label>
              <textarea
                value={fileUploadForm.description}
                onChange={(e) => setFileUploadForm({ ...fileUploadForm, description: e.target.value })}
                rows={3}
                placeholder="Descrição do arquivo..."
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  resize: 'vertical',
                }}
              />
            </div>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => {
                  setShowFileUploadModal(false);
                  setFileUploadForm({ file: null, file_type: 'photo', description: '' });
                }}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#f1f5f9',
                  color: '#64748b',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600',
                }}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleUploadFile}
                disabled={!fileUploadForm.file}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: fileUploadForm.file ? '#3b82f6' : '#cbd5e1',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: fileUploadForm.file ? 'pointer' : 'not-allowed',
                  fontWeight: '600',
                }}
              >
                <Upload size={18} style={{ marginRight: '0.5rem', display: 'inline-block', verticalAlign: 'middle' }} />
                Enviar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderDetailModal;

