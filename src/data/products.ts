export type Product = {
  id: string;
  name: string;
  price: number;
  rating: number;
  reviews: number;
  category: string;
  icon: string;
  inStock: boolean;
  description: string;
};

export const categories = [
  "Electronics",
  "Audio",
  "Accessories",
  "Wearables",
  "Home",
] as const;

export const products: Product[] = [
  {
    id: "wireless-headphones",
    name: "NestSound Wireless Headphones",
    price: 2499,
    rating: 4.4,
    reviews: 812,
    category: "Audio",
    icon: "headphones",
    inStock: true,
    description:
      "Over-ear wireless headphones with 30-hour battery life, soft memory-foam cushions and low-latency mode for movies.",
  },
  {
    id: "smart-watch",
    name: "NestFit Smart Watch S2",
    price: 3299,
    rating: 4.2,
    reviews: 540,
    category: "Wearables",
    icon: "watch",
    inStock: true,
    description:
      "1.4 inch AMOLED smart watch with heart-rate tracking, 60+ sport modes and 7-day battery on a single charge.",
  },
  {
    id: "mechanical-keyboard",
    name: "KeyNest Mechanical Keyboard TKL",
    price: 4199,
    rating: 4.7,
    reviews: 331,
    category: "Accessories",
    icon: "keyboard",
    inStock: true,
    description:
      "Tenkeyless mechanical keyboard with hot-swappable tactile switches, per-key backlight and an aluminium top plate.",
  },
  {
    id: "gaming-mouse",
    name: "NestClick Gaming Mouse Pro",
    price: 1899,
    rating: 4.5,
    reviews: 1204,
    category: "Accessories",
    icon: "mouse",
    inStock: true,
    description:
      "Lightweight 68g gaming mouse with a 16,000 DPI sensor, six programmable buttons and braided cable.",
  },
  {
    id: "travel-backpack",
    name: "NestCarry Travel Backpack 28L",
    price: 1599,
    rating: 4.1,
    reviews: 276,
    category: "Accessories",
    icon: "backpack",
    inStock: true,
    description:
      "Water-resistant 28L backpack with a padded 15.6 inch laptop sleeve, luggage strap and hidden pocket.",
  },
  {
    id: "power-bank",
    name: "NestCharge Power Bank 20000mAh",
    price: 1299,
    rating: 4.3,
    reviews: 963,
    category: "Electronics",
    icon: "battery",
    inStock: true,
    description:
      "20000mAh power bank with 22.5W fast charging, dual USB-A output and USB-C in/out with charge level display.",
  },
  {
    id: "bluetooth-speaker",
    name: "NestBeat Bluetooth Speaker",
    price: 1999,
    rating: 4.0,
    reviews: 418,
    category: "Audio",
    icon: "speaker",
    inStock: false,
    description:
      "Portable 20W speaker with punchy bass radiators, IPX6 splash resistance and true wireless stereo pairing.",
  },
  {
    id: "usb-c-hub",
    name: "NestPort USB-C Hub 7-in-1",
    price: 2199,
    rating: 4.4,
    reviews: 187,
    category: "Electronics",
    icon: "usb",
    inStock: true,
    description:
      "7-in-1 aluminium hub with 4K HDMI, 100W pass-through charging, SD/microSD reader and three USB 3.0 ports.",
  },
  {
    id: "laptop-stand",
    name: "NestDesk Laptop Stand",
    price: 999,
    rating: 4.6,
    reviews: 402,
    category: "Home",
    icon: "laptop",
    inStock: true,
    description:
      "Foldable aluminium laptop stand with six height levels, silicone grips and open airflow design.",
  },
  {
    id: "smartphone-case",
    name: "NestShield Smartphone Case",
    price: 499,
    rating: 3.9,
    reviews: 1520,
    category: "Accessories",
    icon: "smartphone",
    inStock: true,
    description:
      "Shock-absorbing clear case with raised camera lip, anti-yellow coating and precise button cutouts.",
  },
  {
    id: "led-desk-lamp",
    name: "NestGlow LED Desk Lamp",
    price: 1149,
    rating: 4.2,
    reviews: 233,
    category: "Home",
    icon: "lamp",
    inStock: true,
    description:
      "Flicker-free LED desk lamp with five brightness levels, three colour temperatures and a USB charging port.",
  },
  {
    id: "fitness-band",
    name: "NestFit Fitness Band Lite",
    price: 1799,
    rating: 4.0,
    reviews: 688,
    category: "Wearables",
    icon: "activity",
    inStock: true,
    description:
      "Slim fitness band with SpO2 and sleep tracking, 14-day battery life and swim-proof 5ATM build.",
  },
  {
    id: "webcam-1080p",
    name: "NestView Webcam 1080p",
    price: 1699,
    rating: 4.1,
    reviews: 145,
    category: "Electronics",
    icon: "camera",
    inStock: true,
    description:
      "1080p 60fps webcam with autofocus, dual noise-cancelling mics and a built-in privacy shutter.",
  },
  {
    id: "wireless-earbuds",
    name: "NestSound Wireless Earbuds",
    price: 1499,
    rating: 4.3,
    reviews: 2011,
    category: "Audio",
    icon: "earbuds",
    inStock: true,
    description:
      "True wireless earbuds with hybrid noise cancellation, 24-hour total playtime and touch controls.",
  },
  {
    id: "monitor-24",
    name: "NestVision 24 inch Monitor",
    price: 8999,
    rating: 4.5,
    reviews: 96,
    category: "Electronics",
    icon: "monitor",
    inStock: true,
    description:
      "24 inch 100Hz IPS monitor with slim bezels, HDMI + DisplayPort inputs and a flicker-free eye-care mode.",
  },
  {
    id: "coffee-mug-warmer",
    name: "NestWarm Coffee Mug Warmer",
    price: 799,
    rating: 3.8,
    reviews: 121,
    category: "Home",
    icon: "coffee",
    inStock: true,
    description:
      "Desk mug warmer with three heat settings, auto shut-off timer and a non-slip heat-safe surface.",
  },
];

export const getProduct = (id: string) => products.find((p) => p.id === id);

export const formatPrice = (value: number) =>
  `₹${value.toLocaleString("en-IN")}`;
