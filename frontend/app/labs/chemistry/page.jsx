'use client';

import { FlaskConical, Sparkles, Beaker, HelpCircle, ChevronRight, Home } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { T } from '@/lib/lms-data';

export default function ChemistryLabPlaceholder() {
  const router = useRouter();

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: '#07080F',
      color: '#DDE3F2',
      fontFamily: 'var(--font-outfit), sans-serif',
      padding: 24,
      textAlign: 'center'
    }}>
      {/* Animated glowing backdrop */}
      <div style={{
        position: 'absolute',
        top: '30%',
        left: '50%',
        width: 300,
        height: 300,
        background: 'radial-gradient(circle, rgba(34, 197, 160, 0.15) 0%, rgba(0,0,0,0) 70%)',
        transform: 'translate(-50%, -50%)',
        zIndex: 0,
        pointerEvents: 'none'
      }} />

      <div style={{
        maxWidth: 500,
        background: '#0C0F1C',
        border: '1px solid rgba(34, 197, 160, 0.2)',
        borderRadius: 16,
        padding: '40px 32px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 20,
        zIndex: 1
      }}>
        {/* Glow beaker icon container */}
        <div style={{
          width: 64,
          height: 64,
          borderRadius: 20,
          background: 'rgba(34, 197, 160, 0.1)',
          border: '1px solid rgba(34, 197, 160, 0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 20px rgba(34, 197, 160, 0.2)'
        }}>
          <FlaskConical size={32} color="#22C5A0" />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#22C5A0', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          <Sparkles size={12} fill="currentColor" /> Chemistry Lab Simulator
        </div>

        <h2 style={{ fontSize: 22, fontWeight: 800, color: '#F8FAFC', margin: 0, letterSpacing: '-0.02em' }}>
          Coming Soon in next MVP
        </h2>

        <p style={{ fontSize: 13.5, color: '#8892B0', margin: 0, lineHeight: 1.6 }}>
          We are currently preparing interactive 3D chemical reaction builders, molecular structure visualizers, and titration labs using real-time WebGL rendering.
        </p>

        {/* Info list */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          width: '100%',
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid rgba(255,255,255,0.04)',
          borderRadius: 10,
          padding: 14,
          textAlign: 'left'
        }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 12.5 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22C5A0' }} />
            <span>3D Element Atomic Bohr Model Builders</span>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 12.5 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22C5A0' }} />
            <span>Acid-Base Titration Experiments</span>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 12.5 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22C5A0' }} />
            <span>Gas Laws (PV=nRT) Gas Pressure Visualizer</span>
          </div>
        </div>

        <button
          onClick={() => router.push('/labs/physics')}
          style={{
            background: '#22C5A0',
            color: '#000000',
            border: 'none',
            padding: '10px 20px',
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            marginTop: 10,
            transition: 'background 0.2s'
          }}
          onMouseEnter={e => e.currentTarget.style.background = '#1EAE8C'}
          onMouseLeave={e => e.currentTarget.style.background = '#22C5A0'}
        >
          <span>Try Physics Lab Simulator</span>
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}
