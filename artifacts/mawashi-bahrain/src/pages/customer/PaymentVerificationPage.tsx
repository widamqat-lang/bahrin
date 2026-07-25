import { useState } from 'react';
import { useLocation } from 'wouter';
import { ArrowLeft, Check, Loader2, LockKeyhole } from 'lucide-react';
import { Shell } from '../shared';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export function PaymentVerificationPage() {
  const [, setLocation] = useLocation();
  const [code, setCode] = useState('');
  const [sent, setSent] = useState(false);

  const verify = () => {
    if (code.trim().length >= 4) {
      setSent(true);
      setTimeout(() => setLocation('/thank-you'), 700);
    }
  };

  return (
    <Shell showSidebar={false}>
      <div className="page-enter mx-auto flex min-h-[calc(100dvh-76px)] max-w-2xl items-center px-5 py-12">
        <div className="w-full rounded-[32px] border border-border bg-card p-7 text-center shadow-card sm:p-12">
          <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-accent/25 text-primary">
            <LockKeyhole size={27} />
          </div>
          
          <div className="mt-7 text-[10px] font-bold text-primary">تحقق آمن للدفع</div>
          <h1 className="mt-3 text-2xl font-bold tracking-[-.05em] sm:text-3xl" data-testid="text-payment-title">
            أدخل رمز التحقق
          </h1>
          <p className="mx-auto mt-3 max-w-sm text-xs leading-7 text-muted-foreground">
            أرسلنا رمزاً مؤقتاً إلى رقم التواصل المسجل. هذه شاشة تجريبية جاهزة للربط مع بوابة الدفع.
          </p>

          <div className="mx-auto mt-8 max-w-xs">
            <Input 
              value={code} 
              onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))} 
              inputMode="numeric" 
              placeholder="٠ ٠ ٠ ٠ ٠ ٠" 
              dir="ltr" 
              data-testid="input-payment-code" 
              className="h-14 rounded-xl text-center text-xl tracking-[.5em]" 
            />
          </div>

          {sent ? (
            <div className="mt-5 flex items-center justify-center gap-2 text-xs font-bold text-secondary" data-testid="status-payment-verified">
              <Check size={16} /> تم التحقق، نجهّز تأكيدكم
            </div>
          ) : (
            <>
              <Button 
                onClick={verify} 
                data-testid="button-verify-payment" 
                className="mt-6 h-12 w-full max-w-xs rounded-xl"
              >
                تأكيد الرمز <ArrowLeft size={15} />
              </Button>
              <button 
                type="button" 
                onClick={() => setCode('123456')} 
                data-testid="button-fill-demo-code" 
                className="mt-5 text-[10px] font-semibold text-muted-foreground underline underline-offset-4"
              >
                استخدام رمز تجريبي
              </button>
            </>
          )}
        </div>
      </div>
    </Shell>
  );
}
