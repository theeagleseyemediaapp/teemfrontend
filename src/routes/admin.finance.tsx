import { createFileRoute, redirect } from '@tanstack/react-router';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Wallet, ArrowDownCircle, ArrowUpCircle, SendHorizontal } from 'lucide-react';

import { getStoredUser } from '@/lib/auth-session';

export const Route = createFileRoute('/admin/finance')({
  beforeLoad: () => {
    const user = getStoredUser();
    if (!user) throw redirect({ to: '/sign-in' });
    if (user.role !== 'super_admin') {
      throw redirect({ to: '/admin' });
    }
  },
  component: AdminFinancePage,
});

const API_BASE = import.meta.env.VITE_API_URL ?? "/api/v1";

function AdminFinancePage() {
  const [amount, setAmount] = useState('');
  const [phone, setPhone] = useState('');
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  const handleTransaction = async (action: 'withdraw' | 'deposit' | 'transfer') => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    if (!phone || phone.length < 9) {
      toast.error('Please enter a valid mobile money number');
      return;
    }

    setLoadingAction(action);
    try {
      const token = localStorage.getItem("eem_auth_token");
      const res = await fetch(`${API_BASE}/finance/${action}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          amount: Number(amount),
          [action === 'deposit' ? 'payer' : 'receiver']: phone,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Transaction failed');

      toast.success(`${action.charAt(0).toUpperCase() + action.slice(1)} successful! Ref: ${data.result?.providerRef}`);
      setAmount('');
      setPhone('');
    } catch (err: any) {
      toast.error(err.message || 'Transaction failed');
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="font-serif font-black text-3xl text-navy flex items-center gap-2">
          <Wallet className="size-7 text-gold" /> Finance Management
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Manage platform funds. Powered by MeSomb. Restricted to Super Admin only.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-navy/10 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">New Transaction</CardTitle>
            <CardDescription>Initiate a mobile money transaction.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label>Amount (XAF) <span className="text-red-500">*</span></Label>
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g. 5000"
                min={100}
              />
            </div>
            
            <div className="space-y-1.5">
              <Label>Mobile Money Number <span className="text-red-500">*</span></Label>
              <Input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="6XXXXXXXX"
              />
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2">
              <Button
                variant="outline"
                className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100 font-semibold"
                onClick={() => handleTransaction('deposit')}
                disabled={loadingAction !== null}
              >
                {loadingAction === 'deposit' ? 'Processing...' : <><ArrowDownCircle className="size-4 mr-1.5" /> Deposit</>}
              </Button>
              <Button
                variant="outline"
                className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 font-semibold"
                onClick={() => handleTransaction('transfer')}
                disabled={loadingAction !== null}
              >
                {loadingAction === 'transfer' ? 'Processing...' : <><SendHorizontal className="size-4 mr-1.5" /> Transfer</>}
              </Button>
              <Button
                variant="outline"
                className="bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 font-semibold"
                onClick={() => handleTransaction('withdraw')}
                disabled={loadingAction !== null}
              >
                {loadingAction === 'withdraw' ? 'Processing...' : <><ArrowUpCircle className="size-4 mr-1.5" /> Withdraw</>}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-navy/10 shadow-sm bg-navy/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-navy">Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p><strong>Deposit:</strong> Pulls funds from the specified mobile money account into the application's MeSomb balance. The user will receive a prompt on their phone to approve.</p>
            <p><strong>Withdraw / Payout:</strong> Pushes funds from the application's balance to the specified mobile money account. (Requires payout permissions from MeSomb).</p>
            <p><strong>Transfer:</strong> Structurally similar to a payout in this interface.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
