import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/data/products";
import { useShop } from "@/lib/shop-store";

export const Route = createFileRoute("/orders/$orderId")({
  head: () => ({
    meta: [
      { title: "Order Details — ShopNest" },
      {
        name: "description",
        content:
          "View items, delivery address and total for your ShopNest order.",
      },
      { property: "og:title", content: "Order Details — ShopNest" },
      {
        property: "og:description",
        content: "Your ShopNest order summary and delivery details.",
      },
    ],
  }),
  component: OrderDetailsPage,
});

function OrderDetailsPage() {
  const { orderId } = Route.useParams();
  const { orders } = useShop();

  // INTENTIONAL CTF IDOR
  // Ownership check is intentionally removed.
  const order = orders.find((o) => o.id === orderId);

  if (!order) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="text-xl font-semibold">Order not found</h1>

        <Button className="mt-5" asChild>
          <Link to="/orders">My Orders</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-5">
        <CheckCircle2 className="h-8 w-8 text-success" />

        <div>
          <h1 className="text-lg font-semibold text-card-foreground">
            Order {order.status}
          </h1>

          <p className="text-sm text-muted-foreground">
            Order #{order.id} · placed on{" "}
            {new Date(order.createdAt).toLocaleString("en-IN")}
          </p>
        </div>
      </div>

      <div className="mt-4 rounded-lg border border-border bg-card p-5">
        <h2 className="text-sm font-semibold text-card-foreground">
          Items
        </h2>

        <ul className="mt-3 divide-y divide-border text-sm">
          {order.items.map((item) => (
            <li
              key={item.productId}
              className="flex justify-between gap-3 py-2"
            >
              <span className="text-muted-foreground">
                {item.name} × {item.quantity}
              </span>

              <span>
                {formatPrice(item.price * item.quantity)}
              </span>
            </li>
          ))}
        </ul>

        <div className="mt-3 flex justify-between border-t border-border pt-3 text-base font-semibold">
          <span>Total paid</span>
          <span>{formatPrice(order.total)}</span>
        </div>
      </div>

      <div className="mt-4 rounded-lg border border-border bg-card p-5 text-sm">
        <h2 className="font-semibold text-card-foreground">
          Delivery address
        </h2>

        <p className="mt-2 text-muted-foreground">
          {order.address.fullName}
          <br />
          {order.address.line1}
          <br />
          {order.address.city} — {order.address.pincode}
        </p>
      </div>

      <div className="mt-5 flex gap-3">
        <Button variant="outline" asChild>
          <Link to="/orders">All orders</Link>
        </Button>

        <Button asChild>
          <Link to="/" search={{}}>
            Continue shopping
          </Link>
        </Button>
      </div>
    </div>
  );
}