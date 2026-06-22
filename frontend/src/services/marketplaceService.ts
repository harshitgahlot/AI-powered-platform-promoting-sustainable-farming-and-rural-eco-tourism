import api from './api';

export interface ProductImage {
  id: number;
  url: string;
}

export interface Product {
  id: number;
  farm_id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  status: string;
  created_at: string;
  images: ProductImage[];
}

export interface ProductListResponse {
  items: Product[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface CartItem {
  id: number;
  cart_id: number;
  product_id: number;
  quantity: number;
  product: Product;
}

export interface Cart {
  id: number;
  user_id: number;
  created_at: string;
  items: CartItem[];
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  price: number;
  product: Product;
}

export interface Order {
  id: number;
  tourist_id: number;
  total_price: number;
  status: string;
  created_at: string;
  items: OrderItem[];
}

export const marketplaceService = {
  // Product Catalog
  listProducts: async (params?: { page?: number; limit?: number; search?: string; category?: string; status?: string; sort?: string }): Promise<ProductListResponse> => {
    const res = await api.get('/marketplace/products', { params });
    return res.data;
  },
  getProduct: async (id: number): Promise<Product> => {
    const res = await api.get(`/marketplace/products/${id}`);
    return res.data;
  },
  createProduct: async (data: Partial<Product>): Promise<Product> => {
    const res = await api.post('/marketplace/products', data);
    return res.data;
  },
  updateProduct: async (id: number, data: Partial<Product>): Promise<Product> => {
    const res = await api.put(`/marketplace/products/${id}`, data);
    return res.data;
  },
  uploadProductImage: async (id: number, file: File): Promise<ProductImage> => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.post(`/marketplace/products/${id}/upload-image`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
  },
  approveProduct: async (id: number, status: string): Promise<Product> => {
    const res = await api.put(`/marketplace/products/${id}/approve`, { status });
    return res.data;
  },
  
  // Shopping Cart
  getCart: async (): Promise<Cart> => {
    const res = await api.get('/marketplace/cart');
    return res.data;
  },
  addToCart: async (productId: number, quantity: number = 1): Promise<Cart> => {
    const res = await api.post('/marketplace/cart/items', { product_id: productId, quantity });
    return res.data;
  },
  updateCartItem: async (productId: number, quantity: number): Promise<Cart> => {
    const res = await api.put(`/marketplace/cart/items/${productId}`, { quantity });
    return res.data;
  },
  removeFromCart: async (productId: number): Promise<Cart> => {
    const res = await api.delete(`/marketplace/cart/items/${productId}`);
    return res.data;
  },
  
  // Checkout & Orders
  checkout: async (): Promise<Order> => {
    const res = await api.post('/marketplace/checkout');
    return res.data;
  },
  listOrders: async (): Promise<Order[]> => {
    const res = await api.get('/marketplace/orders');
    return res.data;
  },
  getOrder: async (id: number): Promise<Order> => {
    const res = await api.get(`/marketplace/orders/${id}`);
    return res.data;
  }
};
