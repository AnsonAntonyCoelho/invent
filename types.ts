// BASIC TYPES + INTERFACES

// Union type: a product ID can be a number (101) or a string ("P-102").
export type ProductId = number | string;

// Literal union: the list can only be filtered in these two ways.
export type StockFilter = "all" | "available";

// Interface describing one product.
// "readonly" means the id is set once and can never be changed afterwards.
export interface Product {
  readonly id: ProductId;
  name: string; // string
  price: number; // number
  inStock: boolean; // boolean
  tags: string[]; // array of strings
  discountPercent: number; // 0 to 100
}
