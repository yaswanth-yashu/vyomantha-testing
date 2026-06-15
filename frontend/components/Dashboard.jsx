'use client';

import { useState, useEffect } from 'react';
import {
  BookOpen, Brain, CheckCircle, ChevronRight, GraduationCap, Flame
} from 'lucide-react';
import { T, getCourseDetails } from '@/lib/lms-data';
import { getCourses, getStudentEnrollments } from '@/lib/frappe';
import { useMediaQuery, isMobileMQ, isTabletMQ } from '@/lib/useMediaQuery';

export default function Dashboard() {
  const [courses, setCourses] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [completed, setCompleted] = useState({});
  const [loading, setLoading] = useState(true);
  const isMobile = useMediaQuery(isMobileMQ);
  const isTablet = useMediaQuery(isTabletMQ);
  const rPad = isMobile ? 16 : 36;
  const statCols = isMobile ? '1fr' : isTablet ? 'repeat(2,1fr)' : 'repeat(3,1fr)';
  const bottomCols = isMobile ? '1fr' : '1fr 1fr';

  useEffect(() => {
    async function loadDashboardData() {
      try {
        let email = '';
        if (typeof window !== 'undefined') {
          const stored = localStorage.getItem('frappe_user');
          if (stored) {
            try {
              const user = JSON.parse(stored);
              if (user && user.email) {
                email = user.email;
              }
            } catch (e) {}
          }
        }

        const [list, enrollments] = await Promise.all([
          getCourses(),
          email ? getStudentEnrollments(email) : Promise.resolve([])
        ]);
        const published = list.filter(c => c.status === 'Published');
        setCourses(published);

        const enrolled = published.filter(c => enrollments.includes(c.id));
        setEnrolledCourses(enrolled);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();

    let key = 'completed_lessons';
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('frappe_user');
      if (stored) {
        try {
          const user = JSON.parse(stored);
          if (user && user.email) {
            key = `completed_lessons_${user.email}`;
          }
        } catch (e) {}
      }
    }
    const savedCompleted = localStorage.getItem(key);
    if (savedCompleted) {
      try {
        setCompleted(JSON.parse(savedCompleted));
      } catch (e) {}
    }
  }, []);

  // Compute stats dynamically for enrolled courses
  let totalLessons = 0;
  let totalModules = 0;
  let completedCount = 0;

  enrolledCourses.forEach(course => {
    const details = getCourseDetails(course);
    if (details && details.modules) {
      totalModules += details.modules.length;
      details.modules.forEach(m => {
        if (m.lessons) {
          totalLessons += m.lessons.length;
          m.lessons.forEach(l => {
            if (completed[l.id]) {
              completedCount++;
            }
          });
        }
      });
    }
  });

  const progressPercent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  const stats = [
    { label: 'Lessons Completed', val: `${completedCount}/${totalLessons}`, sub: `${progressPercent}% done`, color: T.accent, Icon: CheckCircle },
    { label: 'Enrolled Courses', val: `${enrolledCourses.length}`, sub: 'Active cohort learning', color: T.green, Icon: BookOpen },
    { label: 'AI Tools Ready', val: '3', sub: 'General, Coding & Voice Tutor', color: T.purple, Icon: Brain },
  ];

  if (loading) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', background: '#07080F', alignItems: 'center', justifyContent: 'center', color: '#DDE3F2' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', border: '2px solid rgba(91, 140, 248, 0.2)', borderTopColor: '#5B8CF8', animation: 'spin 1s linear infinite' }} />
          <div style={{ fontSize: 14, color: '#647298' }}>Loading student workspace...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: `32px ${rPad}px`, maxWidth: 900, fontFamily: 'var(--font-outfit), sans-serif' }}>
      {/* Hero */}
      <div style={{ marginBottom: isMobile ? 20 : 32 }}>
        <h1 style={{ color: T.text, fontSize: isMobile ? 22 : 28, fontWeight: 700, margin: 0, letterSpacing: '-0.04em' }}>
          {isMobile ? (
            <>Build understanding,<br />not just notes.</>
          ) : (
            <>Build understanding,<br /><span style={{ color: T.accent }}>not just notes.</span></>
          )}
        </h1>
        <p style={{ color: T.muted, marginTop: 8, fontSize: isMobile ? 14 : 15 }}>
          Your AI-powered learning workspace is connected.
        </p>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: statCols, gap: 14, marginBottom: 28 }}>
        {stats.map(({ label, val, sub, color, Icon }) => (
          <div key={label} style={{ background: T.s1, border: `1px solid ${T.border}`, borderRadius: 12, padding: '18px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
              <div style={{ fontSize: 12, color: T.muted, fontWeight: 500 }}>{label}</div>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={14} color={color} />
              </div>
            </div>
            <div style={{ fontSize: 26, fontWeight: 700, color: T.text, letterSpacing: '-0.04em' }}>{val}</div>
            <div style={{ fontSize: 12, color: T.muted, marginTop: 3 }}>{sub}</div>
          </div>
        ))}
      </div>

      {/* Bottom cards */}
      <div style={{ display: 'grid', gridTemplateColumns: bottomCols, gap: 14 }}>
        
        {/* Main/First Course card */}
        <div style={{ background: T.s1, border: `1px solid ${T.border}`, borderRadius: 12, padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 11, color: T.accent, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4, marginBottom: 6 }}>
              <GraduationCap size={13} /> Active Syllabus
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, color: T.text, marginBottom: 4 }}>
              {enrolledCourses[0]?.title || 'No Courses Enrolled'}
            </div>
            <div style={{ fontSize: 12, color: T.muted, marginBottom: 14 }}>
              {enrolledCourses[0] ? `${getCourseDetails(enrolledCourses[0])?.modules?.length || 0} modules · ${getCourseDetails(enrolledCourses[0])?.modules?.flatMap(m => m.lessons).length || 0} lessons` : 'Go to Explore Courses to enroll and start learning!'}
            </div>
          </div>

          <div>
            {enrolledCourses[0] && (
              <>
                <div style={{ background: T.s3, borderRadius: 99, height: 6, marginBottom: 8, overflow: 'hidden' }}>
                  <div style={{ background: T.accent, height: 6, borderRadius: 99, width: `${progressPercent}%`, transition: 'width 0.5s' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
                  <span style={{ fontSize: 12, color: T.muted }}>{progressPercent}% complete</span>
                  <a 
                    href="/courses" 
                    onClick={() => {
                      if (typeof window !== 'undefined' && enrolledCourses[0]) {
                        localStorage.setItem('selected_course_id', enrolledCourses[0].id);
                      }
                    }}
                    style={{ background: T.accent, color: '#000', border: 'none', padding: '7px 14px', borderRadius: 7, fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, textDecoration: 'none' }}
                  >
                    Continue <ChevronRight size={13} />
                  </a>
                </div>
              </>
            )}
            {!enrolledCourses[0] && (
              <a href="/courses" style={{ background: T.accent, color: '#000', border: 'none', padding: '8px 14px', borderRadius: 7, fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 5, textDecoration: 'none' }}>
                Go to Courses <ChevronRight size={13} />
              </a>
            )}
          </div>
        </div>

        {/* Tutor card */}
        <div style={{ background: T.s1, border: `1px solid ${T.border}`, borderRadius: 12, padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 11, color: T.purple, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4, marginBottom: 6 }}>
              <Flame size={13} /> AI Assistant Hub
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, color: T.text, marginBottom: 4 }}>General & Coding Tutor</div>
            <div style={{ fontSize: 12, color: T.muted, marginBottom: 14 }}>Ask questions, generate flashcards, visual infographic outlines, and test code.</div>
          </div>
          
          <div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
              {['Concept Explainer', 'Flashcards', 'Infographics', 'Code Sandbox'].map(m => (
                <span key={m} style={{ fontSize: 10, color: T.purple, background: `${T.purple}14`, padding: '2px 8px', borderRadius: 20, border: `1px solid ${T.purple}20` }}>{m}</span>
              ))}
            </div>
            <a href="/general-tutor" style={{ background: T.purple, color: '#fff', border: 'none', padding: '7px 14px', borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 5, textDecoration: 'none' }}>
              Open Tutor Hub <ChevronRight size={13} />
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}
