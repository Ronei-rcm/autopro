import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, Search, Edit, Trash2, FileText, Car, Wrench, Package, DollarSign, X, Eye, CheckCircle, Clock, AlertCircle, ArrowRight, Printer } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import SkeletonLoader from '../components/common/SkeletonLoader';
import AdvancedFilters from '../components/common/AdvancedFilters';
import Pagination from '../components/common/Pagination';
import ConfirmDialog from '../components/common/ConfirmDialog';
import ApproveQuoteModal from '../components/quotes/ApproveQuoteModal';
import { useAuth } from '../contexts/AuthContext';

interface Quote {
  id: number;
  quote_number: string;
  client_id: number;
  client_name?: string;
  vehicle_id: number;
  vehicle_brand?: string;
  vehicle_model?: string;
  vehicle_plate?: string;
  user_name?: string;
  status: 'open' | 'approved' | 'rejected' | 'converted';
  subtotal: number;
  discount: number;
  total: number;
  valid_until?: string;
  notes?: string;
  created_at: string;
  items?: QuoteItem[];
}

interface QuoteItem {
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

interface Client {
  id: number;
  name: string;
}

interface Vehicle {
  id: number;
  brand: string;
  model: string;
  plate?: string;
  client_id: number;
}

interface Product {
  id: number;
  name: string;
  sale_price: number;
  unit: string;
}

interface LaborType {
  id: number;
  name: string;
  price: number;
}

const Quotes = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [laborTypes, setLaborTypes] = useState<LaborType[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showModal, setShowModal] = useState(false);
  const [showItemModal, setShowItemModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [approveQuote, setApproveQuote] = useState<Quote | null>(null);
  const [selectedQuoteId, setSelectedQuoteId] = useState<number | null>(null);
  const [editingQuote, setEditingQuote] = useState<Quote | null>(null);
  const [currentQuote, setCurrentQuote] = useState<Quote | null>(null);
  const [quoteItems, setQuoteItems] = useState<QuoteItem[]>([]);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; quote: Quote | null }>({
    isOpen: false,
    quote: null,
  });
  const [convertConfirm, setConvertConfirm] = useState<{ isOpen: boolean; quote: Quote | null }>({
    isOpen: false,
    quote: null,
  });
  const [formData, setFormData] = useState({
    client_id: '',
    vehicle_id: '',
    status: 'open',
    discount: '0',
    valid_until: '',
    notes: '',
  });
  const [itemFormData, setItemFormData] = useState({
    item_type: 'product' as 'product' | 'labor',
    product_id: '',
    labor_id: '',
    description: '',
    quantity: '1',
    unit_price: '0',
  });

  useEffect(() => {
    loadQuotes();
    loadClients();
    loadProducts();
    loadLaborTypes();
  }, [search, selectedStatus, filters]);

  // Verificar se há parâmetro approve na URL
  useEffect(() => {
    const approveId = searchParams.get('approve');
    if (approveId && quotes.length > 0) {
      const quote = quotes.find((q) => q.id === parseInt(approveId));
      if (quote && quote.status === 'open') {
        setApproveQuote(quote);
        setShowApproveModal(true);
        // Limpar parâmetro da URL
        setSearchParams({});
      }
    }
  }, [searchParams, quotes]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filters, search, selectedStatus]);

  useEffect(() => {
    if (showDetailModal && selectedQuoteId) {
      loadQuoteItems(selectedQuoteId);
    }
  }, [showDetailModal, selectedQuoteId]);

  const loadQuotes = async () => {
    try {
      setLoading(true);
      const params: Record<string, string> = {};
      if (search) params.search = search;
      if (selectedStatus) params.status = selectedStatus;
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params[key] = value;
      });

      const response = await api.get('/quotes', { params });
      setQuotes(response.data);
    } catch (error: any) {
      toast.error('Erro ao carregar orçamentos');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadClients = async () => {
    try {
      const response = await api.get('/clients');
      setClients(response.data);
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
    }
  };

  const loadVehicles = async (clientId?: number) => {
    try {
      const params = clientId ? { client_id: clientId } : {};
      const response = await api.get('/vehicles', { params });
      setVehicles(response.data);
    } catch (error) {
      console.error('Erro ao carregar veículos:', error);
    }
  };

  const loadProducts = async () => {
    try {
      const response = await api.get('/products');
      setProducts(response.data);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
    }
  };

  const loadLaborTypes = async () => {
    try {
      const response = await api.get('/labor-types', { params: { active: 'true' } });
      setLaborTypes(response.data);
    } catch (error) {
      console.error('Erro ao carregar tipos de mão de obra:', error);
    }
  };

  const loadQuoteItems = async (quoteId: number) => {
    try {
      const response = await api.get(`/quotes/${quoteId}`);
      setQuoteItems(response.data.items || []);
      setCurrentQuote(response.data);
    } catch (error) {
      console.error('Erro ao carregar itens:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      client_id: '',
      vehicle_id: '',
      status: 'open',
      discount: '0',
      valid_until: '',
      notes: '',
    });
    setQuoteItems([]);
    setCurrentQuote(null);
    setEditingQuote(null);
    setItemFormData({
      item_type: 'product',
      product_id: '',
      labor_id: '',
      description: '',
      quantity: '1',
      unit_price: '0',
    });
  };

  const resetItemForm = () => {
    setItemFormData({
      item_type: 'product',
      product_id: '',
      labor_id: '',
      description: '',
      quantity: '1',
      unit_price: '0',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.client_id || !formData.vehicle_id) {
      toast.error('Cliente e veículo são obrigatórios');
      return;
    }

    if (quoteItems.length === 0) {
      toast.error('Orçamento deve ter pelo menos um item');
      return;
    }

    try {
      const items = quoteItems.map((item) => ({
        product_id: item.product_id || null,
        labor_id: item.labor_id || null,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.total_price,
        item_type: item.item_type,
      }));

      const data: any = {
        client_id: parseInt(formData.client_id),
        vehicle_id: parseInt(formData.vehicle_id),
        status: formData.status,
        discount: parseFloat(formData.discount) || 0,
        valid_until: formData.valid_until || null,
        notes: formData.notes,
        items,
      };

      if (editingQuote) {
        await api.put(`/quotes/${editingQuote.id}`, data);
        toast.success('Orçamento atualizado com sucesso!');
      } else {
        await api.post('/quotes', data);
        toast.success('Orçamento criado com sucesso!');
      }
      setShowModal(false);
      resetForm();
      loadQuotes();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro ao salvar orçamento');
    }
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();

    if (!itemFormData.description.trim()) {
      toast.error('Descrição é obrigatória');
      return;
    }

    const quantity = parseFloat(itemFormData.quantity);
    const unitPrice = parseFloat(itemFormData.unit_price);

    if (quantity <= 0) {
      toast.error('Quantidade deve ser maior que zero');
      return;
    }

    if (unitPrice < 0) {
      toast.error('Preço unitário deve ser maior ou igual a zero');
      return;
    }

    const totalPrice = quantity * unitPrice;

    const newItem: QuoteItem = {
      id: Date.now(), // ID temporário
      product_id: itemFormData.item_type === 'product' && itemFormData.product_id ? parseInt(itemFormData.product_id) : undefined,
      labor_id: itemFormData.item_type === 'labor' && itemFormData.labor_id ? parseInt(itemFormData.labor_id) : undefined,
      product_name: itemFormData.item_type === 'product' && itemFormData.product_id ? products.find(p => p.id === parseInt(itemFormData.product_id))?.name : undefined,
      labor_name: itemFormData.item_type === 'labor' && itemFormData.labor_id ? laborTypes.find(l => l.id === parseInt(itemFormData.labor_id))?.name : undefined,
      description: itemFormData.description,
      quantity,
      unit_price: unitPrice,
      total_price: totalPrice,
      item_type: itemFormData.item_type,
    };

    setQuoteItems([...quoteItems, newItem]);
    resetItemForm();
    setShowItemModal(false);
  };

  const handleRemoveItem = (itemId: number) => {
    setQuoteItems(quoteItems.filter(item => item.id !== itemId));
  };

  const handleEdit = async (quote: Quote) => {
    setEditingQuote(quote);
    setFormData({
      client_id: quote.client_id.toString(),
      vehicle_id: quote.vehicle_id.toString(),
      status: quote.status,
      discount: quote.discount.toString(),
      valid_until: quote.valid_until ? quote.valid_until.split('T')[0] : '',
      notes: quote.notes || '',
    });
    await loadVehicles(quote.client_id);
    
    const response = await api.get(`/quotes/${quote.id}`);
    setQuoteItems(response.data.items || []);
    setCurrentQuote(response.data);
    setShowModal(true);
  };

  const handleDeleteClick = (quote: Quote) => {
    setDeleteConfirm({ isOpen: true, quote });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm.quote) return;

    try {
      await api.delete(`/quotes/${deleteConfirm.quote.id}`);
      toast.success('Orçamento excluído com sucesso!');
      setDeleteConfirm({ isOpen: false, quote: null });
      loadQuotes();
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Erro ao excluir orçamento';
      toast.error(errorMessage);
      console.error('Erro ao excluir orçamento:', error);
      setDeleteConfirm({ isOpen: false, quote: null });
    }
  };

  const handleConvertClick = (quote: Quote) => {
    setConvertConfirm({ isOpen: true, quote });
  };

  const handleConvertConfirm = async () => {
    if (!convertConfirm.quote) return;

    try {
      await api.post(`/quotes/${convertConfirm.quote.id}/convert-to-order`, {});
      toast.success('Orçamento convertido em ordem de serviço com sucesso!');
      setConvertConfirm({ isOpen: false, quote: null });
      loadQuotes();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro ao converter orçamento');
      setConvertConfirm({ isOpen: false, quote: null });
    }
  };

  const handleApproveClick = (quote: Quote) => {
    setApproveQuote(quote);
    setShowApproveModal(true);
  };

  const handleApproveSuccess = () => {
    loadQuotes();
    setShowApproveModal(false);
    setApproveQuote(null);
    // Forçar recarregamento da página de agendamentos se estiver aberta
    toast.success('Agendamento criado! Verifique a página de Agendamentos.', {
      duration: 5000,
    });
  };

  const handleUpdateStatus = async (quoteId: number, status: 'open' | 'approved' | 'rejected') => {
    try {
      await api.patch(`/quotes/${quoteId}/status`, { status });
      toast.success('Status atualizado com sucesso!');
      loadQuotes();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro ao atualizar status');
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatDateForPDF = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatCurrencyForPDF = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const handlePrintQuote = async (quote: Quote) => {
    try {
      toast.loading('Gerando PDF do orçamento...', { id: 'export-quote-pdf' });

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

      // Buscar informações da oficina
      let workshop: any = null;
      try {
        const response = await api.get('/workshop-info');
        workshop = response.data;
      } catch (error) {
        console.error('Erro ao carregar informações da oficina:', error);
      }

      // Cabeçalho com informações da oficina
      const headerHeight = workshop?.logo_base64 ? 50 : 40;
      pdf.setFillColor(59, 130, 246); // Azul #3b82f6
      pdf.rect(0, 0, pageWidth, headerHeight, 'F');
      
      // Logo da oficina (se houver)
      if (workshop?.logo_base64) {
        try {
          pdf.addImage(workshop.logo_base64, 'PNG', margin, 5, 30, 30);
        } catch (error) {
          console.error('Erro ao adicionar logo:', error);
        }
      }

      // Informações da oficina no cabeçalho
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(workshop?.name ? 16 : 24);
      pdf.setFont('helvetica', 'bold');
      const workshopName = workshop?.name || 'ORÇAMENTO';
      pdf.text(workshopName, workshop?.logo_base64 ? margin + 35 : pageWidth / 2, workshop?.logo_base64 ? 15 : 15, { 
        align: workshop?.logo_base64 ? 'left' : 'center',
        maxWidth: workshop?.logo_base64 ? pageWidth - margin - 60 : pageWidth - 2 * margin
      });
      
      if (workshop?.trade_name) {
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'normal');
        pdf.text(workshop.trade_name, workshop?.logo_base64 ? margin + 35 : pageWidth / 2, 22, {
          align: workshop?.logo_base64 ? 'left' : 'center',
          maxWidth: workshop?.logo_base64 ? pageWidth - margin - 60 : pageWidth - 2 * margin
        });
      }

      // Número do Orçamento
      pdf.setFontSize(18);
      pdf.setFont('helvetica', 'bold');
      pdf.text(quote.quote_number, pageWidth / 2, workshop?.logo_base64 ? 35 : 28, { align: 'center' });

      yPosition = headerHeight + 10;

      // Dados do Orçamento
      pdf.setTextColor(30, 41, 59);
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Dados do Orçamento', margin, yPosition);
      yPosition += 8;

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(9);
      const quoteData = [
        ['Status:', getStatusLabel(quote.status)],
        ['Data de Criação:', formatDateForPDF(quote.created_at)],
        quote.valid_until ? ['Válido até:', formatDateForPDF(quote.valid_until)] : null,
      ].filter(Boolean) as string[][];

      quoteData.forEach(([label, value]) => {
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
      pdf.text(quote.client_name || '-', margin, yPosition);
      yPosition += 6;

      // Dados do Veículo
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(10);
      pdf.text('Veículo', margin, yPosition);
      yPosition += 8;

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(9);
      const vehicleInfo = `${quote.vehicle_brand || ''} ${quote.vehicle_model || ''}`.trim();
      pdf.text(vehicleInfo || '-', margin, yPosition);
      if (quote.vehicle_plate) {
        yPosition += 6;
        pdf.text(`Placa: ${quote.vehicle_plate}`, margin, yPosition);
      }
      yPosition += 6;

      yPosition += 5;
      checkNewPage(30);

      // Tabela de Itens
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(10);
      pdf.text('Itens do Orçamento', margin, yPosition);
      yPosition += 8;

      // Buscar quote completo com itens se necessário
      let quoteWithItems = quote;
      if (!quote.items || quote.items.length === 0) {
        const response = await api.get(`/quotes/${quote.id}`);
        quoteWithItems = response.data;
      }

      if (quoteWithItems.items && quoteWithItems.items.length > 0) {
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
        quoteWithItems.items.forEach((item: QuoteItem, index: number) => {
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
      pdf.text(formatCurrencyForPDF(quote.subtotal), pageWidth - margin - 5, yPosition, { align: 'right' });
      yPosition += 7;

      if (quote.discount > 0) {
        pdf.text('Desconto:', pageWidth - margin - 50, yPosition);
        pdf.text(formatCurrencyForPDF(quote.discount), pageWidth - margin - 5, yPosition, { align: 'right' });
        yPosition += 7;
      }

      pdf.setFillColor(59, 130, 246, 0.1); // Azul claro
      pdf.rect(margin, yPosition - 5, pageWidth - 2 * margin, 8, 'F');
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(11);
      pdf.setTextColor(59, 130, 246);
      pdf.text('TOTAL:', pageWidth - margin - 50, yPosition);
      pdf.text(formatCurrencyForPDF(quote.total), pageWidth - margin - 5, yPosition, { align: 'right' });
      
      pdf.setTextColor(30, 41, 59);
      yPosition += 10;
      checkNewPage(20);

      // Observações
      if (quote.notes) {
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(10);
        pdf.text('Observações', margin, yPosition);
        yPosition += 8;

        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(9);
        const notesLines = pdf.splitTextToSize(quote.notes, pageWidth - 2 * margin);
        notesLines.forEach((line: string) => {
          checkNewPage(6);
          pdf.text(line, margin, yPosition);
          yPosition += 6;
        });
        yPosition += 5;
      }

      // Rodapé com informações da oficina
      const totalPages = pdf.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setTextColor(100, 116, 139);
        
        // Texto do rodapé personalizado ou padrão
        const footerText = workshop?.footer_text || `Página ${i} de ${totalPages} - Gerado em ${new Date().toLocaleString('pt-BR')}`;
        pdf.text(
          footerText,
          pageWidth / 2,
          pageHeight - 10,
          { align: 'center', maxWidth: pageWidth - 2 * margin }
        );
        
        // Informações de contato da oficina (se houver)
        if (workshop && (workshop.phone || workshop.email || workshop.address_city)) {
          let contactInfo = '';
          if (workshop.phone) contactInfo += `Tel: ${workshop.phone}`;
          if (workshop.email) contactInfo += (contactInfo ? ' | ' : '') + `Email: ${workshop.email}`;
          if (workshop.address_city) contactInfo += (contactInfo ? ' | ' : '') + `${workshop.address_city}${workshop.address_state ? '/' + workshop.address_state : ''}`;
          
          if (contactInfo) {
            pdf.setFontSize(7);
            pdf.text(contactInfo, pageWidth / 2, pageHeight - 5, { align: 'center', maxWidth: pageWidth - 2 * margin });
          }
        }
      }

      // Salvar PDF
      const fileName = `ORCAMENTO_${quote.quote_number}_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);

      toast.success('PDF gerado com sucesso!', { id: 'export-quote-pdf' });
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast.error('Erro ao gerar PDF do orçamento', { id: 'export-quote-pdf' });
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      open: 'Aberto',
      approved: 'Aprovado',
      rejected: 'Rejeitado',
      converted: 'Convertido',
    };
    return labels[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      open: '#3b82f6',
      approved: '#10b981',
      rejected: '#ef4444',
      converted: '#64748b',
    };
    return colors[status] || '#64748b';
  };

  // Calcular totais
  const subtotal = useMemo(() => {
    return quoteItems.reduce((sum, item) => sum + item.total_price, 0);
  }, [quoteItems]);

  const discount = parseFloat(formData.discount) || 0;
  const total = subtotal - discount;

  // Atualizar total no formData quando mudar
  useEffect(() => {
    // Não precisa atualizar formData aqui, apenas usar nos cálculos
  }, [subtotal, discount]);

  // Filtrar veículos quando cliente mudar
  useEffect(() => {
    if (formData.client_id) {
      loadVehicles(parseInt(formData.client_id));
    } else {
      setVehicles([]);
    }
  }, [formData.client_id]);

  // Quando produto/serviço for selecionado, preencher preço e descrição
  useEffect(() => {
    if (itemFormData.item_type === 'product' && itemFormData.product_id) {
      const product = products.find(p => p.id === parseInt(itemFormData.product_id));
      if (product) {
        setItemFormData({
          ...itemFormData,
          description: product.name,
          unit_price: product.sale_price.toString(),
        });
      }
    } else if (itemFormData.item_type === 'labor' && itemFormData.labor_id) {
      const labor = laborTypes.find(l => l.id === parseInt(itemFormData.labor_id));
      if (labor) {
        setItemFormData({
          ...itemFormData,
          description: labor.name,
          unit_price: labor.price.toString(),
        });
      }
    }
  }, [itemFormData.product_id, itemFormData.labor_id, itemFormData.item_type]);

  const filteredQuotes = useMemo(() => {
    return quotes.filter((quote) => {
      if (selectedStatus && quote.status !== selectedStatus) return false;
      if (search) {
        const searchLower = search.toLowerCase();
        return (
          quote.quote_number.toLowerCase().includes(searchLower) ||
          (quote.client_name && quote.client_name.toLowerCase().includes(searchLower)) ||
          (quote.vehicle_plate && quote.vehicle_plate.toLowerCase().includes(searchLower))
        );
      }
      return true;
    });
  }, [quotes, search, selectedStatus]);

  const paginatedQuotes = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredQuotes.slice(start, start + itemsPerPage);
  }, [filteredQuotes, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredQuotes.length / itemsPerPage);

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '0.5rem' }}>
            Orçamentos
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
            Gerencie orçamentos de serviços
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.5rem',
            backgroundColor: '#f97316',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '600',
          }}
        >
          <Plus size={20} />
          Novo Orçamento
        </button>
      </div>

      {/* Filters */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '1', minWidth: '250px', maxWidth: '400px' }}>
          <Search
            size={20}
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#64748b',
            }}
          />
          <input
            type="text"
            placeholder="Buscar orçamentos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem 1rem 0.75rem 2.5rem',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              fontSize: '0.9rem',
              outline: 'none',
            }}
          />
        </div>
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          style={{
            padding: '0.75rem 1rem',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            fontSize: '0.9rem',
            outline: 'none',
            cursor: 'pointer',
          }}
        >
          <option value="">Todos os status</option>
          <option value="open">Aberto</option>
          <option value="approved">Aprovado</option>
          <option value="rejected">Rejeitado</option>
          <option value="converted">Convertido</option>
        </select>
      </div>

      {/* Table */}
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
          overflow: 'hidden',
        }}
      >
        {loading ? (
          <SkeletonLoader type="table" />
        ) : filteredQuotes.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
            Nenhum orçamento encontrado
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#64748b' }}>
                  Número
                </th>
                <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#64748b' }}>
                  Cliente
                </th>
                <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#64748b' }}>
                  Veículo
                </th>
                <th style={{ padding: '1rem', textAlign: 'right', fontSize: '0.875rem', fontWeight: '600', color: '#64748b' }}>
                  Total
                </th>
                <th style={{ padding: '1rem', textAlign: 'center', fontSize: '0.875rem', fontWeight: '600', color: '#64748b' }}>
                  Status
                </th>
                <th style={{ padding: '1rem', textAlign: 'center', fontSize: '0.875rem', fontWeight: '600', color: '#64748b' }}>
                  Validade
                </th>
                <th style={{ padding: '1rem', textAlign: 'center', fontSize: '0.875rem', fontWeight: '600', color: '#64748b' }}>
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedQuotes.map((quote) => (
                <tr
                  key={quote.id}
                  style={{
                    borderBottom: '1px solid #e2e8f0',
                    transition: 'background-color 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#f8fafc';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'white';
                  }}
                >
                  <td style={{ padding: '1rem' }}>
                    <span style={{ fontWeight: '600', color: '#1e293b' }}>{quote.quote_number}</span>
                  </td>
                  <td style={{ padding: '1rem', color: '#64748b' }}>{quote.client_name}</td>
                  <td style={{ padding: '1rem', color: '#64748b', fontSize: '0.875rem' }}>
                    {quote.vehicle_brand} {quote.vehicle_model} {quote.vehicle_plate && `- ${quote.vehicle_plate}`}
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right', fontWeight: '600', color: '#1e293b' }}>
                    {formatCurrency(quote.total)}
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '12px',
                        fontWeight: '600',
                        backgroundColor: getStatusColor(quote.status) + '20',
                        color: getStatusColor(quote.status),
                      }}
                    >
                      {getStatusLabel(quote.status)}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center', color: '#64748b', fontSize: '0.875rem' }}>
                    {quote.valid_until ? formatDate(quote.valid_until) : '-'}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                      <button
                        onClick={() => {
                          setSelectedQuoteId(quote.id);
                          setShowDetailModal(true);
                        }}
                        style={{
                          padding: '0.5rem',
                          backgroundColor: '#f1f5f9',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                        title="Visualizar"
                      >
                        <Eye size={16} color="#64748b" />
                      </button>
                      <button
                        onClick={() => handlePrintQuote(quote)}
                        style={{
                          padding: '0.5rem',
                          backgroundColor: '#fef3c7',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                        title="Gerar PDF"
                      >
                        <Printer size={16} color="#d97706" />
                      </button>
                      {quote.status !== 'converted' && (
                        <>
                          <button
                            onClick={() => handleEdit(quote)}
                            style={{
                              padding: '0.5rem',
                              backgroundColor: '#f1f5f9',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                            title="Editar"
                          >
                            <Edit size={16} color="#64748b" />
                          </button>
                          {quote.status === 'open' && (
                            <>
                              {(user?.profile === 'admin' || user?.profile === 'attendant') && (
                                <button
                                  onClick={() => handleApproveClick(quote)}
                                  style={{
                                    padding: '0.5rem',
                                    backgroundColor: '#fff7ed',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                  }}
                                  title="Aprovar e Agendar"
                                >
                                  <CheckCircle size={16} color="#f97316" />
                                </button>
                              )}
                              <button
                                onClick={() => handleConvertClick(quote)}
                                style={{
                                  padding: '0.5rem',
                                  backgroundColor: '#10b98120',
                                  border: 'none',
                                  borderRadius: '6px',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                }}
                                title="Converter em OS"
                              >
                                <ArrowRight size={16} color="#10b981" />
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => handleDeleteClick(quote)}
                            style={{
                              padding: '0.5rem',
                              backgroundColor: '#fee2e2',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                            title="Excluir"
                          >
                            <Trash2 size={16} color="#ef4444" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {!loading && filteredQuotes.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalItems={filteredQuotes.length}
          itemsPerPage={itemsPerPage}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        title="Confirmar Exclusão"
        message={
          deleteConfirm.quote?.status === 'converted'
            ? `Atenção: O orçamento "${deleteConfirm.quote?.quote_number}" já foi convertido em ordem de serviço. Tem certeza que deseja excluí-lo? Esta ação não pode ser desfeita e não afetará a ordem de serviço já criada.`
            : `Tem certeza que deseja excluir o orçamento "${deleteConfirm.quote?.quote_number}"? Esta ação não pode ser desfeita.`
        }
        confirmText="Excluir"
        cancelText="Cancelar"
        type="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteConfirm({ isOpen: false, quote: null })}
      />

      {/* Convert Confirmation Dialog */}
      <ConfirmDialog
        isOpen={convertConfirm.isOpen}
        title="Converter Orçamento em OS"
        message={`Deseja converter o orçamento "${convertConfirm.quote?.quote_number}" em uma Ordem de Serviço?`}
        confirmText="Converter"
        cancelText="Cancelar"
        type="info"
        onConfirm={handleConvertConfirm}
        onCancel={() => setConvertConfirm({ isOpen: false, quote: null })}
      />

      {/* Modal Criar/Editar Orçamento */}
      {showModal && (
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
            zIndex: 1000,
            padding: '1rem',
          }}
          onClick={() => {
            setShowModal(false);
            resetForm();
          }}
        >
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '2rem',
              width: '90%',
              maxWidth: '800px',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem', fontWeight: 'bold' }}>
              {editingQuote ? 'Editar Orçamento' : 'Novo Orçamento'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '600' }}>
                    Cliente *
                  </label>
                  <select
                    value={formData.client_id}
                    onChange={(e) => setFormData({ ...formData, client_id: e.target.value, vehicle_id: '' })}
                    required
                    disabled={!!editingQuote}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: '0.9rem',
                    }}
                  >
                    <option value="">Selecione um cliente</option>
                    {clients.map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '600' }}>
                    Veículo *
                  </label>
                  <select
                    value={formData.vehicle_id}
                    onChange={(e) => setFormData({ ...formData, vehicle_id: e.target.value })}
                    required
                    disabled={!!editingQuote || !formData.client_id}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: '0.9rem',
                    }}
                  >
                    <option value="">Selecione um veículo</option>
                    {vehicles
                      .filter((v) => v.client_id === parseInt(formData.client_id))
                      .map((vehicle) => (
                        <option key={vehicle.id} value={vehicle.id}>
                          {vehicle.brand} {vehicle.model} {vehicle.plate && `- ${vehicle.plate}`}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '600' }}>
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    disabled={editingQuote?.status === 'converted'}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: '0.9rem',
                    }}
                  >
                    <option value="open">Aberto</option>
                    <option value="approved">Aprovado</option>
                    <option value="rejected">Rejeitado</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '600' }}>
                    Desconto (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.discount}
                    onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: '0.9rem',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '600' }}>
                    Válido até
                  </label>
                  <input
                    type="date"
                    value={formData.valid_until}
                    onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: '0.9rem',
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '600' }}>
                  Observações
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
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

              {/* Botão Adicionar Item */}
              <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: '600' }}>Itens do Orçamento</h3>
                <button
                  type="button"
                  onClick={() => setShowItemModal(true)}
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
                  <Plus size={16} />
                  Adicionar Item
                </button>
              </div>

              {/* Lista de Itens */}
              {quoteItems.length > 0 ? (
                <div style={{ marginBottom: '1.5rem', border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f8fafc' }}>
                        <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#64748b' }}>
                          Tipo
                        </th>
                        <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#64748b' }}>
                          Descrição
                        </th>
                        <th style={{ padding: '0.75rem', textAlign: 'center', fontSize: '0.875rem', fontWeight: '600', color: '#64748b' }}>
                          Qtd
                        </th>
                        <th style={{ padding: '0.75rem', textAlign: 'right', fontSize: '0.875rem', fontWeight: '600', color: '#64748b' }}>
                          Preço Unit.
                        </th>
                        <th style={{ padding: '0.75rem', textAlign: 'right', fontSize: '0.875rem', fontWeight: '600', color: '#64748b' }}>
                          Total
                        </th>
                        <th style={{ padding: '0.75rem', textAlign: 'center', fontSize: '0.875rem', fontWeight: '600', color: '#64748b' }}>
                          Ações
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {quoteItems.map((item) => (
                        <tr key={item.id} style={{ borderTop: '1px solid #e2e8f0' }}>
                          <td style={{ padding: '0.75rem' }}>
                            {item.item_type === 'product' ? (
                              <Package size={16} color="#3b82f6" />
                            ) : (
                              <Wrench size={16} color="#f97316" />
                            )}
                          </td>
                          <td style={{ padding: '0.75rem', fontSize: '0.875rem', color: '#1e293b' }}>
                            {item.description}
                          </td>
                          <td style={{ padding: '0.75rem', textAlign: 'center', fontSize: '0.875rem', color: '#64748b' }}>
                            {item.quantity}
                          </td>
                          <td style={{ padding: '0.75rem', textAlign: 'right', fontSize: '0.875rem', color: '#64748b' }}>
                            {formatCurrency(item.unit_price)}
                          </td>
                          <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: '600', fontSize: '0.875rem', color: '#1e293b' }}>
                            {formatCurrency(item.total_price)}
                          </td>
                          <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(item.id)}
                              style={{
                                padding: '0.5rem',
                                backgroundColor: '#fee2e2',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              <X size={16} color="#ef4444" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b', marginBottom: '1.5rem', border: '1px dashed #e2e8f0', borderRadius: '8px' }}>
                  Nenhum item adicionado. Clique em "Adicionar Item" para começar.
                </div>
              )}

              {/* Resumo Financeiro */}
              <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.875rem', color: '#64748b' }}>Subtotal:</span>
                  <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#1e293b' }}>{formatCurrency(subtotal)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.875rem', color: '#64748b' }}>Desconto:</span>
                  <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#ef4444' }}>- {formatCurrency(discount)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.5rem', borderTop: '2px solid #e2e8f0' }}>
                  <span style={{ fontSize: '1rem', fontWeight: '600', color: '#1e293b' }}>Total:</span>
                  <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#10b981' }}>{formatCurrency(total)}</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
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
                  type="submit"
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
                  {editingQuote ? 'Atualizar' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Adicionar Item */}
      {showItemModal && (
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
            zIndex: 1001,
          }}
          onClick={() => {
            setShowItemModal(false);
            resetItemForm();
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
            <h3 style={{ marginBottom: '1.5rem', fontSize: '1.25rem', fontWeight: 'bold' }}>Adicionar Item</h3>
            <form onSubmit={handleAddItem}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '600' }}>
                  Tipo de Item
                </label>
                <select
                  value={itemFormData.item_type}
                  onChange={(e) => setItemFormData({ ...itemFormData, item_type: e.target.value as any, product_id: '', labor_id: '', description: '', unit_price: '0' })}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                  }}
                >
                  <option value="product">Produto</option>
                  <option value="labor">Mão de Obra</option>
                </select>
              </div>

              {itemFormData.item_type === 'product' ? (
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '600' }}>
                    Produto
                  </label>
                  <select
                    value={itemFormData.product_id}
                    onChange={(e) => setItemFormData({ ...itemFormData, product_id: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: '0.9rem',
                    }}
                  >
                    <option value="">Selecione um produto</option>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name} - {formatCurrency(product.sale_price)}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '600' }}>
                    Mão de Obra
                  </label>
                  <select
                    value={itemFormData.labor_id}
                    onChange={(e) => setItemFormData({ ...itemFormData, labor_id: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: '0.9rem',
                    }}
                  >
                    <option value="">Selecione um serviço</option>
                    {laborTypes.map((labor) => (
                      <option key={labor.id} value={labor.id}>
                        {labor.name} - {formatCurrency(labor.price)}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '600' }}>
                  Descrição *
                </label>
                <input
                  type="text"
                  value={itemFormData.description}
                  onChange={(e) => setItemFormData({ ...itemFormData, description: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '600' }}>
                    Quantidade *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={itemFormData.quantity}
                    onChange={(e) => setItemFormData({ ...itemFormData, quantity: e.target.value })}
                    required
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: '0.9rem',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '600' }}>
                    Preço Unitário *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={itemFormData.unit_price}
                    onChange={(e) => setItemFormData({ ...itemFormData, unit_price: e.target.value })}
                    required
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: '0.9rem',
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowItemModal(false);
                    resetItemForm();
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
                  type="submit"
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
                  Adicionar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Detalhes */}
      {showDetailModal && selectedQuoteId && (
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
          onClick={() => {
            setShowDetailModal(false);
            setSelectedQuoteId(null);
          }}
        >
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '2rem',
              width: '90%',
              maxWidth: '800px',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {(() => {
              const quote = quotes.find(q => q.id === selectedQuoteId);
              
              // Se não encontrou na lista ou não tem itens, usar currentQuote
              const displayQuote = currentQuote || quote;
              
              if (!displayQuote) {
                // Carregar do backend se necessário
                if (selectedQuoteId) {
                  loadQuoteItems(selectedQuoteId);
                }
                return <div>Carregando...</div>;
              }

              return (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1.5rem' }}>
                    <div>
                      <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                        {displayQuote.quote_number}
                      </h2>
                      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <span
                          style={{
                            fontSize: '0.75rem',
                            padding: '0.25rem 0.75rem',
                            borderRadius: '12px',
                            fontWeight: '600',
                            backgroundColor: getStatusColor(displayQuote.status) + '20',
                            color: getStatusColor(displayQuote.status),
                          }}
                        >
                          {getStatusLabel(displayQuote.status)}
                        </span>
                        <span style={{ fontSize: '0.875rem', color: '#64748b' }}>
                          Criado em {formatDate(displayQuote.created_at)}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setShowDetailModal(false);
                        setSelectedQuoteId(null);
                      }}
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

                  <div style={{ marginBottom: '1.5rem' }}>
                    <div style={{ padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                      <div style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.25rem' }}>Cliente</div>
                      <div style={{ fontSize: '1rem', fontWeight: '600', color: '#1e293b' }}>{displayQuote.client_name}</div>
                      <div style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.5rem', marginBottom: '0.25rem' }}>Veículo</div>
                      <div style={{ fontSize: '1rem', fontWeight: '600', color: '#1e293b' }}>
                        {displayQuote.vehicle_brand} {displayQuote.vehicle_model} {displayQuote.vehicle_plate && `- ${displayQuote.vehicle_plate}`}
                      </div>
                      {displayQuote.valid_until && (
                        <>
                          <div style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.5rem', marginBottom: '0.25rem' }}>Válido até</div>
                          <div style={{ fontSize: '1rem', fontWeight: '600', color: '#1e293b' }}>{formatDate(displayQuote.valid_until)}</div>
                        </>
                      )}
                    </div>
                  </div>

                  {displayQuote.items && displayQuote.items.length > 0 && (
                    <div style={{ marginBottom: '1.5rem' }}>
                      <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem' }}>Itens</h3>
                      <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                          <thead>
                            <tr style={{ backgroundColor: '#f8fafc' }}>
                              <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#64748b' }}>
                                Descrição
                              </th>
                              <th style={{ padding: '0.75rem', textAlign: 'center', fontSize: '0.875rem', fontWeight: '600', color: '#64748b' }}>
                                Qtd
                              </th>
                              <th style={{ padding: '0.75rem', textAlign: 'right', fontSize: '0.875rem', fontWeight: '600', color: '#64748b' }}>
                                Preço Unit.
                              </th>
                              <th style={{ padding: '0.75rem', textAlign: 'right', fontSize: '0.875rem', fontWeight: '600', color: '#64748b' }}>
                                Total
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {displayQuote.items!.map((item) => (
                              <tr key={item.id} style={{ borderTop: '1px solid #e2e8f0' }}>
                                <td style={{ padding: '0.75rem', fontSize: '0.875rem', color: '#1e293b' }}>
                                  {item.description}
                                </td>
                                <td style={{ padding: '0.75rem', textAlign: 'center', fontSize: '0.875rem', color: '#64748b' }}>
                                  {item.quantity}
                                </td>
                                <td style={{ padding: '0.75rem', textAlign: 'right', fontSize: '0.875rem', color: '#64748b' }}>
                                  {formatCurrency(item.unit_price)}
                                </td>
                                <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: '600', fontSize: '0.875rem', color: '#1e293b' }}>
                                  {formatCurrency(item.total_price)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  <div style={{ padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '8px', marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.875rem', color: '#64748b' }}>Subtotal:</span>
                      <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#1e293b' }}>{formatCurrency(displayQuote.subtotal)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.875rem', color: '#64748b' }}>Desconto:</span>
                      <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#ef4444' }}>- {formatCurrency(displayQuote.discount)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.5rem', borderTop: '2px solid #e2e8f0' }}>
                      <span style={{ fontSize: '1rem', fontWeight: '600', color: '#1e293b' }}>Total:</span>
                      <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#10b981' }}>{formatCurrency(displayQuote.total)}</span>
                    </div>
                  </div>

                  {displayQuote.notes && (
                    <div style={{ marginBottom: '1.5rem' }}>
                      <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.5rem' }}>Observações</h3>
                      <div style={{ padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '8px', fontSize: '0.875rem', color: '#64748b' }}>
                        {displayQuote.notes}
                      </div>
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '1rem', justifyContent: 'space-between', alignItems: 'center' }}>
                    <button
                      onClick={() => handlePrintQuote(displayQuote)}
                      style={{
                        padding: '0.75rem 1.5rem',
                        backgroundColor: '#fef3c7',
                        color: '#d97706',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                      }}
                    >
                      <Printer size={18} />
                      Gerar PDF
                    </button>
                    {displayQuote.status !== 'converted' && (
                      <div style={{ display: 'flex', gap: '1rem' }}>
                        {displayQuote.status === 'open' && (
                        <>
                          <button
                            onClick={() => {
                              handleUpdateStatus(displayQuote.id, 'approved');
                              setShowDetailModal(false);
                              setSelectedQuoteId(null);
                            }}
                            style={{
                              padding: '0.75rem 1.5rem',
                              backgroundColor: '#10b981',
                              color: 'white',
                              border: 'none',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              fontWeight: '600',
                            }}
                          >
                            Aprovar
                          </button>
                          <button
                            onClick={() => {
                              handleUpdateStatus(displayQuote.id, 'rejected');
                              setShowDetailModal(false);
                              setSelectedQuoteId(null);
                            }}
                            style={{
                              padding: '0.75rem 1.5rem',
                              backgroundColor: '#ef4444',
                              color: 'white',
                              border: 'none',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              fontWeight: '600',
                            }}
                          >
                            Rejeitar
                          </button>
                        </>
                      )}
                      {displayQuote.status === 'approved' && (
                        <button
                          onClick={() => {
                            handleConvertClick(displayQuote);
                            setShowDetailModal(false);
                            setSelectedQuoteId(null);
                          }}
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
                          <ArrowRight size={18} />
                          Converter em OS
                        </button>
                      )}
                      </div>
                    )}
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* Modal de Aprovação */}
      {showApproveModal && approveQuote && (
        <ApproveQuoteModal
          quoteId={approveQuote.id}
          quoteNumber={approveQuote.quote_number}
          clientName={approveQuote.client_name}
          vehicleBrand={approveQuote.vehicle_brand}
          vehicleModel={approveQuote.vehicle_model}
          vehiclePlate={approveQuote.vehicle_plate}
          total={approveQuote.total}
          onClose={() => {
            setShowApproveModal(false);
            setApproveQuote(null);
          }}
          onSuccess={handleApproveSuccess}
        />
      )}
    </div>
  );
};

export default Quotes;
