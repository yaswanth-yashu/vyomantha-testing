'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Layers, GraduationCap, ChevronRight, Plus, HelpCircle, Settings, CheckCircle2 } from 'lucide-react';
import { T } from '@/lib/lms-data';
import { useMediaQuery, isMobileMQ } from '@/lib/useMediaQuery';

export default function AdminHomePage() {
  const router = useRouter();
  const isMobile = useMediaQuery(isMobileMQ);
  
  // Setup checklist state
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

  // Load checklist state
  useEffect(() => {
    const savedChecklist = localStorage.getItem('admin_getting_started');
    if (savedChecklist) {
      try {
        setChecklist(JSON.parse(savedChecklist));
      } catch (e) {}
    }
  }, []);

  // Sync checklist with sidebar
  const handleChecklistChange = (key, val) => {
    const updated = { ...checklist, [key]: val };
    setChecklist(updated);
    localStorage.setItem('admin_getting_started', JSON.stringify(updated));
    window.dispatchEvent(new Event('admin_checklist_update'));
  };

  const checklistItems = [
    { key: 'course', label: 'Create your first course', desc: 'Define your course outline, title, and target audience.' },
    { key: 'chapter', label: 'Add your first chapter', desc: 'Group lessons together by module or topic chapters.' },
    { key: 'lesson', label: 'Add your first lesson', desc: 'Upload markdown content or video explanations.' },
    { key: 'quiz', label: 'Create your first quiz', desc: 'Add interactive multiple-choice questions.' },
    { key: 'team', label: 'Invite your team and students', desc: 'Send invites to instructors, tutors, or learners.' },
    { key: 'batch', label: 'Create your first batch', desc: 'Set up cohort structures for scheduling releases.' },
    { key: 'batchStudent', label: 'Add students to your batch', desc: 'Enroll student groups to batch cohorts.' },
    { key: 'batchCourse', label: 'Add courses to your batch', desc: 'Link modules and lessons to your batch syllabus.' }
  ];

  const completedCount = Object.values(checklist).filter(Boolean).length;
  const progressPercent = Math.round((completedCount / checklistItems.length) * 100);

  const containerPadding = isMobile ? '70px 16px 32px 16px' : '40px';

  return (
    <div style={{
      padding: containerPadding,
      maxWidth: 1100,
      margin: '0 auto',
      fontFamily: 'var(--font-outfit), sans-serif'
    }}>
      {/* Header section */}
      <div style={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        justifyContent: 'space-between',
        alignItems: isMobile ? 'flex-start' : 'center',
        gap: 16,
        marginBottom: 32
      }}>
        <div>
          <h1 style={{
            color: T.text,
            fontSize: isMobile ? 22 : 28,
            fontWeight: 700,
            margin: 0,
            letterSpacing: '-0.04em',
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}>
            Hey, Administrator 👋
          </h1>
          <p style={{ color: T.muted, fontSize: isMobile ? 13.5 : 14.5, marginTop: 4, margin: 0 }}>
            Manage your courses and batches at a glance
          </p>
        </div>

        <button
          onClick={() => router.push('/admin/courses')}
          style={{
            background: T.purple,
            color: '#fff',
            border: 'none',
            padding: '9px 16px',
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            boxShadow: '0 4px 12px rgba(155, 110, 248, 0.2)',
            transition: 'opacity 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.opacity = 0.9}
          onMouseLeave={(e) => e.currentTarget.style.opacity = 1}
        >
          <Plus size={16} /> Create Course
        </button>
      </div>

      {/* Main Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '3fr 2fr', gap: 28 }}>
        
        {/* Left Column: Course Empty State */}
        <div style={{
          background: T.s1,
          border: `1px solid ${T.border}`,
          borderRadius: 14,
          padding: isMobile ? '40px 20px' : '64px 32px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          minHeight: 400
        }}>
          <div style={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            background: `${T.purple}15`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 20,
            border: `1px solid rgba(155, 110, 248, 0.2)`
          }}>
            <GraduationCap size={40} color={T.purple} />
          </div>
          <h2 style={{ color: T.text, fontSize: 18, fontWeight: 700, margin: '0 0 8px 0' }}>No courses created</h2>
          <p style={{ color: T.muted, fontSize: 13.5, maxWidth: 360, margin: '0 0 24px 0', lineHeight: 1.5 }}>
            There are no courses currently. Create your first course to get started!
          </p>
          <button
            onClick={() => router.push('/admin/courses')}
            style={{
              background: 'transparent',
              border: `1px solid ${T.border}`,
              color: T.text,
              padding: '10px 20px',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              transition: 'background 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = T.s2}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <Plus size={15} color={T.purple} /> Create Course
          </button>
        </div>

        {/* Right Column: Interactive Checklist Progress */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          
          {/* Progress Overview */}
          <div style={{
            background: T.s1,
            border: `1px solid ${T.border}`,
            borderRadius: 14,
            padding: 24,
            display: 'flex',
            flexDirection: 'column',
            gap: 12
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: T.text }}>Getting started</span>
              <span style={{ fontSize: 13, color: T.purple, fontWeight: 800 }}>{progressPercent}% Done</span>
            </div>
            
            <div style={{ background: T.s3, height: 8, borderRadius: 4, overflow: 'hidden' }}>
              <div style={{ width: `${progressPercent}%`, height: '100%', background: T.purple, transition: 'width 0.4s ease' }} />
            </div>
            
            <p style={{ color: T.muted, fontSize: 12, margin: 0 }}>
              Complete the setup checklist to configure your LMS platform for instructors and students.
            </p>
          </div>

          {/* Interactive Checklist list */}
          <div style={{
            background: T.s1,
            border: `1px solid ${T.border}`,
            borderRadius: 14,
            padding: 20,
            display: 'flex',
            flexDirection: 'column',
            gap: 12
          }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: T.text, margin: '0 0 6px 0', borderBottom: `1px solid ${T.border}`, paddingBottom: 10 }}>
              Platform Setup Checklist
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxHeight: 360, overflowY: 'auto', paddingRight: 4 }}>
              {checklistItems.map((item) => {
                const done = checklist[item.key];
                return (
                  <div
                    key={item.key}
                    onClick={() => handleChecklistChange(item.key, !done)}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 12,
                      padding: 10,
                      borderRadius: 8,
                      background: done ? 'rgba(155, 110, 248, 0.02)' : 'transparent',
                      border: `1px solid ${done ? 'rgba(155, 110, 248, 0.1)' : 'transparent'}`,
                      cursor: 'pointer',
                      transition: 'all 0.15s'
                    }}
                    onMouseEnter={(e) => {
                      if (!done) e.currentTarget.style.background = T.s2;
                    }}
                    onMouseLeave={(e) => {
                      if (!done) e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <div style={{ marginTop: 2, display: 'flex', alignItems: 'center' }}>
                      <input
                        type="checkbox"
                        checked={done}
                        readOnly
                        style={{
                          accentColor: T.purple,
                          width: 15,
                          height: 15,
                          cursor: 'pointer'
                        }}
                      />
                    </div>
                    
                    <div style={{ flex: 1 }}>
                      <div style={{
                        fontSize: 12.5,
                        fontWeight: 600,
                        color: done ? T.muted : T.text,
                        textDecoration: done ? 'line-through' : 'none'
                      }}>
                        {item.label}
                      </div>
                      <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>
                        {item.desc}
                      </div>
                    </div>

                    {done && <CheckCircle2 size={14} color={T.purple} style={{ alignSelf: 'center' }} />}
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => {
                const reset = {};
                checklistItems.forEach(i => reset[i.key] = false);
                setChecklist(reset);
                localStorage.setItem('admin_getting_started', JSON.stringify(reset));
                window.dispatchEvent(new Event('admin_checklist_update'));
              }}
              style={{
                background: 'transparent',
                border: 'none',
                color: T.muted,
                fontSize: 11,
                cursor: 'pointer',
                textAlign: 'center',
                marginTop: 6,
                padding: '6px 0'
              }}
            >
              Reset Platform Checklist
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
