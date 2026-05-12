import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";

function Modal({
  open,
  onOpenChange,
  title,
  children,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 max-h-[85vh] w-[90vw] max-w-2xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-xl bg-[#1f1f1f] p-6 shadow-2xl ring-1 ring-[#333]">
          <div className="mb-5 flex items-center justify-between">
            <Dialog.Title className="text-[15px] font-semibold text-[#e8e8e8]">
              {title}
            </Dialog.Title>
            <Dialog.Close className="rounded-md p-1 text-[#888] transition-colors hover:bg-[#2a2a2a] hover:text-[#e0e0e0]">
              <X className="h-4 w-4" />
            </Dialog.Close>
          </div>
          <div className="space-y-4 text-[13px] leading-relaxed text-[#ccc]">
            {children}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export function PrivacyDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  return (
    <Modal open={open} onOpenChange={onOpenChange} title="Privacy Policy">
      <p>
        <strong className="text-[#e8e8e8]">OpenCraft</strong> respects your privacy. This policy
        explains what data we collect and how we handle it.
      </p>

      <h3 className="text-[14px] font-semibold text-[#e8e8e8]">Data We Collect</h3>
      <ul className="list-disc pl-5 space-y-1">
        <li>
          <strong>Account data:</strong> If you sign in with Google or email, we store your name,
          email address, and profile picture to provide cloud sync functionality.
        </li>
        <li>
          <strong>Documents & content:</strong> Your notes, tasks, and workspace data are stored
          locally in your browser by default. If you sign in and enable sync, they are also stored
          in Firebase Firestore.
        </li>
        <li>
          <strong>Usage data:</strong> We do not collect analytics, telemetry, or crash reports. The
          app is designed to be privacy-first.
        </li>
      </ul>

      <h3 className="text-[14px] font-semibold text-[#e8e8e8]">How We Use Your Data</h3>
      <ul className="list-disc pl-5 space-y-1">
        <li>To provide cloud sync across devices (only when you opt in).</li>
        <li>To authenticate you via Google or email/password.</li>
        <li>We never sell, share, or monetize your data.</li>
      </ul>

      <h3 className="text-[14px] font-semibold text-[#e8e8e8]">Data Storage</h3>
      <p>
        Local data is stored in your browser's IndexedDB. Cloud data is stored in Firebase
        Firestore (Google Cloud Platform, us-central region). You can delete your cloud data at
        any time by signing in and removing your account data.
      </p>

      <h3 className="text-[14px] font-semibold text-[#e8e8e8]">Third-Party Services</h3>
      <p>
        We use Firebase (Google) for authentication and Firestore database. Google's privacy policy
        applies to data stored on their infrastructure. We do not use any analytics, tracking, or
        advertising services.
      </p>

      <h3 className="text-[14px] font-semibold text-[#e8e8e8]">Your Rights</h3>
      <p>
        You can request deletion of your account and associated data at any time by contacting us.
        You can also clear all local data via your browser settings.
      </p>

      <p className="pt-4 text-[12px] text-[#666]">
        Last updated: May 2026. If you have questions, open an issue on GitHub or contact the
        maintainer.
      </p>
    </Modal>
  );
}

export function TermsDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  return (
    <Modal open={open} onOpenChange={onOpenChange} title="Terms of Service">
      <p>
        By using <strong className="text-[#e8e8e8]">OpenCraft</strong>, you agree to these terms.
      </p>

      <h3 className="text-[14px] font-semibold text-[#e8e8e8]">Acceptance</h3>
      <p>
        By accessing or using OpenCraft, you agree to be bound by these terms. If you do not agree,
        do not use the service.
      </p>

      <h3 className="text-[14px] font-semibold text-[#e8e8e8]">License</h3>
      <p>
        OpenCraft is open source software released under the MIT License. You are free to use,
        modify, and distribute it in accordance with the license terms. The source code is
        available on GitHub.
      </p>

      <h3 className="text-[14px] font-semibold text-[#e8e8e8]">User Responsibilities</h3>
      <ul className="list-disc pl-5 space-y-1">
        <li>You are responsible for the content you create and store.</li>
        <li>You must not use OpenCraft for illegal purposes.</li>
        <li>You must not attempt to disrupt or compromise the service.</li>
        <li>You are responsible for maintaining the security of your account credentials.</li>
      </ul>

      <h3 className="text-[14px] font-semibold text-[#e8e8e8]">Service Availability</h3>
      <p>
        OpenCraft is provided "as is" without warranty. We strive for high availability but do not
        guarantee uninterrupted service. The cloud sync feature depends on Firebase services.
      </p>

      <h3 className="text-[14px] font-semibold text-[#e8e8e8]">Limitation of Liability</h3>
      <p>
        OpenCraft and its contributors are not liable for any damages arising from the use or
        inability to use the service. This includes data loss — please maintain backups of
        important documents.
      </p>

      <h3 className="text-[14px] font-semibold text-[#e8e8e8]">Changes</h3>
      <p>
        We reserve the right to update these terms. Continued use after changes constitutes
        acceptance of the new terms. Significant changes will be communicated via the app or
        GitHub repository.
      </p>

      <p className="pt-4 text-[12px] text-[#666]">
        Last updated: May 2026. For questions, open an issue on GitHub.
      </p>
    </Modal>
  );
}
