import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { startDiscordLogin } from "@/const";
import { toast } from "sonner";
import { CartDrawer } from "@/components/CartDrawer";
import {
  ArrowUpRight,
  Check,
  ChevronDown,
  CircleHelp,
  LockKeyhole,
  Menu,
  ProductIcon,
  Search,
  ShoppingBag,
  X,
  Zap,
} from "@/components/OptixIcons";
import {
  products,
  productCategories,
  type Product,
  type ProductCategory,
} from "@/data/products";

const navItems = [
  { label: "Produkte", href: "#shop" },
  { label: "Pakete & Bundles", href: "#bundles" },
  { label: "Sicherheit", href: "#sicherheit" },
  { label: "FAQ", href: "#faq" },
];

function categoryLabel(category: ProductCategory) {
  return category;
}

function ProductCard({
  product,
  selected,
  onToggle,
}: {
  product: Product;
  selected: boolean;
  onToggle: (product: Product) => void;
}) {
  return (
    <article className={`product-card ${selected ? "is-selected" : ""}`}>
      <div className="product-card-head">
        <div className="product-number">{String(products.indexOf(product) + 1).padStart(2, "0")}</div>
        <div className="product-tags">
          <span className="tag tag-purple">{categoryLabel(product.category)}</span>
          {product.badge && <span className="tag tag-badge">{product.badge}</span>}
        </div>
        <span className="product-price">{product.price.toFixed(2)} €</span>
      </div>
      <div className="product-icon-wrap"><ProductIcon name={product.icon} size={22} strokeWidth={1.7} /></div>
      <h3>{product.title}</h3>
      <p className="product-description">{product.description}</p>
      
      {product.includes && (
        <div className="bundle-includes">
          <span className="micro-label">Enthaltene Tweaks:</span>
          <ul>
            {product.includes.map((inc) => (
              <li key={inc}><Check size={12} /> {inc}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="benefit-block">
        <span className="micro-label">Hauptvorteil</span>
        <p>{product.benefit}</p>
      </div>

      <div className="product-footer">
        <span className="mono">v{product.version} · {product.id}</span>
        <button className={`button button-small ${selected ? "button-selected" : "button-primary"}`} type="button" aria-pressed={selected} onClick={() => onToggle(product)}>
          {selected ? <><Check size={14} /> Im Warenkorb</> : <>In den Warenkorb <span>+</span></>}
        </button>
      </div>
    </article>
  );
}

export default function Home() {
  const { user } = useAuth();
  const [activeCategory, setActiveCategory] = useState<string>("Alle");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 18);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const filteredProducts = useMemo(() => {
    if (activeCategory === "Alle") return products;
    return products.filter((product) => product.category === activeCategory);
  }, [activeCategory]);

  const selectedProducts = useMemo(
    () => products.filter((product) => selectedIds.includes(product.id)),
    [selectedIds],
  );

  const handleToggle = (product: Product) => {
    setSelectedIds((current) => {
      const exists = current.includes(product.id);
      if (exists) {
        toast(`${product.title} entfernt`, { description: "Dein Warenkorb wurde aktualisiert." });
        return current.filter((id) => id !== product.id);
      }
      toast(`${product.title} hinzugefügt`, { description: "Das Produkt liegt jetzt in deinem Warenkorb." });
      return [...current, product.id];
    });
  };

  const scrollToShop = () => document.getElementById("shop")?.scrollIntoView({ behavior: "smooth" });

  return (
    <div className="site-shell">
      <header className={`site-header ${scrolled ? "is-scrolled" : ""}`}>
        <div className="header-inner">
          <a className="brand" href="#top" aria-label="Optix Tweaks Startseite">
            <span className="brand-logo-wrap">
              <img src="/manus-storage/optix-tweaks-logo_efcd87df.png" alt="Optix Tweaks Logo" />
            </span>
          </a>
          <nav className={`main-nav ${mobileMenuOpen ? "is-open" : ""}`} aria-label="Hauptnavigation">
            {navItems.map((item) => <a key={item.href} href={item.href} onClick={() => setMobileMenuOpen(false)}>{item.label}</a>)}
            <a className="nav-download" href="#shop" onClick={() => setMobileMenuOpen(false)}>Shop öffnen <ArrowUpRight size={14} /></a>
          </nav>
          <div className="header-actions">
            <span className="system-status"><span className="status-pulse" /> 100% Secure Checkout</span>
            {user ? (
              <a className="account-button" href="/dashboard" aria-label="Dashboard öffnen">
                <span className="account-dot" /> <span>{user.discordUsername || user.name || "Dashboard"}</span> <ArrowUpRight size={14} />
              </a>
            ) : (
              <button className="account-button" type="button" onClick={startDiscordLogin}>
                Discord Login <ArrowUpRight size={14} />
              </button>
            )}
            <button className="cart-button" type="button" onClick={() => setCartOpen(true)} aria-label={`Warenkorb öffnen, ${selectedProducts.length} Artikel`}>
              <ShoppingBag size={17} strokeWidth={1.8} /><span>Warenkorb</span><b>{String(selectedProducts.length).padStart(2, "0")}</b>
            </button>
            <button className="mobile-menu-button" type="button" onClick={() => setMobileMenuOpen((current) => !current)} aria-label="Menü öffnen">
              {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </header>

      <main id="top">
        <section className="hero-section">
          <div className="hero-noise" />
          <div className="hero-inner">
            <div className="hero-copy">
              <div className="eyebrow-row"><span className="eyebrow">Optix Tweaks / High Performance Engine</span><span className="eyebrow-line" /></div>
              <h1>Optimize.<br /><em>Dominate. Win.</em></h1>
              <p className="hero-lead">Entdecke professionelle Tweaks für FiveM, Valorant, Fortnite, Rocket League und Windows. Präzise optimiert für stabilere Frametimes, geringere Latenzen und kontrollierbare Systemperformance.</p>
              <div className="hero-actions">
                <button className="button button-primary button-large" type="button" onClick={scrollToShop}>Zum Shop & Paketen <ArrowUpRight size={17} /></button>
                <a className="button button-quiet button-large" href="#bundles">Beliebte Packs <span>↓</span></a>
              </div>
              <div className="hero-proof"><span><Check size={13} /> Sofortiger Lizenzversand</span><span><LockKeyhole size={13} /> Stripe Checkout</span></div>
            </div>
            <div className="hero-visual-logo" aria-label="Optix Tweaks Logo Showcase">
              <div className="logo-card-glow" />
              <img src="/manus-storage/optix-tweaks-logo_efcd87df.png" alt="Optix Tweaks" />
              <div className="logo-card-badge mono">PRO GAMING OPTIMIZATION</div>
            </div>
          </div>
        </section>

        <section className="shop-section section-pad" id="shop">
          <div className="shop-heading">
            <div>
              <span className="section-index">01 / PRODUKTKATALOG</span>
              <h2>Wähle dein<br /><em>Performance Upgrade.</em></h2>
            </div>
            <div className="shop-heading-right">
              <p>Alle Game Tweaks, Tweak Packs und System-Optimierungen auf einen Blick. Sofort lieferbar nach dem Checkout.</p>
              <div className="catalog-count"><strong>{String(filteredProducts.length).padStart(2, "0")}</strong><span>verfügbare<br />produkte</span></div>
            </div>
          </div>

          <div className="catalog-toolbar" id="bundles">
            <div className="category-filters" role="tablist" aria-label="Produktkategorien">
              {productCategories.map((category) => (
                <button
                  key={category}
                  className={activeCategory === category ? "is-active" : ""}
                  type="button"
                  role="tab"
                  aria-selected={activeCategory === category}
                  onClick={() => setActiveCategory(category)}
                >
                  {category}
                </button>
              ))}
            </div>
            <div className="toolbar-detail"><Search size={15} /> <span className="mono">FILTER / {activeCategory.toUpperCase()}</span></div>
          </div>

          <div className="product-grid" id="module">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                selected={selectedIds.includes(product.id)}
                onToggle={handleToggle}
              />
            ))}
          </div>
          <div className="catalog-foot"><span className="mono">SECURE CHECKOUT / STRIPE & PAYPAL</span><span>Alle Lizenzen enthalten kostenfreie Updates für die jeweilige Hauptversion.</span></div>
        </section>

        <section className="security-section section-pad" id="sicherheit">
          <div className="protocol-line" aria-hidden="true"><span className="mono">SICHERHEIT</span><i /><i /><i /><span className="mono">VERIFIED</span></div>
          <div className="security-mark">
            <div className="security-brand-mark"><img src="/manus-storage/optix-tweaks-logo_efcd87df.png" alt="" /></div>
            <span className="mono">100% CLEAN<br />VERIFIED</span>
          </div>
          <div className="security-copy">
            <span className="section-index">02 / QUALITÄT & SCHUTZ</span>
            <h2>Sicher, sauber<br /><em>und zuverlässig.</em></h2>
            <p>Unsere Tweaks greifen tief in Windows- und Spieleinstellungen ein, ohne Anti-Cheat-Sperren zu provozieren. Jedes Skript wird vor der Freigabe streng getestet.</p>
            <a className="button button-light" href="#faq">Häufige Fragen <span>↓</span></a>
          </div>
          <div className="security-list">
            <div>
              <span className="security-step">01</span>
              <div>
                <strong>Anti-Cheat Kompatibel</strong>
                <p>Sicher für Vanguard, Easy Anti-Cheat und FiveM-Schutzmechanismen.</p>
              </div>
            </div>
            <div>
              <span className="security-step">02</span>
              <div>
                <strong>Einfacher Wiederherstellungspunkt</strong>
                <p>Jede Änderung lässt sich über Windows-Systemwiederherstellung zurücksetzen.</p>
              </div>
            </div>
            <div>
              <span className="security-step">03</span>
              <div>
                <strong>Sofortiger Download</strong>
                <p>Nach erfolgreicher Zahlung via Stripe Checkout erhältst du den Download sofort.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="faq-section section-pad" id="faq">
          <div className="protocol-line" aria-hidden="true"><span className="mono">FAQ</span><i /><i /><i /><span className="mono">HILFE</span></div>
          <div className="section-header faq-header">
            <div>
              <span className="section-index">03 / HÄUFIGE FRAGEN</span>
              <h2>Antworten zu<br /><em>Bestellung & Tweaks.</em></h2>
            </div>
            <CircleHelp size={34} strokeWidth={1.1} />
          </div>
          <div className="faq-list">
            <details open>
              <summary>Wie erhalte ich meine Tweaks nach dem Kauf? <ChevronDown size={18} /></summary>
              <p>Unmittelbar nach Abschluss der Zahlung über Stripe Checkout wird dir der Download-Link zusammen mit deiner Lizenz an deine eingegebene E-Mail-Adresse geschickt.</p>
            </details>
            <details>
              <summary>Funktionieren die Tweaks mit Valorant / Vanguard? <ChevronDown size={18} /></summary>
              <p>Ja, alle angebotenen Tweaks respektieren die Vorgaben moderner Anti-Cheat-Systeme wie Riot Vanguard oder Easy Anti-Cheat und führen zu keinen Banns.</p>
            </details>
            <details>
              <summary>Welche Zahlungsmethoden werden unterstützt? <ChevronDown size={18} /></summary>
              <p>Wir unterstützen sichere Zahlungen via Stripe Checkout mit Kreditkarte, Apple Pay und Google Pay.</p>
            </details>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="footer-inner">
          <div className="brand">
            <span className="brand-logo-wrap"><img src="/manus-storage/optix-tweaks-logo_efcd87df.png" alt="" /></span>
          </div>
          <p>Optimize. Dominate. Win. — mit kontrollierter Performance für kompetitives Gaming.</p>
          <div className="footer-meta">
            <span className="mono">© 2026 OPTIX TWEAKS</span>
            <span className="mono">STRIPE & PAYPAL SECURE SHOP</span>
          </div>
        </div>
      </footer>

      <CartDrawer
        items={selectedProducts}
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        onRemove={(id) => setSelectedIds((current) => current.filter((item) => item !== id))}
        onClear={() => setSelectedIds([])}
      />
    </div>
  );
}
