'use client';

import {
  BookOpen, CheckCircle, Circle, Clock, Trophy
} from 'lucide-react';
import { T, COURSE, ALL_LESSONS } from '@/lib/lms-data';
import { useMediaQuery, isMobileMQ, isTabletMQ } from '@/lib/useMediaQuery';

export default function ProgressPage({ completed = {} }) {
  const total = ALL_LESSONS.length;
  const done  = Object.values(completed).filter(Boolean).length;
  const pct   = Math.round((done / total) * 100);
  const isMobile = useMediaQuery(isMobileMQ);
  const isTablet = useMediaQuery(isTabletMQ);
  const rPad = isMobile ? 16 : 36;
  const statCols = isMobile ? 'repeat(2,1fr)' : isTablet ? 'repeat(2,1fr)' : 'repeat(4,1fr)';
  const lessonCols = isMobile ? 'repeat(3,1fr)' : isTablet ? 'repeat(4,1fr)' : 'repeat(5,1fr)';

  const stats = [
    { label: 'Lessons Done',    val: done,        total: total, color: T.accent, Icon: CheckCircle },
    { label: 'Completion',       val: `${pct}%`,   total: null,  color: T.green,  Icon: Trophy      },
    { label: 'Modules Started',  val: COURSE.modules.filter(m => m.lessons.some(l => completed[l.id])).length, total: 5, color: T.purple, Icon: BookOpen },
    { label: 'Remaining',        val: total - done, total: total, color: T.amber, Icon: Clock       },
  ];

  return (
    <div style={{ padding: isMobile ? '20px 16px' : '32px 36px', maxWidth: 860 }}>
      <h2 style={{ color: T.text, fontSize: 22, fontWeight: 700, margin: '0 0 6px', letterSpacing: '-0.03em' }}>
        Progress Dashboard
      </h2>
      <p style={{ color: T.muted, margin: '0 0 24px', fontSize: 14 }}>
        Your Python Fundamentals journey at a glance.
      </p>

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: statCols, gap: 12, marginBottom: 24 }}>
        {stats.map(({ label, val, total: t, color, Icon }) => (
          <div key={label} style={{ background: T.s2, border: `1px solid ${T.border}`, borderRadius: 12, padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontSize: 12, color: T.muted }}>{label}</span>
              <div style={{ width: 24, height: 24, borderRadius: 6, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={12} color={color} />
              </div>
            </div>
            <div style={{ fontSize: 24, fontWeight: 700, color: T.text, letterSpacing: '-0.04em' }}>{val}</div>
            {t && <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>of {t}</div>}
          </div>
        ))}
      </div>

      {/* Module progress */}
      <div style={{ background: T.s2, border: `1px solid ${T.border}`, borderRadius: 12, padding: '20px', marginBottom: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: T.text, marginBottom: 14 }}>Module Progress</div>
        {COURSE.modules.map(mod => {
          const modDone = mod.lessons.filter(l => completed[l.id]).length;
          const modPct  = Math.round((modDone / mod.lessons.length) * 100);
          return (
            <div key={mod.id} style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <span style={{ fontSize: 13, color: T.text }}>{mod.emoji} {mod.title}</span>
                <span style={{ fontSize: 12, color: T.muted }}>{modDone}/{mod.lessons.length} · {modPct}%</span>
              </div>
              <div style={{ background: T.s3, borderRadius: 99, height: 7 }}>
                <div style={{ background: mod.accent, height: 7, borderRadius: 99, width: `${modPct}%`, transition: 'width 0.5s' }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Lesson status grid */}
      <div style={{ background: T.s2, border: `1px solid ${T.border}`, borderRadius: 12, padding: '20px' }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: T.text, marginBottom: 12 }}>Lesson Status</div>
        <div style={{ display: 'grid', gridTemplateColumns: lessonCols, gap: 6 }}>
          {ALL_LESSONS.map(l => (
            <div key={l.id} title={l.title}
              style={{
                background: completed[l.id] ? `${T.green}18` : T.s3,
                border: `1px solid ${completed[l.id] ? T.green + '40' : T.border}`,
                borderRadius: 7, padding: '8px', textAlign: 'center'
              }}>
              {completed[l.id]
                ? <CheckCircle size={12} color={T.green} style={{ display: 'block', margin: '0 auto 3px' }} />
                : <Circle size={12} color={T.dim} style={{ display: 'block', margin: '0 auto 3px' }} />}
              <div style={{ fontSize: 10, color: completed[l.id] ? T.green : T.muted, lineHeight: 1.2 }}>
                {l.title.slice(0, 12)}{l.title.length > 12 ? '...' : ''}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
