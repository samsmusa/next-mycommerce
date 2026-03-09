export const APP_ROUTE = {
    ADMIN_PANEL: '/admin',
    ADMIN_PRODUCTS: '/admin/products',
    ADMIN_PRODUCTS_EDIT: (id:string)=>`/admin/products/${id}`,
    ADMIN_CATEGORIES: '/admin/categories',
    ADMIN_CATEGORIES_EDIT: (id:string)=>`/admin/categories/${id}`,
}