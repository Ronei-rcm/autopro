import { useState, useEffect } from 'react';
import { FileText, DollarSign, TrendingUp, Package, Users, Calendar, Download, BarChart3, PieChart } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { LineChart, Line, BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ReportData {
  period?: { start: string; end: string };
  [key: string]: any;
}

const COLORS = ['#f97316', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const Reports = () => {
  const [activeReport, setActiveReport] = useState<'overview' | 'financial' | 'sales' | 'inventory' | 'clients'>('overview');
  const [startDate, setStartDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<ReportData | null>(null);

  useEffect(() => {
    loadReport();
  }, [activeReport, startDate, endDate]);

  const loadReport = async () => {
    try {
      setLoading(true);
      const params = { start_date: startDate, end_date: endDate };
      const response = await api.get(`/reports/${activeReport}`, { params });
      setReportData(response.data);
    } catch (error: any) {
      toast.error('Erro ao carregar relatório');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const renderOverviewReport = () => {
    if (!reportData?.summary) return null;

    const summary = reportData.summary;
    return (
      <div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          <div style={{ padding: '1.5rem', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)' }}>
            <div style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.5rem' }}>Total de Clientes</div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1e293b' }}>{summary.total_clients || 0}</div>
          </div>
          <div style={{ padding: '1.5rem', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)' }}>
            <div style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.5rem' }}>OS Finalizadas</div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1e293b' }}>{summary.finished_orders || 0}</div>
          </div>
          <div style={{ padding: '1.5rem', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)' }}>
            <div style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.5rem' }}>Receita Total</div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>{formatCurrency(parseFloat(summary.total_revenue || '0'))}</div>
          </div>
          <div style={{ padding: '1.5rem', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)' }}>
            <div style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.5rem' }}>Estoque Baixo</div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f59e0b' }}>{summary.low_stock_count || 0}</div>
          </div>
          <div style={{ padding: '1.5rem', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)' }}>
            <div style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.5rem' }}>Contas Vencidas</div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ef4444' }}>
              {(summary.overdue_receivables || 0) + (summary.overdue_payables || 0)}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderFinancialReport = () => {
    if (!reportData) return null;

    const receivables = reportData.receivables?.map((r: any) => ({
      date: formatDate(r.date),
      value: parseFloat(r.total),
    })) || [];

    const payables = reportData.payables?.map((p: any) => ({
      date: formatDate(p.date),
      value: parseFloat(p.total),
    })) || [];

    const categories = reportData.categories || [];
    const totals = reportData.totals || {};

    return (
      <div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
          <div style={{ padding: '1.5rem', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)' }}>
            <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem', fontWeight: '600' }}>Total de Receitas</h3>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>
              {formatCurrency(parseFloat(totals.total_income || '0'))}
            </div>
          </div>
          <div style={{ padding: '1.5rem', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)' }}>
            <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem', fontWeight: '600' }}>Total de Despesas</h3>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ef4444' }}>
              {formatCurrency(parseFloat(totals.total_expense || '0'))}
            </div>
          </div>
        </div>

        <div style={{ padding: '1.5rem', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)', marginBottom: '2rem' }}>
          <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem', fontWeight: '600' }}>Receitas vs Despesas</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={[...receivables, ...payables].sort((a, b) => a.date.localeCompare(b.date))}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Legend />
              <Line type="monotone" dataKey="value" name="Receitas" stroke="#10b981" data={receivables} />
              <Line type="monotone" dataKey="value" name="Despesas" stroke="#ef4444" data={payables} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {categories.length > 0 && (
          <div style={{ padding: '1.5rem', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)' }}>
            <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem', fontWeight: '600' }}>Despesas por Categoria</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categories.map((c: any) => ({ name: c.category, value: parseFloat(c.total) }))}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categories.map((_: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    );
  };

  const renderSalesReport = () => {
    if (!reportData) return null;

    const daily = reportData.daily?.map((d: any) => ({
      date: formatDate(d.date),
      vendas: parseFloat(d.total || '0'),
      quantidade: parseInt(d.count || '0'),
    })) || [];

    const byMechanic = reportData.byMechanic || [];
    const byClient = reportData.byClient || [];
    const totals = reportData.totals || {};

    return (
      <div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          <div style={{ padding: '1.5rem', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)' }}>
            <div style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.5rem' }}>Total de OS</div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1e293b' }}>{totals.total_orders || 0}</div>
          </div>
          <div style={{ padding: '1.5rem', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)' }}>
            <div style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.5rem' }}>Total de Vendas</div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>
              {formatCurrency(parseFloat(totals.total_sales || '0'))}
            </div>
          </div>
          <div style={{ padding: '1.5rem', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)' }}>
            <div style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.5rem' }}>Ticket Médio</div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#3b82f6' }}>
              {formatCurrency(parseFloat(totals.avg_order_value || '0'))}
            </div>
          </div>
        </div>

        {daily.length > 0 && (
          <div style={{ padding: '1.5rem', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)', marginBottom: '2rem' }}>
            <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem', fontWeight: '600' }}>Vendas por Dia</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={daily}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Legend />
                <Bar dataKey="vendas" fill="#f97316" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {byMechanic.length > 0 && (
          <div style={{ padding: '1.5rem', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)', marginBottom: '2rem' }}>
            <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem', fontWeight: '600' }}>Vendas por Mecânico</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#64748b' }}>Mecânico</th>
                  <th style={{ padding: '0.75rem', textAlign: 'right', fontSize: '0.875rem', fontWeight: '600', color: '#64748b' }}>OS</th>
                  <th style={{ padding: '0.75rem', textAlign: 'right', fontSize: '0.875rem', fontWeight: '600', color: '#64748b' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {byMechanic.map((m: any, index: number) => (
                  <tr key={index} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '0.75rem' }}>{m.mechanic_name || 'Sem mecânico'}</td>
                    <td style={{ padding: '0.75rem', textAlign: 'right' }}>{m.count}</td>
                    <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: '600' }}>{formatCurrency(parseFloat(m.total || '0'))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {byClient.length > 0 && (
          <div style={{ padding: '1.5rem', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)' }}>
            <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem', fontWeight: '600' }}>Top Clientes</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#64748b' }}>Cliente</th>
                  <th style={{ padding: '0.75rem', textAlign: 'right', fontSize: '0.875rem', fontWeight: '600', color: '#64748b' }}>OS</th>
                  <th style={{ padding: '0.75rem', textAlign: 'right', fontSize: '0.875rem', fontWeight: '600', color: '#64748b' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {byClient.map((c: any, index: number) => (
                  <tr key={index} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '0.75rem' }}>{c.client_name}</td>
                    <td style={{ padding: '0.75rem', textAlign: 'right' }}>{c.orders_count}</td>
                    <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: '600' }}>{formatCurrency(parseFloat(c.total_spent || '0'))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };

  const renderInventoryReport = () => {
    if (!reportData) return null;

    const lowStock = reportData.lowStock || [];
    const byCategory = reportData.byCategory || [];
    const totals = reportData.totals || {};

    return (
      <div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          <div style={{ padding: '1.5rem', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)' }}>
            <div style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.5rem' }}>Total de Produtos</div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1e293b' }}>{totals.total_products || 0}</div>
          </div>
          <div style={{ padding: '1.5rem', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)' }}>
            <div style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.5rem' }}>Valor de Custo</div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#3b82f6' }}>
              {formatCurrency(parseFloat(totals.total_cost_value || '0'))}
            </div>
          </div>
          <div style={{ padding: '1.5rem', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)' }}>
            <div style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.5rem' }}>Valor de Venda</div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>
              {formatCurrency(parseFloat(totals.total_sale_value || '0'))}
            </div>
          </div>
          <div style={{ padding: '1.5rem', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)' }}>
            <div style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.5rem' }}>Estoque Baixo</div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f59e0b' }}>{lowStock.length}</div>
          </div>
        </div>

        {lowStock.length > 0 && (
          <div style={{ padding: '1.5rem', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)', marginBottom: '2rem' }}>
            <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem', fontWeight: '600' }}>Produtos com Estoque Baixo</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#64748b' }}>Produto</th>
                  <th style={{ padding: '0.75rem', textAlign: 'right', fontSize: '0.875rem', fontWeight: '600', color: '#64748b' }}>Estoque</th>
                  <th style={{ padding: '0.75rem', textAlign: 'right', fontSize: '0.875rem', fontWeight: '600', color: '#64748b' }}>Mínimo</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#64748b' }}>Fornecedor</th>
                </tr>
              </thead>
              <tbody>
                {lowStock.map((p: any) => (
                  <tr key={p.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '0.75rem' }}>{p.name}</td>
                    <td style={{ padding: '0.75rem', textAlign: 'right', color: '#ef4444', fontWeight: '600' }}>{p.current_quantity} {p.unit}</td>
                    <td style={{ padding: '0.75rem', textAlign: 'right' }}>{p.min_quantity} {p.unit}</td>
                    <td style={{ padding: '0.75rem' }}>{p.supplier_name || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {byCategory.length > 0 && (
          <div style={{ padding: '1.5rem', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)' }}>
            <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem', fontWeight: '600' }}>Estoque por Categoria</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={byCategory.map((c: any) => ({ name: c.category, valor: parseFloat(c.total_value || '0') }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Bar dataKey="valor" fill="#f97316" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    );
  };

  const renderClientsReport = () => {
    if (!reportData) return null;

    const topClients = reportData.topClients || [];
    const byType = reportData.byType || [];
    const newClients = reportData.newClients?.map((c: any) => ({
      month: new Date(c.month).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }),
      count: parseInt(c.count || '0'),
    })) || [];

    return (
      <div>
        {topClients.length > 0 && (
          <div style={{ padding: '1.5rem', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)', marginBottom: '2rem' }}>
            <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem', fontWeight: '600' }}>Top Clientes</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#64748b' }}>Cliente</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#64748b' }}>Tipo</th>
                  <th style={{ padding: '0.75rem', textAlign: 'right', fontSize: '0.875rem', fontWeight: '600', color: '#64748b' }}>OS</th>
                  <th style={{ padding: '0.75rem', textAlign: 'right', fontSize: '0.875rem', fontWeight: '600', color: '#64748b' }}>Total Gasto</th>
                </tr>
              </thead>
              <tbody>
                {topClients.map((c: any, index: number) => (
                  <tr key={c.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '0.75rem' }}>{c.name}</td>
                    <td style={{ padding: '0.75rem' }}>{c.type === 'PF' ? 'Pessoa Física' : 'Pessoa Jurídica'}</td>
                    <td style={{ padding: '0.75rem', textAlign: 'right' }}>{c.orders_count}</td>
                    <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: '600' }}>{formatCurrency(parseFloat(c.total_spent || '0'))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {byType.length > 0 && (
          <div style={{ padding: '1.5rem', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)', marginBottom: '2rem' }}>
            <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem', fontWeight: '600' }}>Clientes por Tipo</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={byType.map((t: any) => ({ name: t.type === 'PF' ? 'Pessoa Física' : 'Pessoa Jurídica', value: parseInt(t.count || '0') }))}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {byType.map((_: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {newClients.length > 0 && (
          <div style={{ padding: '1.5rem', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)' }}>
            <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem', fontWeight: '600' }}>Novos Clientes por Mês</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={newClients}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '0.5rem' }}>
          Relatórios
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
          Análise completa do negócio
        </p>
      </div>

      {/* Date Filters */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Calendar size={18} color="#64748b" />
          <label style={{ fontSize: '0.875rem', fontWeight: '600', color: '#64748b' }}>Período:</label>
        </div>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          style={{
            padding: '0.5rem',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            fontSize: '0.9rem',
          }}
        />
        <span style={{ color: '#64748b' }}>até</span>
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          style={{
            padding: '0.5rem',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            fontSize: '0.9rem',
          }}
        />
      </div>

      {/* Report Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', borderBottom: '2px solid #e2e8f0', flexWrap: 'wrap' }}>
        {[
          { id: 'overview', label: 'Visão Geral', icon: BarChart3 },
          { id: 'financial', label: 'Financeiro', icon: DollarSign },
          { id: 'sales', label: 'Vendas', icon: TrendingUp },
          { id: 'inventory', label: 'Estoque', icon: Package },
          { id: 'clients', label: 'Clientes', icon: Users },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveReport(tab.id as any)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.5rem',
                border: 'none',
                backgroundColor: 'transparent',
                borderBottom: activeReport === tab.id ? '2px solid #f97316' : '2px solid transparent',
                cursor: 'pointer',
                fontWeight: activeReport === tab.id ? '600' : '400',
                color: activeReport === tab.id ? '#f97316' : '#64748b',
              }}
            >
              <Icon size={18} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Report Content */}
      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>Carregando relatório...</div>
      ) : (
        <>
          {activeReport === 'overview' && renderOverviewReport()}
          {activeReport === 'financial' && renderFinancialReport()}
          {activeReport === 'sales' && renderSalesReport()}
          {activeReport === 'inventory' && renderInventoryReport()}
          {activeReport === 'clients' && renderClientsReport()}
        </>
      )}
    </div>
  );
};

export default Reports;

