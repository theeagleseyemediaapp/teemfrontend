import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAdminEmployees, useCreateEmployee, useDeleteEmployee, useResendEmployeeEmail, type Employee } from "@/lib/api";
import { getStoredUser } from "@/lib/auth-session";
import { compressAndUploadImage } from "@/lib/image-upload";
import { playEagleHasLanded } from "@/lib/audio-alerts";
import { 
  Users, 
  QrCode, 
  Mail, 
  Trash2, 
  Plus, 
  Loader2, 
  Clock, 
  ShieldCheck, 
  ShieldAlert, 
  Download, 
  Printer, 
  X,
  Camera
} from "lucide-react";

export const Route = createFileRoute("/admin/employees")({
  beforeLoad: () => {
    const user = getStoredUser();
    if (!user) throw redirect({ to: "/sign-in" });
    if (user.role !== "admin" && user.role !== "editor" && user.role !== "super_admin") {
      throw redirect({ to: "/" });
    }
  },
  component: AdminEmployees,
});

function AdminEmployees() {
  const employees = useAdminEmployees();
  const create = useCreateEmployee();
  const deleteEmployee = useDeleteEmployee();
  const resendEmail = useResendEmployeeEmail();

  // Modals & form state
  const [createOpen, setCreateOpen] = useState(false);
  const [badgeOpen, setBadgeOpen] = useState<Employee | null>(null);
  
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    age: "",
    role: "",
    department: "",
    expiryHours: 24,
  });

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    
    if (!form.fullName || !form.email || !form.age) {
      setErrorMsg("Please fill out all required fields.");
      return;
    }

    try {
      let photoUrl = "";
      if (photoFile) {
        setUploadingPhoto(true);
        const res = await compressAndUploadImage(photoFile, "media");
        photoUrl = res.url;
        setUploadingPhoto(false);
      }

      await create.mutateAsync({
        fullName: form.fullName,
        email: form.email,
        age: parseInt(form.age),
        role: form.role,
        department: form.department,
        expiryHours: Number(form.expiryHours),
        photoUrl: photoUrl || undefined,
      });

      playEagleHasLanded();

      // Clear form
      setForm({
        fullName: "",
        email: "",
        age: "",
        role: "",
        department: "",
        expiryHours: 24,
      });
      setPhotoFile(null);
      setPhotoPreview(null);
      setCreateOpen(false);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to create employee pass.");
      setUploadingPhoto(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this employee pass? Scans of this QR code will no longer work.")) {
      try {
        await deleteEmployee.mutateAsync(id);
      } catch (err: any) {
        alert(err.message || "Failed to delete pass.");
      }
    }
  };

  const handleResendEmail = async (id: string) => {
    try {
      await resendEmail.mutateAsync(id);
      alert("Verification badge email has been resent successfully!");
    } catch (err: any) {
      alert(err.message || "Failed to send email.");
    }
  };

  // Helper to determine active state
  const isPassActive = (expiresAt: string) => {
    return new Date(expiresAt).getTime() > Date.now();
  };

  // Helper to trigger print of the badge modal
  const handlePrintBadge = () => {
    const printContent = document.getElementById("printable-badge");
    if (!printContent) return;
    
    const windowUrl = "about:blank";
    const uniqueName = new Date().getTime();
    const printWindow = window.open(windowUrl, uniqueName.toString(), "left=50,top=50,width=600,height=800");
    if (!printWindow) return;
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Print Staff Badge</title>
          <style>
            body {
              font-family: 'Inter', sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
              margin: 0;
              background: #fff;
            }
            .badge-container {
              width: 320px;
              height: 480px;
              border: 3px solid #050596;
              border-radius: 12px;
              padding: 24px;
              box-shadow: 0 4px 6px rgba(0,0,0,0.1);
              display: flex;
              flex-direction: column;
              align-items: center;
              text-align: center;
              position: relative;
            }
            .badge-header {
              font-family: Georgia, serif;
              color: #050596;
              font-size: 20px;
              font-weight: 900;
              text-transform: uppercase;
              letter-spacing: 1px;
              margin-bottom: 4px;
            }
            .badge-subheader {
              color: #d97706;
              font-size: 11px;
              font-weight: 700;
              text-transform: uppercase;
              letter-spacing: 2px;
              margin-bottom: 20px;
            }
            .avatar {
              width: 110px;
              height: 110px;
              border-radius: 50%;
              object-fit: cover;
              border: 3px solid #050596;
              margin-bottom: 16px;
            }
            .name {
              font-size: 18px;
              font-weight: bold;
              color: #1e293b;
              margin-bottom: 6px;
            }
            .role {
              font-size: 14px;
              color: #475569;
              font-weight: 600;
              margin-bottom: 2px;
            }
            .department {
              font-size: 11px;
              color: #64748b;
              text-transform: uppercase;
              font-weight: bold;
              margin-bottom: 24px;
            }
            .qr-code {
              width: 140px;
              height: 140px;
              margin-bottom: 12px;
            }
            .badge-footer {
              font-size: 10px;
              color: #64748b;
              font-family: monospace;
              border-top: 1px solid #e2e8f0;
              width: 100%;
              padding-top: 12px;
              margin-top: auto;
            }
          </style>
        </head>
        <body>
          <div class="badge-container">
            ${printContent.innerHTML}
          </div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const activePassCount = (employees.data ?? []).filter(e => isPassActive(e.expires_at)).length;
  const expiredPassCount = (employees.data ?? []).length - activePassCount;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif font-black text-3xl text-navy">Employee Recognition Passes</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage temporary verified credentials and scan-enabled employee badges.</p>
        </div>
        <Button onClick={() => setCreateOpen(true)} className="bg-navy hover:bg-navy/95 text-white flex items-center gap-1.5 self-start sm:self-auto">
          <Plus className="size-4" /> Create Verification Pass
        </Button>
      </div>

      {/* Metrics Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="bg-white border-l-4 border-l-navy dark:bg-slate-900">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Credentials</p>
                <h3 className="text-3xl font-black text-navy dark:text-white mt-1">
                  {employees.isLoading ? "…" : (employees.data ?? []).length}
                </h3>
              </div>
              <Users className="size-8 text-navy/20" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-l-4 border-l-emerald-500 dark:bg-slate-900">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Passes</p>
                <h3 className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                  {employees.isLoading ? "…" : activePassCount}
                </h3>
              </div>
              <ShieldCheck className="size-8 text-emerald-500/20" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-l-4 border-l-rose-500 dark:bg-slate-900">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Expired Passes</p>
                <h3 className="text-3xl font-black text-rose-600 dark:text-rose-400 mt-1">
                  {employees.isLoading ? "…" : expiredPassCount}
                </h3>
              </div>
              <ShieldAlert className="size-8 text-rose-500/20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Employee List Card */}
      <Card className="bg-white dark:bg-slate-900 shadow-sm border border-slate-200/80">
        <CardHeader>
          <CardTitle className="text-base font-bold text-navy flex items-center gap-2">
            <QrCode className="size-4 text-gold" />
            Active Passes Directory
          </CardTitle>
        </CardHeader>
        <CardContent>
          {employees.isLoading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="size-6 animate-spin text-navy" />
              <span className="text-sm ml-2 text-muted-foreground">Loading employee directory…</span>
            </div>
          )}

          {!employees.isLoading && (employees.data ?? []).length === 0 && (
            <div className="text-center py-16 border-2 border-dashed border-slate-200 rounded-lg">
              <Users className="size-10 mx-auto text-slate-300" />
              <h3 className="font-bold text-slate-700 mt-4">No Employees Registered</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-2">
                Get started by creating your first temporary employee pass. The system will auto-generate their badge QR code.
              </p>
              <Button onClick={() => setCreateOpen(true)} className="bg-navy hover:bg-navy/95 text-white mt-4" size="sm">
                Add Employee Pass
              </Button>
            </div>
          )}

          {!employees.isLoading && (employees.data ?? []).length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase">
                    <th className="pb-3 pt-2 pl-4">Staff Member</th>
                    <th className="pb-3 pt-2">Designation / Dept</th>
                    <th className="pb-3 pt-2">Status</th>
                    <th className="pb-3 pt-2">Expiry Date</th>
                    <th className="pb-3 pt-2 pr-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {(employees.data ?? []).map((emp) => {
                    const active = isPassActive(emp.expires_at);
                    const formattedDate = new Date(emp.expires_at).toLocaleString("en-US", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    });

                    return (
                      <tr key={emp.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                        {/* Profile Info */}
                        <td className="py-4 pl-4 flex items-center gap-3">
                          <img
                            src={emp.photo_url || "/profile-circle-svgrepo-com.svg"}
                            alt={emp.full_name}
                            className="size-10 rounded-full object-cover border border-slate-200"
                          />
                          <div>
                            <div className="font-bold text-navy dark:text-white leading-tight">{emp.full_name}</div>
                            <div className="text-[11px] text-slate-400 mt-0.5">{emp.email} • Age: {emp.age}</div>
                          </div>
                        </td>

                        {/* Role & Dept */}
                        <td className="py-4">
                          <div className="font-semibold text-slate-700 dark:text-slate-300">{emp.role || "Staff"}</div>
                          <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">{emp.department || "Operations"}</div>
                        </td>

                        {/* Status */}
                        <td className="py-4">
                          {active ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <span className="size-1.5 rounded-full bg-emerald-600 animate-pulse" />
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                              Expired
                            </span>
                          )}
                        </td>

                        {/* Expiry */}
                        <td className="py-4 text-xs font-medium text-slate-600 dark:text-slate-400">
                          <span className="flex items-center gap-1">
                            <Clock className="size-3.5" />
                            {formattedDate}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-4 pr-4 text-right">
                          <div className="inline-flex items-center gap-1">
                            <Button 
                              onClick={() => setBadgeOpen(emp)}
                              variant="outline" 
                              size="sm"
                              className="size-8 p-0"
                              title="View & Print Badge"
                            >
                              <Printer className="size-4" />
                            </Button>
                            <Button 
                              onClick={() => handleResendEmail(emp.id)}
                              variant="outline" 
                              size="sm"
                              className="size-8 p-0"
                              title="Resend Pass Email"
                              disabled={resendEmail.isPending}
                            >
                              <Mail className="size-4" />
                            </Button>
                            <Button 
                              onClick={() => handleDelete(emp.id)}
                              variant="outline" 
                              size="sm"
                              className="size-8 p-0 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200"
                              title="Delete Pass"
                              disabled={deleteEmployee.isPending}
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* CREATE MODAL */}
      {createOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 rounded-xl shadow-2xl w-full max-w-md overflow-hidden relative animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-navy px-6 py-4 flex items-center justify-between text-white">
              <h3 className="font-serif font-black text-lg">New Employee Pass</h3>
              <button onClick={() => setCreateOpen(false)} className="text-white/80 hover:text-white transition-colors">
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4">
              {errorMsg && (
                <div className="p-3 text-xs bg-rose-50 text-rose-700 border border-rose-200 rounded">
                  {errorMsg}
                </div>
              )}

              {/* Photo Upload */}
              <div className="flex flex-col items-center gap-2 pb-2">
                <div className="relative group cursor-pointer size-20 rounded-full border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden bg-slate-50 hover:bg-slate-100 transition-colors">
                  {photoPreview ? (
                    <img src={photoPreview} alt="Preview" className="size-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center text-slate-400">
                      <Camera className="size-5" />
                      <span className="text-[9px] mt-1 font-semibold">PHOTO</span>
                    </div>
                  )}
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handlePhotoChange} 
                    className="absolute inset-0 opacity-0 cursor-pointer" 
                  />
                </div>
                <span className="text-[10px] text-slate-400 font-medium">Click to upload photo ID (Optional)</span>
              </div>

              {/* Full Name */}
              <div className="space-y-1">
                <Label htmlFor="fullName" className="text-xs font-bold text-slate-600 uppercase">Full Name *</Label>
                <Input
                  id="fullName"
                  required
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  placeholder="e.g. John Doe"
                />
              </div>

              {/* Email & Age Row */}
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2 space-y-1">
                  <Label htmlFor="email" className="text-xs font-bold text-slate-600 uppercase">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="e.g. name@domain.com"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="age" className="text-xs font-bold text-slate-600 uppercase">Age *</Label>
                  <Input
                    id="age"
                    type="number"
                    required
                    min={18}
                    max={100}
                    value={form.age}
                    onChange={(e) => setForm({ ...form, age: e.target.value })}
                    placeholder="25"
                  />
                </div>
              </div>

              {/* Role & Dept Row */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="role" className="text-xs font-bold text-slate-600 uppercase">Designation / Role</Label>
                  <Input
                    id="role"
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                    placeholder="e.g. Reporter"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="department" className="text-xs font-bold text-slate-600 uppercase">Department</Label>
                  <Input
                    id="department"
                    value={form.department}
                    onChange={(e) => setForm({ ...form, department: e.target.value })}
                    placeholder="e.g. Editorial"
                  />
                </div>
              </div>

              {/* Expiration Settings */}
              <div className="space-y-1">
                <Label htmlFor="expiryHours" className="text-xs font-bold text-slate-600 uppercase">Pass Validity (Hours)</Label>
                <select
                  id="expiryHours"
                  value={form.expiryHours}
                  onChange={(e) => setForm({ ...form, expiryHours: Number(e.target.value) })}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value={1}>1 Hour (Temporary Visitor)</option>
                  <option value={12}>12 Hours</option>
                  <option value={24}>24 Hours (Default Guest)</option>
                  <option value={48}>48 Hours</option>
                  <option value={168}>1 Week (168 Hours)</option>
                  <option value={720}>1 Month (30 Days)</option>
                  <option value={8760}>1 Year (365 Days Press Pass)</option>
                  <option value={876000}>Permanent Worker (Permanent Staff - No Expiration)</option>
                </select>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-2">
                <Button 
                  type="submit" 
                  className="flex-1 bg-navy hover:bg-navy/95 text-white"
                  disabled={create.isPending || uploadingPhoto}
                >
                  {(create.isPending || uploadingPhoto) ? (
                    <>
                      <Loader2 className="size-4 animate-spin mr-1.5" />
                      Creating Pass…
                    </>
                  ) : (
                    "Generate & Mail Pass"
                  )}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setCreateOpen(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BADGE PREVIEW & PRINT POPUP */}
      {badgeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 rounded-xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-navy px-4 py-3 flex items-center justify-between text-white">
              <h3 className="font-bold text-sm">Official Badge Preview</h3>
              <button onClick={() => setBadgeOpen(null)} className="text-white/80 hover:text-white transition-colors">
                <X className="size-5" />
              </button>
            </div>

            {/* Preview Area */}
            <div className="p-8 flex justify-center bg-slate-50 dark:bg-slate-800">
              <div 
                id="printable-badge"
                className="w-[260px] h-[390px] flex flex-col items-center text-center relative"
              >
                {/* Header */}
                <div className="badge-header font-serif font-black text-navy text-[17px] leading-none">THE EAGLE'S EYE</div>
                <div className="badge-subheader text-[9px] text-amber-500 font-extrabold uppercase tracking-widest mt-1">Parliament Press</div>

                {/* Profile Pic */}
                <img
                  src={badgeOpen.photo_url || "/profile-circle-svgrepo-com.svg"}
                  alt={badgeOpen.full_name}
                  className="avatar size-24 rounded-full object-cover border-2 border-navy mt-4"
                />

                {/* Details */}
                <div className="name font-sans font-bold text-[15px] text-slate-800 mt-2.5 leading-tight">{badgeOpen.full_name}</div>
                <div className="role text-[11px] text-slate-600 font-semibold mt-0.5">{badgeOpen.role || "Staff"}</div>
                <div className="department text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">{badgeOpen.department || "Operations"}</div>

                {/* QR Code */}
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(`${window.location.origin}/verify-employee/${badgeOpen.id}`)}`}
                  alt="QR Code"
                  className="qr-code size-24 mt-3 object-contain"
                />

                {/* Footer */}
                <div className="badge-footer text-[9px] text-slate-400 font-mono border-t border-slate-100 w-full pt-1.5 mt-auto">
                  EXP: {new Date(badgeOpen.expires_at).toLocaleDateString()} • ID: {badgeOpen.id.slice(0, 8)}
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="p-4 border-t border-slate-100 flex gap-2 bg-white dark:bg-slate-900">
              <Button onClick={handlePrintBadge} className="flex-1 bg-navy hover:bg-navy/95 text-white flex items-center justify-center gap-1.5 text-xs font-semibold">
                <Printer className="size-4" /> Print Badge
              </Button>
              <a 
                href={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(`${window.location.origin}/verify-employee/${badgeOpen.id}`)}`}
                download={`qr_badge_${badgeOpen.id.slice(0, 8)}.png`}
                target="_blank"
                rel="noreferrer"
                className="flex-1"
              >
                <Button variant="outline" className="w-full flex items-center justify-center gap-1.5 text-xs font-semibold">
                  <Download className="size-4" /> Save QR Code
                </Button>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
