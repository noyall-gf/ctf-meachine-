import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductImage } from "@/components/ProductImage";
import { Rating } from "@/components/Rating";
import { formatPrice, getProduct } from "@/data/products";
import { useShop } from "@/lib/shop-store";

export const Route = createFileRoute("/product/$productId")({
  head: ({ params }) => {
    const product = getProduct(params.productId);
    const title = product ? `${product.name} — ShopNest` : "Product not found — ShopNest";
    const description =
      product?.description ?? "This ShopNest product could not be found.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
  component: ProductDetails,
});

function ProductDetails() {
  const { productId } = Route.useParams();
  const product = getProduct(productId);
  const { addToCart } = useShop();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);

  if (!product) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="text-xl font-semibold">Product not found</h1>
        <Button className="mt-4" asChild>
          <Link to="/" search={{}}>Back to shop</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="grid gap-8 rounded-lg border border-border bg-card p-6 md:grid-cols-2">
        <ProductImage icon={product.icon} name={product.name} size="lg" />

        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {product.category}
          </p>
          <h1 className="mt-1 text-2xl font-semibold text-card-foreground">
            {product.name}
          </h1>
          <div className="mt-2">
            <Rating value={product.rating} reviews={product.reviews} />
          </div>
          <p className="mt-4 text-3xl font-semibold text-card-foreground">
            {formatPrice(product.price)}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">Inclusive of all taxes</p>

          <p className="mt-4 text-sm leading-relaxed text-card-foreground">
            {product.description}
          </p>

          <p
            className={`mt-4 text-sm font-medium ${
              product.inStock ? "text-success" : "text-destructive"
            }`}
          >
            {product.inStock ? "In stock — ships in 2 days" : "Out of stock"}
          </p>

          <div className="mt-5 flex items-center gap-3">
            <span className="text-sm font-medium">Quantity</span>
            <div className="flex items-center rounded-md border border-border">
              <Button
                variant="ghost"
                size="icon"
                aria-label="Decrease quantity"
                onClick={() => setQuantity((n) => Math.max(1, n - 1))}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-10 text-center text-sm">{quantity}</span>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Increase quantity"
                onClick={() => setQuantity((n) => Math.min(10, n + 1))}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Button
              disabled={!product.inStock}
              onClick={() => {
                addToCart(product.id, quantity);
                toast.success("Added to cart");
              }}
            >
              Add to Cart
            </Button>
            <Button
              variant="accent"
              disabled={!product.inStock}
              onClick={() => {
                addToCart(product.id, quantity);
                navigate({ to: "/checkout" });
              }}
            >
              Buy Now
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
