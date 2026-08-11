import type { LucideProps } from "lucide-react";
import {
  ArrowUpRight,
  Check,
  ChevronDown,
  CircleHelp,
  Cpu,
  Flame,
  Gamepad2,
  Layers,
  LockKeyhole,
  Menu,
  MonitorPlay,
  Search,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Terminal,
  X,
  Zap,
} from "lucide-react";

export const iconMap = {
  gaming: Gamepad2,
  pack: Layers,
  windows: Terminal,
  fps: Zap,
  gta: Flame,
} as const;

export function ProductIcon({ name, ...props }: { name: keyof typeof iconMap } & LucideProps) {
  const Icon = iconMap[name] || Gamepad2;
  return <Icon {...props} />;
}

export {
  ArrowUpRight,
  Check,
  ChevronDown,
  CircleHelp,
  LockKeyhole,
  Menu,
  Search,
  ShoppingBag,
  Sparkles,
  X,
  Zap,
};
