import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Check, X } from 'lucide-react';
import { Shell } from '../shared';

export function PaymentVerificationPage() {
  const [, setLocation] = useLocation();
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState('');
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const fullCode = code.join('');

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    
    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);
    setError('');

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    if (newCode.every(digit => digit !== '')) {
      if (fullCode === '000000') {
        setLocation('/payment-rejected');
      } else {
        setVerified(true);
        setTimeout(() => setLocation('/thank-you'), 1000);
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newCode = [...code];
    pastedData.split('').forEach((char, i) => {
      if (i < 6) newCode[i] = char;
    });
    setCode(newCode);
    
    const lastFilledIndex = Math.min(pastedData.length, 6) - 1;
    if (lastFilledIndex >= 0) {
      inputRefs.current[lastFilledIndex]?.focus();
    }
  };

  const handleResend = () => {
    setCode(['', '', '', '', '', '']);
    setError('');
    inputRefs.current[0]?.focus();
  };

  const handleVerify = () => {
    if (fullCode.length < 6) {
      setError('يرجى إدخال رمز التحقق كاملاً');
      return;
    }
    if (fullCode === '000000') {
      setLocation('/payment-rejected');
    } else {
      setVerified(true);
      setTimeout(() => setLocation('/thank-you'), 1000);
    }
  };

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  if (verified) {
    return (
      <Shell>
        <div className="page-enter mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center px-5 py-10 text-center">
          <div className="mb-6 grid size-16 place-items-center rounded-full bg-green-500 text-white">
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
      <div className="page-enter mx-auto flex min-h-[calc(100vh-104px)] items-center justify-center px-5 py-10 lg:py-16">
        {/* OTP Form Card */}
        <div className="relative flex w-[300px] flex-col items-center justify-center gap-6 rounded-[20px] bg-white p-8 shadow-[0px_0px_20px_rgba(0,0,0,0.082)] sm:w-[320px]">
          {/* Exit Button */}
          <button
            onClick={() => setLocation('/payment')}
            className="absolute right-3 top-3 grid size-8 place-items-center rounded-full bg-white shadow-[0px_0px_20px_rgba(0,0,0,0.171)] text-xl text-black"
          >
            <X size={20} />
          </button>

          {/* Main Heading */}
          <span className="text-xl font-bold text-[rgb(15,15,15)]">أدخل رمز التحقق</span>

          {/* Subheading */}
          <p className="text-center text-sm leading-5 text-black">
            تم إرسال رمز التحقق إلى رقم هاتفك
          </p>

          {/* OTP Inputs */}
          <div className="flex w-full flex-row items-center justify-center gap-3">
            {code.map((digit, index) => (
              <input
                key={index}
                ref={(el) => { inputRefs.current[index] = el; }}
                type="tel"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                className="h-[44px] w-[40px] rounded-[10px] bg-[rgb(228,228,228)] text-center text-lg font-semibold text-[rgb(44,44,44)] outline-none caret-[rgb(127,129,255)] transition-all duration-300 focus:bg-[rgba(127,129,255,0.199)] focus:shadow-none"
              />
            ))}
          </div>

          {/* Error Message */}
          {error && (
            <p className="text-center text-sm text-red-500">{error}</p>
          )}

          {/* Verify Button */}
          <button
            onClick={handleVerify}
            className="h-[48px] w-full rounded-[12px] border-none bg-[rgb(127,129,255)] text-base font-semibold text-white cursor-pointer transition-all duration-200 hover:bg-[rgb(144,145,255)]"
          >
            تحقق
          </button>

          {/* Resend Note */}
          <p className="flex flex-col items-center justify-center gap-1 text-sm text-black">
            <span>لم تستلم الرمز؟</span>
            <button
              onClick={handleResend}
              className="bg-transparent border-none text-[rgb(127,129,255)] cursor-pointer text-base font-bold"
            >
              إعادة إرسال
            </button>
          </p>
        </div>
      </div>
    </Shell>
  );
}
