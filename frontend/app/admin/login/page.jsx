'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { T } from '@/lib/lms-data';
import { login } from '@/lib/frappe';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Clear any existing session on mount
  useEffect(() => {
    localStorage.removeItem('frappe_user');
  }, []);

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(email, password);
      if (user.role !== 'Administrator') {
        throw new Error("Access Denied: This portal requires Administrator permissions.");
      }
      localStorage.setItem('frappe_user', JSON.stringify(user));
      router.replace('/admin');
    } catch (err) {
      setError(err.message || 'Invalid admin email or password.');
      setLoading(false);
    }
  };

  const fillAdminCredentials = () => {
    setEmail('admin@lms.com');
    setPassword('admin123');
    setError('');
  };

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      background: 'radial-gradient(circle at center, #150F2A 0%, #07080F 100%)',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      fontFamily: 'var(--font-outfit), sans-serif'
    }}>
      <div style={{ width: '100%', maxWidth: 450, display: 'flex', flexDirection: 'column', gap: 24 }}>
        
        {/* Main login card */}
        <div style={{
          background: T.s1,
          border: `1px solid ${T.border}`,
          borderRadius: 16,
          padding: '40px 32px 32px 32px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Decorative subtle ambient lights */}
          <div style={{
            position: 'absolute', top: -100, left: -100, width: 200, height: 200,
            borderRadius: '50%', background: 'rgba(155, 110, 248, 0.1)', filter: 'blur(50px)', pointerEvents: 'none'
          }} />

          {/* Logo */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, marginBottom: 28 }}>
            <div style={{
              width: 52, height: 52, borderRadius: 14,
              background: `linear-gradient(135deg, ${T.purple} 0%, #7C3AED 100%)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 8px 16px rgba(124, 58, 237, 0.2)'
            }}>
              <Shield size={28} color="#fff" />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ color: T.text, fontWeight: 800, fontSize: 22, letterSpacing: '-0.03em' }}>Learning Admin</span>
            </div>
            <div style={{ textAlign: 'center', marginTop: 4 }}>
              <h2 style={{ color: T.text, fontSize: 20, fontWeight: 700, margin: 0, letterSpacing: '-0.02em' }}>Admin Workspace</h2>
              <p style={{ color: T.muted, fontSize: 13, margin: '6px 0 0' }}>Sign in to manage system curricula</p>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div style={{
              background: 'rgba(245, 91, 107, 0.1)',
              border: `1px solid rgba(245, 91, 107, 0.25)`,
              color: T.red,
              padding: '12px 14px',
              borderRadius: 8,
              fontSize: 12.5,
              marginBottom: 20,
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}>
              <span>⚠️</span>
              <span style={{ flex: 1 }}>{error}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {/* Email Field */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label htmlFor="email" style={{ color: T.text, fontSize: 12.5, fontWeight: 500 }}>Admin Email</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center' }}>
                  <Mail size={16} color={T.muted} />
                </span>
                <input
                  id="email"
                  type="email"
                  placeholder="admin@lms.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    background: T.s2,
                    border: `1px solid ${T.border}`,
                    borderRadius: 8,
                    padding: '11px 12px 11px 38px',
                    color: T.text,
                    fontSize: 13.5,
                    fontFamily: 'inherit',
                    outline: 'none',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = T.purple}
                  onBlur={(e) => e.target.style.borderColor = T.border}
                />
              </div>
            </div>

            {/* Password Field */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label htmlFor="password" style={{ color: T.text, fontSize: 12.5, fontWeight: 500 }}>Password</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center' }}>
                  <Lock size={16} color={T.muted} />
                </span>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="admin123"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    background: T.s2,
                    border: `1px solid ${T.border}`,
                    borderRadius: 8,
                    padding: '11px 38px 11px 38px',
                    color: T.text,
                    fontSize: 13.5,
                    fontFamily: 'inherit',
                    outline: 'none',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = T.purple}
                  onBlur={(e) => e.target.style.borderColor = T.border}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: 12,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    color: T.muted,
                    padding: 0,
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                background: loading ? T.dim : `linear-gradient(135deg, ${T.purple} 0%, #7C3AED 100%)`,
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                padding: '12px 0',
                fontSize: 13.5,
                fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 12px rgba(124, 58, 237, 0.15)',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8
              }}
            >
              {loading ? (
                <>
                  <div style={{
                    width: 16, height: 16, borderRadius: '50%',
                    border: '2px solid rgba(255,255,255,0.2)',
                    borderTopColor: '#fff', animation: 'spin 1s linear infinite'
                  }} />
                  Signing In...
                </>
              ) : 'Sign In as Admin'}
            </button>
          </form>
        </div>

        {/* Credentials helper panel */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.02)',
          border: `1px solid ${T.border}`,
          borderRadius: 12,
          padding: '18px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: 12
        }}>
          <div style={{ fontSize: 12.5, fontWeight: 600, color: T.text, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>🔒</span> Administrative Access Only
          </div>
          
          <button
            onClick={fillAdminCredentials}
            style={{
              background: T.s2,
              border: `1px solid rgba(155, 110, 248, 0.35)`,
              borderRadius: 8,
              padding: '12px 14px',
              cursor: 'pointer',
              textAlign: 'left',
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
              transition: 'background 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = T.s3}
            onMouseLeave={(e) => e.currentTarget.style.background = T.s2}
          >
            <span style={{ fontSize: 11, fontWeight: 700, color: T.purple, display: 'flex', alignItems: 'center', gap: 4 }}>
              Fill Admin Credentials
            </span>
            <span style={{ fontSize: 10.5, color: T.muted, fontFamily: 'monospace' }}>admin@lms.com</span>
            <span style={{ fontSize: 9.5, color: T.dim }}>password: admin123</span>
          </button>
        </div>

        {/* Footer info */}
        <div style={{ textAlign: 'center', fontSize: 11.5, color: T.dim }}>
          © 2026 LMS Platform. All rights reserved.
        </div>

      </div>
    </div>
  );
}
