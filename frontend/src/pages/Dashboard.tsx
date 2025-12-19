const Dashboard = () => {
  return (
    <div>
      <h1>Dashboard</h1>
      <p>Bem-vindo ao sistema de gestão da oficina mecânica!</p>
      <div style={{ marginTop: '2rem' }}>
        <h2>Módulos Disponíveis</h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '1rem',
            marginTop: '1rem',
          }}
        >
          <div
            style={{
              padding: '1.5rem',
              backgroundColor: 'white',
              borderRadius: '8px',
              boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
            }}
          >
            <h3>Clientes</h3>
            <p>Gerenciar cadastro de clientes</p>
          </div>
          <div
            style={{
              padding: '1.5rem',
              backgroundColor: 'white',
              borderRadius: '8px',
              boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
            }}
          >
            <h3>Veículos</h3>
            <p>Cadastro de veículos</p>
          </div>
          <div
            style={{
              padding: '1.5rem',
              backgroundColor: 'white',
              borderRadius: '8px',
              boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
            }}
          >
            <h3>Estoque</h3>
            <p>Controle de produtos e peças</p>
          </div>
          <div
            style={{
              padding: '1.5rem',
              backgroundColor: 'white',
              borderRadius: '8px',
              boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
            }}
          >
            <h3>Ordens de Serviço</h3>
            <p>Gerenciar OS</p>
          </div>
          <div
            style={{
              padding: '1.5rem',
              backgroundColor: 'white',
              borderRadius: '8px',
              boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
            }}
          >
            <h3>Financeiro</h3>
            <p>Contas a pagar e receber</p>
          </div>
          <div
            style={{
              padding: '1.5rem',
              backgroundColor: 'white',
              borderRadius: '8px',
              boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
            }}
          >
            <h3>Agendamentos</h3>
            <p>Agenda de serviços</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

