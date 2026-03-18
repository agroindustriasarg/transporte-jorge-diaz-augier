import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Viajes from './pages/Viajes';
import Clientes from './pages/Clientes';
import Fleteros from './pages/Fleteros';
import Comisionistas from './pages/Comisionistas';
import Rutas from './pages/Rutas';
import OrdenesPago from './pages/OrdenesPago';
import FacturasAPagar from './pages/FacturasAPagar';
import Usuarios from './pages/Usuarios';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="viajes" element={<Viajes />} />
            <Route path="ordenes-pago" element={<OrdenesPago />} />
            <Route path="facturas-a-pagar" element={<FacturasAPagar />} />
            <Route path="clientes" element={<Clientes />} />
            <Route path="fleteros" element={<Fleteros />} />
            <Route path="comisionistas" element={<Comisionistas />} />
            <Route path="rutas" element={<Rutas />} />
            <Route path="usuarios" element={<Usuarios />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
