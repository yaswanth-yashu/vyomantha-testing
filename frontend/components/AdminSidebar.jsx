'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  Home, Search, Bell, BookOpen, Layers, Users, Award,
  Briefcase, BarChart3, CheckSquare, FileText, Code2,
  Plus, HelpCircle, LogOut, ChevronDown, Settings
} from 'lucide-react';
import { T } from '@/lib/lms-data';
import { useMediaQuery, isMobileMQ } from '@/lib/useMediaQuery';

// Admin-specific navigation items
const NAV_ITEMS = [
  { id: '/admin',             Icon: Home,         label: 'Home' },
  { id: '/admin/search',      Icon: Search,       label: 'Search', disabled: true },
  { id: '/admin/alerts',      Icon: Bell,         label: 'Notifications', disabled: true },
  { id: '/admin/courses',     Icon: BookOpen,     label: 'Courses' },
  { id: '/admin/programs',    Icon: Layers,       label: 'Programs', disabled: true },
  { id: '/admin/batches',     Icon: Users,        label: 'Batches', disabled: true },
  { id: '/admin/certs',       Icon: Award,        label: 'Certifications', disabled: true },
  { id: '/admin/jobs',        Icon: Briefcase,    label: 'Jobs' },
  { id: '/admin/statistics',  Icon: BarChart3,    label: 'Statistics' },
  { id: '/admin/quizzes',     Icon: CheckSquare,  label: 'Quizzes', disabled: true },
  { id: '/admin/assignments', Icon: FileText,    label: 'Assignments', disabled: true },
  { id: '/admin/code-ex',     Icon: Code2,        label: 'Programming Exercises', disabled: true },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const isMobile = useMediaQuery(isMobileMQ);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  
  // Checklist State for interactive progress tracker
  const [checklist, setChecklist] = useState({
    course: false,
    chapter: false,
    lesson: false,
    quiz: false,
    team: false,
    batch: false,
    batchStudent: false,
    batchCourse: false
  });
  
  const [checklistPanelOpen, setChecklistPanelOpen] = useState(false);

  // Load checklist progress from localStorage
  useEffect(() => {
    const savedChecklist = localStorage.getItem('admin_getting_started');
    if (savedChecklist) {
      try {
        setChecklist(JSON.parse(savedChecklist));
      } catch (e) {}
    }
  }, []);

  const saveChecklist = (newChecklist) => {
    setChecklist(newChecklist);
    localStorage.setItem('admin_getting_started', JSON.stringify(newChecklist));
    // Trigger custom event so other components (like app/admin/page.jsx) can update in real-time
    window.dispatchEvent(new Event('admin_checklist_update'));
  };

  // Listen to external checklist updates (e.g. from the admin home dashboard page)
  useEffect(() => {
    const handleUpdate = () => {
      const savedChecklist = localStorage.getItem('admin_getting_started');
      if (savedChecklist) {
        try {
          setChecklist(JSON.parse(savedChecklist));
        } catch (e) {}
      }
    };
    window.addEventListener('admin_checklist_update', handleUpdate);
    return () => window.removeEventListener('admin_checklist_update', handleUpdate);
  }, []);

  const checklistItems = [
    { key: 'course', label: 'Create your first course' },
    { key: 'chapter', label: 'Add your first chapter' },
    { key: 'lesson', label: 'Add your first lesson' },
    { key: 'quiz', label: 'Create your first quiz' },
    { key: 'team', label: 'Invite your team and students' },
    { key: 'batch', label: 'Create your first batch' },
    { key: 'batchStudent', label: 'Add students to your batch' },
    { key: 'batchCourse', label: 'Add courses to your batch' }
  ];

  const completedCount = Object.values(checklist).filter(Boolean).length;
  const progressPercent = Math.round((completedCount / checklistItems.length) * 100);

  const handleLogout = () => {
    localStorage.removeItem('frappe_user');
    router.replace('/login');
  };

  const isActive = (navId) => {
    if (navId === '/admin') return pathname === '/admin';
    return pathname.startsWith(navId);
  };

  const navigateTo = (navId, disabled) => {
    if (disabled) return;
    router.push(navId);
  };

  // ── Mobile layout top menu ──
  if (isMobile) {
    return (
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, height: 48,
        background: T.s1, borderBottom: `1px solid ${T.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 16px', zIndex: 100
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }} onClick={() => router.push('/admin')}>
          <div style={{ width: 24, height: 24, borderRadius: 6, background: `${T.purple}22`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Layers size={14} color={T.purple} />
          </div>
          <span style={{ color: T.text, fontWeight: 700, fontSize: 14 }}>Learning Admin</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={() => setChecklistPanelOpen(!checklistPanelOpen)}
            style={{
              background: 'transparent', border: 'none', color: T.purple,
              fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer'
            }}
          >
            Checklist ({completedCount}/8)
          </button>
          
          <button onClick={handleLogout} style={{ background: 'transparent', border: 'none', color: T.muted, cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
            <LogOut size={16} />
          </button>
        </div>

        {/* Mobile checklist dropdown panel */}
        {checklistPanelOpen && (
          <div style={{
            position: 'absolute', top: 48, left: 0, right: 0, background: T.s2,
            borderBottom: `1px solid ${T.border}`, padding: 16, display: 'flex',
            flexDirection: 'column', gap: 10, zIndex: 99, boxShadow: '0 10px 20px rgba(0,0,0,0.5)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: T.text }}>Getting Started Checklist</span>
              <span style={{ fontSize: 12, color: T.purple, fontWeight: 700 }}>{progressPercent}%</span>
            </div>
            
            <div style={{ background: T.s3, height: 6, borderRadius: 3, overflow: 'hidden' }}>
              <div style={{ width: `${progressPercent}%`, height: '100%', background: T.purple, transition: 'width 0.3s' }} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 8 }}>
              {checklistItems.map((item) => (
                <label key={item.key} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: T.muted, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={checklist[item.key]}
                    onChange={(e) => saveChecklist({ ...checklist, [item.key]: e.target.checked })}
                    style={{ accentColor: T.purple }}
                  />
                  <span style={{ color: checklist[item.key] ? T.text : T.muted }}>{item.label}</span>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── Desktop Sidebar ──
  return (
    <div style={{
      width: 240, minHeight: '100vh', background: T.s1,
      borderRight: `1px solid ${T.border}`, display: 'flex',
      flexDirection: 'column', padding: '20px 0', flexShrink: 0,
      position: 'relative'
    }}>
      {/* Brand Header */}
      <div style={{ padding: '0 20px 16px', borderBottom: `1px solid ${T.border}`, marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: `${T.purple}22`, border: `1px solid ${T.purple}40`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Layers size={18} color={T.purple} />
          </div>
          <div>
            <div style={{ color: T.text, fontWeight: 700, fontSize: 15, letterSpacing: '-0.02em' }}>Learning</div>
            <div style={{ color: T.muted, fontSize: 11 }}>Admin Portal</div>
          </div>
        </div>
      </div>

      {/* Administrator Profile dropdown */}
      <div style={{ padding: '0 12px 12px', position: 'relative' }}>
        <button
          onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '8px 12px', borderRadius: 8, background: profileDropdownOpen ? T.s2 : 'transparent',
            border: 'none', color: T.text, cursor: 'pointer', textAlign: 'left',
            transition: 'background 0.2s'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 28, height: 28, borderRadius: '50%', background: `${T.purple}30`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, color: T.purple, fontWeight: 700
            }}>
              AD
            </div>
            <div>
              <div style={{ fontSize: 12.5, fontWeight: 600 }}>Hey, Administrator 👋</div>
              <div style={{ fontSize: 10, color: T.muted }}>Owner / Admin</div>
            </div>
          </div>
          <ChevronDown size={14} color={T.muted} style={{ transform: profileDropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
        </button>

        {profileDropdownOpen && (
          <div style={{
            position: 'absolute', top: '100%', left: 12, right: 12, background: T.s2,
            border: `1px solid ${T.border}`, borderRadius: 8, marginTop: 4, zIndex: 50,
            boxShadow: '0 4px 12px rgba(0,0,0,0.4)', overflow: 'hidden'
          }}>
            <button
              onClick={() => {
                setProfileDropdownOpen(false);
                router.push('/admin');
              }}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px',
                background: 'transparent', border: 'none', color: T.text, fontSize: 12,
                cursor: 'pointer', textAlign: 'left', ':hover': { background: T.s3 }
              }}
            >
              <Settings size={14} color={T.muted} /> Admin Home
            </button>
            <button
              onClick={handleLogout}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px',
                background: 'transparent', border: 'none', color: T.red, fontSize: 12,
                borderTop: `1px solid ${T.border}`, cursor: 'pointer', textAlign: 'left'
              }}
            >
              <LogOut size={14} color={T.red} /> Log Out
            </button>
          </div>
        )}
      </div>

      {/* Nav Menu */}
      <div style={{ flex: 1, padding: '0 12px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {NAV_ITEMS.map(({ id, Icon, label, disabled }) => {
          const active = isActive(id);
          return (
            <button
              key={id}
              onClick={() => navigateTo(id, disabled)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 11,
                padding: '9px 12px', borderRadius: 8,
                background: active ? `${T.purple}15` : 'transparent',
                border: 'none',
                color: active ? T.purple : disabled ? T.dim : T.muted,
                cursor: disabled ? 'not-allowed' : 'pointer',
                fontSize: 13, fontWeight: active ? 600 : 400,
                textAlign: 'left', transition: 'all 0.15s',
                fontFamily: 'inherit', opacity: disabled ? 0.6 : 1
              }}
              title={disabled ? "Feature coming soon" : ""}
            >
              <Icon size={15} color={active ? T.purple : disabled ? T.dim : T.muted} />
              <span>{label}</span>
              {disabled && (
                <span style={{ fontSize: 9, background: T.s3, color: T.dim, padding: '1px 5px', borderRadius: 4, marginLeft: 'auto' }}>
                  Soon
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Getting Started Progress Panel */}
      <div style={{ padding: '12px', borderTop: `1px solid ${T.border}`, background: 'rgba(155, 110, 248, 0.02)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: T.text }}>Getting started</span>
          <span style={{ fontSize: 11, color: T.purple, fontWeight: 700 }}>{completedCount}/8 steps</span>
        </div>
        
        <div style={{ background: T.s3, height: 6, borderRadius: 3, overflow: 'hidden', marginBottom: 10 }}>
          <div style={{ width: `${progressPercent}%`, height: '100%', background: T.purple, transition: 'width 0.3s' }} />
        </div>

        <button
          onClick={() => setChecklistPanelOpen(!checklistPanelOpen)}
          style={{
            width: '100%', background: 'rgba(155, 110, 248, 0.1)', border: `1px solid rgba(155, 110, 248, 0.25)`,
            color: T.purple, padding: '7px 0', borderRadius: 6, fontSize: 11, fontWeight: 600,
            cursor: 'pointer', transition: 'all 0.2s', textAlign: 'center'
          }}
        >
          {checklistPanelOpen ? 'Close Checklist' : 'Start now'}
        </button>

        {checklistPanelOpen && (
          <div style={{
            marginTop: 10, background: T.s2, border: `1px solid ${T.border}`,
            borderRadius: 8, padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 8
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${T.border}`, paddingBottom: 6 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: T.text }}>Setup Steps</span>
              <button
                onClick={() => {
                  const allDone = {};
                  checklistItems.forEach(i => allDone[i.key] = true);
                  saveChecklist(allDone);
                }}
                style={{ background: 'transparent', border: 'none', color: T.purple, fontSize: 9, cursor: 'pointer', padding: 0 }}
              >
                Complete All
              </button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 150, overflowY: 'auto', paddingRight: 2 }}>
              {checklistItems.map((item) => (
                <label key={item.key} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={checklist[item.key]}
                    onChange={(e) => saveChecklist({ ...checklist, [item.key]: e.target.checked })}
                    style={{ accentColor: T.purple, cursor: 'pointer' }}
                  />
                  <span style={{ color: checklist[item.key] ? T.text : T.muted, textDecoration: checklist[item.key] ? 'line-through' : 'none' }}>
                    {item.label}
                  </span>
                </label>
              ))}
            </div>

            <button
              onClick={() => {
                const reset = {};
                checklistItems.forEach(i => reset[i.key] = false);
                saveChecklist(reset);
              }}
              style={{
                background: 'transparent', border: 'none', color: T.muted, fontSize: 9,
                cursor: 'pointer', textAlign: 'center', marginTop: 4, width: '100%'
              }}
            >
              Reset progress
            </button>
          </div>
        )}
      </div>

      {/* Help Footer */}
      <div style={{ padding: '12px 18px 0', borderTop: `1px solid ${T.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button
          onClick={() => alert('Support portal is under construction.')}
          style={{
            background: 'transparent', border: 'none', color: T.muted, display: 'flex',
            alignItems: 'center', gap: 8, fontSize: 12, cursor: 'pointer', padding: 0
          }}
        >
          <HelpCircle size={14} /> Help
        </button>
        <span style={{ color: T.dim, fontSize: 10 }}>v1.0.0</span>
      </div>
    </div>
  );
}
