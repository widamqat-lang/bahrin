import type { QueryKey, UseMutationOptions, UseMutationResult, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import type { AdminSummary, HealthStatus, Order, OrderInput, Presence, PresenceInput, Product, ProductInput, ProductUpdate, SiteContent, SiteContentUpdate, Storefront } from './api.schemas';
import { customFetch } from '../custom-fetch';
import type { ErrorType, BodyType } from '../custom-fetch';
type AwaitedInput<T> = PromiseLike<T> | T;
type Awaited<O> = O extends AwaitedInput<infer T> ? T : never;
type SecondParameter<T extends (...args: never) => unknown> = Parameters<T>[1];
export declare const getHealthCheckUrl: () => string;
/**
 * Returns server health status
 * @summary Health check
 */
export declare const healthCheck: (options?: RequestInit) => Promise<HealthStatus>;
export declare const getHealthCheckQueryKey: () => readonly ["/api/healthz"];
export declare const getHealthCheckQueryOptions: <TData = Awaited<ReturnType<typeof healthCheck>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData> & {
    queryKey: QueryKey;
};
export type HealthCheckQueryResult = NonNullable<Awaited<ReturnType<typeof healthCheck>>>;
export type HealthCheckQueryError = ErrorType<unknown>;
/**
 * @summary Health check
 */
export declare function useHealthCheck<TData = Awaited<ReturnType<typeof healthCheck>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getGetStorefrontUrl: () => string;
/**
 * @summary Get storefront content and products
 */
export declare const getStorefront: (options?: RequestInit) => Promise<Storefront>;
export declare const getGetStorefrontQueryKey: () => readonly ["/api/storefront"];
export declare const getGetStorefrontQueryOptions: <TData = Awaited<ReturnType<typeof getStorefront>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getStorefront>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getStorefront>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetStorefrontQueryResult = NonNullable<Awaited<ReturnType<typeof getStorefront>>>;
export type GetStorefrontQueryError = ErrorType<unknown>;
/**
 * @summary Get storefront content and products
 */
export declare function useGetStorefront<TData = Awaited<ReturnType<typeof getStorefront>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getStorefront>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getListProductsUrl: () => string;
/**
 * @summary List available products
 */
export declare const listProducts: (options?: RequestInit) => Promise<Product[]>;
export declare const getListProductsQueryKey: () => readonly ["/api/products"];
export declare const getListProductsQueryOptions: <TData = Awaited<ReturnType<typeof listProducts>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listProducts>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listProducts>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListProductsQueryResult = NonNullable<Awaited<ReturnType<typeof listProducts>>>;
export type ListProductsQueryError = ErrorType<unknown>;
/**
 * @summary List available products
 */
export declare function useListProducts<TData = Awaited<ReturnType<typeof listProducts>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listProducts>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getCreateOrderUrl: () => string;
/**
 * @summary Create a customer order
 */
export declare const createOrder: (orderInput: OrderInput, options?: RequestInit) => Promise<Order>;
export declare const getCreateOrderMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createOrder>>, TError, {
        data: BodyType<OrderInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createOrder>>, TError, {
    data: BodyType<OrderInput>;
}, TContext>;
export type CreateOrderMutationResult = NonNullable<Awaited<ReturnType<typeof createOrder>>>;
export type CreateOrderMutationBody = BodyType<OrderInput>;
export type CreateOrderMutationError = ErrorType<unknown>;
/**
* @summary Create a customer order
*/
export declare const useCreateOrder: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createOrder>>, TError, {
        data: BodyType<OrderInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createOrder>>, TError, {
    data: BodyType<OrderInput>;
}, TContext>;
export declare const getListAdminOrdersUrl: () => string;
/**
 * @summary List recent orders for admin
 */
export declare const listAdminOrders: (options?: RequestInit) => Promise<Order[]>;
export declare const getListAdminOrdersQueryKey: () => readonly ["/api/admin/orders"];
export declare const getListAdminOrdersQueryOptions: <TData = Awaited<ReturnType<typeof listAdminOrders>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listAdminOrders>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listAdminOrders>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListAdminOrdersQueryResult = NonNullable<Awaited<ReturnType<typeof listAdminOrders>>>;
export type ListAdminOrdersQueryError = ErrorType<unknown>;
/**
 * @summary List recent orders for admin
 */
export declare function useListAdminOrders<TData = Awaited<ReturnType<typeof listAdminOrders>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listAdminOrders>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getGetAdminSummaryUrl: () => string;
/**
 * @summary Get dashboard summary
 */
export declare const getAdminSummary: (options?: RequestInit) => Promise<AdminSummary>;
export declare const getGetAdminSummaryQueryKey: () => readonly ["/api/admin/summary"];
export declare const getGetAdminSummaryQueryOptions: <TData = Awaited<ReturnType<typeof getAdminSummary>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getAdminSummary>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getAdminSummary>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetAdminSummaryQueryResult = NonNullable<Awaited<ReturnType<typeof getAdminSummary>>>;
export type GetAdminSummaryQueryError = ErrorType<unknown>;
/**
 * @summary Get dashboard summary
 */
export declare function useGetAdminSummary<TData = Awaited<ReturnType<typeof getAdminSummary>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getAdminSummary>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getCreateProductUrl: () => string;
/**
 * @summary Create a product
 */
export declare const createProduct: (productInput: ProductInput, options?: RequestInit) => Promise<Product>;
export declare const getCreateProductMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createProduct>>, TError, {
        data: BodyType<ProductInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createProduct>>, TError, {
    data: BodyType<ProductInput>;
}, TContext>;
export type CreateProductMutationResult = NonNullable<Awaited<ReturnType<typeof createProduct>>>;
export type CreateProductMutationBody = BodyType<ProductInput>;
export type CreateProductMutationError = ErrorType<unknown>;
/**
* @summary Create a product
*/
export declare const useCreateProduct: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createProduct>>, TError, {
        data: BodyType<ProductInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createProduct>>, TError, {
    data: BodyType<ProductInput>;
}, TContext>;
export declare const getUpdateProductUrl: (id: number) => string;
/**
 * @summary Update a product
 */
export declare const updateProduct: (id: number, productUpdate: ProductUpdate, options?: RequestInit) => Promise<Product>;
export declare const getUpdateProductMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateProduct>>, TError, {
        id: number;
        data: BodyType<ProductUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateProduct>>, TError, {
    id: number;
    data: BodyType<ProductUpdate>;
}, TContext>;
export type UpdateProductMutationResult = NonNullable<Awaited<ReturnType<typeof updateProduct>>>;
export type UpdateProductMutationBody = BodyType<ProductUpdate>;
export type UpdateProductMutationError = ErrorType<unknown>;
/**
* @summary Update a product
*/
export declare const useUpdateProduct: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateProduct>>, TError, {
        id: number;
        data: BodyType<ProductUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateProduct>>, TError, {
    id: number;
    data: BodyType<ProductUpdate>;
}, TContext>;
export declare const getUpdateSiteContentUrl: () => string;
/**
 * @summary Update storefront content
 */
export declare const updateSiteContent: (siteContentUpdate: SiteContentUpdate, options?: RequestInit) => Promise<SiteContent>;
export declare const getUpdateSiteContentMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateSiteContent>>, TError, {
        data: BodyType<SiteContentUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateSiteContent>>, TError, {
    data: BodyType<SiteContentUpdate>;
}, TContext>;
export type UpdateSiteContentMutationResult = NonNullable<Awaited<ReturnType<typeof updateSiteContent>>>;
export type UpdateSiteContentMutationBody = BodyType<SiteContentUpdate>;
export type UpdateSiteContentMutationError = ErrorType<unknown>;
/**
* @summary Update storefront content
*/
export declare const useUpdateSiteContent: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateSiteContent>>, TError, {
        data: BodyType<SiteContentUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateSiteContent>>, TError, {
    data: BodyType<SiteContentUpdate>;
}, TContext>;
export declare const getListPresenceUrl: () => string;
/**
 * @summary List live customer sessions
 */
export declare const listPresence: (options?: RequestInit) => Promise<Presence[]>;
export declare const getListPresenceQueryKey: () => readonly ["/api/admin/presence"];
export declare const getListPresenceQueryOptions: <TData = Awaited<ReturnType<typeof listPresence>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listPresence>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listPresence>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListPresenceQueryResult = NonNullable<Awaited<ReturnType<typeof listPresence>>>;
export type ListPresenceQueryError = ErrorType<unknown>;
/**
 * @summary List live customer sessions
 */
export declare function useListPresence<TData = Awaited<ReturnType<typeof listPresence>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listPresence>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getUpdatePresenceUrl: () => string;
/**
 * @summary Update customer live presence
 */
export declare const updatePresence: (presenceInput: PresenceInput, options?: RequestInit) => Promise<void>;
export declare const getUpdatePresenceMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updatePresence>>, TError, {
        data: BodyType<PresenceInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updatePresence>>, TError, {
    data: BodyType<PresenceInput>;
}, TContext>;
export type UpdatePresenceMutationResult = NonNullable<Awaited<ReturnType<typeof updatePresence>>>;
export type UpdatePresenceMutationBody = BodyType<PresenceInput>;
export type UpdatePresenceMutationError = ErrorType<unknown>;
/**
* @summary Update customer live presence
*/
export declare const useUpdatePresence: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updatePresence>>, TError, {
        data: BodyType<PresenceInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updatePresence>>, TError, {
    data: BodyType<PresenceInput>;
}, TContext>;
export {};
//# sourceMappingURL=api.d.ts.map