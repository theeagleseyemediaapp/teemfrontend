import { useState, useEffect, useCallback } from "react";
import { X, Phone, Clock } from "lucide-react";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  provider: string;
  phone: string;
  orderId: string;
  amount: number;
  onPaid?: () => void;
}

function getUssdCode(provider: string, phone: string): { code: string | null; network: string } {
  const cleanPhone = phone.replace(/[^0-9]/g, "");
  const isCM = cleanPhone.startsWith("237");
  const local = isCM ? cleanPhone.slice(3) : cleanPhone;
  const prefix3 = parseInt(local.slice(0, 3), 10);

  // AIRTEL (Nexttel/Viettel): 660–669
  if (prefix3 >= 660 && prefix3 <= 669) {
    return { code: isCM ? "#919#" : null, network: "Airtel" };
  }
  // Orange: 655–659, 690–699
  if ((prefix3 >= 655 && prefix3 <= 659) || (prefix3 >= 690 && prefix3 <= 699) || provider === "orange") {
    return { code: isCM ? "#150#" : null, network: "Orange Money" };
  }
  // MTN: everything else (650–654, 670–689)
  return { code: isCM ? "*126#" : null, network: "MTN Mobile Money" };
}

export function PaymentModal({ isOpen, onClose, provider, phone, orderId, amount, onPaid }: PaymentModalProps) {
  const [secondsLeft, setSecondsLeft] = useState(180);
  const [status, setStatus] = useState<"pending" | "checking" | "paid" | "expired">("pending");
  const { code, network } = getUssdCode(provider, phone);

  const checkStatus = useCallback(async () => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("eagle_token") : null;
      const apiBase = (import.meta as any).env?.VITE_API_URL ?? "https://the-eagles-eye-backend-api.onrender.com/api/v1";
      const res = await fetch(`${apiBase}/premium/orders/${orderId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const data = await res.json();
        if (data.status === "paid") {
          setStatus("paid");
          onPaid?.();
        }
      }
    } catch { /* ignore */ }
  }, [orderId, onPaid]);

  useEffect(() => {
    if (!isOpen) {
      setSecondsLeft(180);
      setStatus("pending");
      return;
    }
    setStatus("pending");
    const interval = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          setStatus("expired");
          clearInterval(interval);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || status !== "pending") return;
    const poll = setInterval(checkStatus, 5000);
    return () => clearInterval(poll);
  }, [isOpen, status, checkStatus]);

  if (!isOpen) return null;

  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const isUrgent = secondsLeft <= 30;
  const isExpired = status === "expired";

  return (
    <div className="fixed inset-0 z-[90] bg-black/60 flex items-center justify-center p-4" onClick={isExpired ? onClose : undefined}>
      <div className="bg-white rounded shadow-xl max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
        <div className={`px-4 py-3 text-center ${isExpired ? "bg-red-600" : isUrgent ? "bg-red-500" : "bg-navy"}`}>
          <Phone className="size-8 text-white/90 mx-auto mb-1.5" />
          <h3 className="font-serif font-bold text-lg text-white">Complete Payment</h3>
          {isExpired ? (
            <p className="text-white/80 text-xs mt-1">Transaction cancelled — time expired</p>
          ) : (
            <p className="text-white/70 text-xs mt-1">{code ? "Use the USSD code on your phone" : "Approve the payment on your phone"}</p>
          )}
        </div>

        <div className="p-4 text-center">
          {!isExpired ? (
            <>
              <div className="mb-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">{network}</span>
                {code ? (
                  <div className="mt-1 text-3xl font-bold text-navy tracking-wider">{code}</div>
                ) : (
                  <div className="mt-2 text-sm font-bold text-navy">Check your phone for a prompt</div>
                )}
                <p className="text-xs text-gray-500 mt-1">Confirm payment of <strong>{amount.toLocaleString()} XAF</strong></p>
              </div>

              <div className={`inline-flex items-center gap-1.5 rounded px-3 py-1.5 mb-3 ${isUrgent ? "bg-red-50 text-red-700" : "bg-gray-100 text-gray-700"}`}>
                <Clock className={`size-3.5 ${isUrgent ? "animate-spin" : ""}`} />
                <span className="font-bold text-sm">{mins}:{secs.toString().padStart(2, "0")}</span>
              </div>

              <p className="text-[11px] text-gray-500 mb-3">
                Enter <strong>{phone}</strong> as recipient if asked.
              </p>
            </>
          ) : (
            <div className="py-6">
              <p className="text-gray-600 text-sm mb-3">Your order has been cancelled because payment was not completed in time.</p>
              <button onClick={onClose} className="rounded bg-navy px-4 py-1.5 font-bold text-white text-sm hover:bg-navy/90">
                Close
              </button>
            </div>
          )}

          {status === "paid" && (
            <div className="py-6">
              <div className="text-navy mb-2">
                <svg className="size-10 mx-auto text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="font-bold text-navy">Payment successful!</p>
              <p className="text-xs text-gray-500 mb-4">Your premium access is being activated.</p>
              <div className="flex gap-2 justify-center">
                <a
                  href={`/api/v1/premium/orders/${orderId}/receipt?token=${localStorage.getItem("eagle_token") ?? ""}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded bg-emerald-600 px-4 py-1.5 font-bold text-white text-sm hover:bg-emerald-700 inline-flex items-center gap-1.5"
                >
                  Download Receipt
                </a>
                <button
                  onClick={onClose}
                  className="rounded bg-navy px-4 py-1.5 font-bold text-white text-sm hover:bg-navy/90"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
