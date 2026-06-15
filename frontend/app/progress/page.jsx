'use client';

import { useState, useEffect } from 'react';
import ProgressPage from '@/components/ProgressPage';

export default function ProgressRoute() {
  const [completed, setCompleted] = useState({});

  useEffect(() => {
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
      const saved = localStorage.getItem(key);
      if (saved) {
        try {
          setCompleted(JSON.parse(saved));
        } catch (e) {}
      }
    }
  }, []);

  return <ProgressPage completed={completed} />;
}
