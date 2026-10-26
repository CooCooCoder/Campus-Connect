import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Calendar, Users, Sparkles, Shield, ArrowRight, Search, Award, CheckCircle } from 'lucide-react';
import { eventService, clubService } from '../services/api';
import EventCard from '../components/EventCard';
import ClubCard from '../components/ClubCard';
import RegistrationModal from '../components/RegistrationModal';
import LoadingSpinner from '../components/LoadingSpinner';

export default function LandingPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [modalEvent, setModalEvent] = useState(null);

  // Fetch featured events
  const { data: eventsData, isLoading: eventsLoading } = useQuery({
    queryKey: ['featured-events'],
    queryFn: () => eventService.getEvents({ limit: 6, sortBy: 'date', order: 'asc' })
  });

  // Fetch clubs
  const { data: clubsData, isLoading: clubsLoading } = useQuery({
    queryKey: ['clubs-preview'],
    queryFn: () => clubService.getClubs()
  });

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/events?search=${encodeURIComponent(searchTerm.trim())}`);
    } else {
      navigate('/events');
    }
  };

  const categories = ['All', 'Technical', 'Cultural', 'Sports', 'Workshop', 'Seminar'];

  return (
    <div>
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-pill">
            <Sparkles size={14} />
            <span>Campus Event & Club Management Portal</span>
          </div>

          <h1 className="hero-title">
            Discover, Experience & Lead <br />
            <span className="hero-gradient">University Life with CampusConnect</span>
          </h1>

          <p className="hero-subtitle">
            The unified portal for students to explore campus clubs, register for hackathons and cultural fests with guaranteed seat availability, and empower student organizers.
          </p>

          {/* Search Hero Bar */}
          <form
            onSubmit={handleSearchSubmit}
            style={{
              maxWidth: '640px',
              margin: '0 auto 2rem',
              display: 'flex',
              background: 'white',
              padding: '0.4rem',
              borderRadius: 'var(--radius-full)',
              boxShadow: 'var(--shadow-lg)',
              border: '1px solid var(--border)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', paddingLeft: '1rem', color: 'var(--text-light)' }}>
              <Search size={20} />
            </div>
            <input
              type="text"
              placeholder="Search hackathons, workshops, sports, concerts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                flex: 1,
                border: 'none',
                outline: 'none',
                padding: '0.75rem 1rem',
                fontSize: '0.95rem'
              }}
            />
            <button type="submit" className="btn btn-primary" style={{ borderRadius: 'var(--radius-full)', padding: '0.65rem 1.5rem' }}>
              Search
            </button>
          </form>

          {/* Category Chips */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => navigate(cat === 'All' ? '/events' : `/events?category=${cat}`)}
                className="btn btn-outline"
                style={{
                  borderRadius: 'var(--radius-full)',
                  padding: '0.35rem 0.85rem',
                  fontSize: '0.8rem',
                  background: 'white'
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Metric Ticker */}
      <section style={{ borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', background: 'white', padding: '2rem 0' }}>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', textAlign: 'center' }}>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary)', fontFamily: 'var(--font-heading)' }}>
              {clubsData?.data?.length || 8}+
            </div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 600 }}>Active Campus Clubs</div>
          </div>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#059669', fontFamily: 'var(--font-heading)' }}>
              {eventsData?.pagination?.totalRecords || 12}+
            </div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 600 }}>Upcoming Events</div>
          </div>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#d97706', fontFamily: 'var(--font-heading)' }}>
              100%
            </div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 600 }}>Overbooking Prevention</div>
          </div>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#7c3aed', fontFamily: 'var(--font-heading)' }}>
              Instant
            </div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 600 }}>Seat Confirmation</div>
          </div>
        </div>
      </section>

      {/* Featured Upcoming Events */}
      <section className="container" style={{ padding: '4rem 1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <span className="badge badge-tech" style={{ marginBottom: '0.4rem' }}>Premier Activities</span>
            <h2 style={{ fontSize: '2rem' }}>Featured Campus Events</h2>
          </div>
          <Link to="/events" className="btn btn-outline">
            <span>View All Events</span>
            <ArrowRight size={16} />
          </Link>
        </div>

        {eventsLoading ? (
          <LoadingSpinner message="Loading upcoming campus events..." />
        ) : (
          <div className="grid-3">
            {eventsData?.data?.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onQuickRegister={(ev) => setModalEvent(ev)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Campus Clubs Showcase */}
      <section style={{ background: 'var(--bg-surface)', padding: '4rem 0' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <span className="badge badge-cultural" style={{ marginBottom: '0.4rem' }}>Student Societies</span>
              <h2 style={{ fontSize: '2rem' }}>Explore Campus Clubs</h2>
            </div>
            <Link to="/clubs" className="btn btn-outline" style={{ background: 'white' }}>
              <span>Browse All Clubs</span>
              <ArrowRight size={16} />
            </Link>
          </div>

          {clubsLoading ? (
            <LoadingSpinner message="Loading active student clubs..." />
          ) : (
            <div className="grid-4">
              {clubsData?.data?.slice(0, 4).map((club) => (
                <ClubCard key={club.id} club={club} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Organizer Callout Banner */}
      <section className="container" style={{ padding: '4rem 1.5rem' }}>
        <div style={{
          background: 'linear-gradient(135deg, #1e1b4b, #312e81)',
          borderRadius: 'var(--radius-lg)',
          padding: '3rem 2rem',
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '2rem'
        }}>
          <div style={{ maxWidth: '600px' }}>
            <span className="badge" style={{ background: 'rgba(255, 255, 255, 0.15)', color: 'white', marginBottom: '0.75rem' }}>
              Club Leads & Coordinators
            </span>
            <h2 style={{ fontSize: '2rem', color: 'white', marginBottom: '0.75rem' }}>
              Organizing an event or workshop?
            </h2>
            <p style={{ color: '#cbd5e1', fontSize: '0.95rem', lineHeight: 1.6 }}>
              Use the Organizer Portal to publish events, set strict seat capacities, monitor registration rosters in real-time, and ensure fair seat distribution.
            </p>
          </div>

          <Link to="/organizer" className="btn" style={{ background: 'white', color: 'var(--primary)', padding: '0.75rem 1.5rem', fontWeight: 700 }}>
            <Users size={18} />
            <span>Open Organizer Portal</span>
          </Link>
        </div>
      </section>

      {/* Quick Registration Modal */}
      {modalEvent && (
        <RegistrationModal
          event={modalEvent}
          isOpen={!!modalEvent}
          onClose={() => setModalEvent(null)}
          onSuccess={() => {
            // refresh data
          }}
        />
      )}
    </div>
  );
}
