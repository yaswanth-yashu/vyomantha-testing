'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getCourses, getCourseSyllabus, frappeRestGet } from '@/lib/frappe';
import { getCourseDetails } from '@/lib/lms-data';
import LessonPage from '@/components/LessonPage';

export default function LessonRoute() {
  const { id } = useParams();
  const router = useRouter();
  const [completed, setCompleted] = useState({});
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);

  // Sync completion states
  useEffect(() => {
    const saved = localStorage.getItem('completed_lessons');
    if (saved) {
      try {
        setCompleted(JSON.parse(saved));
      } catch (e) {}
    }
  }, []);

  // Fetch courses dynamically and compile the lesson list
  useEffect(() => {
    async function loadLesson() {
      try {
        let found = null;
        const FRAPPE_URL = process.env.NEXT_PUBLIC_FRAPPE_URL || process.env.FRAPPE_URL;

        if (FRAPPE_URL) {
          try {
            const lDoc = await frappeRestGet(`Course Lesson/${id}`);
            if (lDoc && lDoc.course) {
              const syllabus = await getCourseSyllabus(lDoc.course);
              if (syllabus && syllabus.modules) {
                const lessonsInCourse = [];
                syllabus.modules.forEach(m => {
                  m.lessons.forEach(l => {
                    lessonsInCourse.push({
                      ...l,
                      moduleTitle: m.title,
                      courseTitle: syllabus.title,
                      courseId: syllabus.id,
                      module: m
                    });
                  });
                });
                found = lessonsInCourse.find(l => l.id === id);
              }
            }
          } catch (e) {
            console.error("Backend fetch failed, trying local fallback", e);
          }
        }

        // Local cache fallback
        if (!found) {
          const courses = await getCourses();
          const allLessons = [];
          courses.forEach(course => {
            const details = getCourseDetails(course);
            if (details && details.modules) {
              details.modules.forEach(m => {
                m.lessons.forEach(l => {
                  allLessons.push({
                    ...l,
                    moduleTitle: m.title,
                    courseTitle: course.title,
                    courseId: course.id,
                    module: m
                  });
                });
              });
            }
          });
          found = allLessons.find(l => l.id === id);
        }

        setLesson(found);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadLesson();
  }, [id]);

  const onComplete = (lessonId) => {
    const updated = { ...completed, [lessonId]: true };
    setCompleted(updated);
    localStorage.setItem('completed_lessons', JSON.stringify(updated));
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', background: '#07080F', alignItems: 'center', justifyContent: 'center', color: '#DDE3F2' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', border: '2px solid rgba(91, 140, 248, 0.2)', borderTopColor: '#5B8CF8', animation: 'spin 1s linear infinite' }} />
          <div style={{ fontSize: 14, color: '#647298' }}>Loading lesson...</div>
        </div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div style={{ padding: '60px 36px', textAlign: 'center', color: '#647298', background: '#07080F', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        <h2>Lesson not found</h2>
        <button onClick={() => router.push('/courses')}
          style={{ marginTop: 16, background: '#5B8CF8', color: '#fff', border: 'none', padding: '8px 18px', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>
          Back to Courses
        </button>
      </div>
    );
  }

  return (
    <LessonPage
      lesson={lesson}
      completed={completed}
      onComplete={onComplete}
    />
  );
}
