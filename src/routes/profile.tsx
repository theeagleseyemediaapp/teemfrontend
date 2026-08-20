import { createFileRoute, redirect } from "@tanstack/react-router";
import { getStoredUser, getToken } from "@/lib/auth-session";
import { useUpdateProfile, useMyOrders } from "@/lib/api";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Save, User, CreditCard, FileText } from "lucide-react";

export const Route = createFileRoute("/profile")({
  beforeLoad: () => {
    const user = getStoredUser();
    if (!user) throw redirect({ to: "/sign-in" });
  },
  component: ProfilePage,
});

function ProfilePage() {
  const user = getStoredUser();
  const updateProfile = useUpdateProfile();
  const myOrders = useMyOrders();
  const orders = myOrders.data ?? [];
  
  const [displayName, setDisplayName] = useState(user?.displayName || "");

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName);
    }
  }, [user?.displayName]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    updateProfile.mutate(
      { id: user.id, data: { displayName } },
      {
        onSuccess: () => {
          toast.success("Profile updated successfully");
          // Update local storage user data to reflect new display name
          const stored = localStorage.getItem("eagle_user");
          if (stored) {
            const parsed = JSON.parse(stored);
            parsed.displayName = displayName;
            localStorage.setItem("eagle_user", JSON.stringify(parsed));
          }
        },
        onError: () => {
          toast.error("Failed to update profile");
        }
      }
    );
  };

  if (!user) return null;

  const handleViewReceipt = (orderId: string) => {
    const token = getToken();
    const baseUrl = import.meta.env.VITE_API_URL || "https://the-eagles-eye-backend-api.onrender.com/api/v1";
    window.open(`${baseUrl}/premium/orders/${orderId}/receipt?token=${token}`, "_blank");
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <div className="mb-8 flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-navy text-gold shadow-md">
          <User className="h-8 w-8" />
        </div>
        <div>
          <h1 className="font-serif text-3xl font-black text-navy">My Profile</h1>
          <p className="text-sm font-medium text-muted-foreground mt-1">{user.email}</p>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-6 sm:p-8 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="displayName" className="mb-2 block text-sm font-bold text-navy">
              Display Name
            </label>
            <input
              id="displayName"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full rounded border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-navy focus:ring-1 focus:ring-navy transition-all"
              placeholder="Your public display name"
              required
            />
            <p className="mt-2 text-xs text-muted-foreground">
              This is how your name will appear on comments and other interactions.
            </p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold text-navy opacity-60">
              Email Address
            </label>
            <input
              type="email"
              value={user.email}
              disabled
              className="w-full rounded border border-border bg-muted px-4 py-2.5 text-sm opacity-60 outline-none cursor-not-allowed"
            />
            <p className="mt-2 text-xs text-muted-foreground">
              Your email address is used for sign-in and cannot be changed here.
            </p>
          </div>

          <div className="pt-6 border-t border-border mt-8 flex justify-end">
            <button
              type="submit"
              disabled={updateProfile.isPending || displayName === user.displayName}
              className="inline-flex w-full items-center justify-center gap-2 rounded bg-navy px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-gold transition-colors hover:bg-navy/90 disabled:opacity-50 sm:w-auto"
            >
              {updateProfile.isPending ? "Saving..." : "Save Changes"}
              <Save className="h-4 w-4" />
            </button>
          </div>
        </form>
      </div>

      {/* Billing & Receipts */}
      <div className="mt-8 rounded-xl border border-border bg-card p-6 sm:p-8 shadow-sm">
        <h2 className="font-serif text-xl font-bold text-navy flex items-center gap-2 mb-4">
          <CreditCard className="h-5 w-5 text-gold" />
          Billing & Order History
        </h2>
        
        {myOrders.isLoading && (
          <p className="text-sm text-muted-foreground animate-pulse">Loading orders...</p>
        )}
        
        {!myOrders.isLoading && orders.length === 0 && (
          <p className="text-sm text-slate-500">You don't have any transaction history yet.</p>
        )}
        
        {!myOrders.isLoading && orders.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm text-slate-600">
              <thead>
                <tr className="border-b border-slate-100 font-bold text-navy text-xs uppercase tracking-wider">
                  <th className="pb-3">Reference</th>
                  <th className="pb-3">Date</th>
                  <th className="pb-3">Amount</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map((order: any) => (
                  <tr key={order.id} className="hover:bg-slate-50/50">
                    <td className="py-3.5 font-mono text-xs">{order.id.slice(0, 8)}...</td>
                    <td className="py-3.5">{new Date(order.created_at).toLocaleDateString()}</td>
                    <td className="py-3.5 font-semibold text-navy">{order.amount_xaf.toLocaleString()} XAF</td>
                    <td className="py-3.5">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-bold ${
                        order.status === "paid" ? "bg-emerald-50 text-emerald-700" :
                        order.status === "failed" ? "bg-red-50 text-red-700" :
                        "bg-amber-50 text-amber-700"
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3.5 text-right">
                      {order.status === "paid" && (
                        <button
                          onClick={() => handleViewReceipt(order.id)}
                          className="inline-flex items-center gap-1.5 rounded bg-navy px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-gold hover:bg-navy/90 transition-colors"
                        >
                          <FileText className="h-3 w-3" />
                          Receipt
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
