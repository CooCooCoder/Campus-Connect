import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Calendar, MapPin, Users, Mail, ArrowLeft, ShieldCheck, AlertCircle, CheckCircle2, Sparkles, Loader2 } from 'lucide-react';
import { eventService } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

export default function EventDetailPage() {
  const { id } = useParams();
  const queryClient = useQueryClient();

  const [studentName, setStudentName] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [registering, setRegistering] = useState(false);
  const [formError, setFormError] = useState(null);
  const [successInfo, setSuccessInfo] = useState(null);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['event-detail', id],
    queryFn: () => eventService.getEventById(id)
  });

  const event = data?.data;

  const handleRegister = async (e) => {
    e.preventDefault();
    setFormError(null);

    if (!studentName.trim()) {
      setFormError('Please enter your full name.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!studentEmail.trim() || !emailRegex.test(studentEmail.trim())) {
      setFormError('Please enter a valid student email address (e.g. name@campus.edu).');
      return;
    }

    setRegistering(true);
    try {
      const response = await eventService.registerForEvent(id, {
        studentName: studentName.trim(),
        studentEmail: studentEmail.trim().toLowerCase()
      });

      setSuccessInfo(response.data);
      queryClient.invalidateQueries({ queryKey: ['event-detail', id] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
    } catch (err) {
      setFormError(err.message || 'Registration failed. Please check event status.');
    } finally {
      setRegistering(false);
    }
  };

  if (isLoading) return <LoadingSpinner message="Loading event details & availability..." />;
  if (isError) return <ErrorMessage message={error?.message} onRetry={refetch} />;
  if (!event) return null;

  const fillPercent = Math.min(100, Math.round((event.registeredCount / event.capacity) * 100));
  const isFull = event.registeredCount >= event.capacity;

  const eventDate = new Date(event.date);
  const formattedDate = eventDate.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
  const formattedTime = eventDate.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="container" style={{ padding: '3rem 1.5rem' }}>
      {/* Back button */}
      <Link to="/events" className="btn btn-outline" style={{ display: 'inline-flex', marginBottom: '2rem' }}>
        <ArrowLeft size={16} />
        <span>Back to Events</span>
      </Link>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2.5rem', alignItems: 'flex-start' }}>
        {/* Left Column: Event Overview */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
            <span className="badge badge-tech">{event.category}</span>
            <span className="badge badge-default">Status: {event.status}</span>
            {isFull ? (
              <span className="badge badge-danger">Capacity Reached</span>
            ) : (
              <span className="badge badge-success">{event.remainingSeats} Seats Available</span>
            )}
          </div>

          <h1 style={{ fontSize: '2.5rem', marginBottom: '1.25rem', lineHeight: 1.25 }}>
            {event.title}
          </h1>

          <div style={{
            background: 'white',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.5rem',
            marginBottom: '2rem',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1.5rem'
          }}>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
              <div style={{ padding: '0.6rem', background: 'var(--primary-light)', color: 'var(--primary)', borderRadius: 'var(--radius-md)' }}>
                <Calendar size={20} />
              </div>
              <div>
                <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Date & Time</span>
                <strong style={{ fontSize: '0.95rem' }}>{formattedDate}</strong>
                <span style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)' }}>{formattedTime}</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
              <div style={{ padding: '0.6rem', background: '#ecfdf5', color: '#059669', borderRadius: 'var(--radius-md)' }}>
                <MapPin size={20} />
              </div>
              <div>
                <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Venue / Hall</span>
                <strong style={{ fontSize: '0.95rem' }}>{event.venue}</strong>
                <span style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Main Campus</span>
              </div>
            </div>
          </div>

          <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '2rem', marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>About this Event</h3>
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.8, fontSize: '1rem', whiteSpace: 'pre-line' }}>
              {event.description}
            </p>
          </div>

          {/* Club Organizer Info */}
          {event.club && (
            <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.5rem' }}>
              <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                Organized by
              </h4>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <img
                  src={event.club.logoUrl || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=100&auto=format&fit=crop&q=80'}
                  alt={event.club.name}
                  style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', objectFit: 'cover' }}
                />
                <div style={{ flex: 1 }}>
                  <h4 style={{ fontSize: '1.1rem' }}>{event.club.name}</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{event.club.category} Society</p>
                </div>
                <a href={`mailto:${event.club.contactEmail}`} className="btn btn-outline" style={{ fontSize: '0.8rem', padding: '0.4rem 0.75rem' }}>
                  <Mail size={14} /> Contact
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Registration Card */}
        <div style={{ position: 'sticky', top: '90px' }}>
          <div className="card" style={{ padding: '2rem', boxShadow: 'var(--shadow-xl)' }}>
            <h3 style={{ fontSize: '1.35rem', marginBottom: '0.5rem' }}>Reserve Your Seat</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
              Seats are strictly limited to {event.capacity} registrations and allocated on a verified first-come first-served basis.
            </p>

            {/* Live Capacity Bar */}
            <div style={{ background: 'var(--bg-surface)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                <span>Registration Status</span>
                <span style={{ color: isFull ? 'var(--danger)' : 'var(--primary)' }}>
                  {event.registeredCount} / {event.capacity} Confirmed
                </span>
              </div>

              <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '9999px', overflow: 'hidden', marginBottom: '0.5rem' }}>
                <div style={{
                  width: `${fillPercent}%`,
                  height: '100%',
                  background: isFull ? 'var(--danger)' : fillPercent > 80 ? 'var(--warning)' : 'var(--primary)',
                  transition: 'width 0.4s ease'
                }} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                <span>{fillPercent}% Booked</span>
                <strong>{event.remainingSeats} Seats Available</strong>
              </div>
            </div>

            {/* Success State Confirmation */}
            {successInfo ? (
              <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                <div style={{
                  width: '56px',
                  height: '56px',
                  background: '#ecfdf5',
                  color: '#059669',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem'
                }}>
                  <CheckCircle2 size={32} />
                </div>
                <h4 style={{ fontSize: '1.15rem', color: '#065f46', marginBottom: '0.5rem' }}>
                  You are registered!
                </h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
                  Confirmation record created for <strong>{successInfo.registration.studentName}</strong> ({successInfo.registration.studentEmail}).
                </p>
                <div style={{ background: 'var(--bg-surface)', padding: '0.75rem', borderRadius: 'var(--radius-md)', fontSize: '0.8rem', marginBottom: '1.25rem', textAlign: 'left' }}>
                  <div>Registration ID: <code>{successInfo.registration.id.slice(0, 8)}...</code></div>
                  <div>Status: <span className="badge badge-success">CONFIRMED</span></div>
                </div>
                <button
                  onClick={() => setSuccessInfo(null)}
                  className="btn btn-outline"
                  style={{ width: '100%', fontSize: '0.85rem' }}
                >
                  Register Another Student
                </button>
              </div>
            ) : isFull ? (
              <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
                <div style={{ width: '48px', height: '48px', background: '#fef2f2', color: '#dc2626', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                  <AlertCircle size={28} />
                </div>
                <h4 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Registration Closed</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                  This event has reached its maximum configured capacity of {event.capacity} attendees.
                </p>
                <Link to="/events" className="btn btn-primary" style={{ width: '100%' }}>
                  Browse Available Events
                </Link>
              </div>
            ) : (
              /* Registration Form */
              <form onSubmit={handleRegister}>
                {formError && (
                  <div style={{
                    background: '#fef2f2',
                    border: '1px solid #fecaca',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.75rem',
                    color: '#b91c1c',
                    fontSize: '0.85rem',
                    marginBottom: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <AlertCircle size={16} style={{ flexShrink: 0 }} />
                    <span>{formError}</span>
                  </div>
                )}

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Student Full Name <span style={{ color: 'var(--danger)' }}>*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Shivamsh Anil Menon"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border)',
                      outline: 'none',
                      fontSize: '0.9rem'
                    }}
                    disabled={registering}
                  />
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Student Email Address <span style={{ color: 'var(--danger)' }}>*</span>
                  </label>
                  <input
                    type="email"
                    placeholder="e.g. shivamsh.menon@campus.edu"
                    value={studentEmail}
                    onChange={(e) => setStudentEmail(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border)',
                      outline: 'none',
                      fontSize: '0.9rem'
                    }}
                    disabled={registering}
                  />
                </div>

                <button
                  type="submit"
                  disabled={registering}
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '0.75rem' }}
                >
                  {registering ? (
                    <>
                      <Loader2 size={16} className="spin" />
                      <span>Securing Registration...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={16} />
                      <span>Confirm Free Registration</span>
                    </>
                  )}
                </button>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', marginTop: '1rem', fontSize: '0.75rem', color: 'var(--text-light)' }}>
                  <ShieldCheck size={14} style={{ color: '#059669' }} />
                  <span>Atomic concurrency lock guarantees zero overbooking</span>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
