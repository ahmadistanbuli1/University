import QRCode from 'react-qr-code';

type PaymentQrProps = {
  value: string;
  size?: number;
};

/** Simulated payment QR with SPU branding (decorative; not a live payment gateway). */
export function PaymentQr({ value, size = 200 }: PaymentQrProps) {
  return (
    <div
      className="relative inline-flex rounded-2xl border-2 border-brand/20 bg-white p-4 shadow-lg shadow-brand/10 dark:border-brand/30 dark:bg-zinc-950"
      role="img"
      aria-label="Payment QR code"
    >
      <QRCode
        value={value}
        size={size}
        level="M"
        bgColor="#ffffff"
        fgColor="#1e1b4b"
        className="h-auto max-w-full"
      />
      <div
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
        aria-hidden
      >
        <span className="rounded-lg border-2 border-brand bg-white px-2.5 py-1 text-sm font-black tracking-widest text-brand shadow-md dark:border-brand-light dark:bg-zinc-900 dark:text-brand-light">
          SPU
        </span>
      </div>
    </div>
  );
}
