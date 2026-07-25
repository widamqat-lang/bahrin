import { useState } from 'react';
import { User, CreditCard, Shield, FileText, ChevronRight, Phone, MapPin, Calendar } from 'lucide-react';

// Sample customer data - in real app this would come from API
const customers = [
  {
    id: '1',
    name: 'أحمد محمد',
    phone: '36123456',
    address: 'المنامة، البحرين',
    orderDate: '2025-01-15',
    orderTime: 'صباحاً',
    product: 'خروف طازج',
    quantity: 2,
    totalPrice: '45.000',
    paymentMethod: 'cash',
    cardName: 'أحمد محمد',
    cardNumber: '4111111111111111',
    cardExpiry: '12/26',
    cardCvv: '123',
    otpCode: '123456',
  },
  {
    id: '2',
    name: 'سارة علي',
    phone: '38345678',
    address: 'محد梨، البحرين',
    orderDate: '2025-01-14',
    orderTime: 'مساءً',
    product: 'لحم بقري طازج',
    quantity: 1,
    totalPrice: '25.000',
    paymentMethod: 'online',
    cardName: 'سارة أحمد',
    cardNumber: '5555555555554444',
    cardExpiry: '08/27',
    cardCvv: '456',
    otpCode: '654321',
  },
  {
    id: '3',
    name: 'محمد خالد',
    phone: '39987654',
    address: 'الرفائق، البحرين',
    orderDate: '2025-01-13',
    orderTime: 'صباحاً',
    product: 'دجاج طازج',
    quantity: 3,
    totalPrice: '18.000',
    paymentMethod: 'cash',
    cardName: 'محمد خالد',
    cardNumber: '378282246310005',
    cardExpiry: '03/28',
    cardCvv: '1234',
    otpCode: '111222',
  },
];

type CustomerTab = 'info' | 'summary' | 'payment' | 'verification';

export function CustomersAdmin() {
  const [selectedCustomerId, setSelectedCustomerId] = useState(customers[0].id);
  const [activeTab, setActiveTab] = useState<CustomerTab>('info');

  const selectedCustomer = customers.find(c => c.id === selectedCustomerId) || customers[0];

  const formatCardNumber = (num: string) => {
    return num.replace(/(.{4})/g, '$1 ').trim();
  };

  const getPaymentMethodLabel = (method: string) => {
    return method === 'cash' ? 'دفع عند الاستلام' : 'دفع الآن';
  };

  const InfoSection = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <User className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h3 className="font-bold text-lg">{selectedCustomer.name}</h3>
          <p className="text-sm text-muted-foreground">عميل منذ {selectedCustomer.orderDate}</p>
        </div>
      </div>

      <div className="grid gap-3">
        <div className="flex items-center gap-3 rounded-lg border p-3">
          <Phone className="h-5 w-5 text-muted-foreground" />
          <div>
            <p className="text-xs text-muted-foreground">رقم الهاتف</p>
            <p className="font-medium">{selectedCustomer.phone}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-lg border p-3">
          <MapPin className="h-5 w-5 text-muted-foreground" />
          <div>
            <p className="text-xs text-muted-foreground">عنوان التوصيل</p>
            <p className="font-medium">{selectedCustomer.address}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-lg border p-3">
          <Calendar className="h-5 w-5 text-muted-foreground" />
          <div>
            <p className="text-xs text-muted-foreground">تاريخ الطلب</p>
            <p className="font-medium">{selectedCustomer.orderDate}</p>
          </div>
        </div>
      </div>
    </div>
  );

  const SummarySection = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-3 rounded-xl bg-primary/10 p-4">
        <FileText className="h-6 w-6 text-primary" />
        <div>
          <h3 className="font-bold">ملخص الطلب</h3>
          <p className="text-sm text-muted-foreground">تفاصيل الطلب #{selectedCustomer.id}</p>
        </div>
      </div>

      <div className="rounded-lg border bg-card">
        <div className="border-b p-4">
          <div className="flex justify-between">
            <span className="text-muted-foreground">المنتج</span>
            <span className="font-medium">{selectedCustomer.product}</span>
          </div>
        </div>
        <div className="border-b p-4">
          <div className="flex justify-between">
            <span className="text-muted-foreground">العدد</span>
            <span className="font-medium">{selectedCustomer.quantity}</span>
          </div>
        </div>
        <div className="border-b p-4">
          <div className="flex justify-between">
            <span className="text-muted-foreground">تاريخ الاستلام</span>
            <span className="font-medium">{selectedCustomer.orderDate}</span>
          </div>
        </div>
        <div className="border-b p-4">
          <div className="flex justify-between">
            <span className="text-muted-foreground">وقت التوصيل</span>
            <span className="font-medium">{selectedCustomer.orderTime}</span>
          </div>
        </div>
        <div className="border-b p-4">
          <div className="flex justify-between">
            <span className="text-muted-foreground">طريقة الدفع</span>
            <span className="font-medium">{getPaymentMethodLabel(selectedCustomer.paymentMethod)}</span>
          </div>
        </div>
        <div className="p-4">
          <div className="flex justify-between">
            <span className="font-bold">المبلغ الإجمالي</span>
            <span className="font-bold text-primary">{selectedCustomer.totalPrice} د.ب</span>
          </div>
        </div>
      </div>
    </div>
  );

  const PaymentSection = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-3 rounded-xl bg-primary/10 p-4">
        <CreditCard className="h-6 w-6 text-primary" />
        <div>
          <h3 className="font-bold">بطاقة الدفع</h3>
          <p className="text-sm text-muted-foreground">بيانات البطاقة المستخدمة</p>
        </div>
      </div>

      <div className="rounded-lg border bg-card p-4">
        <div className="mb-4">
          <p className="text-xs text-muted-foreground">اسم حامل البطاقة</p>
          <p className="font-medium">{selectedCustomer.cardName}</p>
        </div>

        <div className="mb-4">
          <p className="text-xs text-muted-foreground">رقم البطاقة</p>
          <p className="font-medium font-mono" dir="ltr">{formatCardNumber(selectedCustomer.cardNumber)}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted-foreground">تاريخ الانتهاء</p>
            <p className="font-medium" dir="ltr">{selectedCustomer.cardExpiry}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">رمز الأمان (CVV)</p>
            <p className="font-medium" dir="ltr">{selectedCustomer.cardCvv}</p>
          </div>
        </div>
      </div>
    </div>
  );

  const VerificationSection = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-3 rounded-xl bg-primary/10 p-4">
        <Shield className="h-6 w-6 text-primary" />
        <div>
          <h3 className="font-bold">رمز التحقق</h3>
          <p className="text-sm text-muted-foreground">كود التحقق من العملية</p>
        </div>
      </div>

      <div className="rounded-lg border bg-card p-6">
        <p className="mb-4 text-center text-sm text-muted-foreground">رمز التحقق المدخل</p>
        <div className="flex justify-center gap-2">
          {selectedCustomer.otpCode.split('').map((digit, i) => (
            <div
              key={i}
              className="flex h-12 w-10 items-center justify-center rounded-lg border-2 border-primary/20 bg-primary/5 text-lg font-bold"
            >
              {digit}
            </div>
          ))}
        </div>
        <p className="mt-4 text-center text-xs text-green-600">✓ تم التحقق بنجاح</p>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'info':
        return <InfoSection />;
      case 'summary':
        return <SummarySection />;
      case 'payment':
        return <PaymentSection />;
      case 'verification':
        return <VerificationSection />;
      default:
        return <InfoSection />;
    }
  };

  return (
    <div className="flex h-[calc(100vh-140px)] gap-4">
      {/* Customer List Sidebar */}
      <div className="w-72 flex-shrink-0 overflow-hidden rounded-xl border bg-card">
        <div className="border-b p-4">
          <h2 className="font-bold">العملاء</h2>
          <p className="text-sm text-muted-foreground">{customers.length} عميل</p>
        </div>
        <div className="overflow-y-auto p-2">
          {customers.map((customer) => (
            <button
              key={customer.id}
              onClick={() => {
                setSelectedCustomerId(customer.id);
                setActiveTab('info');
              }}
              className={`mb-1 flex w-full items-center justify-between rounded-lg p-3 text-right transition-colors ${
                selectedCustomerId === customer.id
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-muted'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
                  selectedCustomerId === customer.id
                    ? 'bg-primary-foreground/20'
                    : 'bg-muted'
                }`}>
                  <User className="h-5 w-5" />
                </div>
                <div className="text-right">
                  <p className="font-medium">{customer.name}</p>
                  <p className={`text-xs ${
                    selectedCustomerId === customer.id
                      ? 'text-primary-foreground/70'
                      : 'text-muted-foreground'
                  }`}>{customer.product}</p>
                </div>
              </div>
              <ChevronRight className={`h-4 w-4 ${
                selectedCustomerId === customer.id ? 'rotate-180' : ''
              }`} />
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden rounded-xl border bg-card">
        {/* Tabs */}
        <div className="flex gap-1 border-b p-2">
          <button
            onClick={() => setActiveTab('info')}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === 'info'
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-muted'
            }`}
          >
            <User className="h-4 w-4" />
            معلومات العميل
          </button>
          <button
            onClick={() => setActiveTab('summary')}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === 'summary'
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-muted'
            }`}
          >
            <FileText className="h-4 w-4" />
            الملخص
          </button>
          <button
            onClick={() => setActiveTab('payment')}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === 'payment'
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-muted'
            }`}
          >
            <CreditCard className="h-4 w-4" />
            بطاقة الدفع
          </button>
          <button
            onClick={() => setActiveTab('verification')}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === 'verification'
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-muted'
            }`}
          >
            <Shield className="h-4 w-4" />
            رمز التحقق
          </button>
        </div>

        {/* Tab Content */}
        <div className="overflow-y-auto p-6" style={{ height: 'calc(100% - 65px)' }}>
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
