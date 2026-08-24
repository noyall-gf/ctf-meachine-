import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { getProduct } from "@/data/products";

/**
 * Lightweight fictional shop state.
 * User-specific carts are stored separately in localStorage.
 */

export type User = {
  id: string;
  name: string;
  email: string;
};

export type CartItem = {
  productId: string;
  quantity: number;
};

export type Order = {
  id: string;
  userId: string;
  createdAt: string;
  status: string;
  items: {
    productId: string;
    name: string;
    price: number;
    quantity: number;
  }[];
  total: number;
  address: {
    fullName: string;
    line1: string;
    city: string;
    pincode: string;
  };
};

type StoredAccount = User & {
  password: string;
};

type ShopState = {
  user: User | null;
  cart: CartItem[];
  orders: Order[];
  cartCount: number;
  cartTotal: number;
  register: (
    name: string,
    email: string,
    password: string,
  ) => string | null;
  login: (
    email: string,
    password: string,
  ) => string | null;
  logout: () => void;
  addToCart: (
    productId: string,
    quantity?: number,
  ) => void;
  updateQuantity: (
    productId: string,
    quantity: number,
  ) => void;
  removeFromCart: (
    productId: string,
  ) => void;
  clearCart: () => void;
  placeOrder: (
    address: Order["address"],
  ) => Order | null;
};

const KEYS = {
  accounts: "shopnest.accounts",
  session: "shopnest.session",
  orders: "shopnest.orders",
};

function cartKey(userId: string) {
  return `shopnest.cart.${userId}`;
}

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") {
    return fallback;
  }

  try {
    const raw = window.localStorage.getItem(key);

    return raw
      ? (JSON.parse(raw) as T)
      : fallback;
  } catch {
    return fallback;
  }
}

function write(
  key: string,
  value: unknown,
) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(
    key,
    JSON.stringify(value),
  );
}

const globalStore = globalThis as unknown as {
  __shopnestContext?: React.Context<
    ShopState | null
  >;
};

const ShopContext =
  globalStore.__shopnestContext ??
  (globalStore.__shopnestContext =
    createContext<ShopState | null>(null));

export function ShopProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [user, setUser] =
    useState<User | null>(null);

  const [cart, setCart] =
    useState<CartItem[]>([]);

  const [orders, setOrders] =
    useState<Order[]>([]);

  /*
   * Load current session and that user's cart.
   */
  useEffect(() => {
    const session = read<User | null>(
      KEYS.session,
      null,
    );

    setUser(session);

    if (session) {
      setCart(
        read<CartItem[]>(
          cartKey(session.id),
          [],
        ),
      );
    } else {
      setCart([]);
    }

    setOrders(
      read<Order[]>(
        KEYS.orders,
        [],
      ),
    );
  }, []);

  /*
   * Persist cart for the CURRENT user only.
   */
  const persistCart = useCallback(
    (next: CartItem[]) => {
      if (!user) {
        return;
      }

      setCart(next);

      write(
        cartKey(user.id),
        next,
      );
    },
    [user],
  );

  /*
   * Register
   */
  const register = useCallback(
    (
      name: string,
      email: string,
      password: string,
    ) => {
      const accounts =
        read<StoredAccount[]>(
          KEYS.accounts,
          [],
        );

      const normalized =
        email.trim().toLowerCase();

      if (
        accounts.some(
          (account) =>
            account.email === normalized,
        )
      ) {
        return "An account with this email already exists.";
      }

      const account: StoredAccount = {
        id: `u_${Date.now()}`,
        name: name.trim(),
        email: normalized,
        password,
      };

      write(
        KEYS.accounts,
        [...accounts, account],
      );

      const session: User = {
        id: account.id,
        name: account.name,
        email: account.email,
      };

      write(
        KEYS.session,
        session,
      );

      setUser(session);

      /*
       * New user starts with an empty cart.
       */
      const existingCart =
        read<CartItem[]>(
          cartKey(session.id),
          [],
        );

      setCart(existingCart);

      return null;
    },
    [],
  );

  /*
   * Login
   */
  const login = useCallback(
    (
      email: string,
      password: string,
    ) => {
      const accounts =
        read<StoredAccount[]>(
          KEYS.accounts,
          [],
        );

      const found = accounts.find(
        (account) =>
          account.email ===
            email.trim().toLowerCase() &&
          account.password === password,
      );

      if (!found) {
        return "Invalid email or password.";
      }

      const session: User = {
        id: found.id,
        name: found.name,
        email: found.email,
      };

      write(
        KEYS.session,
        session,
      );

      setUser(session);

      /*
       * IMPORTANT:
       * Load ONLY this user's cart.
       */
      const userCart =
        read<CartItem[]>(
          cartKey(session.id),
          [],
        );

      setCart(userCart);

      return null;
    },
    [],
  );

  /*
   * Logout
   */
  const logout = useCallback(() => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(
        KEYS.session,
      );
    }

    setUser(null);
    setCart([]);
  }, []);

  /*
   * Add product
   */
  const addToCart = useCallback(
    (
      productId: string,
      quantity = 1,
    ) => {
      if (!user) {
        return;
      }

      const existing = cart.find(
        (item) =>
          item.productId === productId,
      );

      const next = existing
        ? cart.map((item) =>
            item.productId === productId
              ? {
                  ...item,
                  quantity:
                    item.quantity +
                    quantity,
                }
              : item,
          )
        : [
            ...cart,
            {
              productId,
              quantity,
            },
          ];

      persistCart(next);
    },
    [cart, persistCart, user],
  );

  /*
   * Update quantity
   */
  const updateQuantity =
    useCallback(
      (
        productId: string,
        quantity: number,
      ) => {
        if (!user || quantity < 1) {
          return;
        }

        const next = cart.map(
          (item) =>
            item.productId ===
            productId
              ? {
                  ...item,
                  quantity,
                }
              : item,
        );

        persistCart(next);
      },
      [cart, persistCart, user],
    );

  /*
   * Remove product
   */
  const removeFromCart =
    useCallback(
      (productId: string) => {
        if (!user) {
          return;
        }

        const next = cart.filter(
          (item) =>
            item.productId !==
            productId,
        );

        persistCart(next);
      },
      [cart, persistCart, user],
    );

  /*
   * Clear current user's cart
   */
  const clearCart = useCallback(() => {
    if (!user) {
      return;
    }

    persistCart([]);
  }, [persistCart, user]);

  /*
   * Cart total
   */
  const cartTotal = useMemo(
    () =>
      cart.reduce(
        (sum, item) => {
          const product =
            getProduct(
              item.productId,
            );

          return (
            sum +
            (product
              ? product.price *
                item.quantity
              : 0)
          );
        },
        0,
      ),
    [cart],
  );

  /*
   * Cart count
   */
  const cartCount = useMemo(
    () =>
      cart.reduce(
        (sum, item) =>
          sum + item.quantity,
        0,
      ),
    [cart],
  );

  /*
   * Place order
   */
  const placeOrder =
    useCallback(
      (
        address: Order["address"],
      ) => {
        if (
          !user ||
          cart.length === 0
        ) {
          return null;
        }

        const items =
          cart.flatMap(
            (item) => {
              const product =
                getProduct(
                  item.productId,
                );

              if (!product) {
                return [];
              }

              return [
                {
                  productId:
                    product.id,
                  name:
                    product.name,
                  price:
                    product.price,
                  quantity:
                    item.quantity,
                },
              ];
            },
          );

        const order: Order = {
          id: `SN${Date.now()
            .toString()
            .slice(-8)}`,

          userId: user.id,

          createdAt:
            new Date().toISOString(),

          status: "Confirmed",

          items,

          total:
            items.reduce(
              (sum, item) =>
                sum +
                item.price *
                  item.quantity,
              0,
            ),

          address,
        };

        const next = [
          order,
          ...read<Order[]>(
            KEYS.orders,
            [],
          ),
        ];

        setOrders(next);

        write(
          KEYS.orders,
          next,
        );

        /*
         * Clear ONLY current user's cart.
         */
        persistCart([]);

        return order;
      },
      [cart, persistCart, user],
    );

  const value: ShopState = {
    user,
    cart,
    orders,
    cartCount,
    cartTotal,
    register,
    login,
    logout,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    placeOrder,
  };

  return (
    <ShopContext.Provider
      value={value}
    >
      {children}
    </ShopContext.Provider>
  );
}

export function useShop() {
  const ctx =
    useContext(ShopContext);

  if (!ctx) {
    throw new Error(
      "useShop must be used inside ShopProvider",
    );
  }

  return ctx;
}