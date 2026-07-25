import { useState } from 'react';
import { useLocation, Link } from 'wouter';
import { useListProducts } from '@workspace/api-client-react';
import { ArrowRight, CalendarDays, Minus, Plus } from 'lucide-react';
import { Shell, LoadingBlock, ErrorBlock, EmptyProducts } from '../shared';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { usePresence } from './usePresence';

const fallbackSheep = 'https://images.unsplash.com/photo-1484557985045-edf25e08da73?auto=format&fit=crop&w=900&q=82';

function money(value: number) {
  return `${value.toFixed(3)} د.ب`;
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

export function OrderPage() {
  const [, setLocation] = useLocation();
  const params = new URLSearchParams(window.location.search);
  const productId = Number(params.get('product') || '0');
  const initialQuantity = Number(params.get('quantity') || '1');
  
  const { data: products, isLoading, isError, refetch } = useListProducts();
  const productList = Array.isArray(products) ? products : [];
  const product = productList.find((p) => p.id === productId) || productList.find((p) => p.active);

  const [quantity, setQuantity] = useState(initialQuantity);
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [pickupDate, setPickupDate] = useState(today());
  const [error, setError] = useState('');

  usePresence('order', product?.name ? `يطلب ${product.name}` : 'يجهّز طلباً');

  if (isLoading) return <Shell><LoadingBlock label="نجهّز لكم الاختيارات" /></Shell>;
  if (isError) return <Shell><ErrorBlock onRetry={() => void refetch()} /></Shell>;
  if (!product) return <Shell><div className="p-8"><EmptyProducts /></div></Shell>;

  const goNext = () => {
    if (!customerName.trim() || phone.trim().length < 5 || address.trim().length < 3) {
      setError('يرجى تعبئة الاسم ورقم التواصل والعنوان.');
      return;
    }
    const payload = { 
      productId: product.id, 
      productName: product.name, 
      quantity, 
      customerName, 
      phone, 
      address, 
      pickupDate, 
      paymentMethod: 'cash_on_delivery' as const 
    };
    sessionStorage.setItem('mawashi-order-draft', JSON.stringify(payload));
    sessionStorage.setItem('mawashi-customer-name', customerName);
    setLocation('/summary');
  };

  const decreaseQty = () => setQuantity(q => Math.max(1, q - 1));
  const increaseQty = () => setQuantity(q => Math.min(product.maxQuantity, q + 1));

  return (
    <Shell>
      <div className="page-enter mx-auto max-w-5xl px-5 py-10 lg:px-12 lg:py-16">
        <Link href="/" data-testid="link-back-store" className="mb-9 inline-flex items-center gap-2 text-xs font-bold text-muted-foreground transition hover:text-primary">
          <ArrowRight size={15} /> رجوع للمتجر
        </Link>

        <div className="grid gap-10 lg:grid-cols-[.9fr_1.1fr]">
          {/* Product Image */}
          <div className="overflow-hidden rounded-[30px] bg-muted lg:order-last">
            <img 
              src={product.imageUrl || fallbackSheep} 
              alt={product.name} 
              className="aspect-square size-full object-cover lg:aspect-auto lg:h-full" 
              data-testid={`img-order-product-${product.id}`} 
            />
          </div>

          {/* Order Form */}
          <div className="flex flex-col justify-center">
            <div className="mb-3 flex items-center gap-2 text-[10px] font-bold text-primary">
              <span className="size-1.5 rounded-full bg-primary" /> تفاصيل الطلب
            </div>
            <h1 className="text-3xl font-bold tracking-[-.06em] sm:text-4xl" data-testid="text-order-title">
              {product.name}
            </h1>
            <p className="mt-4 text-sm leading-8 text-muted-foreground" data-testid="text-order-description">
              {product.description}
            </p>

            <div className="mt-8 flex items-end justify-between border-b border-border pb-6">
              <div>
                <div className="text-[10px] text-muted-foreground">السعر التقريبي</div>
                <div className="mt-1 font-mono-bahrain text-2xl text-primary" dir="ltr" data-testid="text-order-price">
                  {money(product.price * quantity)}
                </div>
              </div>
              <div className="text-left text-[10px] text-muted-foreground">
                للكيلو الواحد<br />
                <span className="font-bold text-foreground">{money(product.price)}</span>
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="mt-6">
              <Label className="text-xs font-bold">اختر العدد:</Label>
              <div className="mt-3 flex items-center gap-4">
                <div className="flex items-center gap-3 rounded-2xl border border-input bg-background px-4 py-2">
                  <button 
                    type="button" 
                    onClick={decreaseQty} 
                    data-testid="button-decrease-quantity" 
                    className="grid size-10 place-items-center rounded-xl bg-muted text-muted-foreground transition hover:bg-primary/10 hover:text-primary"
                  >
                    <Minus size={18} />
                  </button>
                  <span className="w-12 text-center text-xl font-bold" dir="ltr" data-testid="text-order-quantity">
                    {quantity}
                  </span>
                  <button 
                    type="button" 
                    onClick={increaseQty} 
                    data-testid="button-increase-quantity" 
                    className="grid size-10 place-items-center rounded-xl bg-accent text-secondary transition hover:bg-accent/80"
                  >
                    <Plus size={18} />
                  </button>
                </div>
                <span className="text-xs text-muted-foreground">
                  من {product.maxQuantity} متاح
                </span>
              </div>
            </div>

            <div className="mt-7 grid gap-5 sm:grid-cols-2">
              <div>
                <Label htmlFor="customer-name" className="text-xs font-bold">الاسم الكريم</Label>
                <Input 
                  id="customer-name" 
                  value={customerName} 
                  onChange={e => setCustomerName(e.target.value)} 
                  placeholder="مثال: محمد أحمد" 
                  data-testid="input-customer-name" 
                  className="mt-2 h-12 rounded-xl bg-card" 
                />
              </div>
              <div>
                <Label htmlFor="customer-phone" className="text-xs font-bold">رقم التواصل</Label>
                <Input 
                  id="customer-phone" 
                  value={phone} 
                  onChange={e => setPhone(e.target.value)} 
                  placeholder="36 000 000" 
                  dir="ltr" 
                  data-testid="input-customer-phone" 
                  className="mt-2 h-12 rounded-xl bg-card text-right" 
                />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="customer-address" className="text-xs font-bold">عنوان التوصيل</Label>
                <Textarea 
                  id="customer-address" 
                  value={address} 
                  onChange={e => setAddress(e.target.value)} 
                  placeholder="المنطقة، الطريق، رقم المبنى..." 
                  data-testid="input-customer-address" 
                  className="mt-2 min-h-[86px] resize-none rounded-xl bg-card" 
                />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="pickup-date" className="text-xs font-bold">موعد التوصيل المفضل</Label>
                <div className="relative mt-2">
                  <CalendarDays size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-primary" />
                  <Input 
                    id="pickup-date" 
                    type="date" 
                    min={today()} 
                    value={pickupDate} 
                    onChange={e => setPickupDate(e.target.value)} 
                    data-testid="input-pickup-date" 
                    className="h-12 rounded-xl bg-card pr-10" 
                  />
                </div>
              </div>
            </div>

            {error && (
              <p className="mt-4 text-xs font-semibold text-destructive" data-testid="status-order-error">
                {error}
              </p>
            )}

            <Button 
              onClick={goNext} 
              data-testid="button-continue-order" 
              className="mt-8 h-14 rounded-2xl text-base font-bold"
            >
              متابعة الطلب <ArrowRight size={20} />
            </Button>
          </div>
        </div>
      </div>
    </Shell>
  );
}
