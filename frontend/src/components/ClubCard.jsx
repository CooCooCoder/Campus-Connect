import React from 'react';
import { Users, Mail, Calendar, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ClubCard({ club }) {
  return (
    <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
        <img
          src={club.logoUrl || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=100&auto=format&fit=crop&q=80'}
          alt={club.name}
          style={{
            width: '56px',
            height: '56px',
            borderRadius: 'var(--radius-md)',
            objectFit: 'cover',
            border: '2px solid var(--border)'
          }}
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=100&auto=format&fit=crop&q=80';
          }}
        />
        <div>
          <span className="badge badge-default" style={{ marginBottom: '0.25rem' }}>
            {club.category}
          </span>
          <h3 style={{ fontSize: '1.15rem' }}>{club.name}</h3>
        </div>
      </div>

      <p style={{
        color: 'var(--text-muted)',
        fontSize: '0.875rem',
        lineHeight: 1.5,
        marginBottom: '1.25rem',
        display: '-webkit-box',
        WebkitLineClamp: 3,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
        flex: 1
      }}>
        {club.description}
      </p>

      <div style={{
        borderTop: '1px solid var(--border)',
        paddingTop: '1rem',
        marginTop: 'auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '0.85rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--primary)', fontWeight: 600 }}>
          <Calendar size={15} />
          <span>{club._count?.events || club.events?.length || 0} Events</span>
        </div>

        <Link
          to={`/events?club=${encodeURIComponent(club.name)}`}
          className="btn btn-outline"
          style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}
        >
          <span>View Events</span>
          <ArrowRight size={13} />
        </Link>
      </div>
    </div>
  );
}
