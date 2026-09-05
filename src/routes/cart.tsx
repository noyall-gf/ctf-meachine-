import { createFileRoute, Link } from "@tanstack/react-router";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductImage } from "@/components/ProductImage";
import { formatPrice, getProduct } from "@/data/products";
import { useShop } from "@/lib/shop-store";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Your Cart — ShopNest" },
      { name: "description", content: "Review the items in your ShopNest cart before checkout." },
      { property: "og:title", content: "Your Cart — ShopNest" },
      { property: "og:description", content: "Review your ShopNest cart items and total." },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const { cart, cartTotal, labFlag, updateQuantity, removeFromCart } = useShop();

  if (cart.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="text-xl font-semibold text-foreground">Your cart is empty</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Add a few products to get started.
        </p>
        <Button className="mt-5" asChild>
          <Link to="/" search={{}}>Continue shopping</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <h1 className="text-xl font-semibold text-foreground">Your Cart</h1>
      {labFlag && (
        <div className="mt-4 rounded-lg border border-success/40 bg-success/10 p-4">
          <p className="text-sm font-semibold text-foreground">Challenge solved</p>
          <p className="mt-2 break-all font-mono text-sm text-foreground">{labFlag}</p>
        </div>
      )}
      <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="divide-y divide-border rounded-lg border border-border bg-card">
          {cart.map((item) => {
            const product = getProduct(item.productId);
            if (!product) return null;
            return (
              <div key={item.productId} className="flex items-center gap-4 p-4">
                <div className="w-16 shrink-0">
                  <ProductImage icon={product.icon} name={product.name} size="sm" />
                </div>
                <div className="min-w-0 flex-1">
                  <Link
                    to="/product/$productId"
                    params={{ productId: product.id }}
                    className="text-sm font-medium text-card-foreground hover:text-primary"
                  >
                    {product.name}
                  </Link>
                  <p className="text-sm text-muted-foreground">
                    {formatPrice(item.price)} each
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <label className="sr-only" htmlFor={`qty-${product.id}`}>
                    Quantity for {product.name}
                  </label>
                  <select
                    id={`qty-${product.id}`}
                    value={item.quantity}
                    onChange={(e) => updateQuantity(product.id, Number(e.target.value))}
                    className="h-8 rounded-md border border-input bg-background px-2 text-sm"
                  >
                    {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                </div>
                <p className="w-24 text-right text-sm font-semibold text-card-foreground">
                  {formatPrice(item.price * item.quantity)}
                </p>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Remove ${product.name}`}
                  onClick={() => removeFromCart(product.id)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            );
          })}
        </div>

        <aside className="h-fit rounded-lg border border-border bg-card p-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Price Details
          </h2>
          <div className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Items total</span>
              <span>{formatPrice(cartTotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Delivery</span>
              <span className="text-success">Free</span>
            </div>
            <div className="flex justify-between border-t border-border pt-2 text-base font-semibold">
              <span>Total</span>
              <span>{formatPrice(cartTotal)}</span>
            </div>
          </div>
          <Button className="mt-4 w-full" asChild>
            <Link to="/checkout">Checkout</Link>
          </Button>
        </aside>
      </div>
    </div>
  );
}
