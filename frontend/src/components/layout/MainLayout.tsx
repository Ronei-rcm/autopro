import { ReactNode } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <Sidebar />
      <div style={{ flex: 1, marginLeft: '260px' }}>
        <Header />
        <main
          style={{
            padding: '2rem',
            minHeight: 'calc(100vh - 70px)',
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;

