import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ProductImage } from "@/components/ProductImage";
import { Rating } from "@/components/Rating";
import { formatPrice, type Product } from "@/data/products";
import { useShop } from "@/lib/shop-store";

export function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useShop();

  return (
    <article className="flex flex-col rounded-lg border border-border bg-card p-3">
      <Link to="/product/$productId" params={{ productId: product.id }}>
        <ProductImage icon={product.icon} name={product.name} />
      </Link>
      <div className="mt-3 flex flex-1 flex-col gap-2">
        <h3 className="line-clamp-2 text-sm font-medium text-card-foreground">
          {product.name}
        </h3>
        <Rating value={product.rating} reviews={product.reviews} />
        <p className="text-lg font-semibold text-card-foreground">
          {formatPrice(product.price)}
        </p>
        {!product.inStock && (
          <p className="text-xs font-medium text-destructive">Out of stock</p>
        )}
        <div className="mt-auto flex gap-2 pt-2">
          <Button
            size="sm"
            className="flex-1"
            disabled={!product.inStock}
            onClick={() => {
              addToCart(product.id);
              toast.success("Added to cart");
            }}
          >
            Add to Cart
          </Button>
          <Button size="sm" variant="outline" className="flex-1" asChild>
            <Link to="/product/$productId" params={{ productId: product.id }}>
              View Details
            </Link>
          </Button>
        </div>
      </div>
    </article>
  );
}
