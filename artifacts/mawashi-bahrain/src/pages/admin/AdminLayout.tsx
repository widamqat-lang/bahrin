import { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { useUser, useClerk } from '@clerk/react';
import {
  BarChart3,
  ChevronDown,
  ChevronLeft,
  ExternalLink,
  FileText,
  ClipboardList,
  LogOut,
  Package,
  UsersRound,
  Users,
  Home,
  ShoppingBag,
  Info,
  Phone,
} from 'lucide-react';
import { BrandMark } from '../shared';

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

type AdminTab = 'overview' | 'products' | 'content' | 'orders' | 'presence' | 'customers';

interface AdminLayoutProps {
  tab: AdminTab;
  setTab: (tab: AdminTab) => void;
  children: React.ReactNode;
}

export function AdminLayout({ tab, setTab, children }: AdminLayoutProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { user } = useUser();
  const { signOut } = useClerk();

  const adminTabs = [
    { id: 'customers' as const, label: 'العملاء', icon: Users },
    { id: 'overview' as const, label: 'نظرة عامة', icon: BarChart3 },
    { id: 'products' as const, label: 'المنتجات', icon: Package },
    { id: 'content' as const, label: 'محتوى المتجر', icon: FileText },
    { id: 'orders' as const, label: 'الطلبات', icon: ClipboardList },
    { id: 'presence' as const, label: 'الحضور المباشر', icon: UsersRound },
  ];

  const storeLinks = [
    { href: '/', label: 'الصفحة الرئيسية', icon: Home },
    { href: '/products', label: 'المنتجات', icon: ShoppingBag },
    { href: '/about', label: 'من نحن', icon: Info },
    { href: '/contact', label: 'اتصل بنا', icon: Phone },
  ];

  const tabTitles: Record<AdminTab, string> = {
    customers: 'العملاء',
    overview: 'صباح الخير، يا مدير',
    products: 'المنتجات',
    content: 'محتوى المتجر',
    orders: 'الطلبات',
    presence: 'الحضور المباشر',
  };

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="min-h-[100dvh] bg-background" dir="rtl">
      {/* Sidebar - Only Brand and User Info */}
      <aside className="fixed inset-y-0 right-0 z-40 w-[260px] border-l border-sidebar-border bg-sidebar px-5 py-7 text-sidebar-foreground">
        <div className="mb-12">
          <BrandMark compact />
        </div>

        {/* User Section at bottom */}
        <div className="absolute inset-x-5 bottom-6">
          <div className="mb-4 flex items-center gap-3 px-2">
            <div className="grid size-8 place-items-center rounded-full bg-sidebar-accent text-xs font-bold">
              {(user?.firstName || 'م').slice(0, 1)}
            </div>
            <div className="min-w-0">
              <div className="truncate text-[11px] font-bold">{user?.firstName || 'مدير المتجر'}</div>
              <div className="truncate text-[9px] text-sidebar-foreground/50">
                {user?.primaryEmailAddress?.emailAddress || 'حساب موثّق'}
              </div>
            </div>
          </div>
          <button 
            type="button" 
            onClick={() => signOut({ redirectUrl: '/' })} 
            data-testid="button-admin-signout" 
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs text-sidebar-foreground/60 hover:bg-sidebar-accent"
          >
            <LogOut size={15} /> تسجيل الخروج
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="md:mr-[260px]">
        <header className="sticky top-0 z-30 flex h-[76px] items-center justify-between border-b border-border bg-background/90 px-5 backdrop-blur-xl md:px-9">
          <div>
            <div className="font-mono-bahrain text-[9px] uppercase tracking-[.15em] text-muted-foreground" dir="ltr">
              MAWASHI / ADMIN
            </div>
            <h1 className="mt-1 text-base font-bold">{tabTitles[tab]}</h1>
          </div>

          {/* القائمة Menu Button with Dropdown */}
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              data-testid="button-admin-menu"
              className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-xs font-bold transition-colors hover:bg-muted"
            >
              <span>القائمة</span>
              <ChevronDown 
                size={14} 
                className={`transition-transform duration-200 ${menuOpen ? 'rotate-180' : ''}`} 
              />
            </button>

            {/* Dropdown Menu */}
            {menuOpen && (
              <div className="absolute left-0 top-full mt-2 w-64 rounded-xl border border-border bg-card shadow-lg z-50 overflow-hidden">
                {/* Control Room Section */}
                <div className="p-2 border-b border-border bg-muted/30">
                  <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">لوحة التحكم</p>
                </div>
                <nav className="p-1 space-y-0.5">
                  {adminTabs.map(({ id, label, icon: Icon }) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => { setTab(id); setMenuOpen(false); }}
                      data-testid={`button-admin-tab-${id}`}
                      className={cn(
                        'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-right text-xs font-medium transition-colors',
                        tab === id 
                          ? 'bg-primary/10 text-primary font-semibold' 
                          : 'hover:bg-muted text-foreground/80'
                      )}
                    >
                      <Icon size={16} />
                      <span className="flex-1">{label}</span>
                      {tab === id && <ChevronLeft size={12} className="opacity-50" />}
                    </button>
                  ))}
                </nav>

                {/* Store Links Section */}
                <div className="p-2 border-t border-border bg-muted/30">
                  <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">روابط المتجر</p>
                </div>
                <nav className="p-1 pb-2 space-y-0.5">
                  {storeLinks.map(({ href, label, icon: Icon }) => (
                    <a
                      key={href}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-medium transition-colors hover:bg-muted text-foreground/80"
                    >
                      <Icon size={16} />
                      <span className="flex-1">{label}</span>
                      <ExternalLink size={10} className="opacity-40" />
                    </a>
                  ))}
                </nav>
              </div>
            )}
          </div>
        </header>

        <div className="p-5 md:p-9">{children}</div>
      </div>
    </div>
  );
}
