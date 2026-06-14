'use client';

import { useState } from 'react';
import { BookOpen, Users, Calendar, FileText, ArrowUpRight, TrendingUp } from 'lucide-react';
import { T } from '@/lib/lms-data';
import { useMediaQuery, isMobileMQ } from '@/lib/useMediaQuery';

export default function AdminStatisticsPage() {
  const isMobile = useMediaQuery(isMobileMQ);
  const [hoveredMonth, setHoveredMonth] = useState(null);
  const [hoveredSegment, setHoveredSegment] = useState(null);

  // Stats cards metadata
  const stats = [
    { label: 'Total Courses', val: '543', sub: '+12 this month', color: T.accent, Icon: BookOpen },
    { label: 'Total Students', val: '421', sub: '+48 this week', color: T.green, Icon: Users },
    { label: 'Active Batches', val: '126', sub: '98% attendance', color: T.purple, Icon: Calendar },
    { label: 'Assignments Submitted', val: '178', sub: '82 pending review', color: T.amber, Icon: FileText },
  ];

  // SVG Line Chart Settings
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const enrollmentData = [2.8, 3.5, 5.1, 4.8, 6.2, 5.5, 7.8, 6.5, 5.2, 7.1, 8.5]; // values scaling from 0 to 9 max

  // Convert enrollment values to SVG coords
  // SVG size: 550x150. Margins: left 30, right 20, top 20, bottom 20
  const width = 520;
  const height = 140;
  const xPad = 40;
  const yPad = 20;

  const points = enrollmentData.map((val, idx) => {
    const x = xPad + (idx * (width - xPad - 20) / (enrollmentData.length - 1));
    const y = height - yPad - (val * (height - yPad * 2) / 9);
    return { x, y, val, month: months[idx] };
  });

  // SVG path definitions
  const linePath = points.map((p, idx) => (idx === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`)).join(' ');
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${height - yPad} L ${points[0].x} ${height - yPad} Z`;

  // SVG Donut Chart Settings
  const categories = [
    { label: 'Programming', value: 40, color: T.purple },
    { label: 'Business', value: 25, color: T.green },
    { label: 'Design', value: 20, color: T.amber },
    { label: 'Other', value: 15, color: T.accent },
  ];

  // Donut values (Radius 45, Stroke width 18, circumference = 2 * Math.PI * 45 = 282.74)
  const radius = 45;
  const strokeWidth = 16;
  const circumference = 2 * Math.PI * radius;
  let accumulatedPercent = 0;

  const donutSegments = categories.map((cat, idx) => {
    const dashArray = `${(cat.value / 100) * circumference} ${circumference}`;
    const dashOffset = circumference - (accumulatedPercent / 100) * circumference;
    accumulatedPercent += cat.value;
    return { ...cat, dashArray, dashOffset };
  });

  const topCourses = [
    { name: 'Introduction to Python', enrolled: 543, rate: '88%', score: '4.5' },
    { name: 'Digital Marketing 101', enrolled: 421, rate: '75%', score: '4.2' },
    { name: 'Web Design Fundamentals', enrolled: 311, rate: '92%', score: '4.8' },
    { name: 'Data Science Basics', enrolled: 255, rate: '68%', score: '3.9' },
  ];

  const containerPadding = isMobile ? '70px 16px 32px 16px' : '40px';
  const gridColumns = isMobile ? '1fr' : 'repeat(2, 1fr) repeat(2, 1fr)';
  const bottomGrid = isMobile ? '1fr' : '1.4fr 1fr';

  return (
    <div style={{
      padding: containerPadding,
      maxWidth: 1200,
      margin: '0 auto',
      fontFamily: 'var(--font-outfit), sans-serif'
    }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ color: T.text, fontSize: isMobile ? 22 : 28, fontWeight: 700, margin: 0, letterSpacing: '-0.04em' }}>Statistics</h1>
        <p style={{ color: T.muted, fontSize: 13.5, margin: '4px 0 0' }}>Overview of registration trends, student ratios, and top-performing courses.</p>
      </div>

      {/* KPI Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)',
        gap: 16,
        marginBottom: 28
      }}>
        {stats.map(({ label, val, sub, color, Icon }) => (
          <div key={label} style={{
            background: T.s1,
            border: `1px solid ${T.border}`,
            borderRadius: 14,
            padding: 20,
            display: 'flex',
            alignItems: 'center',
            gap: 16
          }}>
            <div style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: `${color}12`,
              border: `1px solid ${color}20`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Icon size={20} color={color} />
            </div>
            <div>
              <div style={{ fontSize: 12, color: T.muted, fontWeight: 500 }}>{label}</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: T.text, letterSpacing: '-0.03em', margin: '2px 0' }}>{val}</div>
              <div style={{ fontSize: 11, color: T.green }}>{sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : '1.5fr 1fr',
        gap: 20,
        marginBottom: 28
      }}>
        {/* Line Chart Card */}
        <div style={{
          background: T.s1,
          border: `1px solid ${T.border}`,
          borderRadius: 14,
          padding: 20,
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div>
              <h3 style={{ margin: 0, color: T.text, fontSize: 14.5, fontWeight: 700 }}>Student Enrollments over Time</h3>
              <p style={{ margin: '2px 0 0 0', color: T.muted, fontSize: 11.5 }}>Active registrations logged monthly</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11.5, color: T.green, background: `${T.green}12`, padding: '4px 8px', borderRadius: 20 }}>
              <TrendingUp size={12} /> +22.4% YoY
            </div>
          </div>

          {/* Line Chart Drawing */}
          <div style={{ position: 'relative', width: '100%', flex: 1, minHeight: 180 }}>
            <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: '100%', overflow: 'visible' }}>
              <defs>
                <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={T.purple} stopOpacity="0.25" />
                  <stop offset="100%" stopColor={T.purple} stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              {[0, 3, 6, 9].map((gridVal) => {
                const y = height - yPad - (gridVal * (height - yPad * 2) / 9);
                return (
                  <g key={gridVal}>
                    <line x1={xPad} y1={y} x2={width - 20} y2={y} stroke={T.border} strokeWidth="1" strokeDasharray="3 3" />
                    <text x={xPad - 12} y={y + 4} fill={T.muted} fontSize="9" textAnchor="end">{gridVal === 9 ? 'max' : gridVal}</text>
                  </g>
                );
              })}

              {/* Shaded Area Under Line */}
              <path d={areaPath} fill="url(#lineGrad)" stroke="none" />

              {/* Line path */}
              <path d={linePath} fill="none" stroke={T.purple} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

              {/* Dots & Interactions */}
              {points.map((p, idx) => (
                <g key={idx}
                   onMouseEnter={() => setHoveredMonth({ index: idx, x: p.x, y: p.y, val: p.val, label: p.month })}
                   onMouseLeave={() => setHoveredMonth(null)}
                   style={{ cursor: 'pointer' }}>
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={hoveredMonth?.index === idx ? 6 : 4}
                    fill={T.purple}
                    stroke={T.bg}
                    strokeWidth="1.5"
                    style={{ transition: 'all 0.15s' }}
                  />
                  {/* Invisible larger hover catcher */}
                  <circle cx={p.x} cy={p.y} r={16} fill="transparent" />
                </g>
              ))}

              {/* Bottom Labels */}
              {points.map((p, idx) => (
                <text key={idx} x={p.x} y={height - 2} fill={T.muted} fontSize="9.5" textAnchor="middle">
                  {p.month}
                </text>
              ))}
            </svg>

            {/* Float Tooltip */}
            {hoveredMonth && (
              <div style={{
                position: 'absolute',
                left: `${(hoveredMonth.x / width) * 100}%`,
                top: `${(hoveredMonth.y / height) * 100 - 35}%`,
                transform: 'translateX(-50%)',
                background: T.s3,
                border: `1px solid ${T.purple}40`,
                padding: '4px 8px',
                borderRadius: 6,
                pointerEvents: 'none',
                boxShadow: '0 4px 10px rgba(0,0,0,0.5)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                zIndex: 10
              }}>
                <span style={{ fontSize: 9.5, color: T.muted }}>{hoveredMonth.label}</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: T.text }}>{hoveredMonth.val * 100} Enrolled</span>
              </div>
            )}
          </div>
        </div>

        {/* Donut Chart Card */}
        <div style={{
          background: T.s1,
          border: `1px solid ${T.border}`,
          borderRadius: 14,
          padding: 20,
          display: 'flex',
          flexDirection: 'column'
        }}>
          <h3 style={{ margin: '0 0 4px 0', color: T.text, fontSize: 14.5, fontWeight: 700 }}>Course Category Distribution</h3>
          <p style={{ margin: '0 0 16px 0', color: T.muted, fontSize: 11.5 }}>Active enrollees per field cluster</p>

          <div style={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 20,
            flex: 1
          }}>
            {/* SVG Donut */}
            <div style={{ position: 'relative', width: 130, height: 130 }}>
              <svg width="100%" height="100%" viewBox="0 0 110 110" style={{ transform: 'rotate(-90deg)', overflow: 'visible' }}>
                {donutSegments.map((seg, idx) => (
                  <circle
                    key={idx}
                    cx="55"
                    cy="55"
                    r={radius}
                    fill="transparent"
                    stroke={seg.color}
                    strokeWidth={hoveredSegment === idx ? strokeWidth + 2 : strokeWidth}
                    strokeDasharray={seg.dashArray}
                    strokeDashoffset={seg.dashOffset}
                    style={{ transition: 'all 0.2s', cursor: 'pointer' }}
                    onMouseEnter={() => setHoveredSegment(idx)}
                    onMouseLeave={() => setHoveredSegment(null)}
                  />
                ))}
              </svg>
              {/* Inner Label info */}
              <div style={{
                position: 'absolute',
                top: 0, left: 0, right: 0, bottom: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                pointerEvents: 'none'
              }}>
                <span style={{ fontSize: 10, color: T.muted, textTransform: 'uppercase' }}>
                  {hoveredSegment !== null ? categories[hoveredSegment].label : 'Total'}
                </span>
                <span style={{ fontSize: 16, fontWeight: 800, color: T.text, marginTop: 1 }}>
                  {hoveredSegment !== null ? `${categories[hoveredSegment].value}%` : '100%'}
                </span>
              </div>
            </div>

            {/* Legend checklist */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1, width: '100%' }}>
              {categories.map((cat, idx) => (
                <div
                  key={cat.label}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '6px 8px',
                    borderRadius: 6,
                    background: hoveredSegment === idx ? 'rgba(255,255,255,0.02)' : 'transparent',
                    cursor: 'pointer',
                    transition: 'all 0.15s'
                  }}
                  onMouseEnter={() => setHoveredSegment(idx)}
                  onMouseLeave={() => setHoveredSegment(null)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: cat.color }} />
                    <span style={{ fontSize: 12.5, color: hoveredSegment === idx ? T.text : T.muted }}>{cat.label}</span>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: T.text }}>{cat.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Table Section: Top Courses */}
      <div style={{
        background: T.s1,
        border: `1px solid ${T.border}`,
        borderRadius: 14,
        padding: 20
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <h3 style={{ margin: 0, color: T.text, fontSize: 14.5, fontWeight: 700 }}>Top Courses by Enrollment</h3>
            <p style={{ margin: '2px 0 0 0', color: T.muted, fontSize: 11.5 }}>Highly active student curricula leaderboard</p>
          </div>
          <ArrowUpRight size={18} color={T.muted} />
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: 600 }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${T.border}`, color: T.muted, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                <th style={{ padding: '10px 14px', fontWeight: 600 }}>Course Name</th>
                <th style={{ padding: '10px 14px', fontWeight: 600 }}>Enrolled Count</th>
                <th style={{ padding: '10px 14px', fontWeight: 600 }}>Completion Rate</th>
                <th style={{ padding: '10px 14px', fontWeight: 600, textAlign: 'right' }}>Average Score</th>
              </tr>
            </thead>
            <tbody style={{ fontSize: 13 }}>
              {topCourses.map((c, idx) => (
                <tr key={c.name} style={{
                  borderBottom: idx === topCourses.length - 1 ? 'none' : `1px solid ${T.border}`,
                  transition: 'background 0.2s',
                  ':hover': { background: 'rgba(255,255,255,0.01)' }
                }}>
                  <td style={{ padding: '14px', color: T.text, fontWeight: 600 }}>{c.name}</td>
                  <td style={{ padding: '14px', color: T.muted }}>
                    <span style={{ color: T.text, fontWeight: 500 }}>{c.enrolled}</span> students
                  </td>
                  <td style={{ padding: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 60, height: 6, background: T.s3, borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{ width: c.rate, height: '100%', background: T.green }} />
                      </div>
                      <span style={{ color: T.green, fontWeight: 600 }}>{c.rate}</span>
                    </div>
                  </td>
                  <td style={{ padding: '14px', textAlign: 'right', color: T.amber, fontWeight: 700 }}>★ {c.score}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
