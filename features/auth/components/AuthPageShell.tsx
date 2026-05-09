'use client';

import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from 'framer-motion';
import type { ReactNode } from 'react';
import { useId, useLayoutEffect, useRef } from 'react';

export type AuthHeroVariant =
  | 'sign-in'
  | 'sign-up'
  | 'forgot-password'
  | 'reset-password'
  | 'auth-error'
  | 'email-confirmed'
  | 'email-confirm-failed';

const HERO_COPY: Record<
  AuthHeroVariant,
  { prefix: string; highlight: string; suffix?: string; description: string }
> = {
  'sign-in': {
    prefix: 'Chào mừng ',
    highlight: 'trở lại',
    description:
      'Đăng nhập để bình luận, theo dõi nội dung tự động hóa và trải nghiệm trên một giao diện được thiết kế cho kỹ sư.',
  },
  'sign-up': {
    prefix: 'Bắt đầu ',
    highlight: 'hành trình',
    description:
      'Tạo tài khoản để đọc bài, bình luận và tham gia cộng đồng kỹ sư tự động hóa Việt Nam.',
  },
  'forgot-password': {
    prefix: 'Khôi phục ',
    highlight: 'quyền truy cập',
    description:
      'Nhập email để nhận liên kết đặt lại mật khẩu an toàn — quy trình chuẩn Supabase Auth.',
  },
  'reset-password': {
    prefix: 'Đặt ',
    highlight: 'mật khẩu mới',
    description:
      'Chọn mật khẩu mạnh để bảo vệ tài khoản. Chúng tôi hiển thị tiêu chí ngay khi bạn gõ.',
  },
  'auth-error': {
    prefix: 'Đăng nhập ',
    highlight: 'gián đoạn',
    description:
      'Luồng OAuth hoặc magic link gặp sự cố. Kiểm tra cấu hình Supabase trên Vercel hoặc thử lại.',
  },
  'email-confirmed': {
    prefix: 'Email ',
    highlight: 'đã xác nhận',
    description: 'Tài khoản của bạn đã sẵn sàng. Đăng nhập để tiếp tục trải nghiệm PLC Việt Nam.',
  },
  'email-confirm-failed': {
    prefix: 'Link ',
    highlight: 'không hợp lệ',
    description:
      'Liên kết xác nhận có thể đã hết hạn hoặc đã được dùng. Bạn có thể đăng ký lại hoặc liên hệ hỗ trợ.',
  },
};

function AuroraBackdrop() {
  const reduce = useReducedMotion();
  if (reduce) {
    return (
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-1/4 top-0 h-[520px] w-[520px] rounded-full bg-primary/20 blur-[100px] dark:bg-primary/12" />
        <div className="absolute -right-1/4 bottom-0 h-[480px] w-[480px] rounded-full bg-teal-400/15 blur-[90px] dark:bg-teal-500/8" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(13,148,136,0.12),transparent)] dark:bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(45,212,191,0.08),transparent)]" />
      </div>
    );
  }
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <motion.div
        className="absolute -left-1/4 top-0 h-[520px] w-[520px] rounded-full bg-primary/25 blur-[100px] dark:bg-primary/15"
        animate={{ x: [0, 40, 0], y: [0, 30, 0], scale: [1, 1.08, 1] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute -right-1/4 bottom-0 h-[480px] w-[480px] rounded-full bg-teal-400/20 blur-[90px] dark:bg-teal-500/10"
        animate={{ x: [0, -35, 0], y: [0, -25, 0], scale: [1, 1.06, 1] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
      />
      <motion.div
        className="absolute left-1/3 top-1/2 h-[320px] w-[320px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-400/15 blur-[80px] dark:bg-amber-500/10"
        animate={{ opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(13,148,136,0.12),transparent)] dark:bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(45,212,191,0.08),transparent)]" />
    </div>
  );
}

function FloatingIcon({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      animate={
        reduce
          ? {}
          : {
              y: [0, -10, 0],
              rotate: [0, 4, -3, 0],
            }
      }
      transition={{
        duration: 6 + delay,
        repeat: Infinity,
        ease: 'easeInOut',
        delay,
      }}
    >
      {children}
    </motion.div>
  );
}

function IconShield({ gid }: { gid: string }) {
  return (
    <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" aria-hidden>
      <defs>
        <linearGradient id={gid} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="rgb(13 148 136)" />
          <stop offset="100%" stopColor="rgb(20 184 166)" />
        </linearGradient>
      </defs>
      <path
        d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3z"
        stroke={`url(#${gid})`}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <motion.path
        d="M9 12l2 2 4-4"
        stroke={`url(#${gid})`}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.2, ease: 'easeOut', delay: 0.5 }}
      />
    </svg>
  );
}

function IconCpu({ gid }: { gid: string }) {
  return (
    <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" aria-hidden>
      <defs>
        <linearGradient id={gid} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="rgb(217 119 6)" />
          <stop offset="100%" stopColor="rgb(245 158 11)" />
        </linearGradient>
      </defs>
      <rect x="9" y="9" width="6" height="6" rx="1" stroke={`url(#${gid})`} strokeWidth="1.5" />
      <motion.g
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2.5, repeat: Infinity }}
      >
        <path
          d="M9 2v2M15 2v2M9 20v2M15 20v2M20 9h2M20 14h2M2 9h2M2 14h2"
          stroke={`url(#${gid})`}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </motion.g>
    </svg>
  );
}

function IconPulse({ gid }: { gid: string }) {
  return (
    <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" aria-hidden>
      <defs>
        <linearGradient id={gid} x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgb(13 148 136)" />
          <stop offset="100%" stopColor="rgb(59 130 246)" />
        </linearGradient>
      </defs>
      <motion.path
        d="M4 12h3l2-6 4 12 3-6h4"
        stroke={`url(#${gid})`}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 2, ease: 'easeInOut', repeat: Infinity, repeatDelay: 2 }}
      />
    </svg>
  );
}

function HeroPanel({ variant }: { variant: AuthHeroVariant }) {
  const reduce = useReducedMotion();
  const idShield = `${useId()}-shield`;
  const idCpu = `${useId()}-cpu`;
  const idPulse = `${useId()}-pulse`;
  const copy = HERO_COPY[variant];

  return (
    <div className="relative flex flex-col justify-center space-y-8 lg:pr-8">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="space-y-4"
      >
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">PLC Việt Nam</p>
        <h2 className="font-serif text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
          {copy.prefix}
          <span className="bg-gradient-to-r from-primary via-teal-500 to-emerald-600 bg-clip-text text-transparent dark:from-teal-300 dark:via-primary dark:to-emerald-400">
            {copy.highlight}
          </span>
          {copy.suffix ?? ''}
        </h2>
        <p className="max-w-md text-base leading-relaxed text-muted-foreground">
          {copy.description}
        </p>
      </motion.div>

      <div className="relative flex items-center justify-center gap-6 py-4 sm:justify-start">
        <FloatingIcon
          className="flex h-16 w-16 items-center justify-center rounded-2xl border border-border/60 bg-card/80 shadow-lg shadow-primary/5 backdrop-blur-sm dark:bg-card/50"
          delay={0}
        >
          <IconShield gid={idShield} />
        </FloatingIcon>
        <FloatingIcon
          className="flex h-16 w-16 items-center justify-center rounded-2xl border border-border/60 bg-card/80 shadow-lg shadow-amber-500/10 backdrop-blur-sm dark:bg-card/50"
          delay={0.8}
        >
          <IconCpu gid={idCpu} />
        </FloatingIcon>
        <FloatingIcon
          className="flex h-16 w-16 items-center justify-center rounded-2xl border border-border/60 bg-card/80 shadow-lg shadow-blue-500/10 backdrop-blur-sm dark:bg-card/50"
          delay={1.6}
        >
          <IconPulse gid={idPulse} />
        </FloatingIcon>
      </div>

      {!reduce && (
        <motion.div
          className="hidden h-px max-w-xs bg-gradient-to-r from-transparent via-primary/40 to-transparent lg:block"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          style={{ originX: 0 }}
        />
      )}
    </div>
  );
}

function TiltCard({ children, disableTilt }: { children: ReactNode; disableTilt: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const tiltX = useMotionValue(0);
  const tiltY = useMotionValue(0);
  const springTiltX = useSpring(tiltX, { stiffness: 280, damping: 32 });
  const springTiltY = useSpring(tiltY, { stiffness: 280, damping: 32 });

  const gx = useMotionValue(0);
  const gy = useMotionValue(0);
  const springGx = useSpring(gx, { stiffness: 280, damping: 32 });
  const springGy = useSpring(gy, { stiffness: 280, damping: 32 });

  const gradient = useMotionTemplate`radial-gradient(380px circle at ${springGx}px ${springGy}px, rgba(13,148,136,0.18), transparent 55%)`;

  useLayoutEffect(() => {
    if (disableTilt || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    gx.set(r.width / 2);
    gy.set(r.height / 2);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- gx/gy MotionValues stable; only re-run when tilt mode changes
  }, [disableTilt]);

  function onMove(e: React.MouseEvent<HTMLDivElement>) {
    if (disableTilt || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const nx = (e.clientX - r.left) / r.width - 0.5;
    const ny = (e.clientY - r.top) / r.height - 0.5;
    tiltY.set(nx * 14);
    tiltX.set(-ny * 14);
    gx.set(e.clientX - r.left);
    gy.set(e.clientY - r.top);
  }

  function onLeave() {
    tiltX.set(0);
    tiltY.set(0);
    if (ref.current) {
      const r = ref.current.getBoundingClientRect();
      gx.set(r.width / 2);
      gy.set(r.height / 2);
    }
  }

  return (
    <motion.div
      ref={ref}
      className="relative rounded-3xl border border-border/80 bg-card/90 p-px shadow-2xl shadow-primary/10 backdrop-blur-xl dark:border-border/60 dark:bg-card/70 dark:shadow-primary/5"
      style={
        disableTilt
          ? undefined
          : {
              rotateX: springTiltX,
              rotateY: springTiltY,
              transformStyle: 'preserve-3d',
            }
      }
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
    >
      {!disableTilt && (
        <motion.div
          className="pointer-events-none absolute inset-0 rounded-[calc(1.5rem-1px)] opacity-90"
          style={{ background: gradient }}
        />
      )}
      <div className="relative rounded-[calc(1.5rem-1px)] bg-card/95 p-6 dark:bg-card/90 sm:p-8">
        {children}
      </div>
    </motion.div>
  );
}

export interface AuthPageShellProps {
  variant: AuthHeroVariant;
  children: ReactNode;
}

export function AuthPageShell({ variant, children }: AuthPageShellProps) {
  const reduce = useReducedMotion();

  return (
    <main className="relative min-h-[85vh] overflow-hidden px-4 py-12 sm:py-16 lg:py-20">
      <AuroraBackdrop />
      <div className="relative z-10 mx-auto grid max-w-6xl gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)] lg:items-center lg:gap-16">
        <HeroPanel variant={variant} />
        <div style={{ perspective: reduce ? undefined : 1200 }}>
          <TiltCard disableTilt={!!reduce}>{children}</TiltCard>
        </div>
      </div>
    </main>
  );
}
