import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import AdminLayout from './layouts/AdminLayout';
import PublicLayout from './layouts/PublicLayout';

import Login from './pages/Login';
import Home from './pages/Home';
import PublicProductList from './pages/ProductList';
import ProductDetail from './pages/ProductDetail';

import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProductList from './pages/admin/ProductList';
import ProductForm from './pages/admin/ProductForm';
import CategoryList from './pages/admin/CategoryList';
import CategoryForm from './pages/admin/CategoryForm';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/urunler" element={<PublicProductList />} />
            <Route path="/urunler/:slug" element={<ProductDetail />} />
            <Route path="/giris" element={<Login />} />
          </Route>

          {/* Admin Routes */}
          <Route path="/yonetim" element={<AdminLayout />}>
            <Route path="panel" element={<AdminDashboard />} />
            <Route path="urunler" element={<AdminProductList />} />
            <Route path="urunler/yeni" element={<ProductForm />} />
            <Route path="urunler/:id/duzenle" element={<ProductForm />} />
            <Route path="kategoriler" element={<CategoryList />} />
            <Route path="kategoriler/yeni" element={<CategoryForm />} />
            <Route path="kategoriler/:id/duzenle" element={<CategoryForm />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
