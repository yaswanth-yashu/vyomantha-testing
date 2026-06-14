'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { T } from '@/lib/lms-data';
import { useMediaQuery, isMobileMQ } from '@/lib/useMediaQuery';

export default function MobileNav({ title, accent, items, extras, zBase = 0 }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const isMobile = useMediaQuery(isMobileMQ);
  const Z_BAR = 1001 + zBase;
  const Z_OVERLAY = 1002 + zBase;

  if (!isMobile) return null;

  const active = (href) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  const handleClick = (item) => {
    if (item.onClick) { item.onClick(); setOpen(false); return; }
    if (item.href) router.push(item.href);
    setOpen(false);
  };

  return (
    <>
      {/* ── Fixed top bar ── */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, height: 48, zIndex: Z_BAR,
        background: T.s1, borderBottom: `1px solid ${T.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 12px',
      }}>
        <button onClick={() => setOpen(true)} style={{
          width: 36, height: 36, borderRadius: 8,
          background: 'none', border: 'none', color: T.text, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Menu size={20} />
        </button>
        <div style={{ color: T.text, fontWeight: 700, fontSize: 14, letterSpacing: '-0.02em' }}>
          {title}
        </div>
        <div style={{ width: 36 }} />
      </div>

      {/* ── Centered menu overlay ── */}
      {open && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: Z_OVERLAY,
          background: 'rgba(0,0,0,0.7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 20,
        }} onClick={() => setOpen(false)}>
          <div style={{
            background: T.s1,
            border: `1px solid ${T.border}`,
            borderRadius: 16,
            width: '100%',
            maxWidth: 300,
            maxHeight: '80vh',
            overflowY: 'auto',
            padding: 16,
          }} onClick={e => e.stopPropagation()}>
            {/* Close */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
              <button onClick={() => setOpen(false)} style={{
                width: 32, height: 32, borderRadius: 8,
                background: `${T.s2}`, border: 'none', color: T.muted,
                cursor: 'pointer', display: 'flex', alignItems: 'center',
                justifyContent: 'center',
              }}>
                <X size={18} />
              </button>
            </div>

            {/* Navigation items */}
            <div style={{ marginBottom: extras ? 12 : 0 }}>
              {items.map((item) => {
                const isActive = active(item.href || '');
                return (
                  <button key={item.href || item.label}
                    onClick={() => handleClick(item)}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                      padding: '12px 14px', borderRadius: 10, marginBottom: 4,
                      background: isActive ? `${accent || T.accent}18` : 'transparent',
                      border: isActive ? `1px solid ${(accent || T.accent) + '30'}` : 'none',
                      color: isActive ? (accent || T.accent) : T.text,
                      cursor: 'pointer', fontSize: 14,
                      fontWeight: isActive ? 600 : 400,
                      fontFamily: 'inherit', textAlign: 'left',
                      transition: 'all 0.15s',
                    }}>
                    {item.Icon && <item.Icon size={18} />}
                    {item.label}
                  </button>
                );
              })}
            </div>

            {/* Extras (page-specific settings) */}
            {(() => {
              const extraList = typeof extras === 'function' ? extras(() => setOpen(false)) : extras;
              if (!extraList || extraList.length === 0) return null;
              return (
                <div style={{ borderTop: `1px solid ${T.border}`, paddingTop: 12 }}>
                  {extraList.map((section, i) => (
                    <div key={i} style={{ marginBottom: i < extraList.length - 1 ? 12 : 0 }}>
                      {section}
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </>
  );
}
