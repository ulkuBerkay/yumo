import { Outlet, Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Package, FolderTree, LogOut } from 'lucide-react';

export default function AdminLayout() {
    const { user, isLoading, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/giris');
    };

    const isActive = (path: string) => location.pathname.startsWith(path);

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (!user || !user.is_admin) {
        return <Navigate to="/giris" replace />;
    }

    return (
        <div className="flex min-h-screen bg-gray-50 font-sans">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-gray-200">
                <div className="h-20 flex items-center justify-center border-b border-gray-100">
                    <span className="text-2xl font-bold tracking-tighter">
                        YUMO<span className="text-blue-600">.</span> <span className="text-xs font-normal text-gray-400 ml-1">PANEL</span>
                    </span>
                </div>

                <nav className="p-4 space-y-2">
                    <Link to="/yonetim/panel" className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition ${isActive('/yonetim/panel') ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
                        <LayoutDashboard size={20} />
                        <span className="font-medium text-sm">Genel Bakış</span>
                    </Link>
                    <Link to="/yonetim/urunler" className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition ${isActive('/yonetim/urunler') ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
                        <Package size={20} />
                        <span className="font-medium text-sm">Ürünler</span>
                    </Link>
                    <Link to="/yonetim/kategoriler" className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition ${isActive('/yonetim/kategoriler') ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
                        <FolderTree size={20} />
                        <span className="font-medium text-sm">Kategoriler</span>
                    </Link>

                    <button onClick={handleLogout} className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition mt-8">
                        <LogOut size={20} />
                        <span className="font-medium text-sm">Çıkış Yap</span>
                    </button>
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8 overflow-y-auto">
                <Outlet />
            </main>
        </div>
    );
}
