import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function ErrorMessage({ message = 'An error occurred while loading content.', onRetry }) {
  return (
    <div style={{
      maxWidth: '600px',
      margin: '2rem auto',
      padding: '2rem',
      background: '#fef2f2',
      border: '1px solid #fecaca',
      borderRadius: 'var(--radius-lg)',
      textAlign: 'center',
      color: '#991b1b'
    }}>
      <AlertCircle size={40} style={{ margin: '0 auto 1rem', color: '#dc2626' }} />
      <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Unable to Complete Request</h3>
      <p style={{ color: '#b91c1c', fontSize: '0.9rem', marginBottom: '1.5rem' }}>{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn btn-outline" style={{ background: 'white', borderColor: '#fca5a5' }}>
          <RefreshCw size={14} />
          <span>Retry Request</span>
        </button>
      )}
    </div>
  );
}
