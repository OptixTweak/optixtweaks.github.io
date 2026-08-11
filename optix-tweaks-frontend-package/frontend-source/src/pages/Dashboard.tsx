import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { startDiscordLogin } from "@/const";
import { ArrowUpRight, Check, Copy, CreditCard, KeyRound, LogOut, Plus, ShieldCheck, Users, Wallet, X } from "lucide-react";
import { FormEvent, useState } from "react";
import { toast } from "sonner";

const euro = (cents: number) => new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(cents / 100);
const date = (value: Date | string | null) => value ? new Date(value).toLocaleDateString("de-DE") : "—";

function Metric({ label, value, icon: Icon, detail }: { label: string; value: string | number; icon: typeof Wallet; detail?: string }) {
  return <div className="dashboard-metric"><div className="dashboard-metric-icon"><Icon size={17} /></div><div><span className="dashboard-label">{label}</span><strong>{value}</strong>{detail ? <small>{detail}</small> : null}</div></div>;
}

function EmptyState({ title, text }: { title: string; text: string }) {
  return <div className="dashboard-empty"><span>—</span><strong>{title}</strong><p>{text}</p></div>;
}

function CustomerDashboard() {
  const { data, isLoading } = trpc.dashboard.customer.useQuery();
  if (isLoading) return <div className="dashboard-loading">Kundendaten werden geladen…</div>;
  const customer = data?.user;
  return <>
    <div className="dashboard-metrics">
      <Metric label="Kontostand" value={euro(customer?.balanceCents ?? 0)} icon={Wallet} detail="für Käufe im Shop" />
      <Metric label="Aktive Lizenzen" value={data?.licenses.filter((license) => license.status === "active").length ?? 0} icon={KeyRound} detail="deinem Account zugeordnet" />
      <Metric label="Bestellungen" value={data?.orders.length ?? 0} icon={CreditCard} detail="seit deinem ersten Login" />
    </div>
    <section className="dashboard-section">
      <div className="dashboard-section-heading"><div><span className="dashboard-kicker">01 / LICENSE VAULT</span><h2>Deine Lizenzen</h2></div><span className="dashboard-status"><Check size={13} /> synchronisiert</span></div>
      {data?.licenses.length ? <div className="dashboard-table-wrap"><table className="dashboard-table"><thead><tr><th>Produkt</th><th>Lizenzschlüssel</th><th>Status</th><th>Ausgestellt</th><th /></tr></thead><tbody>{data.licenses.map((license) => <tr key={license.id}><td><strong>{license.productName}</strong><small>{license.productId}</small></td><td><code>{license.licenseKey}</code></td><td><span className={`status-pill ${license.status}`}>{license.status === "active" ? "Aktiv" : "Widerrufen"}</span></td><td>{date(license.issuedAt)}</td><td>{license.downloadUrl ? <a className="table-action" href={license.downloadUrl} target="_blank" rel="noreferrer">Download <ArrowUpRight size={13} /></a> : <span className="table-muted">wird vorbereitet</span>}</td></tr>)}</tbody></table></div> : <EmptyState title="Noch keine Lizenzen" text="Deine bezahlten Tweaks werden nach erfolgreicher Zahlung automatisch hier hinterlegt." />}
    </section>
    <section className="dashboard-section">
      <div className="dashboard-section-heading"><div><span className="dashboard-kicker">02 / ACCOUNT LEDGER</span><h2>Kontobewegungen</h2></div></div>
      {data?.ledger.length ? <div className="dashboard-table-wrap"><table className="dashboard-table"><thead><tr><th>Datum</th><th>Typ</th><th>Notiz</th><th>Betrag</th></tr></thead><tbody>{data.ledger.map((entry) => <tr key={entry.id}><td>{date(entry.createdAt)}</td><td><span className="status-pill">{entry.entryType}</span></td><td>{entry.note}</td><td className={entry.amountCents >= 0 ? "amount-positive" : "amount-negative"}>{entry.amountCents >= 0 ? "+" : ""}{euro(entry.amountCents)}</td></tr>)}</tbody></table></div> : <EmptyState title="Keine Kontobewegungen" text="Guthaben-Anpassungen und Abbuchungen erscheinen hier nachvollziehbar." />}
    </section>
  </>;
}

function StaffDashboard({ owner }: { owner: boolean }) {
  const { data: adminData, isLoading } = trpc.dashboard.admin.useQuery(undefined, { enabled: true });
  const { data: ownerData, refetch: refetchOwner } = trpc.dashboard.owner.useQuery(undefined, { enabled: owner });
  const revokeLicense = trpc.admin.revokeLicense.useMutation({ onSuccess: () => { toast.success("Lizenz wurde widerrufen."); void refetchOwner(); } });
  const promoteAdmin = trpc.owner.promoteAdmin.useMutation({ onSuccess: () => { toast.success("Admin-Rolle wurde vergeben."); void refetchOwner(); } });
  const adjustBalance = trpc.owner.adjustBalance.useMutation({ onSuccess: () => { toast.success("Kontostand wurde aktualisiert."); setBalanceForm({ userId: "", amount: "", note: "" }); void refetchOwner(); } });
  const createDiscount = trpc.owner.createDiscountCode.useMutation({ onSuccess: () => { toast.success("Rabattcode wurde erstellt."); setDiscountForm({ code: "", discountType: "percent", value: "10", maxUses: "0" }); void refetchOwner(); } });
  const [balanceForm, setBalanceForm] = useState({ userId: "", amount: "", note: "" });
  const [discountForm, setDiscountForm] = useState({ code: "", discountType: "percent" as "percent" | "fixed", value: "10", maxUses: "0" });
  const dataset = owner ? ownerData : adminData;

  if (isLoading || (owner && !ownerData)) return <div className="dashboard-loading">Operationsdaten werden geladen…</div>;
  if (!dataset) return <div className="dashboard-loading">Keine Daten verfügbar.</div>;
  const activeLicenses = dataset.licenses.filter((license) => license.status === "active").length;

  const handleBalance = (event: FormEvent) => {
    event.preventDefault();
    if (!balanceForm.userId || !balanceForm.amount || !balanceForm.note) return toast.error("Bitte alle Kontostandfelder ausfüllen.");
    adjustBalance.mutate({ userId: Number(balanceForm.userId), amountCents: Math.round(Number(balanceForm.amount) * 100), note: balanceForm.note });
  };
  const handleDiscount = (event: FormEvent) => {
    event.preventDefault();
    if (!discountForm.code) return toast.error("Bitte einen Rabattcode eingeben.");
    createDiscount.mutate({ code: discountForm.code, discountType: discountForm.discountType, value: discountForm.discountType === "fixed" ? Math.round(Number(discountForm.value) * 100) : Number(discountForm.value), maxUses: Number(discountForm.maxUses) });
  };

  return <>
    <div className="dashboard-metrics">
      <Metric label="Accounts" value={dataset.users.length} icon={Users} detail="registrierte Kunden und Staff" />
      <Metric label="Aktive Lizenzen" value={activeLicenses} icon={KeyRound} detail={`${dataset.licenses.length} insgesamt`} />
      <Metric label="Orders" value={dataset.orders.length} icon={CreditCard} detail="Stripe und Guthaben" />
    </div>
    <section className="dashboard-section">
      <div className="dashboard-section-heading"><div><span className="dashboard-kicker">01 / CUSTOMER INDEX</span><h2>Accounts & Orders</h2></div><span className="dashboard-status"><ShieldCheck size={13} /> {owner ? "owner access" : "admin access"}</span></div>
      <div className="dashboard-table-wrap"><table className="dashboard-table"><thead><tr><th>Account</th><th>Discord</th><th>Rolle</th><th>Guthaben</th><th>Erstellt</th></tr></thead><tbody>{dataset.users.map((account) => <tr key={account.id}><td><strong>{account.name || "Unbekannt"}</strong><small>{account.email || `User #${account.id}`}</small></td><td><code>{account.discordId || "—"}</code></td><td><span className={`role-pill ${account.role}`}>{account.role}</span></td><td>{euro(account.balanceCents)}</td><td>{date(account.createdAt)}</td></tr>)}</tbody></table></div>
    </section>
    <section className="dashboard-section">
      <div className="dashboard-section-heading"><div><span className="dashboard-kicker">02 / LICENSE CONTROL</span><h2>Lizenzverwaltung</h2></div></div>
      <div className="dashboard-table-wrap"><table className="dashboard-table"><thead><tr><th>Lizenz</th><th>Kunde</th><th>Produkt</th><th>Status</th><th /></tr></thead><tbody>{dataset.licenses.length ? dataset.licenses.map((license) => <tr key={license.id}><td><code>{license.licenseKey}</code></td><td>User #{license.userId}</td><td>{license.productName}</td><td><span className={`status-pill ${license.status}`}>{license.status}</span></td><td>{license.status === "active" ? <button className="table-action danger" type="button" onClick={() => revokeLicense.mutate({ licenseId: license.id })}><X size={13} /> widerrufen</button> : <span className="table-muted">gesperrt</span>}</td></tr>) : <tr><td colSpan={5}><EmptyState title="Noch keine Lizenzen" text="Nach erfolgreichen Zahlungen werden sie hier verwaltbar." /></td></tr>}</tbody></table></div>
    </section>
    <section className="dashboard-section" id="orders"><div className="dashboard-section-heading"><div><span className="dashboard-kicker">03 / ORDER CONTROL</span><h2>Bestellungsübersicht</h2></div><span className="dashboard-status"><CreditCard size={13} /> {dataset.orders.length} orders</span></div><div className="dashboard-table-wrap"><table className="dashboard-table"><thead><tr><th>Order</th><th>Kunde</th><th>Zahlungsart</th><th>Betrag</th><th>Status</th><th>Datum</th></tr></thead><tbody>{dataset.orders.length ? dataset.orders.map((order) => <tr key={order.id}><td><code>#{order.id}</code><small>{order.stripeCheckoutSessionId || "Guthaben-Order"}</small></td><td><strong>{order.email}</strong><small>{order.userId ? `User #${order.userId}` : "Gast"}</small></td><td><span className="status-pill">{order.paymentMethod}</span></td><td>{euro(order.totalCents)}</td><td><span className={`status-pill ${order.status === "paid" ? "active" : order.status === "cancelled" ? "revoked" : ""}`}>{order.status}</span></td><td>{date(order.createdAt)}</td></tr>) : <tr><td colSpan={6}><EmptyState title="Noch keine Bestellungen" text="Stripe- und Guthaben-Orders erscheinen hier nach dem ersten Kauf." /></td></tr>}</tbody></table></div></section>
    <section className="dashboard-section" id="moderation"><div className="dashboard-section-heading"><div><span className="dashboard-kicker">04 / MODERATION LOGS</span><h2>Discord Moderationsprotokoll</h2></div><span className="dashboard-status"><ShieldCheck size={13} /> {dataset.moderationLogs.length} logs</span></div><div className="dashboard-table-wrap"><table className="dashboard-table"><thead><tr><th>Aktion</th><th>Moderator</th><th>Ziel-User</th><th>Grund</th><th>Datum</th></tr></thead><tbody>{dataset.moderationLogs.length ? dataset.moderationLogs.map((log) => <tr key={log.id}><td><span className="status-pill active">{log.action}</span></td><td><code>{log.moderatorDiscordId}</code></td><td><code>{log.targetDiscordId}</code></td><td>{log.reason || "Kein Grund"}</td><td>{date(log.createdAt)}</td></tr>) : <tr><td colSpan={5}><EmptyState title="Keine Moderations-Einträge" text="Befehle wie /ban, /kick, /timeout und /warn werden hier protokolliert." /></td></tr>}</tbody></table></div></section>
    {owner ? <>
      <section className="owner-tools-grid">
        <form className="dashboard-form" onSubmit={handleBalance}><span className="dashboard-kicker">03 / BALANCE CONTROL</span><h2>Kontostand anpassen</h2><p>Guthaben wird als Ledger-Eintrag dokumentiert und darf nicht negativ werden.</p><label>Kunde<select value={balanceForm.userId} onChange={(event) => setBalanceForm({ ...balanceForm, userId: event.target.value })}><option value="">Account auswählen</option>{ownerData?.users.filter((account) => account.role === "user").map((account) => <option key={account.id} value={account.id}>{account.name || `User #${account.id}`}</option>)}</select></label><label>Betrag in EUR<input type="number" step="0.01" value={balanceForm.amount} onChange={(event) => setBalanceForm({ ...balanceForm, amount: event.target.value })} placeholder="25.00 oder -5.00" /></label><label>Notiz<input value={balanceForm.note} onChange={(event) => setBalanceForm({ ...balanceForm, note: event.target.value })} placeholder="z. B. Kulanzguthaben" /></label><button className="button button-primary" type="submit" disabled={adjustBalance.isPending}><Plus size={15} /> {adjustBalance.isPending ? "Speichern…" : "Guthaben buchen"}</button></form>
        <form className="dashboard-form" onSubmit={handleDiscount}><span className="dashboard-kicker">04 / PROMOTION CONTROL</span><h2>Rabattcode erstellen</h2><p>Prozentwerte werden als Prozent, feste Rabatte als EUR eingegeben.</p><label>Code<input value={discountForm.code} onChange={(event) => setDiscountForm({ ...discountForm, code: event.target.value })} placeholder="OPTIX10" /></label><label>Typ<select value={discountForm.discountType} onChange={(event) => setDiscountForm({ ...discountForm, discountType: event.target.value as "percent" | "fixed" })}><option value="percent">Prozent</option><option value="fixed">Fester EUR-Betrag</option></select></label><label>Wert<input type="number" min="1" step="0.01" value={discountForm.value} onChange={(event) => setDiscountForm({ ...discountForm, value: event.target.value })} /></label><label>Max. Nutzungen<input type="number" min="0" value={discountForm.maxUses} onChange={(event) => setDiscountForm({ ...discountForm, maxUses: event.target.value })} /></label><button className="button button-primary" type="submit" disabled={createDiscount.isPending}><Plus size={15} /> {createDiscount.isPending ? "Erstellen…" : "Rabattcode anlegen"}</button></form>
      </section>
      <section className="dashboard-section"><div className="dashboard-section-heading"><div><span className="dashboard-kicker">05 / STAFF CONTROL</span><h2>Admin-Zugänge</h2></div></div><div className="dashboard-table-wrap"><table className="dashboard-table"><thead><tr><th>Account</th><th>Discord</th><th>Rolle</th><th /></tr></thead><tbody>{ownerData?.users.map((account) => <tr key={account.id}><td>{account.name || `User #${account.id}`}</td><td><code>{account.discordId || "—"}</code></td><td><span className={`role-pill ${account.role}`}>{account.role}</span></td><td>{account.role === "user" ? <button className="table-action" type="button" onClick={() => promoteAdmin.mutate({ userId: account.id })}><ShieldCheck size={13} /> zum Admin machen</button> : <span className="table-muted">keine Aktion</span>}</td></tr>)}</tbody></table></div></section>
      <section className="dashboard-section"><div className="dashboard-section-heading"><div><span className="dashboard-kicker">06 / PROMOTION INDEX</span><h2>Aktive Rabattcodes</h2></div></div><div className="dashboard-table-wrap"><table className="dashboard-table"><thead><tr><th>Code</th><th>Typ</th><th>Wert</th><th>Nutzung</th><th>Status</th></tr></thead><tbody>{ownerData?.discounts.length ? ownerData.discounts.map((discount) => <tr key={discount.id}><td><strong>{discount.code}</strong></td><td>{discount.discountType}</td><td>{discount.discountType === "percent" ? `${discount.value}%` : euro(discount.value)}</td><td>{discount.usedCount} / {discount.maxUses || "∞"}</td><td><span className={`status-pill ${discount.active ? "active" : "revoked"}`}>{discount.active ? "aktiv" : "inaktiv"}</span></td></tr>) : <tr><td colSpan={5}><EmptyState title="Keine Rabattcodes" text="Neue Codes können im Owner-Bereich angelegt werden." /></td></tr>}</tbody></table></div></section>
    </> : null}
  </>;
}

export default function Dashboard() {
  const { user, loading } = useAuth();
  if (loading) return <DashboardLayout><div className="dashboard-loading">Session wird geladen…</div></DashboardLayout>;
  if (!user) return <DashboardLayout><div className="dashboard-loading"><button className="button button-primary" onClick={startDiscordLogin}>Mit Discord anmelden</button></div></DashboardLayout>;
  const isOwner = user.role === "owner";
  const isStaff = isOwner || user.role === "admin";
  return <DashboardLayout><div className="dashboard-page"><header className="dashboard-header"><div><span className="dashboard-kicker">OPTIX TWEAKS / {isOwner ? "OWNER COMMAND" : isStaff ? "ADMIN CONSOLE" : "CUSTOMER AREA"}</span><h1>{isOwner ? "Owner Control." : isStaff ? "Operations Center." : "Dein Lizenzbereich."}</h1><p>Optimize. Dominate. Win. — kontrolliert über deinen Account.</p></div><div className="dashboard-user"><span className="account-dot" /><strong>{user.discordUsername || user.name || "Discord User"}</strong><span className="role-pill">{user.role}</span></div></header>{isStaff ? <StaffDashboard owner={isOwner} /> : <CustomerDashboard />}</div></DashboardLayout>;
}
