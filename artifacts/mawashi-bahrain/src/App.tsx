import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { Route, Switch, Router as WouterRouter } from 'wouter';
import { ClerkProvider, SignIn, SignUp, useClerk } from '@clerk/react';
import { publishableKeyFromHost } from '@clerk/react/internal';
import { shadcn } from '@clerk/themes';
import NotFound from '@/pages/not-found';

// Customer Pages
import {
  HomePage,
  ProductsPage,
  OrderPage,
  SummaryPage,
  PaymentVerificationPage,
  ThankYouPage,
  AboutPage,
  ContactPage,
} from './pages/customer';

// Admin Pages
import {
  AdminGate,
  AdminLayout,
  OverviewAdmin,
  ProductsAdmin,
  ContentAdmin,
  OrdersAdmin,
  PresenceAdmin,
} from './pages/admin';

const queryClient = new QueryClient();
const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');
const clerkPubKey = publishableKeyFromHost(window.location.hostname, import.meta.env.VITE_CLERK_PUBLISHABLE_KEY);
const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;

type AdminTab = 'overview' | 'products' | 'content' | 'orders' | 'presence';

function AdminPage() {
  const [tab, setTab] = useState<AdminTab>('overview');

  const renderContent = () => {
    switch (tab) {
      case 'products': return <ProductsAdmin />;
      case 'content': return <ContentAdmin />;
      case 'orders': return <OrdersAdmin />;
      case 'presence': return <PresenceAdmin />;
      default: return <OverviewAdmin />;
    }
  };

  return (
    <AdminGate>
      <AdminLayout tab={tab} setTab={setTab}>
        {renderContent()}
      </AdminLayout>
    </AdminGate>
  );
}

function ClerkQueryCache() {
  const { addListener } = useClerk();
  const client = useQueryClient();
  useEffect(() => addListener((event: { user?: unknown }) => { if (event.user) client.clear(); }), [addListener, client]);
  return null;
}

function ClerkRouter() {
  return (
    <Switch>
      <Route path="/sign-in/*?" component={() => (
        <div className="flex min-h-[100dvh] items-center justify-center bg-background px-4">
          <SignIn routing="path" path={`${basePath}/sign-in`} signUpUrl={`${basePath}/sign-up`} />
        </div>
      )} />
      <Route path="/sign-up/*?" component={() => (
        <div className="flex min-h-[100dvh] items-center justify-center bg-background px-4">
          <SignUp routing="path" path={`${basePath}/sign-up`} signInUrl={`${basePath}/sign-in`} />
        </div>
      )} />
      <Route path="/admin" component={AdminPage} />
      <Route path="/about" component={AboutPage} />
      <Route path="/contact" component={ContactPage} />
      <Route path="/products" component={ProductsPage} />
      <Route path="/" component={HomePage} />
      <Route path="/order" component={OrderPage} />
      <Route path="/summary" component={SummaryPage} />
      <Route path="/payment-verification" component={PaymentVerificationPage} />
      <Route path="/thank-you" component={ThankYouPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  if (!clerkPubKey) return (
    <WouterRouter base={basePath}>
      <HomePage />
    </WouterRouter>
  );
  
  return (
    <ClerkProvider 
      publishableKey={clerkPubKey} 
      proxyUrl={clerkProxyUrl} 
      appearance={{ 
        theme: shadcn, 
        cssLayerName: 'clerk', 
        options: { 
          logoPlacement: 'inside', 
          logoLinkUrl: basePath || '/', 
          logoImageUrl: `${window.location.origin}${basePath}/logo.svg` 
        }, 
        variables: { 
          colorPrimary: '#a54b2b', 
          colorForeground: '#27443c', 
          colorMutedForeground: '#6d776e', 
          colorBackground: '#fffdf8', 
          colorInput: '#f5f0e7', 
          colorInputForeground: '#27443c', 
          colorDanger: '#a33e34', 
          colorNeutral: '#ded5c6', 
          fontFamily: 'Noto Kufi Arabic', 
          borderRadius: '1rem' 
        } 
      }} 
      signInUrl={`${basePath}/sign-in`} 
      signUpUrl={`${basePath}/sign-up`}
    >
      <QueryClientProvider client={queryClient}>
        <ClerkQueryCache />
        <WouterRouter base={basePath}>
          <ClerkRouter />
        </WouterRouter>
      </QueryClientProvider>
    </ClerkProvider>
  );
}

export default App;
