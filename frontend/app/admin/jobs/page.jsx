'use client';

import { useState, useEffect } from 'react';
import { Briefcase, Plus, Edit2, Trash2, X, MapPin, Clock, Calendar, CheckSquare } from 'lucide-react';
import { T } from '@/lib/lms-data';
import { useMediaQuery, isMobileMQ } from '@/lib/useMediaQuery';

// Default placeholder jobs
const DEFAULT_JOBS = [
  { id: '1', title: 'Senior Software Engineer', company: 'Google', location: 'Mountain View, CA', type: 'Full-time', date: 'Posted 2 days ago' },
  { id: '2', title: 'Frontend Developer (React)', company: 'Meta', location: 'Remote', type: 'Full-time', date: 'Posted 3 days ago' },
  { id: '3', title: 'Product Design Intern', company: 'Figma', location: 'San Francisco, CA', type: 'Part-time', date: 'Posted 5 days ago' },
  { id: '4', title: 'Full Stack Engineer', company: 'Vercel', location: 'Remote', type: 'Remote', date: 'Posted 1 week ago' },
  { id: '5', title: 'Python Backend Specialist', company: 'OpenAI', location: 'San Francisco, CA', type: 'Full-time', date: 'Posted 1 week ago' },
];

export default function AdminJobsPage() {
  const isMobile = useMediaQuery(isMobileMQ);

  // States
  const [jobs, setJobs] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
  const [currentJob, setCurrentJob] = useState({ id: '', title: '', company: '', location: '', type: 'Full-time', date: '' });

  // Load jobs from localStorage
  useEffect(() => {
    const savedJobs = localStorage.getItem('admin_jobs_list');
    if (savedJobs) {
      try {
        setJobs(JSON.parse(savedJobs));
      } catch (e) {
        setJobs(DEFAULT_JOBS);
      }
    } else {
      setJobs(DEFAULT_JOBS);
      localStorage.setItem('admin_jobs_list', JSON.stringify(DEFAULT_JOBS));
    }
  }, []);

  const saveJobs = (newList) => {
    setJobs(newList);
    localStorage.setItem('admin_jobs_list', JSON.stringify(newList));
  };

  const handleOpenCreateModal = () => {
    setModalMode('create');
    setCurrentJob({ id: '', title: '', company: '', location: '', type: 'Full-time', date: 'Posted just now' });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (job, e) => {
    e.stopPropagation();
    setModalMode('edit');
    setCurrentJob({ ...job });
    setIsModalOpen(true);
  };

  const handleDeleteJob = (id, e) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this job posting?')) {
      const updated = jobs.filter(j => j.id !== id);
      saveJobs(updated);
    }
  };

  const handleSaveJobSubmit = (e) => {
    e.preventDefault();
    if (!currentJob.title.trim() || !currentJob.company.trim()) return;

    if (modalMode === 'create') {
      const newJob = {
        ...currentJob,
        id: Date.now().toString()
      };
      const updated = [newJob, ...jobs];
      saveJobs(updated);
    } else {
      const updated = jobs.map(j => j.id === currentJob.id ? { ...currentJob } : j);
      saveJobs(updated);
    }

    setIsModalOpen(false);
  };

  const containerPadding = isMobile ? '70px 16px 32px 16px' : '40px';
  const gridColumns = isMobile ? '1fr' : 'repeat(auto-fill, minmax(320px, 1fr))';

  return (
    <div style={{
      padding: containerPadding,
      maxWidth: 1200,
      margin: '0 auto',
      fontFamily: 'var(--font-outfit), sans-serif'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 28
      }}>
        <div>
          <h1 style={{ color: T.text, fontSize: isMobile ? 22 : 28, fontWeight: 700, margin: 0, letterSpacing: '-0.04em' }}>
            Jobs (Placeholder)
          </h1>
          <p style={{ color: T.muted, fontSize: 13.5, margin: '4px 0 0' }}>
            Post and manage job opportunities available for active platform students.
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          style={{
            background: T.purple,
            color: '#fff',
            border: 'none',
            padding: '9px 16px',
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            boxShadow: '0 4px 12px rgba(155, 110, 248, 0.2)'
          }}
        >
          <Plus size={16} /> Post New Job (Placeholder)
        </button>
      </div>

      {/* Main Grid View */}
      {jobs.length === 0 ? (
        <div style={{
          background: T.s1,
          border: `1px solid ${T.border}`,
          borderRadius: 14,
          padding: '64px 20px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          minHeight: 320
        }}>
          <Briefcase size={48} color={T.muted} style={{ marginBottom: 16 }} />
          <h3 style={{ color: T.text, fontSize: 16, margin: '0 0 6px 0' }}>No job posts yet (Placeholder)</h3>
          <p style={{ color: T.muted, fontSize: 13, maxWidth: 300, margin: '0 0 16px 0' }}>
            There are no career openings listed right now. Post your first opportunity!
          </p>
          <button
            onClick={handleOpenCreateModal}
            style={{
              background: T.purple,
              color: '#fff',
              border: 'none',
              padding: '9px 16px',
              borderRadius: 8,
              fontSize: 12.5,
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4
            }}
          >
            <Plus size={14} /> Post your first job (Placeholder)
          </button>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: gridColumns,
          gap: 20
        }}>
          {jobs.map((job) => (
            <div
              key={job.id}
              style={{
                background: T.s1,
                border: `1px solid ${T.border}`,
                borderRadius: 12,
                padding: 20,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'all 0.2s',
                position: 'relative'
              }}
            >
              <div>
                {/* Header elements: Title & Actions */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 8 }}>
                  <h3 style={{ color: T.text, fontSize: 15.5, fontWeight: 700, margin: 0, lineHeight: 1.3 }}>
                    {job.title}
                  </h3>
                  
                  <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                    <button
                      onClick={(e) => handleOpenEditModal(job, e)}
                      style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: T.muted, padding: 3, borderRadius: 4 }}
                      onMouseEnter={(e) => e.currentTarget.style.color = T.purple}
                      onMouseLeave={(e) => e.currentTarget.style.color = T.muted}
                      title="Edit Job"
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      onClick={(e) => handleDeleteJob(job.id, e)}
                      style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: T.muted, padding: 3, borderRadius: 4 }}
                      onMouseEnter={(e) => e.currentTarget.style.color = T.red}
                      onMouseLeave={(e) => e.currentTarget.style.color = T.muted}
                      title="Delete Job"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                <div style={{ color: T.purple, fontSize: 13, fontWeight: 600, marginBottom: 14 }}>
                  {job.company}
                </div>

                {/* Tags */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
                  {/* Location Tag */}
                  <span style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    fontSize: 10.5,
                    color: T.accent,
                    background: `${T.accent}12`,
                    border: `1px solid ${T.accent}25`,
                    padding: '3px 8px',
                    borderRadius: 20
                  }}>
                    <MapPin size={10} /> {job.location}
                  </span>

                  {/* Job Type Tag */}
                  <span style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    fontSize: 10.5,
                    color: T.green,
                    background: `${T.green}12`,
                    border: `1px solid ${T.green}25`,
                    padding: '3px 8px',
                    borderRadius: 20
                  }}>
                    <Clock size={10} /> {job.type}
                  </span>
                </div>
              </div>

              {/* Posted Date Footer */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 11,
                color: T.muted,
                borderTop: `1px solid ${T.border}`,
                paddingTop: 12,
                marginTop: 4
              }}>
                <Calendar size={12} />
                <span>{job.date}</span>
              </div>
            </div>
          ))}

          {/* Interactive Dotted Add Shortcut Card */}
          <div
            onClick={handleOpenCreateModal}
            style={{
              background: 'transparent',
              border: `2px dashed ${T.border}`,
              borderRadius: 12,
              padding: 24,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              minHeight: 180,
              transition: 'all 0.2s',
              textAlign: 'center'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = T.purple;
              e.currentTarget.style.background = 'rgba(155, 110, 248, 0.01)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = T.border;
              e.currentTarget.style.background = 'transparent';
            }}
          >
            <Plus size={24} color={T.purple} style={{ marginBottom: 10 }} />
            <span style={{ fontSize: 13, fontWeight: 600, color: T.text }}>Post New Job Position</span>
            <span style={{ fontSize: 11, color: T.muted, marginTop: 4 }}>Add more career placement mockups</span>
          </div>
        </div>
      )}

      {/* Interactive Modal Form */}
      {isModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(7, 8, 15, 0.85)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: 16
        }}>
          <div style={{
            background: T.s1,
            border: `1px solid ${T.border}`,
            borderRadius: 16,
            width: '100%',
            maxWidth: 480,
            boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
            overflow: 'hidden'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '16px 20px',
              borderBottom: `1px solid ${T.border}`,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h3 style={{ margin: 0, color: T.text, fontSize: 16, fontWeight: 700 }}>
                {modalMode === 'create' ? 'Post New Position' : 'Edit Job Position'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: T.muted, padding: 0 }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form Content */}
            <form onSubmit={handleSaveJobSubmit} style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Job Title */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: T.text }}>Job Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Senior Software Engineer"
                  value={currentJob.title}
                  onChange={(e) => setCurrentJob({ ...currentJob, title: e.target.value })}
                  style={{
                    background: T.s2,
                    border: `1px solid ${T.border}`,
                    borderRadius: 8,
                    padding: '9px 12px',
                    color: T.text,
                    fontSize: 13,
                    outline: 'none',
                    fontFamily: 'inherit'
                  }}
                />
              </div>

              {/* Company Name */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: T.text }}>Company Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Google"
                  value={currentJob.company}
                  onChange={(e) => setCurrentJob({ ...currentJob, company: e.target.value })}
                  style={{
                    background: T.s2,
                    border: `1px solid ${T.border}`,
                    borderRadius: 8,
                    padding: '9px 12px',
                    color: T.text,
                    fontSize: 13,
                    outline: 'none',
                    fontFamily: 'inherit'
                  }}
                />
              </div>

              {/* Grid: Location & Type */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: T.text }}>Location Tag</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Remote or London, UK"
                    value={currentJob.location}
                    onChange={(e) => setCurrentJob({ ...currentJob, location: e.target.value })}
                    style={{
                      background: T.s2,
                      border: `1px solid ${T.border}`,
                      borderRadius: 8,
                      padding: '9px 12px',
                      color: T.text,
                      fontSize: 13,
                      outline: 'none',
                      fontFamily: 'inherit'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: T.text }}>Job Type</label>
                  <select
                    value={currentJob.type}
                    onChange={(e) => setCurrentJob({ ...currentJob, type: e.target.value })}
                    style={{
                      background: T.s2,
                      border: `1px solid ${T.border}`,
                      borderRadius: 8,
                      padding: '9px 12px',
                      color: T.text,
                      fontSize: 13,
                      outline: 'none',
                      fontFamily: 'inherit'
                    }}
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Remote">Remote</option>
                    <option value="Internship">Internship</option>
                  </select>
                </div>
              </div>

              {/* Action buttons */}
              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: 10,
                borderTop: `1px solid ${T.border}`,
                paddingTop: 16,
                marginTop: 8
              }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{
                    background: 'transparent',
                    border: `1px solid ${T.border}`,
                    color: T.text,
                    padding: '8px 16px',
                    borderRadius: 8,
                    fontSize: 12.5,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    background: T.purple,
                    color: '#fff',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: 8,
                    fontSize: 12.5,
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  {modalMode === 'create' ? 'Post Job' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
