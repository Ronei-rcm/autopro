import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Clients from './pages/Clients';
import Vehicles from './pages/Vehicles';
import Suppliers from './pages/Suppliers';
import Inventory from './pages/Inventory';
import Orders from './pages/Orders';
import PrivateRoute from './components/common/PrivateRoute';
import MainLayout from './components/layout/MainLayout';
import HelpAssistant from './components/ai/HelpAssistant';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <MainLayout>
                  <Dashboard />
                  <HelpAssistant />
                </MainLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/clientes"
            element={
              <PrivateRoute>
                <MainLayout>
                  <Clients />
                  <HelpAssistant />
                </MainLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/veiculos"
            element={
              <PrivateRoute>
                <MainLayout>
                  <Vehicles />
                  <HelpAssistant />
                </MainLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/fornecedores"
            element={
              <PrivateRoute>
                <MainLayout>
                  <Suppliers />
                  <HelpAssistant />
                </MainLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/estoque"
            element={
              <PrivateRoute>
                <MainLayout>
                  <Inventory />
                  <HelpAssistant />
                </MainLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/ordens-servico"
            element={
              <PrivateRoute>
                <MainLayout>
                  <Orders />
                  <HelpAssistant />
                </MainLayout>
              </PrivateRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

