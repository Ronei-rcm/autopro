import { useState, useEffect } from 'react';
import { Building2, Upload, X, Save, Loader2, MapPin, Phone, Mail, Globe, FileText, Image as ImageIcon } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { formatCNPJ, formatCEP, formatPhone, removeNonNumeric, fetchAddressByCEP } from '../utils/formatters';

interface WorkshopInfo {
  id: number;
  name: string;
  trade_name?: string;
  cnpj?: string;
  state_registration?: string;
  municipal_registration?: string;
  phone?: string;
  email?: string;
  website?: string;
  address_street?: string;
  address_number?: string;
  address_complement?: string;
  address_neighborhood?: string;
  address_city?: string;
  address_state?: string;
  address_zipcode?: string;
  logo_base64?: string;
  notes?: string;
  terms_and_conditions?: string;
  footer_text?: string;
}

const WorkshopInfo = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadingCEP, setLoadingCEP] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    trade_name: '',
    cnpj: '',
    state_registration: '',
    municipal_registration: '',
    phone: '',
    email: '',
    website: '',
    address_street: '',
    address_number: '',
    address_complement: '',
    address_neighborhood: '',
    address_city: '',
    address_state: '',
    address_zipcode: '',
    notes: '',
    terms_and_conditions: '',
    footer_text: '',
  });

  useEffect(() => {
    loadWorkshopInfo();
  }, []);

  const loadWorkshopInfo = async () => {
    try {
      setLoading(true);
      const response = await api.get('/workshop-info');
      const info: WorkshopInfo = response.data;
      
      setFormData({
        name: info.name || '',
        trade_name: info.trade_name || '',
        cnpj: info.cnpj ? formatCNPJ(info.cnpj) : '',
        state_registration: info.state_registration || '',
        municipal_registration: info.municipal_registration || '',
        phone: info.phone ? formatPhone(info.phone) : '',
        email: info.email || '',
        website: info.website || '',
        address_street: info.address_street || '',
        address_number: info.address_number || '',
        address_complement: info.address_complement || '',
        address_neighborhood: info.address_neighborhood || '',
        address_city: info.address_city || '',
        address_state: info.address_state || '',
        address_zipcode: info.address_zipcode ? formatCEP(info.address_zipcode) : '',
        notes: info.notes || '',
        terms_and_conditions: info.terms_and_conditions || '',
        footer_text: info.footer_text || '',
      });

      if (info.logo_base64) {
        setLogoPreview(info.logo_base64);
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message || 'Erro ao carregar informações da oficina';
      
      // Se for erro de tabela não encontrada, mostrar mensagem específica
      if (errorMessage.includes('não existe') || errorMessage.includes('does not exist')) {
        toast.error(
          'Tabela workshop_info não encontrada. Execute a migration 008_add_workshop_info.sql no banco de dados.',
          { duration: 8000 }
        );
      } else {
        toast.error(errorMessage);
      }
      console.error('Erro ao carregar informações da oficina:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Nome da oficina é obrigatório');
      return;
    }

    try {
      setSaving(true);
      
      // Preparar dados, removendo campos vazios e formatando
      const data: any = {
        name: formData.name.trim(),
        trade_name: formData.trade_name.trim() || null,
        cnpj: formData.cnpj ? removeNonNumeric(formData.cnpj) : null,
        state_registration: formData.state_registration.trim() || null,
        municipal_registration: formData.municipal_registration.trim() || null,
        phone: formData.phone ? removeNonNumeric(formData.phone) : null,
        email: formData.email.trim() || null,
        website: formData.website.trim() || null,
        address_street: formData.address_street.trim() || null,
        address_number: formData.address_number.trim() || null,
        address_complement: formData.address_complement.trim() || null,
        address_neighborhood: formData.address_neighborhood.trim() || null,
        address_city: formData.address_city.trim() || null,
        address_state: formData.address_state.trim().toUpperCase() || null,
        address_zipcode: formData.address_zipcode ? removeNonNumeric(formData.address_zipcode) : null,
        notes: formData.notes.trim() || null,
        terms_and_conditions: formData.terms_and_conditions.trim() || null,
        footer_text: formData.footer_text.trim() || null,
      };
      
      // Adicionar logo apenas se houver
      if (logoPreview) {
        data.logo_base64 = logoPreview;
      } else {
        data.logo_base64 = null;
      }
      
      await api.put('/workshop-info', data);
      toast.success('Informações da oficina atualizadas com sucesso!');
      loadWorkshopInfo();
    } catch (error: any) {
      const errorResponse = error.response?.data;
      
      // Se houver erros de validação específicos
      if (errorResponse?.errors && Array.isArray(errorResponse.errors)) {
        const errorMessages = errorResponse.errors.map((err: any) => err.message || err.msg).join(', ');
        toast.error(`Erro de validação: ${errorMessages}`, { duration: 6000 });
      } else {
        toast.error(errorResponse?.error || error.message || 'Erro ao salvar informações da oficina');
      }
      
      console.error('Erro ao salvar informações da oficina:', error.response?.data || error);
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecione uma imagem');
      return;
    }

    // Validar tamanho (máximo 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('A imagem deve ter no máximo 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setLogoPreview(base64String);
      toast.success('Logo carregado com sucesso!');
    };
    reader.onerror = () => {
      toast.error('Erro ao carregar imagem');
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    setLogoPreview(null);
    toast.success('Logo removido');
  };

  const handleCEPChange = async (value: string) => {
    const formatted = formatCEP(value);
    setFormData({ ...formData, address_zipcode: formatted });

    const cleanCEP = removeNonNumeric(value);
    if (cleanCEP.length === 8) {
      setLoadingCEP(true);
      try {
        const addressData = await fetchAddressByCEP(formatted);
        if (addressData) {
          setFormData((prev) => ({
            ...prev,
            address_zipcode: formatted,
            address_street: addressData.logradouro || prev.address_street,
            address_neighborhood: addressData.bairro || prev.address_neighborhood,
            address_city: addressData.localidade || prev.address_city,
            address_state: addressData.uf || prev.address_state,
          }));
          toast.success('Endereço preenchido automaticamente!');
        } else {
          toast.error('CEP não encontrado');
        }
      } catch (error) {
        console.error('Erro ao buscar CEP:', error);
        toast.error('Erro ao buscar CEP. Tente novamente.');
      } finally {
        setLoadingCEP(false);
      }
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', color: '#f97316' }} />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Building2 size={28} style={{ color: '#f97316' }} />
          Informações da Oficina
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
          Configure as informações da sua oficina para uso em documentos, relatórios e cabeçalhos
        </p>
      </div>

      {/* Preview do Logo */}
      {logoPreview && (
        <div style={{ 
          marginBottom: '2rem', 
          padding: '1.5rem', 
          backgroundColor: 'white', 
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <div style={{ position: 'relative' }}>
            <img 
              src={logoPreview} 
              alt="Logo da Oficina" 
              style={{ 
                maxWidth: '150px', 
                maxHeight: '150px', 
                objectFit: 'contain',
                borderRadius: '8px',
                border: '2px solid #e2e8f0'
              }} 
            />
            <button
              onClick={handleRemoveLogo}
              style={{
                position: 'absolute',
                top: '-8px',
                right: '-8px',
                backgroundColor: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '24px',
                height: '24px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
              }}
            >
              <X size={14} />
            </button>
          </div>
          <div>
            <div style={{ fontWeight: '600', color: '#1e293b', marginBottom: '0.25rem' }}>Logo da Oficina</div>
            <div style={{ fontSize: '0.875rem', color: '#64748b' }}>Este logo aparecerá nos documentos impressos</div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gap: '2rem' }}>
          {/* Seção: Dados Básicos */}
          <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1e293b', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Building2 size={20} style={{ color: '#f97316' }} />
              Dados Básicos
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
              {/* Logo */}
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151' }}>
                  Logo da Oficina
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <label
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.75rem 1.5rem',
                      backgroundColor: '#f97316',
                      color: 'white',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: '500',
                      transition: 'background-color 0.2s'
                    }}
                  >
                    <Upload size={18} />
                    {logoPreview ? 'Alterar Logo' : 'Enviar Logo'}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      style={{ display: 'none' }}
                    />
                  </label>
                  <span style={{ fontSize: '0.875rem', color: '#64748b' }}>
                    PNG, JPG ou GIF (máx. 2MB)
                  </span>
                </div>
              </div>

              {/* Nome */}
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151' }}>
                  Nome da Oficina <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '0.875rem'
                  }}
                  placeholder="Ex: Oficina Mecânica Silva"
                />
              </div>

              {/* Nome Fantasia */}
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151' }}>
                  Nome Fantasia
                </label>
                <input
                  type="text"
                  value={formData.trade_name}
                  onChange={(e) => setFormData({ ...formData, trade_name: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '0.875rem'
                  }}
                  placeholder="Ex: Auto Center Silva"
                />
              </div>

              {/* CNPJ */}
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151' }}>
                  CNPJ
                </label>
                <input
                  type="text"
                  value={formData.cnpj}
                  onChange={(e) => {
                    const formatted = formatCNPJ(e.target.value);
                    setFormData({ ...formData, cnpj: formatted });
                  }}
                  maxLength={18}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '0.875rem'
                  }}
                  placeholder="00.000.000/0000-00"
                />
              </div>

              {/* Inscrição Estadual */}
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151' }}>
                  Inscrição Estadual
                </label>
                <input
                  type="text"
                  value={formData.state_registration}
                  onChange={(e) => setFormData({ ...formData, state_registration: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '0.875rem'
                  }}
                  placeholder="000.000.000.000"
                />
              </div>

              {/* Inscrição Municipal */}
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151' }}>
                  Inscrição Municipal
                </label>
                <input
                  type="text"
                  value={formData.municipal_registration}
                  onChange={(e) => setFormData({ ...formData, municipal_registration: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '0.875rem'
                  }}
                  placeholder="0000000"
                />
              </div>
            </div>
          </div>

          {/* Seção: Contato */}
          <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1e293b', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Phone size={20} style={{ color: '#f97316' }} />
              Informações de Contato
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
              {/* Telefone */}
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151' }}>
                  <Phone size={16} style={{ display: 'inline', marginRight: '0.25rem' }} />
                  Telefone
                </label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => {
                    const formatted = formatPhone(e.target.value);
                    setFormData({ ...formData, phone: formatted });
                  }}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '0.875rem'
                  }}
                  placeholder="(00) 00000-0000"
                />
              </div>

              {/* Email */}
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151' }}>
                  <Mail size={16} style={{ display: 'inline', marginRight: '0.25rem' }} />
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '0.875rem'
                  }}
                  placeholder="contato@oficina.com"
                />
              </div>

              {/* Website */}
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151' }}>
                  <Globe size={16} style={{ display: 'inline', marginRight: '0.25rem' }} />
                  Website
                </label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '0.875rem'
                  }}
                  placeholder="https://www.oficina.com"
                />
              </div>
            </div>
          </div>

          {/* Seção: Endereço */}
          <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1e293b', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MapPin size={20} style={{ color: '#f97316' }} />
              Endereço
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
              {/* CEP */}
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151' }}>
                  CEP
                </label>
                <input
                  type="text"
                  value={formData.address_zipcode}
                  onChange={(e) => handleCEPChange(e.target.value)}
                  maxLength={9}
                  disabled={loadingCEP}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    backgroundColor: loadingCEP ? '#f8fafc' : 'white'
                  }}
                  placeholder="00000-000"
                />
              </div>

              {/* Rua */}
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151' }}>
                  Rua/Avenida
                </label>
                <input
                  type="text"
                  value={formData.address_street}
                  onChange={(e) => setFormData({ ...formData, address_street: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '0.875rem'
                  }}
                  placeholder="Rua Exemplo"
                />
              </div>

              {/* Número */}
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151' }}>
                  Número
                </label>
                <input
                  type="text"
                  value={formData.address_number}
                  onChange={(e) => setFormData({ ...formData, address_number: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '0.875rem'
                  }}
                  placeholder="123"
                />
              </div>

              {/* Complemento */}
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151' }}>
                  Complemento
                </label>
                <input
                  type="text"
                  value={formData.address_complement}
                  onChange={(e) => setFormData({ ...formData, address_complement: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '0.875rem'
                  }}
                  placeholder="Sala 101"
                />
              </div>

              {/* Bairro */}
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151' }}>
                  Bairro
                </label>
                <input
                  type="text"
                  value={formData.address_neighborhood}
                  onChange={(e) => setFormData({ ...formData, address_neighborhood: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '0.875rem'
                  }}
                  placeholder="Centro"
                />
              </div>

              {/* Cidade */}
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151' }}>
                  Cidade
                </label>
                <input
                  type="text"
                  value={formData.address_city}
                  onChange={(e) => setFormData({ ...formData, address_city: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '0.875rem'
                  }}
                  placeholder="Porto Alegre"
                />
              </div>

              {/* Estado */}
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151' }}>
                  Estado (UF)
                </label>
                <input
                  type="text"
                  value={formData.address_state}
                  onChange={(e) => setFormData({ ...formData, address_state: e.target.value.toUpperCase().slice(0, 2) })}
                  maxLength={2}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    textTransform: 'uppercase'
                  }}
                  placeholder="RS"
                />
              </div>
            </div>
          </div>

          {/* Seção: Textos e Observações */}
          <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1e293b', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FileText size={20} style={{ color: '#f97316' }} />
              Textos e Observações
            </h2>

            <div style={{ display: 'grid', gap: '1.5rem' }}>
              {/* Texto do Rodapé */}
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151' }}>
                  Texto do Rodapé (para documentos)
                </label>
                <textarea
                  value={formData.footer_text}
                  onChange={(e) => setFormData({ ...formData, footer_text: e.target.value })}
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    fontFamily: 'inherit',
                    resize: 'vertical'
                  }}
                  placeholder="Este documento foi gerado automaticamente pelo sistema de gestão."
                />
                <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
                  Este texto aparecerá no rodapé dos PDFs gerados
                </p>
              </div>

              {/* Termos e Condições */}
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151' }}>
                  Termos e Condições Padrão
                </label>
                <textarea
                  value={formData.terms_and_conditions}
                  onChange={(e) => setFormData({ ...formData, terms_and_conditions: e.target.value })}
                  rows={6}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    fontFamily: 'inherit',
                    resize: 'vertical'
                  }}
                  placeholder="Termos e condições padrão para documentos..."
                />
              </div>

              {/* Observações Gerais */}
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151' }}>
                  Observações Gerais
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={4}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    fontFamily: 'inherit',
                    resize: 'vertical'
                  }}
                  placeholder="Observações internas sobre a oficina..."
                />
              </div>
            </div>
          </div>
        </div>

        {/* Botão Salvar */}
        <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="submit"
            disabled={saving}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 2rem',
              backgroundColor: saving ? '#cbd5e1' : '#f97316',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: saving ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.2s'
            }}
          >
            {saving ? (
              <>
                <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
                Salvando...
              </>
            ) : (
              <>
                <Save size={20} />
                Salvar Informações
              </>
            )}
          </button>
        </div>
      </form>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default WorkshopInfo;
