'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Brain, CheckCircle, ChevronRight, Clock,
  Loader2, Sparkles, RotateCcw, ArrowLeft
} from 'lucide-react';
import { T, COURSE, geminiCall, buildQuizPrompt, parseQuizOutput, getCourseDetails } from '@/lib/lms-data';
import { useMediaQuery, isMobileMQ } from '@/lib/useMediaQuery';
import { getCourses, getCourseSyllabus } from '@/lib/frappe';

export default function LessonPage({ lesson, completed = {}, onComplete }) {
  const router  = useRouter();
  const [next, setNext] = useState(null);
  
  // Resolve module: prefer lesson.module, fall back to matching module in static COURSE
  const mod = lesson.module || COURSE.modules.find(m => m.lessons.some(l => l.id === lesson.id)) || COURSE.modules[0];

  // Quiz states
  const [quiz,    setQuiz]    = useState(null);
  const [loading, setLoading] = useState(false);
  const [err,     setErr]     = useState('');
  const [quizIdx, setQuizIdx] = useState(0);
  const [quizAns, setQuizAns] = useState(null);
  const isMobile = useMediaQuery(isMobileMQ);
  const rPad = isMobile ? 16 : 36;

  // Dynamically load next lesson
  useEffect(() => {
    async function loadNext() {
      try {
        const FRAPPE_URL = process.env.NEXT_PUBLIC_FRAPPE_URL || process.env.FRAPPE_URL;
        let allLessons = [];

        if (FRAPPE_URL && lesson.courseId) {
          try {
            const syllabus = await getCourseSyllabus(lesson.courseId);
            if (syllabus && syllabus.modules) {
              syllabus.modules.forEach(m => {
                m.lessons.forEach(l => {
                  allLessons.push(l);
                });
              });
            }
          } catch (e) {
            console.error("Error loading next lesson from backend:", e);
          }
        }

        // Fallback to static if backend failed or empty
        if (allLessons.length === 0) {
          const courses = await getCourses();
          courses.forEach(course => {
            const details = getCourseDetails(course);
            if (details && details.modules) {
              details.modules.forEach(m => {
                m.lessons.forEach(l => {
                  allLessons.push(l);
                });
              });
            }
          });
        }

        const allIds = allLessons.map(l => l.id);
        const idx = allIds.indexOf(lesson.id);
        if (idx !== -1 && idx < allLessons.length - 1) {
          setNext(allLessons[idx + 1]);
        } else {
          setNext(null);
        }
      } catch (e) {
        console.error("Error loading next lesson:", e);
      }
    }
    loadNext();
  }, [lesson.id, lesson.courseId]);

  useEffect(() => {
    setQuiz(null); setLoading(false); setErr('');
    setQuizIdx(0); setQuizAns(null);
  }, [lesson.id]);

  const handleGenerateQuiz = async () => {
    setErr(''); setLoading(true);
    try {
      const topic = `Python lesson: ${lesson.title}. Overview: ${lesson.overview}. Key points: ${lesson.pts.join(', ')}`;
      const system = 'You are a quiz generator. Output only quiz questions in the specified format.';
      const prompt = buildQuizPrompt(topic, 'Beginner', 4);
      const text = await geminiCall(system, prompt);
      const questions = parseQuizOutput(text);
      if (!questions.length) {
        throw new Error('No quiz questions were returned by the AI. Please try again.');
      }
      setQuiz({ quizQuestions: questions }); setQuizIdx(0); setQuizAns(null);
    } catch (e) {
      setErr(e.message || 'Failed to generate quiz.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: `32px ${rPad}px`, maxWidth: 900 }}>
      <button onClick={() => router.push('/courses')}
        style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: T.muted, cursor: 'pointer', fontSize: 13, marginBottom: isMobile ? 14 : 22, padding: 0 }}>
        <ArrowLeft size={15} /> Back to Course
      </button>

      {/* Title */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <span style={{ fontSize: 13, color: mod?.accent || T.accent, background: `${mod?.accent || T.accent}18`, padding: '3px 10px', borderRadius: 20, fontWeight: 500 }}>
            {mod?.emoji} {mod?.title}
          </span>
        </div>
        <h2 style={{ color: T.text, fontSize: 22, fontWeight: 700, margin: '0 0 4px', letterSpacing: '-0.03em' }}>{lesson.title}</h2>
        <div style={{ color: T.muted, fontSize: 13, display: 'flex', alignItems: 'center', gap: 5 }}>
          <Clock size={13} />{lesson.dur}
        </div>
      </div>

      {/* Video */}
      <div style={{ borderRadius: 14, overflow: 'hidden', border: `1px solid ${T.border}`, marginBottom: 22 }}>
        <iframe
          width="100%" height={isMobile ? 200 : 400}
          src={`https://www.youtube.com/embed/${lesson.vid}`}
          title={lesson.title} frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen style={{ display: 'block' }}
        />
      </div>

      {/* Overview + Key Points */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.4fr 1fr', gap: 16, marginBottom: 20 }}>
        <div style={{ background: T.s2, border: `1px solid ${T.border}`, borderRadius: 12, padding: '18px 20px' }}>
          <div style={{ color: T.text, fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Overview</div>
          <p style={{ color: T.muted, fontSize: 13.5, lineHeight: 1.7, margin: 0 }}>{lesson.overview}</p>
        </div>
        <div style={{ background: T.s2, border: `1px solid ${T.border}`, borderRadius: 12, padding: '18px 20px' }}>
          <div style={{ color: T.text, fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Key Points</div>
          {lesson.pts.map((p, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 9, marginBottom: 9 }}>
              <div style={{
                width: 18, height: 18, borderRadius: '50%',
                background: `${mod?.accent || T.accent}22`, border: `1px solid ${mod?.accent || T.accent}40`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1
              }}>
                <span style={{ fontSize: 9, color: mod?.accent || T.accent, fontWeight: 700 }}>{i + 1}</span>
              </div>
              <span style={{ color: T.muted, fontSize: 13, lineHeight: 1.5 }}>{p}</span>
            </div>
          ))}
        </div>
      </div>

      {/* AI Practice Quiz */}
      <div style={{ background: T.s2, border: `1px solid ${T.border}`, borderRadius: 12, padding: '20px', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Brain size={16} color={T.purple} />
            <div style={{ color: T.text, fontSize: 14, fontWeight: 600 }}>Interactive AI Practice Quiz</div>
          </div>
          {!quiz && !loading && (
            <button onClick={handleGenerateQuiz}
              style={{ background: T.purple, color: '#fff', border: 'none', padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Sparkles size={13} /> Generate Quiz
            </button>
          )}
        </div>

        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0' }}>
            <Loader2 size={16} color={T.purple} style={{ animation: 'spin 1s linear infinite' }} />
            <span style={{ fontSize: 13, color: T.muted }}>Generating quiz questions...</span>
          </div>
        )}

        {err && <div style={{ color: T.red, fontSize: 12, background: `${T.red}12`, padding: '8px 12px', borderRadius: 7 }}>⚠️ {err}</div>}

        {/* Quiz questions */}
        {quiz && quiz.quizQuestions?.length > 0 && (
          <div>
            {(() => {
              const q = quiz.quizQuestions[quizIdx];
              return q ? (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <div style={{ fontSize: 12, color: T.muted }}>Question {quizIdx + 1} of {quiz.quizQuestions.length}</div>
                    <button onClick={() => { setQuizIdx(0); setQuizAns(null); }}
                      style={{ background: 'none', border: `1px solid ${T.border}`, color: T.muted, borderRadius: 6, padding: '3px 8px', fontSize: 11, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <RotateCcw size={10} /> Reset
                    </button>
                  </div>
                  <div style={{ color: T.text, fontSize: 14, fontWeight: 600, marginBottom: 12, lineHeight: 1.5 }}>{q.question}</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {q.options.map((opt, oi) => {
                      const isSelected = quizAns === oi;
                      const isCorrect  = oi === q.correct;
                      const showResult = quizAns !== null;
                      let bg = T.s3, border = T.border, color = T.muted;
                      if (showResult && isCorrect)  { bg = `${T.green}18`;  border = `${T.green}50`;  color = T.green; }
                      else if (showResult && isSelected) { bg = `${T.red}18`;   border = `${T.red}50`;   color = T.red; }
                      else if (!showResult && isSelected) { bg = `${T.accent}18`; border = `${T.accent}50`; color = T.accent; }
                      return (
                        <button key={oi}
                          onClick={() => { if (quizAns === null) setQuizAns(oi); }}
                          disabled={quizAns !== null}
                          style={{ background: bg, border: `1px solid ${border}`, borderRadius: 8, padding: '10px 14px', color, fontSize: 12.5, cursor: quizAns !== null ? 'default' : 'pointer', textAlign: 'left', transition: 'all 0.2s' }}>
                          <span style={{ fontWeight: 700, marginRight: 8 }}>{'ABCD'[oi]})</span>{opt}
                        </button>
                      );
                    })}
                  </div>
                  {quizAns !== null && (
                    <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 12, color: quizAns === q.correct ? T.green : T.red, fontWeight: 600 }}>
                        {quizAns === q.correct ? '✓ Correct!' : `✗ Incorrect — correct answer: ${'ABCD'[q.correct]}`}
                      </span>
                      {quizIdx < quiz.quizQuestions.length - 1 && (
                        <button onClick={() => { setQuizIdx(i => i + 1); setQuizAns(null); }}
                          style={{ background: T.accent, color: '#fff', border: 'none', padding: '6px 12px', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                          Next <ChevronRight size={12} />
                        </button>
                      )}
                      {quizIdx === quiz.quizQuestions.length - 1 && (
                        <span style={{ fontSize: 12, color: T.muted }}>Quiz complete! 🎉</span>
                      )}
                    </div>
                  )}
                </div>
              ) : null;
            })()}
          </div>
        )}

        {!quiz && !loading && !err && (
          <div style={{ color: T.muted, fontSize: 13, textAlign: 'center', padding: '10px 0' }}>
            Test your understanding of this lesson by generating a custom quiz!
          </div>
        )}
      </div>

      {/* Footer actions */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
        {completed[lesson.id] ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: T.green, fontSize: 14, fontWeight: 600 }}>
            <CheckCircle size={18} /> Completed!
          </div>
        ) : (
          <button onClick={() => onComplete(lesson.id)}
            style={{ background: T.green, color: '#000', border: 'none', padding: '11px 24px', borderRadius: 9, fontSize: 14, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 7 }}>
            <CheckCircle size={15} /> Mark as Complete
          </button>
        )}
        {next && (
          <button onClick={() => router.push(`/lesson/${next.id}`)}
            style={{ background: T.s3, border: `1px solid ${T.border}`, color: T.text, padding: '11px 20px', borderRadius: 9, fontSize: 13, fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
            Next: {next.title} <ChevronRight size={14} />
          </button>
        )}
      </div>
    </div>
  );
}
