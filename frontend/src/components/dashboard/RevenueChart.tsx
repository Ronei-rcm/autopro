import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const data = [
  { month: 'Jan', receitas: 35000, despesas: 28000 },
  { month: 'Fev', receitas: 42000, despesas: 32000 },
  { month: 'Mar', receitas: 38000, despesas: 30000 },
  { month: 'Abr', receitas: 45000, despesas: 35000 },
  { month: 'Mai', receitas: 48000, despesas: 38000 },
  { month: 'Jun', receitas: 52000, despesas: 40000 },
  { month: 'Jul', receitas: 45680, despesas: 36000 },
  { month: 'Ago', receitas: 49000, despesas: 38000 },
  { month: 'Set', receitas: 51000, despesas: 39000 },
  { month: 'Out', receitas: 48000, despesas: 37000 },
  { month: 'Nov', receitas: 50000, despesas: 38000 },
  { month: 'Dez', receitas: 55000, despesas: 42000 },
];

const RevenueChart = () => {
  return (
    <div
      style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '1.5rem',
        boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
      }}
    >
      <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem', fontWeight: '600' }}>
        Faturamento Anual
      </h3>
      <div style={{ marginBottom: '0.5rem', fontSize: '0.875rem', color: '#64748b' }}>
        Receitas vs Despesas
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorReceitas" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f97316" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorDespesas" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ec4899" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="month" stroke="#64748b" />
          <YAxis stroke="#64748b" />
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
            }}
          />
          <Legend />
          <Area
            type="monotone"
            dataKey="receitas"
            stroke="#f97316"
            fillOpacity={1}
            fill="url(#colorReceitas)"
            name="Receitas"
          />
          <Area
            type="monotone"
            dataKey="despesas"
            stroke="#ec4899"
            fillOpacity={1}
            fill="url(#colorDespesas)"
            name="Despesas"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RevenueChart;

