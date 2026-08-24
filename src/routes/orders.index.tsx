import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/data/products";
import { useShop } from "@/lib/shop-store";

export const Route = createFileRoute("/orders/")({
  head: () => ({
    meta: [
      { title: "My Orders — ShopNest" },
      { name: "description", content: "Track your ShopNest orders and view past purchases." },
      { property: "og:title", content: "My Orders — ShopNest" },
      { property: "og:description", content: "All of your ShopNest orders in one place." },
    ],
  }),
  component: OrdersPage,
});

function OrdersPage() {
  const { user, orders } = useShop();

  if (!user) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="text-xl font-semibold">Login to see your orders</h1>
        <Button className="mt-5" asChild>
          <Link to="/login">Login</Link>
        </Button>
      </div>
    );
  }

  const myOrders = orders.filter((o) => o.userId === user.id);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-xl font-semibold text-foreground">My Orders</h1>
      {myOrders.length === 0 ? (
        <div className="mt-6 rounded-lg border border-border bg-card p-8 text-center">
          <p className="text-sm text-muted-foreground">You have no orders yet.</p>
          <Button className="mt-4" asChild>
            <Link to="/" search={{}}>Start shopping</Link>
          </Button>
        </div>
      ) : (
        <ul className="mt-4 space-y-3">
          {myOrders.map((order) => (
            <li
              key={order.id}
              className="flex flex-wrap items-center gap-4 rounded-lg border border-border bg-card p-4"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-card-foreground">
                  Order #{order.id}
                </p>
                <p className="text-sm text-muted-foreground">
                  {new Date(order.createdAt).toLocaleDateString("en-IN")} ·{" "}
                  {order.items.length} item(s) · {order.status}
                </p>
              </div>
              <p className="text-sm font-semibold">{formatPrice(order.total)}</p>
              <Button variant="outline" size="sm" asChild>
                <Link to="/orders/$orderId" params={{ orderId: order.id }}>
                  View Details
                </Link>
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
