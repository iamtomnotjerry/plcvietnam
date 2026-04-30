/**
 * HeroSection — editorial hero with premium 3D motion
 */

'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

export interface HeroSectionProps {
  title: string;
  tagline: string;
  description: string;
}

export function HeroSection({ title, tagline, description }: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden border-b border-border/60 bg-gradient-to-br from-primary/[0.07] via-background to-accent/[0.06] py-20 md:py-28">
      <div className="container relative z-[1] mx-auto max-w-6xl px-4">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto max-w-3xl space-y-6 text-center"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            PLC · SCADA · Siemens
          </p>
          <h1
            className="text-[2.25rem] font-semibold leading-tight tracking-tight text-foreground sm:text-5xl md:text-6xl"
            style={{ fontFamily: 'var(--font-serif), ui-serif, Georgia, serif' }}
          >
            {title}
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="text-lg font-medium text-primary md:text-xl"
          >
            {tagline}
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="text-base leading-relaxed text-muted-foreground md:text-lg"
          >
            {description}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.22, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-wrap items-center justify-center gap-3 pt-2"
          >
            <Link
              href="/posts"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              Đọc bài viết
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </Link>
            <Link
              href="/books"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card/80 px-6 py-3 text-sm font-semibold backdrop-blur-sm transition-colors hover:bg-muted"
            >
              Thư viện sách
            </Link>
          </motion.div>
        </motion.div>
      </div>

      {/* Premium 3D Animated Background - Industrial Automation */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Dynamic Gradient Orbs with 3D Effect */}
        <motion.div
          className="absolute -left-32 top-0 h-[600px] w-[600px] rounded-full opacity-20"
          style={{
            background:
              'radial-gradient(circle, hsl(var(--primary) / 0.4) 0%, hsl(var(--primary) / 0.1) 40%, transparent 70%)',
            filter: 'blur(60px)',
          }}
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 30, 0],
            y: [0, -20, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute -right-32 -bottom-20 h-[700px] w-[700px] rounded-full opacity-20"
          style={{
            background:
              'radial-gradient(circle, hsl(var(--accent) / 0.4) 0%, hsl(var(--accent) / 0.1) 40%, transparent 70%)',
            filter: 'blur(60px)',
          }}
          animate={{
            scale: [1, 1.15, 1],
            x: [0, -40, 0],
            y: [0, 20, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 2,
          }}
        />

        {/* Floating Grid Background */}
        <svg
          className="absolute inset-0 h-full w-full opacity-[0.15]"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path
                d="M 40 0 L 0 0 0 40"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.5"
                className="text-primary"
                opacity="0.4"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>

        {/* 3D Rotating Hexagon Grid */}
        <motion.div
          className="absolute left-[5%] top-[10%] h-[400px] w-[400px] opacity-30"
          animate={{
            rotateZ: [0, 360],
          }}
          transition={{
            duration: 60,
            repeat: Infinity,
            ease: 'linear',
          }}
        >
          <svg viewBox="0 0 200 200" className="h-full w-full">
            <defs>
              <linearGradient id="hexGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="currentColor" stopOpacity="0.6" />
                <stop offset="100%" stopColor="currentColor" stopOpacity="0.1" />
              </linearGradient>
            </defs>
            {[...Array(7)].map((_, i) => (
              <motion.polygon
                key={i}
                points="100,30 130,45 130,75 100,90 70,75 70,45"
                fill="none"
                stroke="url(#hexGrad)"
                strokeWidth="1.5"
                className="text-primary"
                initial={{ scale: 0, opacity: 0 }}
                animate={{
                  scale: 1 + i * 0.3,
                  opacity: [0.6 - i * 0.08, 0.3 - i * 0.08, 0.6 - i * 0.08],
                }}
                transition={{
                  scale: { duration: 0.8, delay: i * 0.1 },
                  opacity: { duration: 3, repeat: Infinity, ease: 'easeInOut', delay: i * 0.2 },
                }}
              />
            ))}
          </svg>
        </motion.div>

        {/* Particle System - Data Streams */}
        {[...Array(20)].map((_, i) => {
          // Use index-based values instead of Math.random() to avoid hydration mismatch
          const leftPos = (i * 5.26) % 100; // Distribute evenly
          const topPos = (i * 7.89) % 100;
          const yOffset = 100 + ((i * 10) % 200);
          const xOffset = ((i % 2 === 0 ? 1 : -1) * (i * 5)) % 100;
          const duration = 3 + (i % 4);
          const delay = (i * 0.25) % 5;
          const shadowSize = 4 + (i % 4);

          return (
            <motion.div
              key={`particle-${i}`}
              className="absolute h-1 w-1 rounded-full"
              style={{
                left: `${leftPos}%`,
                top: `${topPos}%`,
                background: i % 2 === 0 ? 'hsl(var(--primary))' : 'hsl(var(--accent))',
                boxShadow: `0 0 ${shadowSize}px currentColor`,
              }}
              animate={{
                y: [0, -yOffset],
                x: [0, xOffset],
                opacity: [0, 0.8, 0],
                scale: [0, 1, 0],
              }}
              transition={{
                duration,
                repeat: Infinity,
                delay,
                ease: 'easeOut',
              }}
            />
          );
        })}

        {/* Holographic Circuit Board */}
        <svg
          className="absolute right-[5%] top-[15%] h-[350px] w-[350px] opacity-25"
          viewBox="0 0 200 200"
        >
          <defs>
            <linearGradient id="circuitGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop
                offset="0%"
                stopColor="currentColor"
                stopOpacity="0.8"
                className="text-accent"
              />
              <stop
                offset="100%"
                stopColor="currentColor"
                stopOpacity="0.2"
                className="text-accent"
              />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Circuit Paths */}
          <motion.path
            d="M20 50 L80 50 L80 100 L140 100"
            fill="none"
            stroke="url(#circuitGrad)"
            strokeWidth="2"
            filter="url(#glow)"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, ease: 'easeInOut' }}
          />
          <motion.path
            d="M180 50 L120 50 L120 150 L60 150"
            fill="none"
            stroke="url(#circuitGrad)"
            strokeWidth="2"
            filter="url(#glow)"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, delay: 0.5, ease: 'easeInOut' }}
          />
          <motion.path
            d="M100 20 L100 80 L160 80 L160 140"
            fill="none"
            stroke="url(#circuitGrad)"
            strokeWidth="2"
            filter="url(#glow)"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, delay: 1, ease: 'easeInOut' }}
          />

          {/* Circuit Nodes */}
          {[
            [20, 50],
            [80, 50],
            [80, 100],
            [140, 100],
            [180, 50],
            [120, 50],
            [120, 150],
            [60, 150],
            [100, 20],
            [100, 80],
            [160, 80],
            [160, 140],
          ].map(([x, y], i) => (
            <motion.g key={`node-${i}`}>
              <motion.circle
                cx={x}
                cy={y}
                r="4"
                fill="currentColor"
                className="text-accent"
                filter="url(#glow)"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3, delay: 0.5 + i * 0.1 }}
              />
              <motion.circle
                cx={x}
                cy={y}
                r="8"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                className="text-accent"
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 0, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.15,
                  ease: 'easeInOut',
                }}
              />
            </motion.g>
          ))}

          {/* Data Pulse */}
          <motion.circle r="3" fill="currentColor" className="text-accent" filter="url(#glow)">
            <animateMotion
              dur="4s"
              repeatCount="indefinite"
              path="M20 50 L80 50 L80 100 L140 100"
            />
            <animate attributeName="opacity" values="0;1;1;0" dur="4s" repeatCount="indefinite" />
          </motion.circle>
        </svg>

        {/* 3D Isometric PLC System */}
        <motion.div
          className="absolute bottom-[15%] left-[8%] h-[200px] w-[280px] opacity-30"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 0.3, y: 0 }}
          transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.svg
            viewBox="0 0 280 200"
            className="h-full w-full drop-shadow-2xl"
            animate={{
              rotateY: [0, 5, 0, -5, 0],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <defs>
              <linearGradient id="plc3d" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop
                  offset="0%"
                  stopColor="currentColor"
                  stopOpacity="0.6"
                  className="text-primary"
                />
                <stop
                  offset="100%"
                  stopColor="currentColor"
                  stopOpacity="0.2"
                  className="text-primary"
                />
              </linearGradient>
            </defs>

            {/* Isometric PLC Base */}
            <path
              d="M40 100 L140 50 L240 100 L240 150 L140 200 L40 150 Z"
              fill="url(#plc3d)"
              stroke="currentColor"
              strokeWidth="2"
              className="text-primary"
            />

            {/* Front Face */}
            <path
              d="M40 100 L140 150 L140 200 L40 150 Z"
              fill="currentColor"
              fillOpacity="0.3"
              className="text-primary"
              stroke="currentColor"
              strokeWidth="1.5"
            />

            {/* Right Face */}
            <path
              d="M140 150 L240 100 L240 150 L140 200 Z"
              fill="currentColor"
              fillOpacity="0.2"
              className="text-primary"
              stroke="currentColor"
              strokeWidth="1.5"
            />

            {/* Module Dividers */}
            <line
              x1="90"
              y1="75"
              x2="90"
              y2="175"
              stroke="currentColor"
              strokeWidth="1"
              className="text-primary"
              opacity="0.5"
            />
            <line
              x1="140"
              y1="50"
              x2="140"
              y2="150"
              stroke="currentColor"
              strokeWidth="1"
              className="text-primary"
              opacity="0.5"
            />
            <line
              x1="190"
              y1="75"
              x2="190"
              y2="175"
              stroke="currentColor"
              strokeWidth="1"
              className="text-primary"
              opacity="0.5"
            />

            {/* Status LEDs */}
            {[65, 115, 165, 215].map((x, i) => (
              <motion.circle
                key={`led-${i}`}
                cx={x}
                cy={85 + (x - 65) * 0.25}
                r="4"
                fill="currentColor"
                className={i % 2 === 0 ? 'text-primary' : 'text-accent'}
                animate={{
                  opacity: [0.3, 1, 0.3],
                }}
                transition={{
                  duration: 1.5 + i * 0.3,
                  repeat: Infinity,
                  delay: i * 0.4,
                  ease: 'easeInOut',
                }}
              />
            ))}

            {/* Connection Lines */}
            <motion.path
              d="M140 50 L140 30 L200 30"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-accent"
              strokeDasharray="4 2"
              animate={{
                strokeDashoffset: [0, -20],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'linear',
              }}
            />
          </motion.svg>
        </motion.div>

        {/* Animated Waveform Display */}
        <motion.div
          className="absolute bottom-[20%] right-[10%] h-[120px] w-[200px] opacity-30"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.3, scale: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
        >
          <svg viewBox="0 0 200 120" className="h-full w-full">
            <defs>
              <linearGradient id="waveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop
                  offset="0%"
                  stopColor="currentColor"
                  stopOpacity="0"
                  className="text-accent"
                />
                <stop
                  offset="50%"
                  stopColor="currentColor"
                  stopOpacity="0.8"
                  className="text-accent"
                />
                <stop
                  offset="100%"
                  stopColor="currentColor"
                  stopOpacity="0"
                  className="text-accent"
                />
              </linearGradient>
            </defs>

            {/* Oscilloscope Grid */}
            {[...Array(5)].map((_, i) => (
              <line
                key={`h-${i}`}
                x1="0"
                y1={i * 30}
                x2="200"
                y2={i * 30}
                stroke="currentColor"
                strokeWidth="0.5"
                className="text-accent"
                opacity="0.2"
              />
            ))}
            {[...Array(7)].map((_, i) => (
              <line
                key={`v-${i}`}
                x1={i * 33.33}
                y1="0"
                x2={i * 33.33}
                y2="120"
                stroke="currentColor"
                strokeWidth="0.5"
                className="text-accent"
                opacity="0.2"
              />
            ))}

            {/* Animated Waveforms */}
            <motion.path
              d="M0 60 Q 25 20, 50 60 T 100 60 T 150 60 T 200 60"
              fill="none"
              stroke="url(#waveGrad)"
              strokeWidth="3"
              filter="url(#glow)"
              animate={{
                d: [
                  'M0 60 Q 25 20, 50 60 T 100 60 T 150 60 T 200 60',
                  'M0 60 Q 25 100, 50 60 T 100 60 T 150 60 T 200 60',
                  'M0 60 Q 25 20, 50 60 T 100 60 T 150 60 T 200 60',
                ],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />

            <motion.path
              d="M0 60 L 50 60 L 50 30 L 100 30 L 100 90 L 150 90 L 150 60 L 200 60"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-primary"
              opacity="0.6"
              strokeDasharray="200"
              animate={{
                strokeDashoffset: [0, -200],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: 'linear',
              }}
            />

            {/* Scanning Line */}
            <motion.line
              x1="0"
              y1="0"
              x2="0"
              y2="120"
              stroke="currentColor"
              strokeWidth="2"
              className="text-accent"
              opacity="0.6"
              animate={{
                x1: [0, 200],
                x2: [0, 200],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'linear',
              }}
            />
          </svg>
        </motion.div>

        {/* Floating Code Snippets */}
        {['IF', 'THEN', 'ELSE', 'LOOP', 'END'].map((text, i) => (
          <motion.div
            key={`code-${i}`}
            className="absolute font-mono text-xs font-bold opacity-20"
            style={{
              left: `${15 + i * 18}%`,
              top: `${30 + (i % 2) * 40}%`,
              color: i % 2 === 0 ? 'hsl(var(--primary))' : 'hsl(var(--accent))',
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.1, 0.3, 0.1],
            }}
            transition={{
              duration: 4 + i,
              repeat: Infinity,
              delay: i * 0.5,
              ease: 'easeInOut',
            }}
          >
            {text}
          </motion.div>
        ))}
      </div>
    </section>
  );
}
