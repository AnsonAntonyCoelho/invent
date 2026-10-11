// CLASS: all the inventory rules live here (no DOM code).
import { Product, ProductId, StockFilter } from "./types.js";
import { calculateDiscountedPrice, createCounter } from "./helpers.js";

export class ProductInventoryManager {
  // private = only code inside this class can touch these (class scope).
  private products: Product[] = [];
  private readonly nextAutoId: () => number = createCounter(1001);

  // rawId may be left out (undefined): then an unused number is chosen for you.
  addProduct(
    rawId: ProductId | undefined,
    name: string,
    price: number,
    inStock: boolean,
    tags: string[] = [],
  ): Product {
    const cleanName: string = name.trim();
    if (cleanName === "") throw new Error("Product name is required");
    if (!Number.isFinite(price) || price < 0) {
      throw new Error("Price must be a number, 0 or more");
    }

    const id: ProductId = rawId ?? this.createFreeId();
    if (this.findById(id) !== undefined) {
      throw new Error(`ID ${id} is already used by another product`);
    }

    const product: Product = { id, name: cleanName, price, inStock, tags, discountPercent: 0 };
    this.products.push(product);
    return product;
  }

  removeProduct(id: ProductId): boolean {
    const countBefore = this.products.length;
    this.products = this.products.filter((product) => product.id !== id);
    return this.products.length < countBefore;
  }

  // Flip In Stock / Out of Stock for one product.
  toggleStock(id: ProductId): boolean {
    const product = this.findById(id);
    if (product === undefined) return false;
    product.inStock = !product.inStock;
    return true;
  }

  // Sets the same discount on every product.
  applyDiscountToAll(percent: number): void {
    if (!Number.isFinite(percent) || percent < 0 || percent > 100) {
      throw new Error("Discount must be a number from 0 to 100");
    }
    for (const product of this.products) {
      product.discountPercent = percent;
    }
  }

  findById(id: ProductId): Product | undefined {
    return this.products.find((product) => product.id === id);
  }

  // Returns a copy so outside code cannot reorder or empty our private list.
  getProducts(filter: StockFilter = "all"): Product[] {
    if (filter === "available") {
      return this.products.filter((product) => product.inStock);
    }
    return [...this.products];
  }

  getDiscountedPrice(product: Product): number {
    return calculateDiscountedPrice(product.price, product.discountPercent);
  }

  // private helper: keeps asking the counter until it finds an unused number.
  private createFreeId(): number {
    let id = this.nextAutoId();
    while (this.findById(id) !== undefined) {
      id = this.nextAutoId();
    }
    return id;
  }
}
