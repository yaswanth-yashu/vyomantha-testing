'use client';

import { Code2 } from 'lucide-react';
import { T } from '@/lib/lms-data';
import { useMediaQuery, isMobileMQ } from '@/lib/useMediaQuery';

export default function CodingTutor() {
  const isMobile = useMediaQuery(isMobileMQ);
  return (
    <div style={{ padding: isMobile ? '20px 16px' : '32px 36px', maxWidth: 700 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
        <div style={{
          width: 32, height: 32, borderRadius: 9,
          background: `${T.amber}22`, border: `1px solid ${T.amber}30`,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <Code2 size={16} color={T.amber} />
        </div>
        <h2 style={{ color: T.text, fontSize: 20, fontWeight: 700, margin: 0, letterSpacing: '-0.03em' }}>Coding Tutor</h2>
      </div>
      <p style={{ color: T.muted, fontSize: 14, marginBottom: 24 }}>
        DSA visualisations · Code execution tracer · Step-by-step animations
      </p>
      <div style={{
        background: T.s2, border: `1px solid ${T.amber}30`,
        borderRadius: 14, padding: '32px', textAlign: 'center'
      }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🚧</div>
        <div style={{ color: T.text, fontSize: 16, fontWeight: 600, marginBottom: 8 }}>Coming in MVP2</div>
        <p style={{ color: T.muted, fontSize: 14, lineHeight: 1.7, maxWidth: 480, margin: '0 auto 20px' }}>
          The Coding Tutor will feature sandboxed code execution, step-by-step DSA visualisations
          for arrays, trees, graphs, sorting algorithms, and more.
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
          {['Binary Search', 'Bubble Sort', 'Linked Lists', 'Binary Trees', 'BFS/DFS', 'Recursion', 'Stacks & Queues', 'Hash Tables'].map(f => (
            <span key={f} style={{ fontSize: 12, color: T.amber, background: `${T.amber}15`, padding: '5px 12px', borderRadius: 20, border: `1px solid ${T.amber}25` }}>{f}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
