import { useState } from 'react';
import { useLocation, Link } from 'wouter';
import { ArrowRight, CreditCard, Lock } from 'lucide-react';
import { Shell } from '../shared';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function PaymentPage() {
  const [, setLocation] = useLocation();
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [error, setError] = useState('');

  const handlePayment = () => {
    if (!cardNumber || cardNumber.length < 16) {
      setError('يرجى إدخال رقم البطاقة صحيح');
      return;
    }
    if (!expiry || expiry.length < 5) {
      setError('يرجى إدخال تاريخ الانتهاء');
      return;
    }
    if (!cvv || cvv.length < 3) {
      setError('يرجى إدخال رمز CVV');
      return;
    }
    setLocation('/payment-verification');
  };

  return (
    <Shell>
      <div className="page-enter mx-auto max-w-md px-5 py-10 lg:py-16">
        <Link href="/summary" className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <ArrowRight size={16} /> رجوع
        </Link>

        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
          <div className="mb-6 flex items-center gap-3">
            <div className="grid size-12 place-items-center rounded-2xl bg-primary text-primary-foreground">
              <CreditCard size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold">الدفع</h1>
              <p className="text-xs text-muted-foreground">أدخل بيانات البطاقة</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="card-number" className="text-sm font-medium">رقم البطاقة</Label>
              <Input 
                id="card-number"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').slice(0, 16))}
                placeholder="0000 0000 0000 0000"
                dir="ltr"
                className="mt-1.5 h-12 rounded-xl"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="expiry" className="text-sm font-medium">تاريخ الانتهاء</Label>
                <Input 
                  id="expiry"
                  value={expiry}
                  onChange={(e) => {
                    let val = e.target.value.replace(/\D/g, '').slice(0, 4);
                    if (val.length >= 2) val = val.slice(0, 2) + '/' + val.slice(2);
                    setExpiry(val);
                  }}
                  placeholder="MM/YY"
                  dir="ltr"
                  className="mt-1.5 h-12 rounded-xl"
                />
              </div>
              <div>
                <Label htmlFor="cvv" className="text-sm font-medium">رمز CVV</Label>
                <Input 
                  id="cvv"
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="123"
                  dir="ltr"
                  type="password"
                  className="mt-1.5 h-12 rounded-xl"
                />
              </div>
            </div>
          </div>

          {error && (
            <p className="mt-4 text-sm text-destructive">{error}</p>
          )}

          <Button 
            onClick={handlePayment}
            className="mt-6 h-14 w-full rounded-2xl text-base font-bold"
          >
            <Lock size={18} className="ml-2" />
            دفع
          </Button>

          <p className="mt-4 text-center text-xs text-muted-foreground">
            عملية الدفع مؤمنة ومشفرة
          </p>
        </div>
      </div>
    </Shell>
  );
}
