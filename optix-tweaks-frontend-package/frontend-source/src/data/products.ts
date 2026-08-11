export type ProductCategory = "Game Tweaks" | "Tweak Packs" | "System Tweaks";

export type Product = {
  id: string;
  version: string;
  category: ProductCategory;
  title: string;
  price: number;
  description: string;
  benefit: string;
  includes?: string[];
  badge?: string;
  icon: "gaming" | "pack" | "windows" | "fps" | "gta";
  featured?: boolean;
};

export const products: Product[] = [
  {
    id: "fivem-tweak",
    version: "2.4.0",
    category: "Game Tweaks",
    title: "Fivem Tweak",
    price: 14.99,
    description: "Spezielle Optimierung für FiveM zur Reduzierung von Microstutters und Verbesserung der Streamer-Performance.",
    benefit: "Maximale Frame-Stabilität und flüssigeres Streaming in dichten Server-Szenarien.",
    badge: "Bestseller",
    icon: "gaming",
    featured: true,
  },
  {
    id: "valorant-tweak",
    version: "2.1.0",
    category: "Game Tweaks",
    title: "Valorant Tweak",
    price: 12.99,
    description: "Präzises Input-Lag-Tuning und Priorisierung für Valorant und Vanguard.",
    benefit: "Spürbar direktere Mausreaktion und konstantere Frametimes in Feuergefechten.",
    icon: "gaming",
  },
  {
    id: "fortnite-tweak",
    version: "2.5.0",
    category: "Game Tweaks",
    title: "Fortnite Tweak",
    price: 14.99,
    description: "Leistungsoptimierung für Unreal Engine 5 in Fortnite für stabilere FPS bei schnellen Builds.",
    benefit: "Reduziert FPS-Drops bei Materialwechseln und sorgt für saubere 240+ Hz Performance.",
    icon: "gaming",
  },
  {
    id: "rocket-league-tweak",
    version: "1.8.0",
    category: "Game Tweaks",
    title: "Rocket League Tweak",
    price: 9.99,
    description: "Fokus auf minimale Eingabeverzögerung und exakte Controller/Maus-Abfrage.",
    benefit: "Ultimative Präzision bei Aerials und schnellen Richtungswechseln.",
    icon: "gaming",
  },
  {
    id: "gta-v-tweak",
    version: "2.0.0",
    category: "Game Tweaks",
    title: "GTA V Tweak",
    price: 12.99,
    description: "Optimiertes Speicher- und CPU-Scheduling für flüssigeres Fahren und Stadt-Loading in GTA V.",
    benefit: "Verringert Nachladeruckler (Pop-in) und maximiert die durchschnittlichen FPS.",
    icon: "gta",
  },
  {
    id: "fivem-tweak-pack",
    version: "3.0.0",
    category: "Tweak Packs",
    title: "Fivem Tweak Pack",
    price: 24.99,
    description: "Das ultimative Kombi-Paket für FiveM-Spieler.",
    benefit: "Enthält Fivem Tweak, WASD Tweak und Hitreg Tweak im vergünstigten Bundle.",
    includes: ["Fivem Tweak", "WASD Tweak", "Hitreg Tweak"],
    badge: "Empfohlen",
    icon: "pack",
    featured: true,
  },
  {
    id: "full-tweak-pack",
    version: "3.5.0",
    category: "Tweak Packs",
    title: "Full Tweak Pack",
    price: 39.99,
    description: "Das komplette Leistungs- und Reaktionspaket für dein gesamtes Windows-System.",
    benefit: "Enthält WASD Tweak, Hitreg Tweak, Windows Tweak und FPS Tweak für maximale Performance.",
    includes: ["WASD Tweak", "Hitreg Tweak", "Windows Tweak", "FPS Tweak"],
    badge: "Best Value",
    icon: "pack",
    featured: true,
  },
  {
    id: "wasd-tweak",
    version: "1.5.0",
    category: "System Tweaks",
    title: "WASD Tweak",
    price: 7.99,
    description: "Optimierung der Tastatur-Polling-Rate und Entprellzeit für schnellere Bewegungsreaktion.",
    benefit: "Sofortige Richtungswechsel ohne spürbare mechanische Verzögerung.",
    icon: "gaming",
  },
  {
    id: "hitreg-tweak",
    version: "2.2.0",
    category: "System Tweaks",
    title: "Hitreg Tweak",
    price: 11.99,
    description: "Netzwerk-Puffer- und Paketreihenfolge-Tuning für verlässliche Trefferregistrierung.",
    benefit: "Verbessert die Synchronisation mit Spieleservern und minimiert 'Ghost Hits'.",
    icon: "gaming",
  },
  {
    id: "windows-tweak",
    version: "3.1.0",
    category: "System Tweaks",
    title: "Windows Tweak",
    price: 14.99,
    description: "Tiefgreifende Bereinigung von Windows-Hintergrunddiensten, Telemetrie und Timer-Resolution.",
    benefit: "Mehr freier Arbeitsspeicher und ein absolut ruhiges Betriebssystem für Gaming.",
    icon: "windows",
  },
  {
    id: "fps-tweak",
    version: "3.2.0",
    category: "System Tweaks",
    title: "FPS Tweak",
    price: 14.99,
    description: "GPU-Priorisierung, Cache-Bereinigung und erweiterte Shader-Kompilierungs-Optimierung.",
    benefit: "Maximiert die Bildwiederholrate in fast allen modernen Multiplayer-Spielen.",
    icon: "fps",
  },
];

export const productCategories = ["Alle", "Game Tweaks", "Tweak Packs", "System Tweaks"] as const;
