'use client';

import { useState } from 'react';
import ProgressPage from '@/components/ProgressPage';

export default function ProgressRoute() {
  const [completed, setCompleted] = useState({});
  return <ProgressPage completed={completed} />;
}
