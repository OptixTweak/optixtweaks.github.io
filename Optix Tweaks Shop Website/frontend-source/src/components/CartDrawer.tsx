import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { startDiscordLogin } from "@/const";
import { Product } from "@/data/products";
import { LockKeyhole, X } from "@/components/OptixIcons";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export type CartDrawerProps = {
  items: Product[];
  open: boolean;
  onClose: () => void;
  onRemove: (productId: string) => void;
  onClear: () => void;
};

export function CartDrawer({ items, open, onClose, onRemove, onClear }: CartDrawerProps) {
  const { user } = useAuth();
  const [checkoutStep, setCheckoutStep] = useState<"cart" | "checkout">("cart");
  const [email, setEmail] = useState(user?.email || "");
  const [paymentMethod, setPaymentMethod] = useState<"stripe" | "balance">("stripe");
  const [discountCode, setDiscountCode] = useState("");
  const checkoutMutation = trpc.shop.createCheckoutSession.useMutation({
    onSuccess: (result) => {
      if ("checkoutUrl" in result) {
        if (!result.checkoutUrl) {
          toast.error("Stripe konnte keine Checkout-URL erstellen.");
          return;
        }
        toast.success("Weiterleitung zu Stripe Checkout", { description: "Deine sichere Zahlungsseite wird in einem neuen Tab geöffnet." });
        window.open(result.checkoutUrl, "_blank", "noopener,noreferrer");
      } else {
        toast.success("Kauf abgeschlossen", { description: "Deine Lizenz wurde im Dashboard hinterlegt." });
      }
      setCheckoutStep("cart");
      onClose();
    },
    onError: (error) => toast.error("Checkout konnte nicht gestartet werden", { description: error.message }),
  });

  if (!open) return null;
  const totalPrice = items.reduce((sum, item) => sum + item.price, 0);
  const totalCents = Math.round(totalPrice * 100);
  const hasEnoughBalance = Boolean(user && user.balanceCents >= totalCents);

  const handleCheckout = (event: React.FormEvent) => {
    event.preventDefault();
    if (paymentMethod === "balance" && !user) {
      toast.info("Bitte zuerst mit Discord anmelden, um dein Kundenkonto zu verwenden.");
      startDiscordLogin();
      return;
    }
    checkoutMutation.mutate({ email, productIds: items.map((item) => item.id), paymentMethod, discountCode: discountCode.trim() || undefined });
  };

  const resetAndClose = () => {
    setCheckoutStep("cart");
    setPaymentMethod("stripe");
    setDiscountCode("");
    onClose();
  };

  return (
    <div className="cart-layer" role="presentation">
      <button className="cart-backdrop" type="button" aria-label="Warenkorb schließen" onClick={resetAndClose} />
      <aside className="cart-drawer" role="dialog" aria-modal="true" aria-labelledby="cart-title">
        <div className="cart-head">
          <div>
            <p className="eyebrow">Warenkorb / {String(items.length).padStart(2, "0")}</p>
            <h2 id="cart-title">{checkoutStep === "cart" ? "Dein Warenkorb" : "Zahlungsart wählen"}</h2>
          </div>
          <button className="icon-button" type="button" onClick={resetAndClose} aria-label="Warenkorb schließen"><X size={18} strokeWidth={1.8} /></button>
        </div>

        {checkoutStep === "cart" && (
          <>
            {items.length === 0 ? (
              <div className="cart-empty"><div className="empty-mark"><LockKeyhole size={20} /></div><h3>Dein Warenkorb ist leer</h3><p>Wähle deine Game Tweaks oder Tweak Packs aus, um deine Performance gezielt zu optimieren.</p><button className="text-link" type="button" onClick={onClose}>Produkte entdecken <span>↗</span></button></div>
            ) : (
              <>
                <div className="cart-items">{items.map((product, index) => <div className="cart-item" key={product.id}><div className="cart-item-index">{String(index + 1).padStart(2, "0")}</div><div className="cart-item-copy"><div className="cart-item-topline"><span className="mono">{product.category}</span><button className="remove-button" type="button" onClick={() => onRemove(product.id)} aria-label={`${product.title} entfernen`}><X size={14} /></button></div><strong>{product.title}</strong><div className="cart-item-price-row"><span className="cart-item-price">{product.price.toFixed(2)} €</span><span className="cart-item-version">v{product.version}</span></div></div></div>)}</div>
                <div className="cart-note"><LockKeyhole size={15} /><span>Sofortiger digitaler Versand · Stripe oder Kundenkontostand</span></div>
                <div className="cart-foot"><div className="cart-summary"><span>Gesamtbetrag vor Rabatt</span><strong>{totalPrice.toFixed(2)} €</strong><small>Rabattcodes werden beim Checkout serverseitig geprüft.</small></div><button className="button button-primary button-wide" type="button" onClick={() => setCheckoutStep("checkout")}>Zur Kasse gehen <span>↗</span></button><button className="button button-ghost button-wide" type="button" onClick={onClear}>Warenkorb leeren</button></div>
              </>
            )}
          </>
        )}

        {checkoutStep === "checkout" && (
          <form onSubmit={handleCheckout} className="checkout-form">
            <div className="form-group"><label htmlFor="email">E-Mail-Adresse für Lizenzschlüssel</label><input id="email" type="email" required placeholder="deine@email.de" value={email} onChange={(event) => setEmail(event.target.value)} className="checkout-input" autoComplete="email" /></div>
            <div className="payment-method-grid">
              <button type="button" className={`payment-method-option ${paymentMethod === "stripe" ? "is-selected" : ""}`} onClick={() => setPaymentMethod("stripe")}><strong>Stripe</strong><span>Karte · Apple Pay · Google Pay</span></button>
              <button type="button" className={`payment-method-option ${paymentMethod === "balance" ? "is-selected" : ""}`} onClick={() => setPaymentMethod("balance")}><strong>Kundenkonto</strong><span>{user ? `Verfügbar: ${(user.balanceCents / 100).toFixed(2)} €` : "Discord-Login erforderlich"}</span></button>
            </div>
            <div className="form-group"><label htmlFor="discount-code">Rabattcode (optional)</label><input id="discount-code" type="text" placeholder="OPTIX10" value={discountCode} onChange={(event) => setDiscountCode(event.target.value.toUpperCase())} className="checkout-input" autoComplete="off" /></div>
            {paymentMethod === "balance" && !hasEnoughBalance ? <div className="checkout-warning">{user ? `Dein Kontostand reicht für diesen Warenkorb nicht aus. Verfügbar: ${(user.balanceCents / 100).toFixed(2)} €` : "Melde dich mit Discord an, um dein Kundenkonto zu verwenden."}</div> : null}
            <div className="stripe-info-box"><div className="stripe-mark">{paymentMethod === "stripe" ? "S" : "€"}</div><div><strong>{paymentMethod === "stripe" ? "Stripe Checkout" : "Optix Kundenkonto"}</strong><span>{paymentMethod === "stripe" ? "Sichere Weiterleitung zu Stripe" : "Atomare Guthabenbuchung mit Ledger-Eintrag"}</span></div></div>
            <div className="checkout-total-box"><span>Zu zahlen:</span><strong>{totalPrice.toFixed(2)} €</strong></div>
            <div className="cart-foot"><button className="button button-primary button-wide" type="submit" disabled={checkoutMutation.isPending || (paymentMethod === "balance" && !hasEnoughBalance)}>{checkoutMutation.isPending ? "Wird verarbeitet…" : paymentMethod === "stripe" ? `Mit Stripe bezahlen · ${totalPrice.toFixed(2)} € ↗` : `Mit Kundenkonto zahlen · ${totalPrice.toFixed(2)} €`}</button><button className="button button-ghost button-wide" type="button" onClick={() => setCheckoutStep("cart")}>Zurück zum Warenkorb</button></div>
          </form>
        )}
      </aside>
    </div>
  );
}
