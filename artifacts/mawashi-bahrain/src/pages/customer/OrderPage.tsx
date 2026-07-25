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
      <div className="page-enter mx-auto max-w-2xl px-5 py-10 lg:py-16">
        <Link href="/" data-testid="link-back-store" className="mb-9 inline-flex items-center gap-2 text-xs font-bold text-muted-foreground transition hover:text-primary">
          <ArrowRight size={15} /> رجوع للمتجر
        </Link>

        {/* Order Form */}
        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight" data-testid="text-order-title">
                {product.name}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {money(product.price)} للكيلو الواحد
              </p>
            </div>
            <div className="text-left">
              <div className="text-xs text-muted-foreground">العدد</div>
              <div className="mt-1 flex items-center gap-2">
                <button 
                  type="button" 
                  onClick={decreaseQty} 
                  data-testid="button-decrease-quantity" 
                  className="grid size-8 place-items-center rounded-xl bg-muted text-muted-foreground transition hover:bg-primary/10 hover:text-primary"
                >
                  <Minus size={14} />
                </button>
                <span className="w-8 text-center font-bold" dir="ltr" data-testid="text-order-quantity">
                  {quantity}
                </span>
                <button 
                  type="button" 
                  onClick={increaseQty} 
                  data-testid="button-increase-quantity" 
                  className="grid size-8 place-items-center rounded-xl bg-accent text-secondary transition hover:bg-accent/80"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>
          </div>

          <div className="mb-6 rounded-xl bg-secondary/20 p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">السعر التقريبي:</span>
              <span className="font-mono-bahrain text-xl font-bold text-primary" dir="ltr" data-testid="text-order-price">
                {money(product.price * quantity)}
              </span>
            </div>
            <p className="mt-1 text-[10px] text-muted-foreground">* السعر النهائي يعتمد على الوزن الفعلي</p>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="customer-name" className="text-sm font-medium">الاسم الكريم</Label>
              <Input 
                id="customer-name" 
                value={customerName} 
                onChange={e => setCustomerName(e.target.value)} 
                placeholder="مثال: محمد أحمد" 
                data-testid="input-customer-name" 
                className="mt-1.5 h-12 rounded-xl" 
              />
            </div>
            <div>
              <Label htmlFor="customer-phone" className="text-sm font-medium">رقم التواصل</Label>
              <Input 
                id="customer-phone" 
                value={phone} 
                onChange={e => setPhone(e.target.value)} 
                placeholder="36 000 000" 
                dir="ltr" 
                data-testid="input-customer-phone" 
                className="mt-1.5 h-12 rounded-xl" 
              />
            </div>
            <div>
              <Label htmlFor="customer-address" className="text-sm font-medium">عنوان التوصيل</Label>
              <Textarea 
                id="customer-address" 
                value={address} 
                onChange={e => setAddress(e.target.value)} 
                placeholder="المنطقة، الطريق، رقم المبنى..." 
                data-testid="input-customer-address" 
                className="mt-1.5 min-h-[80px] resize-none rounded-xl" 
              />
            </div>
            <div>
              <Label htmlFor="pickup-date" className="text-sm font-medium">موعد التوصيل</Label>
              <div className="relative mt-1.5">
                <CalendarDays size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input 
                  id="pickup-date" 
                  type="date" 
                  min={today()} 
                  value={pickupDate} 
                  onChange={e => setPickupDate(e.target.value)} 
                  data-testid="input-pickup-date" 
                  className="h-12 rounded-xl pr-10" 
                />
              </div>
            </div>
          </div>

          {error && (
            <p className="mt-4 text-sm font-medium text-destructive" data-testid="status-order-error">
              {error}
            </p>
          )}

          <Button 
            onClick={goNext} 
            data-testid="button-continue-order" 
            className="mt-6 h-14 w-full rounded-2xl text-base font-bold"
          >
            متابعة الطلب <ArrowRight size={20} />
          </Button>
        </div>
      </div>
    </Shell>
  );
}
