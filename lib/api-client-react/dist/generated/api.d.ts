import type { QueryKey, UseMutationOptions, UseMutationResult, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import type { AuthResponse, Branch, BranchInput, BranchStat, BranchUpdate, Customer, CustomerInput, CustomerUpdate, DashboardOverview, GetBranchComparisonParams, GetCustomersParams, GetDashboardOverviewParams, GetIngredientsParams, GetKitchenQueueParams, GetLowStockAlertsParams, GetMenuCategoriesParams, GetMenuItemsParams, GetOrdersParams, GetPaymentMethodStatsParams, GetPaymentsParams, GetPeakHoursParams, GetPurchaseOrdersParams, GetReservationsParams, GetSalesSummaryParams, GetStockMovementsParams, GetTablesParams, GetTopMenuItemsParams, GetUsersParams, HealthStatus, ImageUploadInput, ImageUploadResult, Ingredient, IngredientInput, IngredientUpdate, KitchenItemStatusInput, KitchenOrder, LoginInput, LowStockAlert, MenuCategory, MenuCategoryInput, MenuCategoryUpdate, MenuItem, MenuItemInput, MenuItemUpdate, Order, OrderInput, OrderItem, OrderItemInput, OrderItemUpdate, OrderUpdate, Payment, PaymentInput, PaymentMethodStat, PeakHourStat, PurchaseOrder, PurchaseOrderInput, PurchaseOrderUpdate, RefundInput, Reservation, ReservationInput, ReservationUpdate, SalesSummary, StockMovement, StockMovementInput, Table, TableInput, TableStatusInput, TableUpdate, TopMenuItem, User, UserInput, UserUpdate, VoidInput } from './api.schemas';
import { customFetch } from '../custom-fetch';
import type { ErrorType, BodyType } from '../custom-fetch';
type AwaitedInput<T> = PromiseLike<T> | T;
type Awaited<O> = O extends AwaitedInput<infer T> ? T : never;
type SecondParameter<T extends (...args: never) => unknown> = Parameters<T>[1];
export declare const getHealthCheckUrl: () => string;
/**
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
export declare const getLoginUrl: () => string;
export declare const login: (loginInput: LoginInput, options?: RequestInit) => Promise<AuthResponse>;
export declare const getLoginMutationOptions: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof login>>, TError, {
        data: BodyType<LoginInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof login>>, TError, {
    data: BodyType<LoginInput>;
}, TContext>;
export type LoginMutationResult = NonNullable<Awaited<ReturnType<typeof login>>>;
export type LoginMutationBody = BodyType<LoginInput>;
export type LoginMutationError = ErrorType<void>;
export declare const useLogin: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof login>>, TError, {
        data: BodyType<LoginInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof login>>, TError, {
    data: BodyType<LoginInput>;
}, TContext>;
export declare const getLogoutUrl: () => string;
export declare const logout: (options?: RequestInit) => Promise<void>;
export declare const getLogoutMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof logout>>, TError, void, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof logout>>, TError, void, TContext>;
export type LogoutMutationResult = NonNullable<Awaited<ReturnType<typeof logout>>>;
export type LogoutMutationError = ErrorType<unknown>;
export declare const useLogout: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof logout>>, TError, void, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof logout>>, TError, void, TContext>;
export declare const getGetMeUrl: () => string;
export declare const getMe: (options?: RequestInit) => Promise<User>;
export declare const getGetMeQueryKey: () => readonly ["/api/auth/me"];
export declare const getGetMeQueryOptions: <TData = Awaited<ReturnType<typeof getMe>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getMe>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getMe>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetMeQueryResult = NonNullable<Awaited<ReturnType<typeof getMe>>>;
export type GetMeQueryError = ErrorType<unknown>;
export declare function useGetMe<TData = Awaited<ReturnType<typeof getMe>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getMe>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getGetBranchesUrl: () => string;
export declare const getBranches: (options?: RequestInit) => Promise<Branch[]>;
export declare const getGetBranchesQueryKey: () => readonly ["/api/branches"];
export declare const getGetBranchesQueryOptions: <TData = Awaited<ReturnType<typeof getBranches>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getBranches>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getBranches>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetBranchesQueryResult = NonNullable<Awaited<ReturnType<typeof getBranches>>>;
export type GetBranchesQueryError = ErrorType<unknown>;
export declare function useGetBranches<TData = Awaited<ReturnType<typeof getBranches>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getBranches>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getCreateBranchUrl: () => string;
export declare const createBranch: (branchInput: BranchInput, options?: RequestInit) => Promise<Branch>;
export declare const getCreateBranchMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createBranch>>, TError, {
        data: BodyType<BranchInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createBranch>>, TError, {
    data: BodyType<BranchInput>;
}, TContext>;
export type CreateBranchMutationResult = NonNullable<Awaited<ReturnType<typeof createBranch>>>;
export type CreateBranchMutationBody = BodyType<BranchInput>;
export type CreateBranchMutationError = ErrorType<unknown>;
export declare const useCreateBranch: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createBranch>>, TError, {
        data: BodyType<BranchInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createBranch>>, TError, {
    data: BodyType<BranchInput>;
}, TContext>;
export declare const getGetBranchUrl: (id: number) => string;
export declare const getBranch: (id: number, options?: RequestInit) => Promise<Branch>;
export declare const getGetBranchQueryKey: (id: number) => readonly [`/api/branches/${number}`];
export declare const getGetBranchQueryOptions: <TData = Awaited<ReturnType<typeof getBranch>>, TError = ErrorType<unknown>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getBranch>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getBranch>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetBranchQueryResult = NonNullable<Awaited<ReturnType<typeof getBranch>>>;
export type GetBranchQueryError = ErrorType<unknown>;
export declare function useGetBranch<TData = Awaited<ReturnType<typeof getBranch>>, TError = ErrorType<unknown>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getBranch>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getUpdateBranchUrl: (id: number) => string;
export declare const updateBranch: (id: number, branchUpdate: BranchUpdate, options?: RequestInit) => Promise<Branch>;
export declare const getUpdateBranchMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateBranch>>, TError, {
        id: number;
        data: BodyType<BranchUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateBranch>>, TError, {
    id: number;
    data: BodyType<BranchUpdate>;
}, TContext>;
export type UpdateBranchMutationResult = NonNullable<Awaited<ReturnType<typeof updateBranch>>>;
export type UpdateBranchMutationBody = BodyType<BranchUpdate>;
export type UpdateBranchMutationError = ErrorType<unknown>;
export declare const useUpdateBranch: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateBranch>>, TError, {
        id: number;
        data: BodyType<BranchUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateBranch>>, TError, {
    id: number;
    data: BodyType<BranchUpdate>;
}, TContext>;
export declare const getDeleteBranchUrl: (id: number) => string;
export declare const deleteBranch: (id: number, options?: RequestInit) => Promise<void>;
export declare const getDeleteBranchMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteBranch>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof deleteBranch>>, TError, {
    id: number;
}, TContext>;
export type DeleteBranchMutationResult = NonNullable<Awaited<ReturnType<typeof deleteBranch>>>;
export type DeleteBranchMutationError = ErrorType<unknown>;
export declare const useDeleteBranch: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteBranch>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof deleteBranch>>, TError, {
    id: number;
}, TContext>;
export declare const getGetUsersUrl: (params?: GetUsersParams) => string;
export declare const getUsers: (params?: GetUsersParams, options?: RequestInit) => Promise<User[]>;
export declare const getGetUsersQueryKey: (params?: GetUsersParams) => readonly ["/api/users", ...GetUsersParams[]];
export declare const getGetUsersQueryOptions: <TData = Awaited<ReturnType<typeof getUsers>>, TError = ErrorType<unknown>>(params?: GetUsersParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getUsers>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getUsers>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetUsersQueryResult = NonNullable<Awaited<ReturnType<typeof getUsers>>>;
export type GetUsersQueryError = ErrorType<unknown>;
export declare function useGetUsers<TData = Awaited<ReturnType<typeof getUsers>>, TError = ErrorType<unknown>>(params?: GetUsersParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getUsers>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getCreateUserUrl: () => string;
export declare const createUser: (userInput: UserInput, options?: RequestInit) => Promise<User>;
export declare const getCreateUserMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createUser>>, TError, {
        data: BodyType<UserInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createUser>>, TError, {
    data: BodyType<UserInput>;
}, TContext>;
export type CreateUserMutationResult = NonNullable<Awaited<ReturnType<typeof createUser>>>;
export type CreateUserMutationBody = BodyType<UserInput>;
export type CreateUserMutationError = ErrorType<unknown>;
export declare const useCreateUser: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createUser>>, TError, {
        data: BodyType<UserInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createUser>>, TError, {
    data: BodyType<UserInput>;
}, TContext>;
export declare const getGetUserUrl: (id: number) => string;
export declare const getUser: (id: number, options?: RequestInit) => Promise<User>;
export declare const getGetUserQueryKey: (id: number) => readonly [`/api/users/${number}`];
export declare const getGetUserQueryOptions: <TData = Awaited<ReturnType<typeof getUser>>, TError = ErrorType<unknown>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getUser>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getUser>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetUserQueryResult = NonNullable<Awaited<ReturnType<typeof getUser>>>;
export type GetUserQueryError = ErrorType<unknown>;
export declare function useGetUser<TData = Awaited<ReturnType<typeof getUser>>, TError = ErrorType<unknown>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getUser>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getUpdateUserUrl: (id: number) => string;
export declare const updateUser: (id: number, userUpdate: UserUpdate, options?: RequestInit) => Promise<User>;
export declare const getUpdateUserMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateUser>>, TError, {
        id: number;
        data: BodyType<UserUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateUser>>, TError, {
    id: number;
    data: BodyType<UserUpdate>;
}, TContext>;
export type UpdateUserMutationResult = NonNullable<Awaited<ReturnType<typeof updateUser>>>;
export type UpdateUserMutationBody = BodyType<UserUpdate>;
export type UpdateUserMutationError = ErrorType<unknown>;
export declare const useUpdateUser: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateUser>>, TError, {
        id: number;
        data: BodyType<UserUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateUser>>, TError, {
    id: number;
    data: BodyType<UserUpdate>;
}, TContext>;
export declare const getDeleteUserUrl: (id: number) => string;
export declare const deleteUser: (id: number, options?: RequestInit) => Promise<void>;
export declare const getDeleteUserMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteUser>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof deleteUser>>, TError, {
    id: number;
}, TContext>;
export type DeleteUserMutationResult = NonNullable<Awaited<ReturnType<typeof deleteUser>>>;
export type DeleteUserMutationError = ErrorType<unknown>;
export declare const useDeleteUser: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteUser>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof deleteUser>>, TError, {
    id: number;
}, TContext>;
export declare const getGetMenuCategoriesUrl: (params?: GetMenuCategoriesParams) => string;
export declare const getMenuCategories: (params?: GetMenuCategoriesParams, options?: RequestInit) => Promise<MenuCategory[]>;
export declare const getGetMenuCategoriesQueryKey: (params?: GetMenuCategoriesParams) => readonly ["/api/menu-categories", ...GetMenuCategoriesParams[]];
export declare const getGetMenuCategoriesQueryOptions: <TData = Awaited<ReturnType<typeof getMenuCategories>>, TError = ErrorType<unknown>>(params?: GetMenuCategoriesParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getMenuCategories>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getMenuCategories>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetMenuCategoriesQueryResult = NonNullable<Awaited<ReturnType<typeof getMenuCategories>>>;
export type GetMenuCategoriesQueryError = ErrorType<unknown>;
export declare function useGetMenuCategories<TData = Awaited<ReturnType<typeof getMenuCategories>>, TError = ErrorType<unknown>>(params?: GetMenuCategoriesParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getMenuCategories>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getCreateMenuCategoryUrl: () => string;
export declare const createMenuCategory: (menuCategoryInput: MenuCategoryInput, options?: RequestInit) => Promise<MenuCategory>;
export declare const getCreateMenuCategoryMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createMenuCategory>>, TError, {
        data: BodyType<MenuCategoryInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createMenuCategory>>, TError, {
    data: BodyType<MenuCategoryInput>;
}, TContext>;
export type CreateMenuCategoryMutationResult = NonNullable<Awaited<ReturnType<typeof createMenuCategory>>>;
export type CreateMenuCategoryMutationBody = BodyType<MenuCategoryInput>;
export type CreateMenuCategoryMutationError = ErrorType<unknown>;
export declare const useCreateMenuCategory: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createMenuCategory>>, TError, {
        data: BodyType<MenuCategoryInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createMenuCategory>>, TError, {
    data: BodyType<MenuCategoryInput>;
}, TContext>;
export declare const getUpdateMenuCategoryUrl: (id: number) => string;
export declare const updateMenuCategory: (id: number, menuCategoryUpdate: MenuCategoryUpdate, options?: RequestInit) => Promise<MenuCategory>;
export declare const getUpdateMenuCategoryMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateMenuCategory>>, TError, {
        id: number;
        data: BodyType<MenuCategoryUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateMenuCategory>>, TError, {
    id: number;
    data: BodyType<MenuCategoryUpdate>;
}, TContext>;
export type UpdateMenuCategoryMutationResult = NonNullable<Awaited<ReturnType<typeof updateMenuCategory>>>;
export type UpdateMenuCategoryMutationBody = BodyType<MenuCategoryUpdate>;
export type UpdateMenuCategoryMutationError = ErrorType<unknown>;
export declare const useUpdateMenuCategory: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateMenuCategory>>, TError, {
        id: number;
        data: BodyType<MenuCategoryUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateMenuCategory>>, TError, {
    id: number;
    data: BodyType<MenuCategoryUpdate>;
}, TContext>;
export declare const getDeleteMenuCategoryUrl: (id: number) => string;
export declare const deleteMenuCategory: (id: number, options?: RequestInit) => Promise<void>;
export declare const getDeleteMenuCategoryMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteMenuCategory>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof deleteMenuCategory>>, TError, {
    id: number;
}, TContext>;
export type DeleteMenuCategoryMutationResult = NonNullable<Awaited<ReturnType<typeof deleteMenuCategory>>>;
export type DeleteMenuCategoryMutationError = ErrorType<unknown>;
export declare const useDeleteMenuCategory: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteMenuCategory>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof deleteMenuCategory>>, TError, {
    id: number;
}, TContext>;
export declare const getGetMenuItemsUrl: (params?: GetMenuItemsParams) => string;
export declare const getMenuItems: (params?: GetMenuItemsParams, options?: RequestInit) => Promise<MenuItem[]>;
export declare const getGetMenuItemsQueryKey: (params?: GetMenuItemsParams) => readonly ["/api/menu-items", ...GetMenuItemsParams[]];
export declare const getGetMenuItemsQueryOptions: <TData = Awaited<ReturnType<typeof getMenuItems>>, TError = ErrorType<unknown>>(params?: GetMenuItemsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getMenuItems>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getMenuItems>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetMenuItemsQueryResult = NonNullable<Awaited<ReturnType<typeof getMenuItems>>>;
export type GetMenuItemsQueryError = ErrorType<unknown>;
export declare function useGetMenuItems<TData = Awaited<ReturnType<typeof getMenuItems>>, TError = ErrorType<unknown>>(params?: GetMenuItemsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getMenuItems>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getCreateMenuItemUrl: () => string;
export declare const createMenuItem: (menuItemInput: MenuItemInput, options?: RequestInit) => Promise<MenuItem>;
export declare const getCreateMenuItemMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createMenuItem>>, TError, {
        data: BodyType<MenuItemInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createMenuItem>>, TError, {
    data: BodyType<MenuItemInput>;
}, TContext>;
export type CreateMenuItemMutationResult = NonNullable<Awaited<ReturnType<typeof createMenuItem>>>;
export type CreateMenuItemMutationBody = BodyType<MenuItemInput>;
export type CreateMenuItemMutationError = ErrorType<unknown>;
export declare const useCreateMenuItem: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createMenuItem>>, TError, {
        data: BodyType<MenuItemInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createMenuItem>>, TError, {
    data: BodyType<MenuItemInput>;
}, TContext>;
export declare const getGetMenuItemUrl: (id: number) => string;
export declare const getMenuItem: (id: number, options?: RequestInit) => Promise<MenuItem>;
export declare const getGetMenuItemQueryKey: (id: number) => readonly [`/api/menu-items/${number}`];
export declare const getGetMenuItemQueryOptions: <TData = Awaited<ReturnType<typeof getMenuItem>>, TError = ErrorType<unknown>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getMenuItem>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getMenuItem>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetMenuItemQueryResult = NonNullable<Awaited<ReturnType<typeof getMenuItem>>>;
export type GetMenuItemQueryError = ErrorType<unknown>;
export declare function useGetMenuItem<TData = Awaited<ReturnType<typeof getMenuItem>>, TError = ErrorType<unknown>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getMenuItem>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getUpdateMenuItemUrl: (id: number) => string;
export declare const updateMenuItem: (id: number, menuItemUpdate: MenuItemUpdate, options?: RequestInit) => Promise<MenuItem>;
export declare const getUpdateMenuItemMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateMenuItem>>, TError, {
        id: number;
        data: BodyType<MenuItemUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateMenuItem>>, TError, {
    id: number;
    data: BodyType<MenuItemUpdate>;
}, TContext>;
export type UpdateMenuItemMutationResult = NonNullable<Awaited<ReturnType<typeof updateMenuItem>>>;
export type UpdateMenuItemMutationBody = BodyType<MenuItemUpdate>;
export type UpdateMenuItemMutationError = ErrorType<unknown>;
export declare const useUpdateMenuItem: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateMenuItem>>, TError, {
        id: number;
        data: BodyType<MenuItemUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateMenuItem>>, TError, {
    id: number;
    data: BodyType<MenuItemUpdate>;
}, TContext>;
export declare const getDeleteMenuItemUrl: (id: number) => string;
export declare const deleteMenuItem: (id: number, options?: RequestInit) => Promise<void>;
export declare const getDeleteMenuItemMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteMenuItem>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof deleteMenuItem>>, TError, {
    id: number;
}, TContext>;
export type DeleteMenuItemMutationResult = NonNullable<Awaited<ReturnType<typeof deleteMenuItem>>>;
export type DeleteMenuItemMutationError = ErrorType<unknown>;
export declare const useDeleteMenuItem: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteMenuItem>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof deleteMenuItem>>, TError, {
    id: number;
}, TContext>;
export declare const getGetTablesUrl: (params?: GetTablesParams) => string;
export declare const getTables: (params?: GetTablesParams, options?: RequestInit) => Promise<Table[]>;
export declare const getGetTablesQueryKey: (params?: GetTablesParams) => readonly ["/api/tables", ...GetTablesParams[]];
export declare const getGetTablesQueryOptions: <TData = Awaited<ReturnType<typeof getTables>>, TError = ErrorType<unknown>>(params?: GetTablesParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getTables>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getTables>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetTablesQueryResult = NonNullable<Awaited<ReturnType<typeof getTables>>>;
export type GetTablesQueryError = ErrorType<unknown>;
export declare function useGetTables<TData = Awaited<ReturnType<typeof getTables>>, TError = ErrorType<unknown>>(params?: GetTablesParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getTables>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getCreateTableUrl: () => string;
export declare const createTable: (tableInput: TableInput, options?: RequestInit) => Promise<Table>;
export declare const getCreateTableMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createTable>>, TError, {
        data: BodyType<TableInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createTable>>, TError, {
    data: BodyType<TableInput>;
}, TContext>;
export type CreateTableMutationResult = NonNullable<Awaited<ReturnType<typeof createTable>>>;
export type CreateTableMutationBody = BodyType<TableInput>;
export type CreateTableMutationError = ErrorType<unknown>;
export declare const useCreateTable: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createTable>>, TError, {
        data: BodyType<TableInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createTable>>, TError, {
    data: BodyType<TableInput>;
}, TContext>;
export declare const getUpdateTableUrl: (id: number) => string;
export declare const updateTable: (id: number, tableUpdate: TableUpdate, options?: RequestInit) => Promise<Table>;
export declare const getUpdateTableMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateTable>>, TError, {
        id: number;
        data: BodyType<TableUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateTable>>, TError, {
    id: number;
    data: BodyType<TableUpdate>;
}, TContext>;
export type UpdateTableMutationResult = NonNullable<Awaited<ReturnType<typeof updateTable>>>;
export type UpdateTableMutationBody = BodyType<TableUpdate>;
export type UpdateTableMutationError = ErrorType<unknown>;
export declare const useUpdateTable: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateTable>>, TError, {
        id: number;
        data: BodyType<TableUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateTable>>, TError, {
    id: number;
    data: BodyType<TableUpdate>;
}, TContext>;
export declare const getDeleteTableUrl: (id: number) => string;
export declare const deleteTable: (id: number, options?: RequestInit) => Promise<void>;
export declare const getDeleteTableMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteTable>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof deleteTable>>, TError, {
    id: number;
}, TContext>;
export type DeleteTableMutationResult = NonNullable<Awaited<ReturnType<typeof deleteTable>>>;
export type DeleteTableMutationError = ErrorType<unknown>;
export declare const useDeleteTable: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteTable>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof deleteTable>>, TError, {
    id: number;
}, TContext>;
export declare const getUpdateTableStatusUrl: (id: number) => string;
export declare const updateTableStatus: (id: number, tableStatusInput: TableStatusInput, options?: RequestInit) => Promise<Table>;
export declare const getUpdateTableStatusMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateTableStatus>>, TError, {
        id: number;
        data: BodyType<TableStatusInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateTableStatus>>, TError, {
    id: number;
    data: BodyType<TableStatusInput>;
}, TContext>;
export type UpdateTableStatusMutationResult = NonNullable<Awaited<ReturnType<typeof updateTableStatus>>>;
export type UpdateTableStatusMutationBody = BodyType<TableStatusInput>;
export type UpdateTableStatusMutationError = ErrorType<unknown>;
export declare const useUpdateTableStatus: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateTableStatus>>, TError, {
        id: number;
        data: BodyType<TableStatusInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateTableStatus>>, TError, {
    id: number;
    data: BodyType<TableStatusInput>;
}, TContext>;
export declare const getGetReservationsUrl: (params?: GetReservationsParams) => string;
export declare const getReservations: (params?: GetReservationsParams, options?: RequestInit) => Promise<Reservation[]>;
export declare const getGetReservationsQueryKey: (params?: GetReservationsParams) => readonly ["/api/reservations", ...GetReservationsParams[]];
export declare const getGetReservationsQueryOptions: <TData = Awaited<ReturnType<typeof getReservations>>, TError = ErrorType<unknown>>(params?: GetReservationsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getReservations>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getReservations>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetReservationsQueryResult = NonNullable<Awaited<ReturnType<typeof getReservations>>>;
export type GetReservationsQueryError = ErrorType<unknown>;
export declare function useGetReservations<TData = Awaited<ReturnType<typeof getReservations>>, TError = ErrorType<unknown>>(params?: GetReservationsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getReservations>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getCreateReservationUrl: () => string;
export declare const createReservation: (reservationInput: ReservationInput, options?: RequestInit) => Promise<Reservation>;
export declare const getCreateReservationMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createReservation>>, TError, {
        data: BodyType<ReservationInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createReservation>>, TError, {
    data: BodyType<ReservationInput>;
}, TContext>;
export type CreateReservationMutationResult = NonNullable<Awaited<ReturnType<typeof createReservation>>>;
export type CreateReservationMutationBody = BodyType<ReservationInput>;
export type CreateReservationMutationError = ErrorType<unknown>;
export declare const useCreateReservation: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createReservation>>, TError, {
        data: BodyType<ReservationInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createReservation>>, TError, {
    data: BodyType<ReservationInput>;
}, TContext>;
export declare const getGetReservationUrl: (id: number) => string;
export declare const getReservation: (id: number, options?: RequestInit) => Promise<Reservation>;
export declare const getGetReservationQueryKey: (id: number) => readonly [`/api/reservations/${number}`];
export declare const getGetReservationQueryOptions: <TData = Awaited<ReturnType<typeof getReservation>>, TError = ErrorType<unknown>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getReservation>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getReservation>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetReservationQueryResult = NonNullable<Awaited<ReturnType<typeof getReservation>>>;
export type GetReservationQueryError = ErrorType<unknown>;
export declare function useGetReservation<TData = Awaited<ReturnType<typeof getReservation>>, TError = ErrorType<unknown>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getReservation>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getUpdateReservationUrl: (id: number) => string;
export declare const updateReservation: (id: number, reservationUpdate: ReservationUpdate, options?: RequestInit) => Promise<Reservation>;
export declare const getUpdateReservationMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateReservation>>, TError, {
        id: number;
        data: BodyType<ReservationUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateReservation>>, TError, {
    id: number;
    data: BodyType<ReservationUpdate>;
}, TContext>;
export type UpdateReservationMutationResult = NonNullable<Awaited<ReturnType<typeof updateReservation>>>;
export type UpdateReservationMutationBody = BodyType<ReservationUpdate>;
export type UpdateReservationMutationError = ErrorType<unknown>;
export declare const useUpdateReservation: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateReservation>>, TError, {
        id: number;
        data: BodyType<ReservationUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateReservation>>, TError, {
    id: number;
    data: BodyType<ReservationUpdate>;
}, TContext>;
export declare const getDeleteReservationUrl: (id: number) => string;
export declare const deleteReservation: (id: number, options?: RequestInit) => Promise<void>;
export declare const getDeleteReservationMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteReservation>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof deleteReservation>>, TError, {
    id: number;
}, TContext>;
export type DeleteReservationMutationResult = NonNullable<Awaited<ReturnType<typeof deleteReservation>>>;
export type DeleteReservationMutationError = ErrorType<unknown>;
export declare const useDeleteReservation: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteReservation>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof deleteReservation>>, TError, {
    id: number;
}, TContext>;
export declare const getGetOrdersUrl: (params?: GetOrdersParams) => string;
export declare const getOrders: (params?: GetOrdersParams, options?: RequestInit) => Promise<Order[]>;
export declare const getGetOrdersQueryKey: (params?: GetOrdersParams) => readonly ["/api/orders", ...GetOrdersParams[]];
export declare const getGetOrdersQueryOptions: <TData = Awaited<ReturnType<typeof getOrders>>, TError = ErrorType<unknown>>(params?: GetOrdersParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getOrders>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getOrders>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetOrdersQueryResult = NonNullable<Awaited<ReturnType<typeof getOrders>>>;
export type GetOrdersQueryError = ErrorType<unknown>;
export declare function useGetOrders<TData = Awaited<ReturnType<typeof getOrders>>, TError = ErrorType<unknown>>(params?: GetOrdersParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getOrders>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getCreateOrderUrl: () => string;
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
export declare const useCreateOrder: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createOrder>>, TError, {
        data: BodyType<OrderInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createOrder>>, TError, {
    data: BodyType<OrderInput>;
}, TContext>;
export declare const getGetOrderUrl: (id: number) => string;
export declare const getOrder: (id: number, options?: RequestInit) => Promise<Order>;
export declare const getGetOrderQueryKey: (id: number) => readonly [`/api/orders/${number}`];
export declare const getGetOrderQueryOptions: <TData = Awaited<ReturnType<typeof getOrder>>, TError = ErrorType<unknown>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getOrder>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getOrder>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetOrderQueryResult = NonNullable<Awaited<ReturnType<typeof getOrder>>>;
export type GetOrderQueryError = ErrorType<unknown>;
export declare function useGetOrder<TData = Awaited<ReturnType<typeof getOrder>>, TError = ErrorType<unknown>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getOrder>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getUpdateOrderUrl: (id: number) => string;
export declare const updateOrder: (id: number, orderUpdate: OrderUpdate, options?: RequestInit) => Promise<Order>;
export declare const getUpdateOrderMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateOrder>>, TError, {
        id: number;
        data: BodyType<OrderUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateOrder>>, TError, {
    id: number;
    data: BodyType<OrderUpdate>;
}, TContext>;
export type UpdateOrderMutationResult = NonNullable<Awaited<ReturnType<typeof updateOrder>>>;
export type UpdateOrderMutationBody = BodyType<OrderUpdate>;
export type UpdateOrderMutationError = ErrorType<unknown>;
export declare const useUpdateOrder: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateOrder>>, TError, {
        id: number;
        data: BodyType<OrderUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateOrder>>, TError, {
    id: number;
    data: BodyType<OrderUpdate>;
}, TContext>;
export declare const getAddOrderItemUrl: (id: number) => string;
export declare const addOrderItem: (id: number, orderItemInput: OrderItemInput, options?: RequestInit) => Promise<OrderItem>;
export declare const getAddOrderItemMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof addOrderItem>>, TError, {
        id: number;
        data: BodyType<OrderItemInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof addOrderItem>>, TError, {
    id: number;
    data: BodyType<OrderItemInput>;
}, TContext>;
export type AddOrderItemMutationResult = NonNullable<Awaited<ReturnType<typeof addOrderItem>>>;
export type AddOrderItemMutationBody = BodyType<OrderItemInput>;
export type AddOrderItemMutationError = ErrorType<unknown>;
export declare const useAddOrderItem: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof addOrderItem>>, TError, {
        id: number;
        data: BodyType<OrderItemInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof addOrderItem>>, TError, {
    id: number;
    data: BodyType<OrderItemInput>;
}, TContext>;
export declare const getUpdateOrderItemUrl: (id: number, itemId: number) => string;
export declare const updateOrderItem: (id: number, itemId: number, orderItemUpdate: OrderItemUpdate, options?: RequestInit) => Promise<OrderItem>;
export declare const getUpdateOrderItemMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateOrderItem>>, TError, {
        id: number;
        itemId: number;
        data: BodyType<OrderItemUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateOrderItem>>, TError, {
    id: number;
    itemId: number;
    data: BodyType<OrderItemUpdate>;
}, TContext>;
export type UpdateOrderItemMutationResult = NonNullable<Awaited<ReturnType<typeof updateOrderItem>>>;
export type UpdateOrderItemMutationBody = BodyType<OrderItemUpdate>;
export type UpdateOrderItemMutationError = ErrorType<unknown>;
export declare const useUpdateOrderItem: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateOrderItem>>, TError, {
        id: number;
        itemId: number;
        data: BodyType<OrderItemUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateOrderItem>>, TError, {
    id: number;
    itemId: number;
    data: BodyType<OrderItemUpdate>;
}, TContext>;
export declare const getRemoveOrderItemUrl: (id: number, itemId: number) => string;
export declare const removeOrderItem: (id: number, itemId: number, options?: RequestInit) => Promise<void>;
export declare const getRemoveOrderItemMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof removeOrderItem>>, TError, {
        id: number;
        itemId: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof removeOrderItem>>, TError, {
    id: number;
    itemId: number;
}, TContext>;
export type RemoveOrderItemMutationResult = NonNullable<Awaited<ReturnType<typeof removeOrderItem>>>;
export type RemoveOrderItemMutationError = ErrorType<unknown>;
export declare const useRemoveOrderItem: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof removeOrderItem>>, TError, {
        id: number;
        itemId: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof removeOrderItem>>, TError, {
    id: number;
    itemId: number;
}, TContext>;
export declare const getVoidOrderUrl: (id: number) => string;
export declare const voidOrder: (id: number, voidInput: VoidInput, options?: RequestInit) => Promise<Order>;
export declare const getVoidOrderMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof voidOrder>>, TError, {
        id: number;
        data: BodyType<VoidInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof voidOrder>>, TError, {
    id: number;
    data: BodyType<VoidInput>;
}, TContext>;
export type VoidOrderMutationResult = NonNullable<Awaited<ReturnType<typeof voidOrder>>>;
export type VoidOrderMutationBody = BodyType<VoidInput>;
export type VoidOrderMutationError = ErrorType<unknown>;
export declare const useVoidOrder: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof voidOrder>>, TError, {
        id: number;
        data: BodyType<VoidInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof voidOrder>>, TError, {
    id: number;
    data: BodyType<VoidInput>;
}, TContext>;
export declare const getGetKitchenQueueUrl: (params?: GetKitchenQueueParams) => string;
export declare const getKitchenQueue: (params?: GetKitchenQueueParams, options?: RequestInit) => Promise<KitchenOrder[]>;
export declare const getGetKitchenQueueQueryKey: (params?: GetKitchenQueueParams) => readonly ["/api/kitchen/queue", ...GetKitchenQueueParams[]];
export declare const getGetKitchenQueueQueryOptions: <TData = Awaited<ReturnType<typeof getKitchenQueue>>, TError = ErrorType<unknown>>(params?: GetKitchenQueueParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getKitchenQueue>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getKitchenQueue>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetKitchenQueueQueryResult = NonNullable<Awaited<ReturnType<typeof getKitchenQueue>>>;
export type GetKitchenQueueQueryError = ErrorType<unknown>;
export declare function useGetKitchenQueue<TData = Awaited<ReturnType<typeof getKitchenQueue>>, TError = ErrorType<unknown>>(params?: GetKitchenQueueParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getKitchenQueue>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getUpdateKitchenItemStatusUrl: (itemId: number) => string;
export declare const updateKitchenItemStatus: (itemId: number, kitchenItemStatusInput: KitchenItemStatusInput, options?: RequestInit) => Promise<OrderItem>;
export declare const getUpdateKitchenItemStatusMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateKitchenItemStatus>>, TError, {
        itemId: number;
        data: BodyType<KitchenItemStatusInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateKitchenItemStatus>>, TError, {
    itemId: number;
    data: BodyType<KitchenItemStatusInput>;
}, TContext>;
export type UpdateKitchenItemStatusMutationResult = NonNullable<Awaited<ReturnType<typeof updateKitchenItemStatus>>>;
export type UpdateKitchenItemStatusMutationBody = BodyType<KitchenItemStatusInput>;
export type UpdateKitchenItemStatusMutationError = ErrorType<unknown>;
export declare const useUpdateKitchenItemStatus: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateKitchenItemStatus>>, TError, {
        itemId: number;
        data: BodyType<KitchenItemStatusInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateKitchenItemStatus>>, TError, {
    itemId: number;
    data: BodyType<KitchenItemStatusInput>;
}, TContext>;
export declare const getProcessPaymentUrl: () => string;
export declare const processPayment: (paymentInput: PaymentInput, options?: RequestInit) => Promise<Payment>;
export declare const getProcessPaymentMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof processPayment>>, TError, {
        data: BodyType<PaymentInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof processPayment>>, TError, {
    data: BodyType<PaymentInput>;
}, TContext>;
export type ProcessPaymentMutationResult = NonNullable<Awaited<ReturnType<typeof processPayment>>>;
export type ProcessPaymentMutationBody = BodyType<PaymentInput>;
export type ProcessPaymentMutationError = ErrorType<unknown>;
export declare const useProcessPayment: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof processPayment>>, TError, {
        data: BodyType<PaymentInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof processPayment>>, TError, {
    data: BodyType<PaymentInput>;
}, TContext>;
export declare const getGetPaymentsUrl: (params?: GetPaymentsParams) => string;
export declare const getPayments: (params?: GetPaymentsParams, options?: RequestInit) => Promise<Payment[]>;
export declare const getGetPaymentsQueryKey: (params?: GetPaymentsParams) => readonly ["/api/payments", ...GetPaymentsParams[]];
export declare const getGetPaymentsQueryOptions: <TData = Awaited<ReturnType<typeof getPayments>>, TError = ErrorType<unknown>>(params?: GetPaymentsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getPayments>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getPayments>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetPaymentsQueryResult = NonNullable<Awaited<ReturnType<typeof getPayments>>>;
export type GetPaymentsQueryError = ErrorType<unknown>;
export declare function useGetPayments<TData = Awaited<ReturnType<typeof getPayments>>, TError = ErrorType<unknown>>(params?: GetPaymentsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getPayments>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getRefundPaymentUrl: (id: number) => string;
export declare const refundPayment: (id: number, refundInput: RefundInput, options?: RequestInit) => Promise<Payment>;
export declare const getRefundPaymentMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof refundPayment>>, TError, {
        id: number;
        data: BodyType<RefundInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof refundPayment>>, TError, {
    id: number;
    data: BodyType<RefundInput>;
}, TContext>;
export type RefundPaymentMutationResult = NonNullable<Awaited<ReturnType<typeof refundPayment>>>;
export type RefundPaymentMutationBody = BodyType<RefundInput>;
export type RefundPaymentMutationError = ErrorType<unknown>;
export declare const useRefundPayment: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof refundPayment>>, TError, {
        id: number;
        data: BodyType<RefundInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof refundPayment>>, TError, {
    id: number;
    data: BodyType<RefundInput>;
}, TContext>;
export declare const getGetIngredientsUrl: (params?: GetIngredientsParams) => string;
export declare const getIngredients: (params?: GetIngredientsParams, options?: RequestInit) => Promise<Ingredient[]>;
export declare const getGetIngredientsQueryKey: (params?: GetIngredientsParams) => readonly ["/api/ingredients", ...GetIngredientsParams[]];
export declare const getGetIngredientsQueryOptions: <TData = Awaited<ReturnType<typeof getIngredients>>, TError = ErrorType<unknown>>(params?: GetIngredientsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getIngredients>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getIngredients>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetIngredientsQueryResult = NonNullable<Awaited<ReturnType<typeof getIngredients>>>;
export type GetIngredientsQueryError = ErrorType<unknown>;
export declare function useGetIngredients<TData = Awaited<ReturnType<typeof getIngredients>>, TError = ErrorType<unknown>>(params?: GetIngredientsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getIngredients>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getCreateIngredientUrl: () => string;
export declare const createIngredient: (ingredientInput: IngredientInput, options?: RequestInit) => Promise<Ingredient>;
export declare const getCreateIngredientMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createIngredient>>, TError, {
        data: BodyType<IngredientInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createIngredient>>, TError, {
    data: BodyType<IngredientInput>;
}, TContext>;
export type CreateIngredientMutationResult = NonNullable<Awaited<ReturnType<typeof createIngredient>>>;
export type CreateIngredientMutationBody = BodyType<IngredientInput>;
export type CreateIngredientMutationError = ErrorType<unknown>;
export declare const useCreateIngredient: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createIngredient>>, TError, {
        data: BodyType<IngredientInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createIngredient>>, TError, {
    data: BodyType<IngredientInput>;
}, TContext>;
export declare const getUpdateIngredientUrl: (id: number) => string;
export declare const updateIngredient: (id: number, ingredientUpdate: IngredientUpdate, options?: RequestInit) => Promise<Ingredient>;
export declare const getUpdateIngredientMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateIngredient>>, TError, {
        id: number;
        data: BodyType<IngredientUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateIngredient>>, TError, {
    id: number;
    data: BodyType<IngredientUpdate>;
}, TContext>;
export type UpdateIngredientMutationResult = NonNullable<Awaited<ReturnType<typeof updateIngredient>>>;
export type UpdateIngredientMutationBody = BodyType<IngredientUpdate>;
export type UpdateIngredientMutationError = ErrorType<unknown>;
export declare const useUpdateIngredient: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateIngredient>>, TError, {
        id: number;
        data: BodyType<IngredientUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateIngredient>>, TError, {
    id: number;
    data: BodyType<IngredientUpdate>;
}, TContext>;
export declare const getDeleteIngredientUrl: (id: number) => string;
export declare const deleteIngredient: (id: number, options?: RequestInit) => Promise<void>;
export declare const getDeleteIngredientMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteIngredient>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof deleteIngredient>>, TError, {
    id: number;
}, TContext>;
export type DeleteIngredientMutationResult = NonNullable<Awaited<ReturnType<typeof deleteIngredient>>>;
export type DeleteIngredientMutationError = ErrorType<unknown>;
export declare const useDeleteIngredient: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteIngredient>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof deleteIngredient>>, TError, {
    id: number;
}, TContext>;
export declare const getGetStockMovementsUrl: (params?: GetStockMovementsParams) => string;
export declare const getStockMovements: (params?: GetStockMovementsParams, options?: RequestInit) => Promise<StockMovement[]>;
export declare const getGetStockMovementsQueryKey: (params?: GetStockMovementsParams) => readonly ["/api/stock-movements", ...GetStockMovementsParams[]];
export declare const getGetStockMovementsQueryOptions: <TData = Awaited<ReturnType<typeof getStockMovements>>, TError = ErrorType<unknown>>(params?: GetStockMovementsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getStockMovements>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getStockMovements>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetStockMovementsQueryResult = NonNullable<Awaited<ReturnType<typeof getStockMovements>>>;
export type GetStockMovementsQueryError = ErrorType<unknown>;
export declare function useGetStockMovements<TData = Awaited<ReturnType<typeof getStockMovements>>, TError = ErrorType<unknown>>(params?: GetStockMovementsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getStockMovements>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getCreateStockMovementUrl: () => string;
export declare const createStockMovement: (stockMovementInput: StockMovementInput, options?: RequestInit) => Promise<StockMovement>;
export declare const getCreateStockMovementMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createStockMovement>>, TError, {
        data: BodyType<StockMovementInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createStockMovement>>, TError, {
    data: BodyType<StockMovementInput>;
}, TContext>;
export type CreateStockMovementMutationResult = NonNullable<Awaited<ReturnType<typeof createStockMovement>>>;
export type CreateStockMovementMutationBody = BodyType<StockMovementInput>;
export type CreateStockMovementMutationError = ErrorType<unknown>;
export declare const useCreateStockMovement: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createStockMovement>>, TError, {
        data: BodyType<StockMovementInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createStockMovement>>, TError, {
    data: BodyType<StockMovementInput>;
}, TContext>;
export declare const getGetPurchaseOrdersUrl: (params?: GetPurchaseOrdersParams) => string;
export declare const getPurchaseOrders: (params?: GetPurchaseOrdersParams, options?: RequestInit) => Promise<PurchaseOrder[]>;
export declare const getGetPurchaseOrdersQueryKey: (params?: GetPurchaseOrdersParams) => readonly ["/api/purchase-orders", ...GetPurchaseOrdersParams[]];
export declare const getGetPurchaseOrdersQueryOptions: <TData = Awaited<ReturnType<typeof getPurchaseOrders>>, TError = ErrorType<unknown>>(params?: GetPurchaseOrdersParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getPurchaseOrders>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getPurchaseOrders>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetPurchaseOrdersQueryResult = NonNullable<Awaited<ReturnType<typeof getPurchaseOrders>>>;
export type GetPurchaseOrdersQueryError = ErrorType<unknown>;
export declare function useGetPurchaseOrders<TData = Awaited<ReturnType<typeof getPurchaseOrders>>, TError = ErrorType<unknown>>(params?: GetPurchaseOrdersParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getPurchaseOrders>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getCreatePurchaseOrderUrl: () => string;
export declare const createPurchaseOrder: (purchaseOrderInput: PurchaseOrderInput, options?: RequestInit) => Promise<PurchaseOrder>;
export declare const getCreatePurchaseOrderMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createPurchaseOrder>>, TError, {
        data: BodyType<PurchaseOrderInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createPurchaseOrder>>, TError, {
    data: BodyType<PurchaseOrderInput>;
}, TContext>;
export type CreatePurchaseOrderMutationResult = NonNullable<Awaited<ReturnType<typeof createPurchaseOrder>>>;
export type CreatePurchaseOrderMutationBody = BodyType<PurchaseOrderInput>;
export type CreatePurchaseOrderMutationError = ErrorType<unknown>;
export declare const useCreatePurchaseOrder: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createPurchaseOrder>>, TError, {
        data: BodyType<PurchaseOrderInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createPurchaseOrder>>, TError, {
    data: BodyType<PurchaseOrderInput>;
}, TContext>;
export declare const getUpdatePurchaseOrderUrl: (id: number) => string;
export declare const updatePurchaseOrder: (id: number, purchaseOrderUpdate: PurchaseOrderUpdate, options?: RequestInit) => Promise<PurchaseOrder>;
export declare const getUpdatePurchaseOrderMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updatePurchaseOrder>>, TError, {
        id: number;
        data: BodyType<PurchaseOrderUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updatePurchaseOrder>>, TError, {
    id: number;
    data: BodyType<PurchaseOrderUpdate>;
}, TContext>;
export type UpdatePurchaseOrderMutationResult = NonNullable<Awaited<ReturnType<typeof updatePurchaseOrder>>>;
export type UpdatePurchaseOrderMutationBody = BodyType<PurchaseOrderUpdate>;
export type UpdatePurchaseOrderMutationError = ErrorType<unknown>;
export declare const useUpdatePurchaseOrder: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updatePurchaseOrder>>, TError, {
        id: number;
        data: BodyType<PurchaseOrderUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updatePurchaseOrder>>, TError, {
    id: number;
    data: BodyType<PurchaseOrderUpdate>;
}, TContext>;
export declare const getDeletePurchaseOrderUrl: (id: number) => string;
export declare const deletePurchaseOrder: (id: number, options?: RequestInit) => Promise<void>;
export declare const getDeletePurchaseOrderMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deletePurchaseOrder>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof deletePurchaseOrder>>, TError, {
    id: number;
}, TContext>;
export type DeletePurchaseOrderMutationResult = NonNullable<Awaited<ReturnType<typeof deletePurchaseOrder>>>;
export type DeletePurchaseOrderMutationError = ErrorType<unknown>;
export declare const useDeletePurchaseOrder: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deletePurchaseOrder>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof deletePurchaseOrder>>, TError, {
    id: number;
}, TContext>;
export declare const getGetCustomersUrl: (params?: GetCustomersParams) => string;
export declare const getCustomers: (params?: GetCustomersParams, options?: RequestInit) => Promise<Customer[]>;
export declare const getGetCustomersQueryKey: (params?: GetCustomersParams) => readonly ["/api/customers", ...GetCustomersParams[]];
export declare const getGetCustomersQueryOptions: <TData = Awaited<ReturnType<typeof getCustomers>>, TError = ErrorType<unknown>>(params?: GetCustomersParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getCustomers>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getCustomers>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetCustomersQueryResult = NonNullable<Awaited<ReturnType<typeof getCustomers>>>;
export type GetCustomersQueryError = ErrorType<unknown>;
export declare function useGetCustomers<TData = Awaited<ReturnType<typeof getCustomers>>, TError = ErrorType<unknown>>(params?: GetCustomersParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getCustomers>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getCreateCustomerUrl: () => string;
export declare const createCustomer: (customerInput: CustomerInput, options?: RequestInit) => Promise<Customer>;
export declare const getCreateCustomerMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createCustomer>>, TError, {
        data: BodyType<CustomerInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createCustomer>>, TError, {
    data: BodyType<CustomerInput>;
}, TContext>;
export type CreateCustomerMutationResult = NonNullable<Awaited<ReturnType<typeof createCustomer>>>;
export type CreateCustomerMutationBody = BodyType<CustomerInput>;
export type CreateCustomerMutationError = ErrorType<unknown>;
export declare const useCreateCustomer: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createCustomer>>, TError, {
        data: BodyType<CustomerInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createCustomer>>, TError, {
    data: BodyType<CustomerInput>;
}, TContext>;
export declare const getGetCustomerUrl: (id: number) => string;
export declare const getCustomer: (id: number, options?: RequestInit) => Promise<Customer>;
export declare const getGetCustomerQueryKey: (id: number) => readonly [`/api/customers/${number}`];
export declare const getGetCustomerQueryOptions: <TData = Awaited<ReturnType<typeof getCustomer>>, TError = ErrorType<unknown>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getCustomer>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getCustomer>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetCustomerQueryResult = NonNullable<Awaited<ReturnType<typeof getCustomer>>>;
export type GetCustomerQueryError = ErrorType<unknown>;
export declare function useGetCustomer<TData = Awaited<ReturnType<typeof getCustomer>>, TError = ErrorType<unknown>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getCustomer>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getUpdateCustomerUrl: (id: number) => string;
export declare const updateCustomer: (id: number, customerUpdate: CustomerUpdate, options?: RequestInit) => Promise<Customer>;
export declare const getUpdateCustomerMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateCustomer>>, TError, {
        id: number;
        data: BodyType<CustomerUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateCustomer>>, TError, {
    id: number;
    data: BodyType<CustomerUpdate>;
}, TContext>;
export type UpdateCustomerMutationResult = NonNullable<Awaited<ReturnType<typeof updateCustomer>>>;
export type UpdateCustomerMutationBody = BodyType<CustomerUpdate>;
export type UpdateCustomerMutationError = ErrorType<unknown>;
export declare const useUpdateCustomer: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateCustomer>>, TError, {
        id: number;
        data: BodyType<CustomerUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateCustomer>>, TError, {
    id: number;
    data: BodyType<CustomerUpdate>;
}, TContext>;
export declare const getGetSalesSummaryUrl: (params: GetSalesSummaryParams) => string;
export declare const getSalesSummary: (params: GetSalesSummaryParams, options?: RequestInit) => Promise<SalesSummary>;
export declare const getGetSalesSummaryQueryKey: (params?: GetSalesSummaryParams) => readonly ["/api/reports/sales-summary", ...GetSalesSummaryParams[]];
export declare const getGetSalesSummaryQueryOptions: <TData = Awaited<ReturnType<typeof getSalesSummary>>, TError = ErrorType<unknown>>(params: GetSalesSummaryParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getSalesSummary>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getSalesSummary>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetSalesSummaryQueryResult = NonNullable<Awaited<ReturnType<typeof getSalesSummary>>>;
export type GetSalesSummaryQueryError = ErrorType<unknown>;
export declare function useGetSalesSummary<TData = Awaited<ReturnType<typeof getSalesSummary>>, TError = ErrorType<unknown>>(params: GetSalesSummaryParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getSalesSummary>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getGetTopMenuItemsUrl: (params: GetTopMenuItemsParams) => string;
export declare const getTopMenuItems: (params: GetTopMenuItemsParams, options?: RequestInit) => Promise<TopMenuItem[]>;
export declare const getGetTopMenuItemsQueryKey: (params?: GetTopMenuItemsParams) => readonly ["/api/reports/top-items", ...GetTopMenuItemsParams[]];
export declare const getGetTopMenuItemsQueryOptions: <TData = Awaited<ReturnType<typeof getTopMenuItems>>, TError = ErrorType<unknown>>(params: GetTopMenuItemsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getTopMenuItems>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getTopMenuItems>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetTopMenuItemsQueryResult = NonNullable<Awaited<ReturnType<typeof getTopMenuItems>>>;
export type GetTopMenuItemsQueryError = ErrorType<unknown>;
export declare function useGetTopMenuItems<TData = Awaited<ReturnType<typeof getTopMenuItems>>, TError = ErrorType<unknown>>(params: GetTopMenuItemsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getTopMenuItems>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getGetBranchComparisonUrl: (params: GetBranchComparisonParams) => string;
export declare const getBranchComparison: (params: GetBranchComparisonParams, options?: RequestInit) => Promise<BranchStat[]>;
export declare const getGetBranchComparisonQueryKey: (params?: GetBranchComparisonParams) => readonly ["/api/reports/branch-comparison", ...GetBranchComparisonParams[]];
export declare const getGetBranchComparisonQueryOptions: <TData = Awaited<ReturnType<typeof getBranchComparison>>, TError = ErrorType<unknown>>(params: GetBranchComparisonParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getBranchComparison>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getBranchComparison>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetBranchComparisonQueryResult = NonNullable<Awaited<ReturnType<typeof getBranchComparison>>>;
export type GetBranchComparisonQueryError = ErrorType<unknown>;
export declare function useGetBranchComparison<TData = Awaited<ReturnType<typeof getBranchComparison>>, TError = ErrorType<unknown>>(params: GetBranchComparisonParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getBranchComparison>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getGetPaymentMethodStatsUrl: (params: GetPaymentMethodStatsParams) => string;
export declare const getPaymentMethodStats: (params: GetPaymentMethodStatsParams, options?: RequestInit) => Promise<PaymentMethodStat[]>;
export declare const getGetPaymentMethodStatsQueryKey: (params?: GetPaymentMethodStatsParams) => readonly ["/api/reports/payment-methods", ...GetPaymentMethodStatsParams[]];
export declare const getGetPaymentMethodStatsQueryOptions: <TData = Awaited<ReturnType<typeof getPaymentMethodStats>>, TError = ErrorType<unknown>>(params: GetPaymentMethodStatsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getPaymentMethodStats>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getPaymentMethodStats>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetPaymentMethodStatsQueryResult = NonNullable<Awaited<ReturnType<typeof getPaymentMethodStats>>>;
export type GetPaymentMethodStatsQueryError = ErrorType<unknown>;
export declare function useGetPaymentMethodStats<TData = Awaited<ReturnType<typeof getPaymentMethodStats>>, TError = ErrorType<unknown>>(params: GetPaymentMethodStatsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getPaymentMethodStats>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getGetDashboardOverviewUrl: (params?: GetDashboardOverviewParams) => string;
export declare const getDashboardOverview: (params?: GetDashboardOverviewParams, options?: RequestInit) => Promise<DashboardOverview>;
export declare const getGetDashboardOverviewQueryKey: (params?: GetDashboardOverviewParams) => readonly ["/api/dashboard/overview", ...GetDashboardOverviewParams[]];
export declare const getGetDashboardOverviewQueryOptions: <TData = Awaited<ReturnType<typeof getDashboardOverview>>, TError = ErrorType<unknown>>(params?: GetDashboardOverviewParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getDashboardOverview>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getDashboardOverview>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetDashboardOverviewQueryResult = NonNullable<Awaited<ReturnType<typeof getDashboardOverview>>>;
export type GetDashboardOverviewQueryError = ErrorType<unknown>;
export declare function useGetDashboardOverview<TData = Awaited<ReturnType<typeof getDashboardOverview>>, TError = ErrorType<unknown>>(params?: GetDashboardOverviewParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getDashboardOverview>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getGetPeakHoursUrl: (params?: GetPeakHoursParams) => string;
export declare const getPeakHours: (params?: GetPeakHoursParams, options?: RequestInit) => Promise<PeakHourStat[]>;
export declare const getGetPeakHoursQueryKey: (params?: GetPeakHoursParams) => readonly ["/api/dashboard/peak-hours", ...GetPeakHoursParams[]];
export declare const getGetPeakHoursQueryOptions: <TData = Awaited<ReturnType<typeof getPeakHours>>, TError = ErrorType<unknown>>(params?: GetPeakHoursParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getPeakHours>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getPeakHours>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetPeakHoursQueryResult = NonNullable<Awaited<ReturnType<typeof getPeakHours>>>;
export type GetPeakHoursQueryError = ErrorType<unknown>;
export declare function useGetPeakHours<TData = Awaited<ReturnType<typeof getPeakHours>>, TError = ErrorType<unknown>>(params?: GetPeakHoursParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getPeakHours>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getGetLowStockAlertsUrl: (params?: GetLowStockAlertsParams) => string;
export declare const getLowStockAlerts: (params?: GetLowStockAlertsParams, options?: RequestInit) => Promise<LowStockAlert[]>;
export declare const getGetLowStockAlertsQueryKey: (params?: GetLowStockAlertsParams) => readonly ["/api/dashboard/low-stock", ...GetLowStockAlertsParams[]];
export declare const getGetLowStockAlertsQueryOptions: <TData = Awaited<ReturnType<typeof getLowStockAlerts>>, TError = ErrorType<unknown>>(params?: GetLowStockAlertsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getLowStockAlerts>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getLowStockAlerts>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetLowStockAlertsQueryResult = NonNullable<Awaited<ReturnType<typeof getLowStockAlerts>>>;
export type GetLowStockAlertsQueryError = ErrorType<unknown>;
export declare function useGetLowStockAlerts<TData = Awaited<ReturnType<typeof getLowStockAlerts>>, TError = ErrorType<unknown>>(params?: GetLowStockAlertsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getLowStockAlerts>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getUploadImageUrl: () => string;
export declare const uploadImage: (imageUploadInput: ImageUploadInput, options?: RequestInit) => Promise<ImageUploadResult>;
export declare const getUploadImageMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof uploadImage>>, TError, {
        data: BodyType<ImageUploadInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof uploadImage>>, TError, {
    data: BodyType<ImageUploadInput>;
}, TContext>;
export type UploadImageMutationResult = NonNullable<Awaited<ReturnType<typeof uploadImage>>>;
export type UploadImageMutationBody = BodyType<ImageUploadInput>;
export type UploadImageMutationError = ErrorType<unknown>;
export declare const useUploadImage: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof uploadImage>>, TError, {
        data: BodyType<ImageUploadInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof uploadImage>>, TError, {
    data: BodyType<ImageUploadInput>;
}, TContext>;
export {};
//# sourceMappingURL=api.d.ts.map