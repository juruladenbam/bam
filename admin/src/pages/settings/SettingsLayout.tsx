import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useEffect } from 'react';

const tabs = [
    { label: 'Beranda', path: '/settings/home', icon: 'home' },
    { label: 'Tentang', path: '/settings/about', icon: 'info' },
];

export default function SettingsLayout() {
    const location = useLocation();

    useEffect(() => {
        // Small delay to override autofocus scroll from RichTextEditor
        const timer = setTimeout(() => {
            const mainContent = document.querySelector('main > div.overflow-auto');
            if (mainContent) {
                mainContent.scrollTo({ top: 0, behavior: 'instant' });
            }
            window.scrollTo({ top: 0, behavior: 'instant' });
        }, 50);

        return () => clearTimeout(timer);
    }, [location.pathname]);

    return (
        <div>
            {/* Settings Tabs */}
            <div className="mb-6 border-b border-[#e6dbdc]">
                <nav className="flex gap-1">
                    {tabs.map((tab) => (
                        <NavLink
                            key={tab.path}
                            to={tab.path}
                            className={({ isActive }) =>
                                `inline-flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${isActive
                                    ? 'border-[#ec1325] text-[#ec1325]'
                                    : 'border-transparent text-[#896165] hover:text-[#181112] hover:border-[#e6dbdc]'
                                }`
                            }
                        >
                            <span className="material-symbols-outlined text-[20px]">{tab.icon}</span>
                            {tab.label}
                        </NavLink>
                    ))}
                </nav>
            </div>

            {/* Content */}
            <Outlet />
        </div>
    );
}
