import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Users, Search, Sparkles } from 'lucide-react';
import { clubService } from '../services/api';
import ClubCard from '../components/ClubCard';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

export default function ClubsPage() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['clubs-all'],
    queryFn: () => clubService.getClubs()
  });

  const clubs = data?.data || [];

  const categories = ['All', 'Technology', 'Cultural', 'Sports', 'Arts & Media', 'Management', 'Literary'];

  const filteredClubs = clubs.filter(club => {
    const matchesSearch = club.name.toLowerCase().includes(search.toLowerCase()) ||
                          club.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || club.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="container" style={{ padding: '3rem 1.5rem' }}>
      <div style={{ marginBottom: '2.5rem' }}>
        <span className="badge badge-cultural" style={{ marginBottom: '0.4rem' }}>
          Student Life & Communities
        </span>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Campus Clubs & Societies</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>
          Explore vibrant university student clubs, discover collaborative workshops, and connect with faculty and student leaders.
        </p>
      </div>

      {/* Search and Category Filters */}
      <div className="card" style={{ padding: '1.25rem', marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
            <input
              type="text"
              placeholder="Search clubs by name or interest..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem 0.65rem 2.5rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border)',
                outline: 'none',
                fontSize: '0.9rem'
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`btn ${selectedCategory === cat ? 'btn-primary' : 'btn-outline'}`}
                style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem', borderRadius: 'var(--radius-full)' }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {isLoading ? (
        <LoadingSpinner message="Loading campus societies..." />
      ) : isError ? (
        <ErrorMessage message={error?.message} onRetry={refetch} />
      ) : filteredClubs.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3.5rem' }}>
          <Users size={48} style={{ color: 'var(--text-light)', margin: '0 auto 1rem' }} />
          <h3>No clubs found matching your search.</h3>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>Try clearing the search query or category filter.</p>
        </div>
      ) : (
        <div className="grid-4">
          {filteredClubs.map(club => (
            <ClubCard key={club.id} club={club} />
          ))}
        </div>
      )}
    </div>
  );
}
