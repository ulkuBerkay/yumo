import { Outlet, Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Package, FolderTree, LogOut, Layers, Menu, X } from 'lucide-react';
import logo from '../assets/logo.jpeg';

export default function AdminLayout() {
    const { user, isLoading, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Close sidebar on route change (mobile)
    useEffect(() => {
        setSidebarOpen(false);
    }, [location.pathname]);

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
            {/* Mobile Header */}
            <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-100 px-4 flex items-center justify-between z-40">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="p-2 -ml-2 text-gray-600 hover:text-black"
                    >
                        <Menu size={24} />
                    </button>
                    <img src={logo} alt="YUMO" className="h-8 object-contain" />
                </div>
                <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">PANEL</span>
            </div>

            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed md:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0
            `}>
                <div className="h-24 hidden md:flex items-center justify-center border-b border-gray-100">
                    <img src={logo} alt="YUMO" className="h-16 object-contain mr-2" />
                    <span className="text-xs font-normal text-gray-400">PANEL</span>
                </div>

                {/* Mobile Sidebar Header */}
                <div className="h-16 flex md:hidden items-center justify-between px-6 border-b border-gray-100">
                    <span className="font-bold text-gray-900">Menü</span>
                    <button onClick={() => setSidebarOpen(false)} className="text-gray-500">
                        <X size={20} />
                    </button>
                </div>

                <nav className="p-4 space-y-2 overflow-y-auto h-[calc(100vh-6rem)] md:h-[calc(100vh-6rem)]">
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
                    <Link to="/yonetim/slider" className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition ${isActive('/yonetim/slider') ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
                        <Layers size={20} />
                        <span className="font-medium text-sm">Slider Yönetimi</span>
                    </Link>

                    <button onClick={handleLogout} className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition mt-8">
                        <LogOut size={20} />
                        <span className="font-medium text-sm">Çıkış Yap</span>
                    </button>
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-4 md:p-8 overflow-y-auto pt-20 md:pt-8">
                <Outlet />
            </main>
        </div>
    );
}
