export type Status = "active" | "inactive" | "pending" | "voided" | "completed";

export interface RawMaterial {
  id: string;
  name: string;
  unit: string;
  currentStock: number;
  minAlertLevel: number;
  costPerUnit?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductRecipeItem {
  id?: string;
  rawMaterialId: string;
  quantity: number;
  unit: string;
  rawMaterialName?: string;
  rawMaterialCurrentStock?: number;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Product {
  id: string;
  name: string;
  category?: string; // Flattened name
  categoryObj?: Category;
  categoryId?: string; // ID for form binding
  price: number;
  description?: string;
  imageUrl?: string;
  status: Status;
  recipe: ProductRecipeItem[];
  availableStock: number;
  limitedBy?: string;
}

export interface ProductSummary {
  id: string;
  name: string;
  canMake: number;
  requiredMaterials: Array<{
    materialName: string;
    need: number;
    have: number;
    shortage: number;
  }>;
}

export interface OrderLineItem {
  id?: string;
  productId: string;
  productName?: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  timestamp: string;
  items: OrderLineItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paymentMethod: "cash" | "card";
  changeGiven?: number;
  customerName?: string;
  processedBy?: string;
  status: Status;
}

export interface DashboardSummary {
  totalSalesToday: number;
  ordersToday: number;
  totalProducts: number;
  lowStockAlertCount: number;
  productsAtRisk: ProductSummary[];
  chartData: Array<{ date: string; revenue: number; orders?: number }>;
  topProducts?: Array<{ name: string; units: number }>;
  inventoryStatus: RawMaterial[];
}

export interface StockHistoryEvent {
  id: string;
  timestamp: string;
  eventType: "Sale" | "Restock" | "Manual";
  materialId: string;
  quantityChange: number;
  resultingStock: number;
  reference: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: "admin" | "cashier";
  status: Status;
  createdAt?: string;
}

export interface AppConfig {
  businessName: string;
  currencySymbol: string;
  taxRate: number;
  emailAlerts: boolean;
  alertEmail: string;
}

export interface AuthToken {
  accessToken: string;
  expiresIn: number;
  refreshToken?: string;
}
