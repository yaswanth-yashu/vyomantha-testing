'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Sidebar from './Sidebar';
import AdminSidebar from './AdminSidebar';

export default function LayoutWrapper({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Read the user object synchronously from localStorage
    const storedUser = localStorage.getItem('frappe_user');
    let currentUser = null;
    if (storedUser) {
      try {
        currentUser = JSON.parse(storedUser);
      } catch (e) {
        localStorage.removeItem('frappe_user');
      }
    }

    const isAuthPage = pathname === '/login' || pathname === '/users' || pathname === '/admin/login' || pathname.startsWith('/auth');

    if (!currentUser) {
      if (!isAuthPage) {
        // Redirect to appropriate login page if not logged in
        setUser(null);
        setLoading(true);
        if (pathname.startsWith('/admin')) {
          router.replace('/admin/login');
        } else {
          router.replace('/users');
        }
        return;
      }
    } else {
      // User is logged in
      if (pathname === '/users' || pathname === '/admin/login' || pathname === '/login') {
        // Redirect logged-in users away from auth pages
        setLoading(true);
        if (currentUser.role === 'Administrator') {
          router.replace('/admin');
        } else {
          router.replace('/');
        }
        return;
      } else {
        // Logged-in page validation
        if (currentUser.role === 'Administrator') {
          if (!pathname.startsWith('/admin')) {
            setLoading(true);
            router.replace('/admin');
            return;
          }
        } else {
          if (pathname.startsWith('/admin')) {
            setLoading(true);
            router.replace('/');
            return;
          }
        }
      }
    }

    // If no redirect is needed, set the local state and stop loading
    setUser(currentUser);
    setLoading(false);
  }, [pathname, router]);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        width: '100vw',
        minWidth: '100vw',
        minHeight: '100vh',
        background: '#07080F',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#DDE3F2',
        fontFamily: 'var(--font-outfit), sans-serif',
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 9999
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            border: '2px solid rgba(91, 140, 248, 0.2)',
            borderTopColor: '#5B8CF8',
            animation: 'spin 1s linear infinite'
          }} />
          <div style={{ fontSize: 14, color: '#647298' }}>Loading LMS Portal...</div>
        </div>
      </div>
    );
  }

  const isAuthPage = pathname === '/login' || pathname.startsWith('/auth');

  // Auth pages (like /login) render directly without a sidebar
  if (isAuthPage || !user) {
    return <div style={{ minHeight: '100vh', background: '#07080F', color: '#DDE3F2' }}>{children}</div>;
  }

  const isAdminRoute = pathname.startsWith('/admin');

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#07080F', color: '#DDE3F2', width: '100%' }}>
      {isAdminRoute ? <AdminSidebar /> : <Sidebar />}
      <div className="sidebar-content-area" style={{ flex: 1, overflowY: 'auto', maxHeight: '100vh' }}>
        {children}
      </div>
    </div>
  );
}
