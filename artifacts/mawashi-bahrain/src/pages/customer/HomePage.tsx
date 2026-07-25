import { useMemo, useState } from 'react';
import { useLocation, Link } from 'wouter';
import { 
  useGetStorefront, 
  useListProducts 
} from '@workspace/api-client-react';
import type { Product } from '@workspace/api-client-react';
import { ArrowLeft, Search, Sparkles } from 'lucide-react';
import { Shell, LoadingBlock, ErrorBlock, EmptyProducts } from '../shared';
import { ProductCard } from './ProductCard';
import { usePresence } from './usePresence';

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

const fallbackSheep = 'https://images.unsplash.com/photo-1484557985045-edf25e08da73?auto=format&fit=crop&w=900&q=82';
const demoHero = 'https://images.unsplash.com/photo-1572046750111-2c4f7a38f0b4?auto=format&fit=crop&w=1400&q=85';

export function HomePage() {
  const { data: storefront, isLoading, isError, refetch } = useGetStorefront();
  const [, setLocation] = useLocation();
  const [activeCategory, setActiveCategory] = useState('الكل');
  const [search, setSearch] = useState('');

  const storefrontProducts = Array.isArray(storefront?.products) ? storefront.products : [];
  const products = useMemo(() => {
    let filtered = storefrontProducts.filter(p => p.active);
    if (search.trim()) {
      filtered = filtered.filter(p => 
        p.name.includes(search) || p.description.includes(search)
      );
    }
    return filtered;
  }, [storefrontProducts, search]);

  usePresence('home', 'يتصفح المتجر');

  if (isLoading) return <Shell><LoadingBlock label="نحمّل لكم أحدث المنتجات" /></Shell>;
  if (isError) return <Shell><ErrorBlock onRetry={() => void refetch()} /></Shell>;

  const content = storefront?.content;
  const heroImage = content?.heroImageUrl || demoHero;
  const heroTitle = content?.heroTitle || 'مواشي طازجة من مزارع البحرين';
  const heroText = content?.heroText || 'أفضل أنواع المواشي، ذبح حلال، وتوصيل مبرد إلى بابكم.';

  return (
    <Shell>
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-b-[40px] bg-muted">
        <img 
          src={heroImage} 
          alt={heroTitle} 
          className="aspect-[2.4/1] size-full object-cover md:aspect-[3/1]" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        <div className="absolute inset-0 flex items-end justify-center pb-10 md:pb-16">
          <div className="mx-auto max-w-[800px] px-5 text-center text-white">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-[10px] font-semibold backdrop-blur">
              <Sparkles size={14} /> مواشي مختارة بعناية
            </div>
            <h1 className="text-3xl font-bold tracking-[-.04em] md:text-5xl">{heroTitle}</h1>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-white/80 md:text-base">{heroText}</p>
            <button 
              onClick={() => setLocation('/products')}
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 text-sm font-bold text-primary transition hover:bg-white/90"
            >
              تصفح المنتجات <ArrowLeft size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="px-5 py-10 lg:px-10 lg:py-16">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-[-.04em]">المنتجات المتاحة</h2>
            <p className="mt-1 text-xs text-muted-foreground">اختاروا من أفضل المواشي الطازجة</p>
          </div>
          <div className="relative">
            <Search size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input 
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ابحث عن منتج..."
              className="h-10 w-52 rounded-xl border border-input bg-card pr-9 text-xs"
            />
          </div>
        </div>

        {products.length === 0 ? (
          <EmptyProducts />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map(product => (
              <ProductCard 
                key={product.id} 
                product={product} 
                onSelect={(p) => setLocation(`/order?product=${p.id}`)} 
              />
            ))}
          </div>
        )}
      </section>
    </Shell>
  );
}
