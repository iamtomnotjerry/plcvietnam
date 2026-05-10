import { Cloud, ScrollText } from 'lucide-react';

type Props = {
  serviceId: string;
  /** When `serviceId` is `hosting`, choose Vercel mark vs generic cloud. */
  isVercelHosting?: boolean;
  className?: string;
  /** Smaller tile for header / dense layouts. */
  variant?: 'default' | 'compact';
};

function IconSupabase({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden xmlns="http://www.w3.org/2000/svg">
      <path
        fill="currentColor"
        d="M11.9 1.036c-.015-.986-1.26-1.41-1.874-.637L.764 12.05C-.33 13.427.65 15.455 2.409 15.455h9.579l.113 7.51c.014.985 1.259 1.408 1.873.636l9.262-11.653c1.093-1.375.113-3.403-1.645-3.403h-9.642z"
      />
    </svg>
  );
}

function IconUpstash({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden xmlns="http://www.w3.org/2000/svg">
      <path
        fill="currentColor"
        d="M13.8027 0C11.193 0 8.583.9952 6.5918 2.9863c-3.9823 3.9823-3.9823 10.4396 0 14.4219 1.9911 1.9911 5.2198 1.9911 7.211 0 1.991-1.9911 1.991-5.2198 0-7.211L12 12c.9956.9956.9956 2.6098 0 3.6055-.9956.9955-2.6099.9955-3.6055 0-2.9866-2.9868-2.9866-7.8297 0-10.8164 2.9868-2.9868 7.8297-2.9868 10.8164 0l1.8028-1.8028C19.0225.9952 16.4125 0 13.8027 0zM12 12c-.9956-.9956-.9956-2.6098 0-3.6055.9956-.9955 2.6098-.9955 3.6055 0 2.9867 2.9868 2.9867 7.8297 0 10.8164-2.9867 2.9868-7.8297 2.9868-10.8164 0l-1.8028 1.8028c3.9823 3.9822 10.4396 3.9822 14.4219 0 3.9823-3.9824 3.9823-10.4396 0-14.4219-.9956-.9956-2.3006-1.4922-3.6055-1.4922-1.3048 0-2.6099.4966-3.6054 1.4922-1.9912 1.9912-1.9912 5.2198 0 7.211z"
      />
    </svg>
  );
}

function IconCloudflare({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden xmlns="http://www.w3.org/2000/svg">
      <path
        fill="currentColor"
        d="M16.5088 16.8447c.1475-.5068.0908-.9707-.1553-1.3154-.2246-.3164-.6045-.499-1.0615-.5205l-8.6592-.1123a.1559.1559 0 0 1-.1333-.0713c-.0283-.042-.0351-.0986-.021-.1553.0278-.084.1123-.1484.2036-.1562l8.7359-.1123c1.0351-.0489 2.1601-.8868 2.5537-1.9136l.499-1.3013c.0215-.0561.0293-.1128.0147-.168-.5625-2.5463-2.835-4.4453-5.5499-4.4453-2.5039 0-4.6284 1.6177-5.3876 3.8614-.4927-.3658-1.1187-.5625-1.794-.499-1.2026.119-2.1665 1.083-2.2861 2.2856-.0283.31-.0069.6128.0635.894C1.5683 13.171 0 14.7754 0 16.752c0 .1748.0142.3515.0352.5273.0141.083.0844.1475.1689.1475h15.9814c.0909 0 .1758-.0645.2032-.1553l.12-.4268zm2.7568-5.5634c-.0771 0-.1611 0-.2383.0112-.0566 0-.1054.0415-.127.0976l-.3378 1.1744c-.1475.5068-.0918.9707.1543 1.3164.2256.3164.6055.498 1.0625.5195l1.8437.1133c.0557 0 .1055.0263.1329.0703.0283.043.0351.1074.0214.1562-.0283.084-.1132.1485-.204.1553l-1.921.1123c-1.041.0488-2.1582.8867-2.5527 1.914l-.1406.3585c-.0283.0713.0215.1416.0986.1416h6.5977c.0771 0 .1474-.0489.169-.126.1122-.4082.1757-.837.1757-1.2803 0-2.6025-2.125-4.727-4.7344-4.727"
      />
    </svg>
  );
}

function IconGoogle({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden xmlns="http://www.w3.org/2000/svg">
      <path
        fill="currentColor"
        d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
      />
    </svg>
  );
}

function IconVercel({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden xmlns="http://www.w3.org/2000/svg">
      <path fill="currentColor" d="M24 22.525H0l12-21.05 12 21.05z" />
    </svg>
  );
}

const brandTextClass: Record<string, string> = {
  supabase: 'text-[#3FCF8E]',
  upstash: 'text-[#00E9A3]',
  turnstile: 'text-[#F48120]',
  google_oauth: 'text-[#4285F4]',
  hosting: 'text-foreground',
  checklog_edge: 'text-primary',
};

/**
 * Rounded tile with vendor mark (SVG paths via Simple Icons, CC0 — simpleicons.org).
 */
export function IntegrationServiceBrandIcon({
  serviceId,
  isVercelHosting = false,
  className,
  variant = 'default',
}: Props) {
  const tile =
    variant === 'compact'
      ? 'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-black/[0.06] bg-white shadow-sm dark:border-white/10 dark:bg-white/5'
      : 'flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-black/[0.06] bg-white shadow-sm dark:border-white/10 dark:bg-white/5';

  const sz =
    variant === 'compact'
      ? { brand: 'h-5 w-5', brandLg: 'h-5 w-5', lucide: 'h-5 w-5' }
      : { brand: 'h-7 w-7', brandLg: 'h-8 w-8', lucide: 'h-7 w-7' };

  if (serviceId === 'hosting') {
    if (isVercelHosting) {
      return (
        <div className={`${tile} ${className ?? ''}`}>
          <IconVercel className={`${sz.brand} ${brandTextClass.hosting}`} />
        </div>
      );
    }
    return (
      <div className={`${tile} ${className ?? ''}`}>
        <Cloud className={`${sz.lucide} text-sky-500`} strokeWidth={1.75} aria-hidden />
      </div>
    );
  }

  if (serviceId === 'checklog_edge') {
    return (
      <div className={`${tile} ${className ?? ''}`}>
        <ScrollText
          className={`${sz.lucide} ${brandTextClass.checklog_edge}`}
          strokeWidth={1.75}
          aria-hidden
        />
      </div>
    );
  }

  const textClass = brandTextClass[serviceId] ?? 'text-muted-foreground';

  const inner =
    serviceId === 'supabase' ? (
      <IconSupabase className={`${sz.brandLg} ${textClass}`} />
    ) : serviceId === 'upstash' ? (
      <IconUpstash className={`${sz.brand} ${textClass}`} />
    ) : serviceId === 'turnstile' ? (
      <IconCloudflare className={`${sz.brandLg} ${textClass}`} />
    ) : serviceId === 'google_oauth' ? (
      <IconGoogle className={`${sz.brand} ${textClass}`} />
    ) : (
      <Cloud className={`${sz.lucide} text-muted-foreground`} strokeWidth={1.75} aria-hidden />
    );

  return <div className={`${tile} ${className ?? ''}`}>{inner}</div>;
}
