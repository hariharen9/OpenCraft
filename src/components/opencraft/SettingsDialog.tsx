import { useState, useEffect } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X, Link2, Unlink2, Cloud, LogOut, Mail, Loader2 } from "lucide-react";
import { useEditorStore } from "@/store/editor-store";
import { useSettingsStore } from "@/store/settings-store";
import { useAuthStore } from "@/store/auth-store";

const PRESETS = [
  "#ff8a4c",
  "#4cc2ff",
  "#a78bfa",
  "#34d399",
  "#f472b6",
  "#fbbf24",
  "#ef4444",
  "#22c55e",
];

export function SettingsDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const storeAccent = useEditorStore((s) => s.accentColor);
  const setAccentColor = useEditorStore((s) => s.setAccentColor);
  const [custom, setCustom] = useState(storeAccent);

  const syncCalendarTasks = useSettingsStore((s) => s.syncCalendarTasks);
  const setSyncCalendarTasks = useSettingsStore((s) => s.setSyncCalendarTasks);
  const loadSettings = useSettingsStore((s) => s.loadSettings);

  const auth = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);

  useEffect(() => {
    if (open) loadSettings();
  }, [open, loadSettings]);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-xl bg-[#1f1f1f] p-6 shadow-2xl ring-1 ring-[#333]">
          <div className="mb-5 flex items-center justify-between">
            <Dialog.Title className="text-[15px] font-semibold text-[#e8e8e8]">Settings</Dialog.Title>
            <Dialog.Close className="rounded-md p-1 text-[#888] transition-colors hover:bg-[#2a2a2a] hover:text-[#e0e0e0]">
              <X className="h-4 w-4" />
            </Dialog.Close>
          </div>

          <div className="space-y-6">
            {/* Accent color */}
            <div>
              <label className="mb-2 block text-[12px] font-medium text-[#ccc]">Accent Color</label>
              <div className="flex flex-wrap gap-2">
                {PRESETS.map((c) => (
                  <button
                    key={c}
                    onClick={() => { setAccentColor(c); setCustom(c); }}
                    className="h-8 w-8 rounded-full transition-all active:scale-90"
                    style={{
                      backgroundColor: c,
                      outline: storeAccent === c ? "2px solid #fff" : "2px solid transparent",
                      outlineOffset: "2px",
                    }}
                  />
                ))}
              </div>

              <div className="mt-3 flex items-center gap-2">
                <input
                  type="color"
                  value={custom}
                  onChange={(e) => { setCustom(e.target.value); setAccentColor(e.target.value); }}
                  className="h-8 w-8 cursor-pointer rounded border-0 bg-transparent p-0"
                />
                <input
                  type="text"
                  value={custom}
                  onChange={(e) => setCustom(e.target.value)}
                  onBlur={() => setAccentColor(custom)}
                  onKeyDown={(e) => { if (e.key === "Enter") setAccentColor(custom); }}
                  placeholder="#hex"
                  className="flex-1 rounded-md bg-[#262626] px-2.5 py-1.5 text-[13px] text-[#e0e0e0] outline-none ring-1 ring-[#333] transition-all focus:ring-[#555] placeholder:text-[#555]"
                />
              </div>
            </div>

            {/* Calendar-Tasks sync */}
            <div>
              <label className="mb-2 block text-[12px] font-medium text-[#ccc]">Integrations</label>
              <button
                onClick={() => setSyncCalendarTasks(!syncCalendarTasks)}
                className="flex w-full items-center gap-3 rounded-lg bg-[#262626] px-4 py-3 ring-1 ring-[#333] transition-colors hover:bg-[#2c2c2c]"
              >
                <div className={"flex h-8 w-8 items-center justify-center rounded-lg " + (syncCalendarTasks ? "bg-[#ff8a4c]/15 text-[#ff8a4c]" : "bg-[#333] text-[#666]")}>
                  {syncCalendarTasks ? <Link2 className="h-4 w-4" /> : <Unlink2 className="h-4 w-4" />}
                </div>
                <div className="flex-1 text-left">
                  <div className="text-[13px] font-medium text-[#e0e0e0]">
                    Calendar ↔ Tasks sync
                  </div>
                  <div className="text-[11px] text-[#777]">
                    {syncCalendarTasks
                      ? "Tasks with due dates appear on the calendar"
                      : "Calendar and tasks are independent"}
                  </div>
                </div>
                <div
                  className={"h-5 w-9 rounded-full p-0.5 transition-colors " + (syncCalendarTasks ? "bg-[#ff8a4c]" : "bg-[#444]")}
                >
                  <div
                    className={"h-4 w-4 rounded-full bg-white transition-transform " + (syncCalendarTasks ? "translate-x-4" : "translate-x-0")}
                  />
                </div>
              </button>
            </div>

            {/* Cloud Sync & Account */}
            <div>
              <label className="mb-2 block text-[12px] font-medium text-[#ccc]">Account & Cloud Sync</label>
              
              {auth.user ? (
                <div className="rounded-lg bg-[#262626] p-4 ring-1 ring-[#333]">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#333]">
                      {auth.user.photoURL ? (
                        <img src={auth.user.photoURL} alt="Avatar" className="h-10 w-10 rounded-full" />
                      ) : (
                        <Cloud className="h-5 w-5 text-[#888]" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="text-[14px] font-medium text-[#e0e0e0]">{auth.user.displayName || "User"}</div>
                      <div className="text-[12px] text-[#888]">{auth.user.email}</div>
                    </div>
                    <button
                      onClick={() => auth.signOut()}
                      className="flex items-center gap-2 rounded-md bg-[#333] px-3 py-1.5 text-[12px] font-medium text-[#ccc] hover:bg-[#444] transition-colors"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      Sign Out
                    </button>
                  </div>
                  <div className="text-[12px] text-[#777] bg-[#1a1a1a] p-2.5 rounded-md border border-[#333]">
                    <span className="text-[#34d399] mr-1">●</span> Sync is active. Your documents, tasks, and workspaces are safely backed up and synced across devices.
                  </div>
                </div>
              ) : (
                <div className="rounded-lg bg-[#262626] p-4 ring-1 ring-[#333]">
                  <div className="text-[12px] text-[#999] mb-4">
                    Sign in to sync your workspace securely to the cloud. You can continue using OpenCraft entirely offline if you prefer.
                  </div>
                  
                  {auth.error && (
                    <div className="mb-4 text-[12px] text-[#ef4444] bg-[#ef4444]/10 p-2 rounded-md">
                      {auth.error}
                    </div>
                  )}

                  <div className="space-y-3">
                    <button
                      onClick={() => auth.signInWithGoogle()}
                      disabled={auth.loading}
                      className="flex w-full items-center justify-center gap-2 rounded-md bg-white text-black px-4 py-2 text-[13px] font-semibold hover:bg-gray-100 transition-colors disabled:opacity-50"
                    >
                      {auth.loading ? <Loader2 className="h-4 w-4 animate-spin" /> : (
                        <svg className="w-4 h-4" viewBox="0 0 24 24">
                          <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                      )}
                      Continue with Google
                    </button>
                    
                    <div className="relative flex items-center">
                      <div className="flex-grow border-t border-[#444]"></div>
                      <span className="flex-shrink-0 mx-3 text-[#666] text-[11px] uppercase tracking-wider">Or</span>
                      <div className="flex-grow border-t border-[#444]"></div>
                    </div>

                    <form 
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (isSignUp) auth.signUpWithEmail(email, password, "");
                        else auth.signInWithEmail(email, password);
                      }}
                      className="space-y-3"
                    >
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email address"
                        className="w-full rounded-md bg-[#1a1a1a] px-3 py-2 text-[13px] text-[#e0e0e0] outline-none ring-1 ring-[#333] focus:ring-[#555] placeholder:text-[#666]"
                      />
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password"
                        className="w-full rounded-md bg-[#1a1a1a] px-3 py-2 text-[13px] text-[#e0e0e0] outline-none ring-1 ring-[#333] focus:ring-[#555] placeholder:text-[#666]"
                      />
                      <button
                        type="submit"
                        disabled={auth.loading || !email || !password}
                        className="w-full rounded-md bg-[#333] px-4 py-2 text-[13px] font-medium text-[#e0e0e0] hover:bg-[#444] transition-colors disabled:opacity-50"
                      >
                        {auth.loading ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : (isSignUp ? "Create Account" : "Sign In")}
                      </button>
                    </form>
                    <div className="text-center mt-2">
                      <button
                        onClick={() => { setIsSignUp(!isSignUp); auth.clearError(); }}
                        className="text-[11px] text-[#888] hover:text-[#bbb] underline underline-offset-2"
                      >
                        {isSignUp ? "Already have an account? Sign In" : "Need an account? Sign Up"}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
