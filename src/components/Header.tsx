import { Link, useNavigate } from "@tanstack/react-router";
import {
  LogOut,
  Package,
  Search,
  ShoppingCart,
  Store,
  User,
} from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { categories } from "@/data/products";
import { useShop } from "@/lib/shop-store";

export function Header() {
  const { user, cartCount, logout } = useShop();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  return (
    <header className="sticky top-0 z-40 bg-primary text-primary-foreground">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3">

        {/* ShopNest Logo */}
        <Link
          to="/"
          className="flex items-center gap-2 font-semibold"
        >
          <Store className="h-6 w-6" />
          <span className="text-xl tracking-tight">
            ShopNest
          </span>
        </Link>

        {/* Search */}
        <form
          className="relative flex-1 max-w-xl"
          onSubmit={(e) => {
            e.preventDefault();

            navigate({
              to: "/",
              search: {
                q: query || undefined,
              },
            });
          }}
        >
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for products, brands and more"
            aria-label="Search products"
            className="bg-card pl-9 text-card-foreground"
          />
        </form>

        {/* Right side */}
        <nav className="ml-auto flex items-center gap-1">

          {user ? (
            <DropdownMenu>

              {/* LOGGED-IN ACCOUNT */}
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghostOnPrimary"
                  size="sm"
                  className="max-w-[180px]"
                >
                  <User className="mr-1 h-4 w-4 shrink-0" />

                  <span className="max-w-[140px] truncate">
                    {user.name}
                  </span>
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="end"
                className="w-64"
              >

                {/* ONLY NAME + EMAIL */}
                <div className="px-3 py-3">
                  <p className="text-sm font-semibold text-foreground truncate">
                    {user.name}
                  </p>

                  <p className="mt-1 text-xs text-muted-foreground truncate">
                    {user.email}
                  </p>
                </div>

                <div className="border-t" />

                <DropdownMenuItem asChild>
                  <Link to="/profile">
                    <User className="mr-2 h-4 w-4" />
                    My Profile
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                  <Link to="/orders">
                    <Package className="mr-2 h-4 w-4" />
                    My Orders
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => {
                    logout();
                    navigate({ to: "/" });
                  }}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>

              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              variant="onPrimary"
              size="sm"
              asChild
            >
              <Link to="/login">
                Login
              </Link>
            </Button>
          )}

          {/* Cart */}
          <Button
            variant="ghostOnPrimary"
            size="sm"
            asChild
          >
            <Link
              to="/cart"
              className="relative"
            >
              <ShoppingCart className="mr-1 h-4 w-4" />

              Cart

              {cartCount > 0 && (
                <span className="ml-1 rounded-full bg-accent px-1.5 text-xs font-semibold text-accent-foreground">
                  {cartCount}
                </span>
              )}
            </Link>
          </Button>

        </nav>
      </div>

      {/* Categories */}
      <div className="border-t border-primary-foreground/15">
        <div className="mx-auto flex max-w-7xl items-center gap-6 overflow-x-auto px-4 py-2 text-sm">

          <Link
            to="/"
            search={{ q: undefined }}
            className="whitespace-nowrap opacity-90 hover:opacity-100"
          >
            All Products
          </Link>

          {categories.map((category) => (
            <Link
              key={category}
              to="/"
              search={{ category }}
              className="whitespace-nowrap opacity-90 hover:opacity-100"
            >
              {category}
            </Link>
          ))}

        </div>
      </div>
    </header>
  );
}