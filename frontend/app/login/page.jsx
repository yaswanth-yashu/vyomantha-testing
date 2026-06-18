'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Zap, Eye, EyeOff, Shield, GraduationCap, Lock, Mail, User } from 'lucide-react';
import { T } from '@/lib/lms-data';
import { login } from '@/lib/frappe';

export default function LoginPage() {
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
      localStorage.setItem('frappe_user', JSON.stringify(user));
      if (user.role === 'Administrator') {
        router.replace('/admin');
      } else {
        router.replace('/');
      }
    } catch (err) {
      setError(err.message || 'Invalid email or password.');
      setLoading(false);
    }
  };


  const students = [
    { email: 'student1@lms.com', name: 'Aarav Mehta', desc: '80% Progress (Committed learner)' },
    { email: 'student2@lms.com', name: 'Sneha Patel', desc: '50% Progress (Half-way through)' },
    { email: 'student3@lms.com', name: 'Rohan Sharma', desc: '90% Progress (High performer)' },
    { email: 'student4@lms.com', name: 'Priya Nair', desc: '20% Progress (Just started)' },
    { email: 'student5@lms.com', name: 'Aditya Rao', desc: '0% Progress (New enrollee)' }
  ];

  const fillCredentials = (role, stdEmail = '') => {
    if (role === 'admin') {
      setEmail('admin@lms.com');
      setPassword('admin123');
    } else if (role === 'student' && stdEmail) {
      setEmail(stdEmail);
      setPassword('student123');
    }
    setError('');
  };

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      background: 'radial-gradient(circle at center, #0F132A 0%, #07080F 100%)',
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
            borderRadius: '50%', background: 'rgba(91, 140, 248, 0.1)', filter: 'blur(50px)', pointerEvents: 'none'
          }} />
          <div style={{
            position: 'absolute', bottom: -100, right: -100, width: 200, height: 200,
            borderRadius: '50%', background: 'rgba(155, 110, 248, 0.1)', filter: 'blur(50px)', pointerEvents: 'none'
          }} />

          {/* Logo */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, marginBottom: 28 }}>
            <div style={{
              width: 52, height: 52, borderRadius: 14,
              background: `linear-gradient(135deg, ${T.accent} 0%, ${T.purple} 100%)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 8px 16px rgba(91, 140, 248, 0.2)'
            }}>
              <GraduationCap size={28} color="#fff" />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ color: T.text, fontWeight: 800, fontSize: 22, letterSpacing: '-0.03em' }}>LMS Portal</span>
            </div>
            <div style={{ textAlign: 'center', marginTop: 4 }}>
              <h2 style={{ color: T.text, fontSize: 20, fontWeight: 700, margin: 0, letterSpacing: '-0.02em' }}>Welcome Back</h2>
              <p style={{ color: T.muted, fontSize: 13, margin: '6px 0 0' }}>Sign in to continue</p>
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
              <label htmlFor="email" style={{ color: T.text, fontSize: 12.5, fontWeight: 500 }}>Email</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center' }}>
                  <Mail size={16} color={T.muted} />
                </span>
                <input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
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
                  onFocus={(e) => e.target.style.borderColor = T.accent}
                  onBlur={(e) => e.target.style.borderColor = T.border}
                />
              </div>
            </div>

            {/* Password Field */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label htmlFor="password" style={{ color: T.text, fontSize: 12.5, fontWeight: 500 }}>Password</label>
                <a href="#forgot" onClick={(e) => { e.preventDefault(); alert('Password reset is not configured for this demo.'); }} style={{ color: T.accent, fontSize: 11.5, textDecoration: 'none' }}>
                  Forgot password?
                </a>
              </div>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center' }}>
                  <Lock size={16} color={T.muted} />
                </span>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter password"
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
                  onFocus={(e) => e.target.style.borderColor = T.accent}
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

            {/* Hint Note */}
            <div style={{ fontSize: 11.5, color: T.muted, textAlign: 'center', lineHeight: '1.4', marginTop: 4 }}>
              🔒 Role is auto-detected from credentials.<br />
              Redirects to Admin or Student dashboard based on role.
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                background: loading ? T.dim : `linear-gradient(135deg, ${T.accent} 0%, rgba(91, 140, 248, 0.8) 100%)`,
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                padding: '12px 0',
                fontSize: 13.5,
                fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 12px rgba(91, 140, 248, 0.15)',
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
              ) : 'Sign In'}
            </button>
          </form>

          {/* Footer links */}
          <div style={{ marginTop: 28, textAlign: 'center', fontSize: 12.5, color: T.muted }}>
            Don't have an account?{' '}
            <a href="#signup" onClick={(e) => { e.preventDefault(); alert('Registration is not configured for this demo.'); }} style={{ color: T.accent, textDecoration: 'none', fontWeight: 500 }}>
              Sign Up
            </a>
          </div>
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
            <span>💡</span> Demo Credentials (click to fill)
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {/* Admin trigger */}
            <button
              type="button"
              onClick={() => fillCredentials('admin')}
              style={{
                background: email === 'admin@lms.com' ? 'rgba(155, 110, 248, 0.12)' : T.s2,
                border: `1px solid ${email === 'admin@lms.com' ? T.purple : T.border}`,
                borderRadius: 8,
                padding: '10px 14px',
                cursor: 'pointer',
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => { if (email !== 'admin@lms.com') e.currentTarget.style.background = T.s3; }}
              onMouseLeave={(e) => { if (email !== 'admin@lms.com') e.currentTarget.style.background = T.s2; }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: 'rgba(155, 110, 248, 0.2)',
                  color: T.purple,
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <Shield size={14} />
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: T.purple }}>Admin Workspace</div>
                  <div style={{ fontSize: 9.5, color: T.muted, fontFamily: 'monospace' }}>admin@lms.com</div>
                </div>
              </div>
              <span style={{ fontSize: 9.5, color: T.dim }}>password: admin123</span>
            </button>

            <div style={{ fontSize: 11, fontWeight: 700, color: T.text, marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>👥</span> Select Student Profile to Sign In
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {students.map((std) => (
                <button
                  key={std.email}
                  type="button"
                  onClick={() => fillCredentials('student', std.email)}
                  style={{
                    background: email === std.email ? `${T.accent}12` : T.s2,
                    border: `1px solid ${email === std.email ? T.accent : T.border}`,
                    borderRadius: 8,
                    padding: '8px 12px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 12,
                    transition: 'all 0.15s'
                  }}
                  onMouseEnter={(e) => { if (email !== std.email) e.currentTarget.style.background = T.s3; }}
                  onMouseLeave={(e) => { if (email !== std.email) e.currentTarget.style.background = T.s2; }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 26, height: 26, borderRadius: '50%',
                      background: `${T.accent}20`,
                      color: T.accent,
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      <User size={13} />
                    </div>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: T.text }}>{std.name}</div>
                      <div style={{ fontSize: 9.5, color: T.muted }}>{std.email}</div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: 9.5, color: T.accent, fontWeight: 600, background: `${T.accent}10`, padding: '2px 6px', borderRadius: 4 }}>
                      {std.desc}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div style={{ textAlign: 'center', fontSize: 11.5, color: T.dim }}>
          © 2026 LMS Platform. All rights reserved.
        </div>

      </div>
    </div>
  );
}
