import { ArrowLeft } from 'lucide-react';
import type { Product } from '@workspace/api-client-react';

const fallbackSheep = 'https://images.unsplash.com/photo-1484557985045-edf25e08da73?auto=format&fit=crop&w=900&q=82';

function money(value: number) {
  return `${value.toFixed(3)} د.ب`;
}

export function ProductCard({ 
  product, 
  onSelect 
}: { 
  product: Product; 
  onSelect: (product: Product) => void 
}) {
  return (
    <article className="group flex min-w-0 flex-col" data-testid={`card-product-${product.id}`}>
      <button 
        type="button" 
        onClick={() => onSelect(product)} 
        data-testid={`button-select-product-${product.id}`} 
        className="relative aspect-[1.08] overflow-hidden rounded-[25px] bg-muted text-right"
      >
        <img 
          src={product.imageUrl || fallbackSheep} 
          alt={product.name} 
          className="size-full object-cover transition duration-700 group-hover:scale-105" 
        />
        <div className="absolute inset-x-3 top-3 flex items-start justify-between">
          <span className="rounded-full bg-card/90 px-3 py-1.5 text-[9px] font-bold text-secondary backdrop-blur">طازج اليوم</span>
          <span className="grid size-8 place-items-center rounded-full bg-card/85 text-primary opacity-0 shadow-sm backdrop-blur transition group-hover:opacity-100">
            <ArrowLeft size={14} />
          </span>
        </div>
      </button>
      <div className="flex items-start justify-between gap-3 px-1 pt-4">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-bold" data-testid={`text-product-name-${product.id}`}>{product.name}</h3>
          <p className="mt-1 line-clamp-2 text-[11px] leading-5 text-muted-foreground" data-testid={`text-product-description-${product.id}`}>
            {product.description}
          </p>
        </div>
        <div className="shrink-0 text-left">
          <div className="font-mono-bahrain text-sm font-medium text-primary" dir="ltr" data-testid={`text-product-price-${product.id}`}>
            {money(product.price)}
          </div>
          <div className="mt-1 text-[9px] text-muted-foreground">للكيلو</div>
        </div>
      </div>
    </article>
  );
}
