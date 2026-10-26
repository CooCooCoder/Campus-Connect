import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Users, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';

export default function EventCard({ event, onQuickRegister }) {
  const eventDate = new Date(event.date);
  const formattedDate = eventDate.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const getCategoryBadgeClass = (category) => {
    switch (category) {
      case 'Technical': return 'badge-tech';
      case 'Cultural': return 'badge-cultural';
      case 'Sports': return 'badge-sports';
      case 'Workshop': return 'badge-workshop';
      case 'Seminar': return 'badge-seminar';
      case 'Literary': return 'badge-literary';
      default: return 'badge-default';
    }
  };

  const fillPercent = Math.min(100, Math.round((event.registeredCount / event.capacity) * 100));
  const isFull = event.registeredCount >= event.capacity;

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Card Header Banner */}
      <div style={{
        height: '140px',
        background: `linear-gradient(135deg, ${
          event.category === 'Technical' ? '#312e81, #4f46e5' :
          event.category === 'Cultural' ? '#831843, #db2777' :
          event.category === 'Sports' ? '#064e3b, #059669' :
          event.category === 'Workshop' ? '#78350f, #d97706' :
          '#1e293b, #475569'
        })`,
        padding: '1.25rem',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        color: 'white',
        position: 'relative'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className={`badge ${getCategoryBadgeClass(event.category)}`}>
            {event.category}
          </span>

          {isFull ? (
            <span className="badge badge-danger" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <AlertCircle size={12} /> FULL
            </span>
          ) : (
            <span className="badge badge-success" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <ShieldCheck size={12} /> {event.remainingSeats} Seats Left
            </span>
          )}
        </div>

        <div>
          <span style={{ fontSize: '0.8rem', opacity: 0.85, fontWeight: 600 }}>
            {event.club?.name || 'Campus Club'}
          </span>
        </div>
      </div>

      {/* Card Body */}
      <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <h3 style={{ fontSize: '1.2rem', marginBottom: '0.75rem', lineHeight: 1.3 }}>
          <Link to={`/events/${event.id}`} style={{ color: 'inherit' }}>
            {event.title}
          </Link>
        </h3>

        <p style={{
          color: 'var(--text-muted)',
          fontSize: '0.875rem',
          lineHeight: 1.5,
          marginBottom: '1.25rem',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden'
        }}>
          {event.description}
        </p>

        {/* Event Meta */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.25rem', fontSize: '0.825rem', color: 'var(--text-muted)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Calendar size={15} style={{ color: 'var(--primary)', flexShrink: 0 }} />
            <span>{formattedDate}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <MapPin size={15} style={{ color: 'var(--primary)', flexShrink: 0 }} />
            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{event.venue}</span>
          </div>
        </div>

        {/* Capacity Bar */}
        <div style={{ marginTop: 'auto', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.35rem', color: 'var(--text-muted)' }}>
            <span>Capacity</span>
            <span>{event.registeredCount} / {event.capacity} filled ({fillPercent}%)</span>
          </div>
          <div style={{ width: '100%', height: '6px', background: 'var(--bg-surface)', borderRadius: '9999px', overflow: 'hidden' }}>
            <div style={{
              width: `${fillPercent}%`,
              height: '100%',
              background: isFull ? 'var(--danger)' : fillPercent > 80 ? 'var(--warning)' : 'var(--primary)',
              borderRadius: '9999px',
              transition: 'width 0.3s ease'
            }} />
          </div>
        </div>

        {/* Card Actions */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '0.75rem', alignItems: 'center' }}>
          <button
            onClick={() => onQuickRegister && onQuickRegister(event)}
            disabled={isFull}
            className={`btn ${isFull ? 'btn-outline' : 'btn-primary'}`}
            style={{ width: '100%', padding: '0.55rem' }}
          >
            {isFull ? 'Event Full' : 'Register Seat'}
          </button>

          <Link
            to={`/events/${event.id}`}
            className="btn btn-outline"
            style={{ padding: '0.55rem 0.75rem' }}
            title="View Details"
          >
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}
