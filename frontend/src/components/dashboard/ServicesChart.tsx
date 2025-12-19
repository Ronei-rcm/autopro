import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const data = [
  { name: 'Troca de Óleo', value: 35, color: '#f97316' },
  { name: 'Freios', value: 25, color: '#10b981' },
  { name: 'Alinhamento', value: 20, color: '#3b82f6' },
  { name: 'Suspensão', value: 15, color: '#a855f7' },
  { name: 'Outros', value: 5, color: '#ec4899' },
];

const ServicesChart = () => {
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
        Serviços Realizados
      </h3>
      <div style={{ marginBottom: '0.5rem', fontSize: '0.875rem', color: '#64748b' }}>
        Distribuição por tipo
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip />
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(value) => value}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ServicesChart;

