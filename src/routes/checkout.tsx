import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatPrice, getProduct } from "@/data/products";
import { useShop } from "@/lib/shop-store";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — ShopNest" },
      { name: "description", content: "Confirm your delivery address and place your ShopNest order." },
      { property: "og:title", content: "Checkout — ShopNest" },
      { property: "og:description", content: "Place a fictional ShopNest order — no real payment." },
    ],
  }),
  component: CheckoutPage,
});

function CheckoutPage() {
  const { cart, cartTotal, user, placeOrder } = useShop();
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: "", line1: "", city: "", pincode: "" });
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "store-credit">("cod");
  const [paymentError, setPaymentError] = useState<string | null>(null);

  if (!user) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="text-xl font-semibold">Login to continue</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          You need an account to place an order.
        </p>
        <Button className="mt-5" asChild>
          <Link to="/login">Login</Link>
        </Button>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="text-xl font-semibold">Nothing to check out</h1>
        <Button className="mt-5" asChild>
          <Link to="/" search={{}}>Browse products</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <h1 className="text-xl font-semibold text-foreground">Checkout</h1>
      <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_320px]">
        <form
          className="rounded-lg border border-border bg-card p-5"
          onSubmit={(e) => {
            e.preventDefault();
            setPaymentError(null);
            if (paymentMethod === "store-credit" && user.storeCredit < cartTotal) {
              setPaymentError("You do not have enough store credit for this order.");
              return;
            }
            const order = placeOrder(form, paymentMethod);
            if (order) navigate({ to: "/orders/$orderId", params: { orderId: order.id } });
          }}
        >
          <h2 className="text-sm font-semibold text-card-foreground">Delivery address</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <Label htmlFor="fullName">Full name</Label>
              <Input
                id="fullName"
                required
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="line1">Address</Label>
              <Input
                id="line1"
                required
                value={form.line1}
                onChange={(e) => setForm({ ...form, line1: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                required
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="pincode">Pincode</Label>
              <Input
                id="pincode"
                required
                value={form.pincode}
                onChange={(e) => setForm({ ...form, pincode: e.target.value })}
              />
            </div>
          </div>

          <fieldset className="mt-5 space-y-3">
            <legend className="text-sm font-semibold text-card-foreground">Payment method</legend>
            <label className="flex cursor-pointer items-center gap-3 rounded-md border border-border p-3 text-sm">
              <input
                type="radio"
                name="paymentMethod"
                value="cod"
                checked={paymentMethod === "cod"}
                onChange={() => setPaymentMethod("cod")}
              />
              Cash on Delivery
            </label>
            <label className="flex cursor-pointer items-center gap-3 rounded-md border border-border p-3 text-sm">
              <input
                type="radio"
                name="paymentMethod"
                value="store-credit"
                checked={paymentMethod === "store-credit"}
                onChange={() => setPaymentMethod("store-credit")}
              />
              Store Credit ({formatPrice(user.storeCredit)} available)
            </label>
          </fieldset>

          {paymentError && <p className="mt-4 text-sm text-destructive">{paymentError}</p>}

          <Button type="submit" className="mt-5 w-full md:w-auto">
            Place Order
          </Button>
        </form>

        <aside className="h-fit rounded-lg border border-border bg-card p-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Order summary
          </h2>
          <ul className="mt-3 space-y-2 text-sm">
            {cart.map((item) => {
              const product = getProduct(item.productId);
              if (!product) return null;
              return (
                <li key={item.productId} className="flex justify-between gap-2">
                  <span className="min-w-0 truncate text-muted-foreground">
                    {product.name} × {item.quantity}
                  </span>
                  <span>{formatPrice(item.price * item.quantity)}</span>
                </li>
              );
            })}
          </ul>
          <div className="mt-3 flex justify-between border-t border-border pt-2 text-base font-semibold">
            <span>Total</span>
            <span>{formatPrice(cartTotal)}</span>
          </div>
        </aside>
      </div>
    </div>
  );
}
