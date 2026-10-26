import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Search, Filter, SlidersHorizontal, Calendar, X, AlertCircle } from 'lucide-react';
import { eventService, clubService } from '../services/api';
import EventCard from '../components/EventCard';
import Pagination from '../components/Pagination';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import RegistrationModal from '../components/RegistrationModal';

export default function EventsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || 'All');
  const [club, setClub] = useState(searchParams.get('club') || 'All');
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'date');
  const [order, setOrder] = useState(searchParams.get('order') || 'asc');
  const [page, setPage] = useState(parseInt(searchParams.get('page'), 10) || 1);

  const [modalEvent, setModalEvent] = useState(null);

  // Sync state with URL search params
  useEffect(() => {
    const params = {};
    if (search.trim()) params.search = search.trim();
    if (category !== 'All') params.category = category;
    if (club !== 'All') params.club = club;
    if (sortBy !== 'date') params.sortBy = sortBy;
    if (order !== 'asc') params.order = order;
    if (page > 1) params.page = page;

    setSearchParams(params, { replace: true });
  }, [search, category, club, sortBy, order, page]);

  // Query events with server-side filtering, sorting and pagination
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['events', { search, category, club, sortBy, order, page }],
    queryFn: () => eventService.getEvents({
      page,
      limit: 6,
      search: search.trim() || undefined,
      category: category !== 'All' ? category : undefined,
      club: club !== 'All' ? club : undefined,
      sortBy,
      order
    }),
    keepPreviousData: true
  });

  // Query clubs for filter dropdown
  const { data: clubsData } = useQuery({
    queryKey: ['clubs-filter-list'],
    queryFn: () => clubService.getClubs()
  });

  const categories = ['All', 'Technical', 'Cultural', 'Sports', 'Workshop', 'Seminar', 'Literary'];

  const resetFilters = () => {
    setSearch('');
    setCategory('All');
    setClub('All');
    setSortBy('date');
    setOrder('asc');
    setPage(1);
  };

  const hasActiveFilters = search || category !== 'All' || club !== 'All' || sortBy !== 'date';

  return (
    <div className="container" style={{ padding: '3rem 1.5rem' }}>
      {/* Page Title Header */}
      <div style={{ marginBottom: '2.5rem' }}>
        <span className="badge badge-tech" style={{ marginBottom: '0.4rem' }}>
          Explore Calendar
        </span>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Campus Events Directory</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>
          Browse upcoming campus competitions, guest seminars, and recreational meets with live remaining seat counts.
        </p>
      </div>

      {/* Filter and Search Bar Card */}
      <div className="card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          alignItems: 'center'
        }}>
          {/* Keyword Search */}
          <div style={{ position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
            <input
              type="text"
              placeholder="Search by title or topic..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
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

          {/* Category Filter */}
          <div>
            <select
              value={category}
              onChange={(e) => { setCategory(e.target.value); setPage(1); }}
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border)',
                outline: 'none',
                fontSize: '0.9rem',
                background: 'white'
              }}
            >
              {categories.map((c) => (
                <option key={c} value={c}>Category: {c}</option>
              ))}
            </select>
          </div>

          {/* Club Filter */}
          <div>
            <select
              value={club}
              onChange={(e) => { setClub(e.target.value); setPage(1); }}
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border)',
                outline: 'none',
                fontSize: '0.9rem',
                background: 'white'
              }}
            >
              <option value="All">All Organizing Clubs</option>
              {clubsData?.data?.map((c) => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Sort By Dropdown */}
          <div>
            <select
              value={`${sortBy}-${order}`}
              onChange={(e) => {
                const [newSort, newOrder] = e.target.value.split('-');
                setSortBy(newSort);
                setOrder(newOrder);
                setPage(1);
              }}
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border)',
                outline: 'none',
                fontSize: '0.9rem',
                background: 'white'
              }}
            >
              <option value="date-asc">Date: Upcoming First</option>
              <option value="date-desc">Date: Furthest First</option>
              <option value="title-asc">Title: Alphabetical (A-Z)</option>
              <option value="capacity-desc">Capacity: Highest First</option>
            </select>
          </div>
        </div>

        {/* Active Filter Pills */}
        {hasActiveFilters && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Active Filters:</span>
            {search && (
              <span className="badge badge-default" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                Query: "{search}" <X size={12} style={{ cursor: 'pointer' }} onClick={() => setSearch('')} />
              </span>
            )}
            {category !== 'All' && (
              <span className="badge badge-tech" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                {category} <X size={12} style={{ cursor: 'pointer' }} onClick={() => setCategory('All')} />
              </span>
            )}
            {club !== 'All' && (
              <span className="badge badge-cultural" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                {club} <X size={12} style={{ cursor: 'pointer' }} onClick={() => setClub('All')} />
              </span>
            )}
            <button onClick={resetFilters} className="btn btn-outline" style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem', marginLeft: 'auto' }}>
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Event Cards Grid */}
      {isLoading ? (
        <LoadingSpinner message="Querying events with active filters..." />
      ) : isError ? (
        <ErrorMessage message={error?.message} onRetry={refetch} />
      ) : data?.data?.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem 1.5rem' }}>
          <AlertCircle size={48} style={{ color: 'var(--text-light)', margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No events match your criteria</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            Try broadening your search keywords or clearing the category filter.
          </p>
          <button onClick={resetFilters} className="btn btn-primary">
            Clear All Filters
          </button>
        </div>
      ) : (
        <>
          <div className="grid-3">
            {data?.data?.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onQuickRegister={(ev) => setModalEvent(ev)}
              />
            ))}
          </div>

          {/* Pagination Controls */}
          <Pagination
            pagination={data?.pagination}
            onPageChange={(newPage) => {
              setPage(newPage);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        </>
      )}

      {/* Registration Modal */}
      {modalEvent && (
        <RegistrationModal
          event={modalEvent}
          isOpen={!!modalEvent}
          onClose={() => setModalEvent(null)}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['events'] });
          }}
        />
      )}
    </div>
  );
}
