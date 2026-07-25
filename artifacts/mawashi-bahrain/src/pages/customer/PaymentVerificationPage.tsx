import { useState } from 'react';
import { useLocation } from 'wouter';
import { ArrowRight, Check, LockKeyhole } from 'lucide-react';
import { Shell } from '../shared';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export function PaymentVerificationPage() {
  const [, setLocation] = useLocation();
  const [code, setCode] = useState('');
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState('');

  const verify = () => {
    if (code.trim().length < 4) {
      setError('يرجى إدخال رمز التحقق');
      return;
    }
    // For demo: any code except "0000" succeeds
    if (code === '0000') {
      setLocation('/payment-rejected');
    } else {
      setVerified(true);
      setTimeout(() => setLocation('/thank-you'), 1000);
    }
  };

  if (verified) {
    return (
      <Shell>
        <div className="page-enter mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center px-5 py-10 text-center">
          <div className="mb-6 grid size-16 place-items-center rounded-full bg-secondary text-secondary-foreground">
            <Check size={32} />
          </div>
          <h1 className="text-xl font-bold">تم التحقق بنجاح</h1>
          <p className="mt-2 text-muted-foreground">جارٍ توجيهك...</p>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="page-enter mx-auto max-w-md px-5 py-10 lg:py-16">
        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
          <div className="mb-6 flex items-center gap-3">
            <div className="grid size-12 place-items-center rounded-2xl bg-primary text-primary-foreground">
              <LockKeyhole size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold">التحقق من الدفع</h1>
              <p className="text-xs text-muted-foreground">أدخل رمز التحقق المرسل لهاتفك</p>
            </div>
          </div>

          <div>
            <Label htmlFor="otp-code" className="text-sm font-medium">رمز التحقق</Label>
            <Input 
              id="otp-code"
              value={code} 
              onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))} 
              inputMode="numeric" 
              placeholder="000000" 
              dir="ltr" 
              className="mt-1.5 h-14 rounded-xl text-center text-2xl tracking-[.5em]" 
            />
          </div>

          {error && (
            <p className="mt-4 text-sm text-destructive">{error}</p>
          )}

          <Button 
            onClick={verify} 
            className="mt-6 h-14 w-full rounded-2xl text-base font-bold"
          >
            تحقق <ArrowRight size={20} className="mr-2" />
          </Button>

          <p className="mt-4 text-center text-xs text-muted-foreground">
            أدخل "000000" لفشل العملية تجريبياً
          </p>
        </div>
      </div>
    </Shell>
  );
}

import { Label } from '@/components/ui/label';
