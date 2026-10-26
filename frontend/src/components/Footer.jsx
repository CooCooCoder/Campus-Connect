import React from 'react';
import { Calendar, Heart, Database, Code, Server } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '2.5rem',
          marginBottom: '2.5rem'
        }}>
          <div>
            <div className="brand" style={{ marginBottom: '1rem' }}>
              <div className="brand-icon">
                <Calendar size={18} />
              </div>
              <span>CampusConnect</span>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
              A full-stack campus event and club discovery portal engineered to streamline university life, enforce concurrency-safe seating registrations, and empower campus student organizers.
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span className="badge badge-tech"><Code size={12} /> Full Stack</span>
              <span className="badge badge-seminar"><Server size={12} /> Backend</span>
              <span className="badge badge-sports"><Database size={12} /> ADBMS</span>
            </div>
          </div>

          <div>
            <h4 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Academic Microproject</h4>
            <ul style={{ listStyle: 'none', fontSize: '0.9rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <li><strong>Student:</strong> Shivamsh Anil Menon</li>
              <li><strong>Project Title:</strong> CampusConnect Portal</li>
              <li><strong>Primary Architecture:</strong> React 18, Express, Prisma ORM</li>
              <li><strong>Database:</strong> PostgreSQL & MongoDB Extension</li>
            </ul>
          </div>

          <div>
            <h4 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Core Modules</h4>
            <ul style={{ listStyle: 'none', fontSize: '0.9rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <li>• Real-Time Capacity Tracking</li>
              <li>• Atomic Compare-and-Swap Reservations</li>
              <li>• Club Directory & Event Indexing</li>
              <li>• MongoDB Append-Only Activity Log</li>
            </ul>
          </div>
        </div>

        <div style={{
          borderTop: '1px solid var(--border)',
          paddingTop: '1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          fontSize: '0.85rem',
          color: 'var(--text-light)'
        }}>
          <div>
            © {new Date().getFullYear()} CampusConnect. Developed by Shivamsh Anil Menon.
          </div>
          <div>
            Academic Microproject Submission
          </div>
        </div>
      </div>
    </footer>
  );
}
