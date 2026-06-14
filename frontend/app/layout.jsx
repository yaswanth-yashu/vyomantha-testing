import { Outfit } from 'next/font/google';
import './globals.css';
import LayoutWrapper from '@/components/LayoutWrapper';

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
});

export const metadata = {
  title: 'LMS AI - Learning Platform',
  description: 'AI-powered learning workspace with courses, tutors, quizzes and flashcards',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={outfit.variable}>
      <body style={{ margin: 0, padding: 0, backgroundColor: '#07080F' }}>
        <LayoutWrapper>{children}</LayoutWrapper>
      </body>
    </html>
  );
}
