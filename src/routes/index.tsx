import { createFileRoute, Link } from "@tanstack/react-router";
import { Truck, ShieldCheck, RotateCcw } from "lucide-react";
import { ProductCard } from "@/components/ProductCard";
import { categories, products } from "@/data/products";

type HomeSearch = { q?: string | undefined; category?: string | undefined };

export const Route = createFileRoute("/")({
  validateSearch: (search: Record<string, unknown>): HomeSearch => ({
    q: typeof search["q"] === "string" && search["q"] ? search["q"] : undefined,
    category:
      typeof search["category"] === "string" && search["category"]
        ? search["category"]
        : undefined,
  }),

  head: () => ({
    meta: [
      { title: "ShopNest — Simple Online Shopping for Tech & Everyday Gear" },
      {
        name: "description",
        content:
          "ShopNest is a fictional online store with headphones, smart watches, keyboards, backpacks and more at simple, honest prices.",
      },
      { property: "og:title", content: "ShopNest — Simple Online Shopping" },
      {
        property: "og:description",
        content: "Browse 16 fictional tech and lifestyle products on ShopNest.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  const { q, category } = Route.useSearch();

  const visible = products.filter((p) => {
    const matchesCategory = !category || p.category === category;
    const matchesQuery =
      !q ||
      p.name.toLowerCase().includes(q.toLowerCase()) ||
      p.category.toLowerCase().includes(q.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <section className="flex flex-col gap-4 rounded-lg bg-primary/10 p-6 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">
            ShopNest Weekly Deals
          </p>
          <h1 className="mt-1 text-2xl font-semibold text-foreground">
            Up to 40% off on tech essentials
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Fictional store, fictional prices — free delivery on every order.
          </p>
        </div>
        <div className="flex gap-6 text-sm text-muted-foreground">
          <span className="flex items-center gap-2">
            <Truck className="h-4 w-4 text-primary" /> Free delivery
          </span>
          <span className="flex items-center gap-2">
            <RotateCcw className="h-4 w-4 text-primary" /> 7-day returns
          </span>
          <span className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-primary" /> 1-year warranty
          </span>
        </div>
      </section>

      <section className="mt-6">
        <h2 className="text-sm font-semibold text-foreground">Shop by category</h2>
        <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-5">
          {categories.map((c) => (
            <Link
              key={c}
              to="/"
              search={{ category: c }}
              className={`rounded-lg border bg-card px-4 py-3 text-center text-sm font-medium transition-colors hover:border-primary ${
                category === c ? "border-primary text-primary" : "border-border"
              }`}
            >
              {c}
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <div className="flex items-baseline justify-between">
          <h2 className="text-lg font-semibold text-foreground">
            {category ? category : q ? `Results for "${q}"` : "All products"}
          </h2>
          <span className="text-sm text-muted-foreground">{visible.length} items</span>
        </div>
        {visible.length === 0 ? (
          <p className="mt-6 text-sm text-muted-foreground">
            No products matched. <Link to="/" search={{}} className="text-primary underline">Clear filters</Link>
          </p>
        ) : (
          <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {visible.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
