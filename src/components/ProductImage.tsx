import {
  Activity,
  BatteryCharging,
  Camera,
  Coffee,
  Headphones,
  Keyboard,
  Lamp,
  Laptop,
  Monitor,
  Mouse,
  Backpack,
  Smartphone,
  Speaker,
  Usb,
  Watch,
  Ear,
  type LucideIcon,
} from "lucide-react";

const icons: Record<string, LucideIcon> = {
  headphones: Headphones,
  watch: Watch,
  keyboard: Keyboard,
  mouse: Mouse,
  backpack: Backpack,
  battery: BatteryCharging,
  speaker: Speaker,
  usb: Usb,
  laptop: Laptop,
  smartphone: Smartphone,
  lamp: Lamp,
  activity: Activity,
  camera: Camera,
  earbuds: Ear,
  monitor: Monitor,
  coffee: Coffee,
};

type Props = {
  icon: string;
  name: string;
  size?: "sm" | "md" | "lg";
};

const sizes = {
  sm: "h-16 w-16",
  md: "h-40",
  lg: "h-72",
};

export function ProductImage({ icon, name, size = "md" }: Props) {
  const Icon = icons[icon] ?? Monitor;
  return (
    <div
      role="img"
      aria-label={`${name} product illustration`}
      className={`flex w-full items-center justify-center rounded-md bg-secondary ${sizes[size]}`}
    >
      <Icon
        className={
          size === "lg"
            ? "h-24 w-24 text-primary"
            : size === "sm"
              ? "h-7 w-7 text-primary"
              : "h-14 w-14 text-primary"
        }
        strokeWidth={1.25}
      />
    </div>
  );
}
