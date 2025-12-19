import { ReactNode, useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      // Auto-collapse on mobile, auto-expand on desktop
      if (mobile) {
        setIsCollapsed(false);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial check

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    if (isMobile) {
      setIsMobileMenuOpen(!isMobileMenuOpen);
    } else {
      setIsCollapsed(!isCollapsed);
    }
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const sidebarWidth = isCollapsed ? 80 : 260;
  const contentMargin = isMobile ? 0 : sidebarWidth;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc', position: 'relative' }}>
      {/* Skip to main content link for accessibility */}
      <a href="#main-content" className="skip-to-main">
        Pular para o conteúdo principal
      </a>

      <Sidebar 
        isCollapsed={isCollapsed} 
        isMobile={isMobile}
        isMobileMenuOpen={isMobileMenuOpen}
        onCloseMobileMenu={closeMobileMenu}
      />
      
      {/* Mobile overlay */}
      {isMobile && isMobileMenuOpen && (
        <div
          onClick={closeMobileMenu}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 999,
            animation: 'fadeIn 0.2s ease-in-out',
          }}
          aria-hidden="true"
        />
      )}

      <div 
        style={{ 
          flex: 1, 
          marginLeft: isMobile ? 0 : `${contentMargin}px`,
          transition: 'margin-left 0.3s ease-in-out',
          width: isMobile ? '100%' : 'auto',
        }}
      >
        <Header 
          isCollapsed={isCollapsed} 
          onToggleSidebar={toggleSidebar}
          isMobile={isMobile}
          isMobileMenuOpen={isMobileMenuOpen}
        />
        <main
          id="main-content"
          style={{
            padding: isMobile ? '1rem' : '2rem',
            minHeight: 'calc(100vh - 70px)',
            maxWidth: '100%',
            overflowX: 'hidden',
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;

