import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../utils/axiosInstance";
const money = n => `PKR ${Number(n || 0).toLocaleString("en-PK")}`;
const date = n => n ? new Date(n).toLocaleString() : "—";
const statuses = ["Confirmed", "Preparing", "Out for Delivery", "Delivered", "Cancelled"];
const btn = "rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50";
export default function AdminDashboard() {
 const { user } = useAuth();
 const [data, setData] = useState(null), [tab, setTab] = useState("users"), [query, setQuery] = useState("");
 const [error, setError] = useState(""), [loading, setLoading] = useState(false), [busy, setBusy] = useState(false);
 const load = useCallback(async () => {
  if (!user?.isSuperAdmin) return;
  setLoading(true); setError("");
  try {setData((await api.get("/admin/overview")).data);} catch(e) {setError(e.response?.data?.message || "Unable to load records. Please retry.");} finally {setLoading(false);}
 }, [user?.isSuperAdmin]);
 useEffect(() => {load();}, [load]);
 async function change(url, payload, method="put") {
  setBusy(true); setError("");
  try {await api[method](url, payload); await load();} catch(e) {setError(e.response?.data?.message || "Update failed");} finally {setBusy(false);}
 }
 if (!user?.isAdmin) return <p className="p-10">Admin access required.</p>;
 const rows=(data?.[tab] || []).filter(r => JSON.stringify(r).toLowerCase().includes(query.toLowerCase()));
 const headers=tab === "users" ? ["User", "Role", "Status", "Joined", "Access controls"] : tab === "products" ? ["Product", "Category", "Price", "Stock", "Manage"] : tab === "orders" ? ["Order / Customer", "Items", "Total / Payment", "Delivery", "Status"] : ["Reference / Guest", "Contact", "Date / Time", "Guests / Area", "Status"];
 const cell="px-4 py-4 align-top text-sm";
 return <main className="mx-auto min-h-screen max-w-7xl px-4 py-10 text-gray-900 dark:text-gray-100">
  <header className="mb-8 flex flex-wrap items-center justify-between gap-5"><div><p className="text-sm font-semibold uppercase tracking-widest text-orange-600">Yumigo • Administration</p><h1 className="mt-2 text-3xl font-bold">{user.isSuperAdmin ? "Super Admin Dashboard" : "Food Management Dashboard"}</h1><p className="mt-2 text-gray-500">{user.isSuperAdmin ? "Website records, team access and order management." : "Manage food, PKR prices and stock."}</p></div><div className="flex gap-3"><Link className={btn} to="/food-management">Manage food items</Link>{user.isSuperAdmin && <button className={btn} disabled={loading} onClick={load}>Refresh records</button>}</div></header>
  {!user.isSuperAdmin ? <section className="rounded-2xl border p-8"><h2 className="text-xl font-bold">Your menu workspace</h2><p className="my-4">Add food with images, edit prices and categories, and update stock. The Super Admin manages account permissions.</p><Link className={btn} to="/food-management">Open inventory</Link></section> : <>
  {error && <p role="alert" className="mb-4 rounded-xl bg-red-50 p-4 text-red-700">{error}</p>}
  <section className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-5">{[["Users",data?.users?.length],["Products",data?.products?.length],["Orders",data?.orders?.length],["Reservations",data?.reservations?.length],["Paid revenue",data ? money(data.revenue) : null]].map(([label,value]) => <div key={label} className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-900"><p className="text-sm text-gray-500">{label}</p><p className="mt-2 break-words text-2xl font-bold">{value ?? "—"}</p></div>)}</section>
  <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900"><div className="flex flex-wrap justify-between gap-4 border-b p-4 dark:border-gray-700"><nav className="flex flex-wrap gap-2" aria-label="Website records">{["users","products","orders","reservations"].map(t => <button key={t} aria-pressed={tab===t} onClick={()=>{setTab(t);setQuery("");}} className={`rounded-lg px-4 py-2 capitalize ${tab===t ? "bg-orange-600 text-white" : "bg-gray-100 dark:bg-gray-800"}`}>{t}</button>)}</nav><input aria-label="Search records" placeholder="Search records…" className="rounded-lg border bg-transparent px-3 py-2" value={query} onChange={e=>setQuery(e.target.value)} /></div>
  {loading && <p role="status" className="p-4">Loading latest records…</p>}
  <div className="overflow-x-auto"><table className="w-full min-w-[700px]"><thead><tr>{headers.map(h=><th key={h} className="px-4 py-3 text-left text-xs uppercase tracking-wide text-gray-500">{h}</th>)}</tr></thead><tbody className="divide-y dark:divide-gray-700">{rows.map(r=><tr key={r._id}>
  {tab==="users" && <><td className={cell}><strong>{r.name}</strong><p>{r.email}</p></td><td className={cell}>{r.isSuperAdmin ? "Super Admin" : r.isAdmin ? "Admin" : "Customer"}</td><td className={cell}>{r.status}</td><td className={cell}>{date(r.createdAt)}<p>Last login: {date(r.lastLogin)}</p></td><td className={cell}>{r.isSuperAdmin ? "Protected owner account" : <div className="flex flex-wrap gap-2"><button className={btn} disabled={busy} onClick={()=>{if(window.confirm(`${r.isAdmin ? "Remove" : "Grant"} admin access for ${r.email}?`)) change(`/admin/users/${r._id}`,{isAdmin:!r.isAdmin});}}>{r.isAdmin ? "Remove admin" : "Grant admin"}</button><button className="rounded-lg border px-3 py-2" disabled={busy} onClick={()=>change(`/admin/users/${r._id}/status`,{status:r.status==="Blocked" ? "Active" : "Blocked"})}>{r.status==="Blocked" ? "Unblock" : "Block"}</button></div>}</td></>}
  {tab==="products" && <><td className={cell}><strong>{r.name}</strong></td><td className={cell}>{r.category}</td><td className={cell}>{money(r.price)}</td><td className={cell}>{r.stock}</td><td className={cell}><Link className="text-orange-600 underline" to="/food-management">Edit inventory</Link></td></>}
  {tab==="orders" && <><td className={cell}>#{r._id.slice(-8)}<p>{r.user?.name || "Deleted account"}</p><p>{r.user?.email}</p><p>{date(r.createdAt)}</p></td><td className={cell}>{r.items.map((i,k)=><p key={k}>{i.name} × {i.quantity} — {money(i.price)}</p>)}</td><td className={cell}>{money(r.totalAmount)}<p>{r.paymentStatus}</p></td><td className={cell}>{r.deliveryAddress?.fullName}<p>{r.deliveryAddress?.mobileNumber}</p><p>{[r.deliveryAddress?.roomNumber,r.deliveryAddress?.street,r.deliveryAddress?.city,r.deliveryAddress?.state,r.deliveryAddress?.pincode].filter(Boolean).join(", ")}</p></td><td className={cell}><select aria-label={`Order status ${r._id}`} className="rounded-lg border bg-white p-2 dark:bg-gray-800" disabled={busy} value={r.orderStatus} onChange={e=>change(`/admin/orders/${r._id}`,{orderStatus:e.target.value},"patch")}>{statuses.map(s=><option key={s}>{s}</option>)}</select></td></>}
  {tab==="reservations" && <><td className={cell}>{r.bookingReference}<p>{r.fullName}</p></td><td className={cell}>{r.email}<p>{r.phone}</p></td><td className={cell}>{r.date}<p>{r.timeSlot}</p></td><td className={cell}>{r.guests} guests<p>{r.diningArea}</p></td><td className={cell}>{r.status}</td></>}
  </tr>)}</tbody></table></div>{!loading && !rows.length && <p className="p-10 text-center text-gray-500">No {tab} {query ? "match your search" : "yet"}.</p>}</section>
  <p className="mt-4 text-sm text-gray-500">All amounts in PKR. Paid revenue excludes cancelled orders. Only Super Admins can grant or revoke admin access.</p><Link className="mt-4 inline-block text-orange-600 underline" to="/users">Advanced user management</Link>
  </>}
 </main>;
}
