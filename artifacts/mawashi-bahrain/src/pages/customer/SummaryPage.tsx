import { useEffect, useState } from 'react';
import { useLocation, Link } from 'wouter';
import { useCreateOrder } from '@workspace/api-client-react';
import type { OrderInput } from '@workspace/api-client-react';
import { ArrowLeft, Check, ClipboardList, CreditCard, WalletCards } from 'lucide-react';
import { Shell } from '../shared';
import { Button } from '@/components/ui/button';

type OrderDraft = { 
  productId: number; 
  productName: string; 
  quantity: number; 
  customerName: string; 
  phone: string; 
  address: string; 
  pickupDate: string; 
  paymentMethod: 'cash_on_delivery' | 'pay_now' 
};

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

export function SummaryPage() {
  const [, setLocation] = useLocation();
  const createOrder = useCreateOrder();
  const [draft, setDraft] = useState<OrderDraft | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'cash_on_delivery' | 'pay_now'>('cash_on_delivery');

  useEffect(() => {
    const raw = sessionStorage.getItem('mawashi-order-draft');
    if (raw) setDraft(JSON.parse(raw));
  }, []);

  if (!draft) {
    return (
      <Shell>
        <div className="mx-auto max-w-xl p-10 text-center">
          <ClipboardList className="mx-auto text-muted-foreground" size={36} />
          <h1 className="mt-5 text-xl font-bold">ابدأوا بطلب جديد</h1>
          <Link href="/" data-testid="link-summary-empty-store" className="mt-5 inline-flex rounded-xl bg-primary px-5 py-3 text-xs font-bold text-primary-foreground">
            العودة للمتجر
          </Link>
        </div>
      </Shell>
    );
  }

  const submit = () => {
    const payload: OrderInput = { 
      productId: draft.productId, 
      quantity: draft.quantity, 
      customerName: draft.customerName, 
      phone: draft.phone, 
      address: draft.address, 
      pickupDate: draft.pickupDate, 
      paymentMethod, 
      paymentStatus: paymentMethod === 'pay_now' ? 'pending' : 'not_required' 
    };
    createOrder.mutate(
      { data: payload }, 
      { 
        onSuccess: order => { 
          sessionStorage.setItem('mawashi-last-order', JSON.stringify({ ...draft, ...order, paymentMethod })); 
          setLocation(paymentMethod === 'pay_now' ? '/payment-verification' : '/thank-you'); 
        } 
      }
    );
  };

  return (
    <Shell>
      <div className="page-enter mx-auto max-w-3xl px-5 py-10 lg:py-16">
        <Link href="/order" data-testid="link-back-order" className="mb-9 inline-flex items-center gap-2 text-xs font-bold text-muted-foreground">
          <ArrowRight size={15} /> تعديل الطلب
        </Link>

        <div className="grid gap-7 lg:grid-cols-[1fr_.78fr]">
          {/* Order Summary */}
          <section>
            <div className="mb-3 text-[10px] font-bold text-primary">الخطوة الأخيرة</div>
            <h1 className="text-3xl font-bold tracking-[-.06em]">تأكيد الطلب</h1>
            
            <div className="mt-8 divide-y divide-border overflow-hidden rounded-[24px] border border-border bg-card">
              <div className="flex items-center justify-between p-5">
                <div>
                  <div className="text-sm font-bold" data-testid="text-summary-product">{draft.productName}</div>
                  <div className="mt-1 text-xs text-muted-foreground">الكمية: {draft.quantity}</div>
                </div>
                <Package className="text-primary" size={20} />
              </div>
              <div className="space-y-3 p-5 text-xs">
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">الاسم</span>
                  <b data-testid="text-summary-customer">{draft.customerName}</b>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">التوصيل</span>
                  <b data-testid="text-summary-address">{draft.address}</b>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">الموعد</span>
                  <b dir="ltr" data-testid="text-summary-date">{draft.pickupDate}</b>
                </div>
              </div>
            </div>
          </section>

          {/* Payment Method */}
          <aside>
            <div className="rounded-[24px] bg-secondary p-6 text-secondary-foreground">
              <h2 className="text-sm font-bold">طريقة الدفع</h2>
              
              <div className="mt-5 space-y-3">
                <button 
                  type="button" 
                  onClick={() => setPaymentMethod('cash_on_delivery')} 
                  data-testid="button-payment-cash" 
                  className={cn(
                    'flex w-full items-center gap-3 rounded-2xl border p-4 text-right transition',
                    paymentMethod === 'cash_on_delivery' ? 'border-accent bg-accent/10' : 'border-secondary-foreground/15'
                  )}
                >
                  <WalletCards size={19} className="text-accent" />
                  <span className="flex-1 text-xs font-bold">الدفع عند الاستلام</span>
                  {paymentMethod === 'cash_on_delivery' && <Check size={16} className="text-accent" />}
                </button>

                <button 
                  type="button" 
                  onClick={() => setPaymentMethod('pay_now')} 
                  data-testid="button-payment-online" 
                  className={cn(
                    'flex w-full items-center gap-3 rounded-2xl border p-4 text-right transition',
                    paymentMethod === 'pay_now' ? 'border-accent bg-accent/10' : 'border-secondary-foreground/15'
                  )}
                >
                  <CreditCard size={19} className="text-accent" />
                  <span className="flex-1 text-xs font-bold">الدفع الإلكتروني</span>
                  {paymentMethod === 'pay_now' && <Check size={16} className="text-accent" />}
                </button>
              </div>

              <div className="my-6 border-t border-secondary-foreground/15" />
              <p className="text-[10px] leading-6 text-secondary-foreground/60">
                سيتم التواصل معكم لتأكيد الوزن النهائي وموعد الوصول قبل التجهيز.
              </p>

              <Button 
                onClick={submit} 
                disabled={createOrder.isPending} 
                data-testid="button-confirm-order" 
                className="mt-5 h-12 w-full rounded-xl bg-accent text-secondary hover:bg-accent/90"
              >
                {createOrder.isPending ? (
                  <Loader2 className="animate-spin" size={17} />
                ) : (
                  <>تأكيد الطلب <ArrowLeft size={16} /></>
                )}
              </Button>

              {createOrder.isError && (
                <p className="mt-3 text-center text-xs text-red-200" data-testid="status-order-submit-error">
                  تعذّر إرسال الطلب، حاولوا مجدداً.
                </p>
              )}
            </div>
          </aside>
        </div>
      </div>
    </Shell>
  );
}

import { Package, Loader2 } from 'lucide-react';
