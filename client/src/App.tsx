import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Proveedores from './pages/Proveedores';
import Clientes from './pages/Clientes';
import Viajes from './pages/Viajes';
import Choferes from './pages/Choferes';
import Gastos from './pages/Gastos';
import Usuarios from './pages/Usuarios';
import Reportes from './pages/Reportes';
import Contabilidad from './pages/Contabilidad';
import Pagos from './pages/Pagos';
import PagoProveedores from './pages/PagoProveedores';
import PagoClientes from './pages/PagoClientes';
import PagoTransportes from './pages/PagoTransportes';
import PreciosCereales from './pages/PreciosCereales';
import Ganancias from './pages/Ganancias';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Cargando...</div>;
  }

  return user ? <Layout>{children}</Layout> : <Navigate to="/login" />;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/proveedores" element={<PrivateRoute><Proveedores /></PrivateRoute>} />
          <Route path="/clientes" element={<PrivateRoute><Clientes /></PrivateRoute>} />
          <Route path="/viajes" element={<PrivateRoute><Viajes /></PrivateRoute>} />
          <Route path="/choferes" element={<PrivateRoute><Choferes /></PrivateRoute>} />
          <Route path="/gastos" element={<PrivateRoute><Gastos /></PrivateRoute>} />
          <Route path="/usuarios" element={<PrivateRoute><Usuarios /></PrivateRoute>} />
          <Route path="/reportes" element={<PrivateRoute><Reportes /></PrivateRoute>} />
          <Route path="/contabilidad" element={<PrivateRoute><Contabilidad /></PrivateRoute>} />
          <Route path="/pagos" element={<PrivateRoute><Pagos /></PrivateRoute>} />
          <Route path="/pagos/proveedores" element={<PrivateRoute><PagoProveedores /></PrivateRoute>} />
          <Route path="/pagos/clientes" element={<PrivateRoute><PagoClientes /></PrivateRoute>} />
          <Route path="/pagos/transportes" element={<PrivateRoute><PagoTransportes /></PrivateRoute>} />
          <Route path="/precios-cereales" element={<PrivateRoute><PreciosCereales /></PrivateRoute>} />
          <Route path="/ganancias" element={<PrivateRoute><Ganancias /></PrivateRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
