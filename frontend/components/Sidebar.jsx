'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  BookOpen, Brain, Code2, BarChart3, Home, Zap, LogOut, Briefcase, Award, FileText, FolderOpen, Sun, Moon
} from 'lucide-react';
import { T, getTheme, setTheme } from '@/lib/lms-data';
import { useMediaQuery, isMobileMQ } from '@/lib/useMediaQuery';
import MobileNav from './MobileNav';

const NAV = [
  { id: '/',              Icon: Home,          label: 'Dashboard'     },
  { id: '/courses',       Icon: BookOpen,      label: 'Courses'       },
  { id: '/quizzes',       Icon: Award,         label: 'Quizzes'       },
  { id: '/assignments',   Icon: FileText,      label: 'Assignments'   },
  { id: '/resources',     Icon: FolderOpen,    label: 'Resources'     },
  { id: '/general-tutor', Icon: Brain,         label: 'General Tutor' },
  { id: '/coding-tutor',  Icon: Code2,         label: 'Coding Tutor'  },
  { id: '/jobs',          Icon: Briefcase,     label: 'Jobs'          },
  { id: '/progress',      Icon: BarChart3,     label: 'Progress'      },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router   = useRouter();
  const isMobile = useMediaQuery(isMobileMQ);
  const isGeneralTutor = pathname.startsWith('/general-tutor');

  const [user, setUser] = useState(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('frappe_user');
      if (stored) {
        try {
          setUser(JSON.parse(stored));
        } catch (e) {}
      }
    }
  }, []);

  const getInitials = (name) => {
    if (!name) return 'S';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  // Inject padding so content clears the fixed MobileNav top bar
  useEffect(() => {
    if (isMobile && !isGeneralTutor) {
      const el = document.createElement('style');
      el.id = 'sidebar-mobile-pad';
      el.textContent = '.sidebar-content-area { padding-top: 48px !important; }';
      document.head.appendChild(el);
      return () => { document.getElementById('sidebar-mobile-pad')?.remove(); };
    }
  }, [isMobile, isGeneralTutor]);

  if (isGeneralTutor) return null;

  const isActive = (navId) => {
    if (navId === '/') return pathname === '/';
    return pathname.startsWith(navId);
  };

  // ── Mobile: fixed top bar + centered menu ──
  if (isMobile) {
    return (
      <MobileNav
        title="LMS AI"
        accent={T.accent}
        items={[
          ...NAV.map(({ id, Icon, label }) => ({
            href: id, Icon, label,
          })),
          {
            label: 'Log Out',
            Icon: LogOut,
            onClick: () => {
              localStorage.removeItem('frappe_user');
              window.location.href = '/login';
            }
          }
        ]}
      />
    );
  }

  // ── Desktop: vertical sidebar ──
  return (
    <div style={{
      width: 220, minHeight: '100vh', background: T.s1,
      borderRight: `1px solid ${T.border}`, display: 'flex',
      flexDirection: 'column', padding: '24px 0', flexShrink: 0
    }}>
      <div style={{ padding: '0 20px 28px', borderBottom: `1px solid ${T.border}`, marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: `${T.accent}22`, border: `1px solid ${T.accent}40`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap size={18} color={T.accent} />
            </div>
            <div>
              <div style={{ color: T.text, fontWeight: 700, fontSize: 15, letterSpacing: '-0.02em' }}>LMS AI</div>
              <div style={{ color: T.muted, fontSize: 11 }}>Learning Platform</div>
            </div>
          </div>
          <button
            onClick={() => setTheme(getTheme() === 'dark' ? 'light' : 'dark')}
            style={{
              background: 'transparent',
              border: 'none',
              color: T.muted,
              cursor: 'pointer',
              padding: 6,
              display: 'flex',
              alignItems: 'center',
              borderRadius: 8,
              transition: 'all 0.2s',
              background: `${T.accent}12`,
              border: `1px solid ${T.border}`
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = T.accent; e.currentTarget.style.background = `${T.accent}22`; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = T.muted; e.currentTarget.style.background = `${T.accent}12`; }}
            title={`Switch to ${getTheme() === 'dark' ? 'Light' : 'Dark'} Mode`}
          >
            {getTheme() === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
          </button>
        </div>
      </div>
      <div style={{ flex: 1, padding: '0 12px' }}>
        {NAV.map(({ id, Icon, label }) => {
          const active = isActive(id);
          return (
            <button key={id} onClick={() => router.push(id)} style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 11,
              padding: '10px 13px', borderRadius: 9, marginBottom: 3,
              background: active ? `${T.accent}18` : 'transparent',
              border: active ? `1px solid ${T.accent}30` : '1px solid transparent',
              color: active ? T.accent : T.muted, cursor: 'pointer',
              fontSize: 13.5, fontWeight: active ? 600 : 400,
              letterSpacing: '-0.01em', transition: 'all 0.15s', fontFamily: 'inherit',
            }}>
              <Icon size={16} />{label}
            </button>
          );
        })}
      </div>
      <div style={{ padding: '14px 18px', borderTop: `1px solid ${T.border}`, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <div style={{ width: 30, height: 30, borderRadius: '50%', background: `${T.purple}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: T.purple, fontWeight: 700 }}>
              {getInitials(user?.name)}
            </div>
            <div>
              <div style={{ color: T.text, fontSize: 13, fontWeight: 500 }}>{user?.name || 'Student'}</div>
              <div style={{ color: T.muted, fontSize: 11 }}>Free Plan</div>
            </div>
          </div>
          <button 
            onClick={() => {
              localStorage.removeItem('frappe_user');
              window.location.href = '/login';
            }}
            style={{
              background: 'transparent',
              border: 'none',
              color: T.muted,
              cursor: 'pointer',
              padding: 4,
              display: 'flex',
              alignItems: 'center',
              borderRadius: 4,
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = T.red; e.currentTarget.style.background = 'rgba(245, 91, 107, 0.08)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = T.muted; e.currentTarget.style.background = 'transparent'; }}
            title="Log Out"
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
