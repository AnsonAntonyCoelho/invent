// BROWSER CODE: connects the page (DOM) to the ProductInventoryManager class.
import { ProductInventoryManager } from "./inventory.js";
import { Product, StockFilter } from "./types.js";
import { formatPrice, parseProductId, parseTags } from "./helpers.js";

// Module scope: visible to every function in this file, and nowhere else.
const manager = new ProductInventoryManager();
let activeFilter: StockFilter = "all";

// Generic function: the caller says which kind of element it expects back.
function getElement<T extends HTMLElement>(id: string): T {
  const element = document.getElementById(id);
  if (element === null) throw new Error(`#${id} is missing from index.html`);
  return element as T;
}

const form = getElement<HTMLFormElement>("product-form");
const idField = getElement<HTMLInputElement>("product-id");
const nameField = getElement<HTMLInputElement>("product-name");
const priceField = getElement<HTMLInputElement>("product-price");
const tagsField = getElement<HTMLInputElement>("product-tags");
const stockField = getElement<HTMLInputElement>("product-instock");
const showAllButton = getElement<HTMLButtonElement>("filter-all");
const availableButton = getElement<HTMLButtonElement>("filter-available");
const discountField = getElement<HTMLInputElement>("discount-input");
const discountButton = getElement<HTMLButtonElement>("discount-apply");
const tableBody = getElement<HTMLTableSectionElement>("product-rows");
const countLabel = getElement<HTMLElement>("product-count");
const messageBox = getElement<HTMLElement>("message");

function showMessage(text: string, isError: boolean = false): void {
  messageBox.textContent = text;
  messageBox.className = isError ? "error" : "ok";
}

function makeCell(text: string): HTMLTableCellElement {
  const cell = document.createElement("td");
  cell.textContent = text; // textContent, not innerHTML: typed text is never run as HTML
  return cell;
}

function buildRow(product: Product): HTMLTableRowElement {
  const row = document.createElement("tr");

  row.appendChild(makeCell(String(product.id)));
  row.appendChild(makeCell(product.name));
  row.appendChild(makeCell(formatPrice(product.price)));

  // Status badge: clicking it flips the stock state.
  const statusCell = document.createElement("td");
  const badge = document.createElement("button");
  badge.type = "button";
  badge.className = product.inStock ? "badge in" : "badge out";
  badge.textContent = product.inStock ? "In Stock" : "Out of Stock";
  badge.title = "Click to change stock status";
  badge.addEventListener("click", () => {
    manager.toggleStock(product.id); // closure: this handler remembers "product"
    render();
  });
  statusCell.appendChild(badge);
  row.appendChild(statusCell);

  // Tags as small chips.
  const tagsCell = document.createElement("td");
  for (const tag of product.tags) {
    const chip = document.createElement("span");
    chip.className = "chip";
    chip.textContent = tag;
    tagsCell.appendChild(chip);
  }
  row.appendChild(tagsCell);

  const discounted = manager.getDiscountedPrice(product);
  row.appendChild(makeCell(`${formatPrice(discounted)} (${product.discountPercent}% off)`));

  const actionCell = document.createElement("td");
  const removeButton = document.createElement("button");
  removeButton.type = "button";
  removeButton.className = "remove";
  removeButton.textContent = "Remove";
  removeButton.addEventListener("click", () => {
    manager.removeProduct(product.id);
    showMessage(`Removed ${product.name}`);
    render();
  });
  actionCell.appendChild(removeButton);
  row.appendChild(actionCell);

  return row;
}

function render(): void {
  const visible = manager.getProducts(activeFilter);
  const total = manager.getProducts("all").length;

  tableBody.innerHTML = "";
  for (const product of visible) {
    tableBody.appendChild(buildRow(product));
  }
  if (visible.length === 0) {
    const emptyRow = document.createElement("tr");
    const emptyCell = makeCell("No products to show.");
    emptyCell.colSpan = 7;
    emptyRow.appendChild(emptyCell);
    tableBody.appendChild(emptyRow);
  }

  countLabel.textContent = `Showing ${visible.length} of ${total}`;
  showAllButton.setAttribute("aria-pressed", String(activeFilter === "all"));
  availableButton.setAttribute("aria-pressed", String(activeFilter === "available"));
}

function setFilter(filter: StockFilter): void {
  activeFilter = filter;
  render();
}

form.addEventListener("submit", (event: Event) => {
  event.preventDefault();
  try {
    const product = manager.addProduct(
      parseProductId(idField.value),
      nameField.value,
      Number(priceField.value),
      stockField.checked,
      parseTags(tagsField.value),
    );
    showMessage(`Added ${product.name} (ID ${product.id})`);
    form.reset();
    stockField.checked = true; // reset() would also do this; kept explicit for clarity
    render();
  } catch (error) {
    showMessage(error instanceof Error ? error.message : "Something went wrong", true);
  }
});

discountButton.addEventListener("click", () => {
  try {
    const raw = discountField.value.trim();
    const percent = raw === "" ? NaN : Number(raw);
    manager.applyDiscountToAll(percent);
    showMessage(`Applied a ${percent}% discount to all products`);
    render();
  } catch (error) {
    showMessage(error instanceof Error ? error.message : "Something went wrong", true);
  }
});

showAllButton.addEventListener("click", () => setFilter("all"));
availableButton.addEventListener("click", () => setFilter("available"));

// Starting data so the page is not empty on first load.
manager.addProduct(201, "A5 Notebook", 120, true, ["Stationery", "Paper"]);
manager.addProduct("P-202", "Desk Lamp", 799.5, true, ["Home", "Lighting"]);
manager.addProduct(203, "Bluetooth Speaker", 1499, false, ["Audio"]);
manager.addProduct("P-204", "Steel Water Bottle", 349, true, ["Home", "Outdoor"]);
render();
