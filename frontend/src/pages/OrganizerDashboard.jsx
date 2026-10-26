import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PlusCircle, LayoutDashboard, Calendar, Users, Trash2, Eye, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';
import { eventService, clubService } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

export default function OrganizerDashboard() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('events'); // 'events' | 'create'
  const [viewingRegistrationsEvent, setViewingRegistrationsEvent] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Technical',
    venue: '',
    date: '',
    capacity: 50,
    clubId: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [createSuccess, setCreateSuccess] = useState(false);

  // Fetch events
  const { data: eventsData, isLoading: eventsLoading, isError: eventsError } = useQuery({
    queryKey: ['organizer-events'],
    queryFn: () => eventService.getEvents({ limit: 50, sortBy: 'date', order: 'desc' })
  });

  // Fetch clubs
  const { data: clubsData } = useQuery({
    queryKey: ['organizer-clubs'],
    queryFn: () => clubService.getClubs()
  });

  // Fetch registrations modal query
  const { data: registrationsData, isLoading: registrationsLoading } = useQuery({
    queryKey: ['event-registrations', viewingRegistrationsEvent?.id],
    queryFn: () => eventService.getEventRegistrations(viewingRegistrationsEvent.id),
    enabled: !!viewingRegistrationsEvent
  });

  // Create Event Mutation
  const createMutation = useMutation({
    mutationFn: (newEvent) => eventService.createEvent(newEvent),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizer-events'] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
      setCreateSuccess(true);
      setFormData({
        title: '',
        description: '',
        category: 'Technical',
        venue: '',
        date: '',
        capacity: 50,
        clubId: ''
      });
      setTimeout(() => {
        setCreateSuccess(false);
        setActiveTab('events');
      }, 1500);
    }
  });

  // Delete Event Mutation
  const deleteMutation = useMutation({
    mutationFn: (eventId) => eventService.deleteEvent(eventId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizer-events'] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
    }
  });

  const validateForm = () => {
    const errors = {};
    if (!formData.title.trim() || formData.title.trim().length < 3) {
      errors.title = 'Title must be at least 3 characters.';
    }
    if (!formData.description.trim() || formData.description.trim().length < 10) {
      errors.description = 'Description must be at least 10 characters.';
    }
    if (!formData.venue.trim() || formData.venue.trim().length < 2) {
      errors.venue = 'Venue is required.';
    }
    if (!formData.date) {
      errors.date = 'Valid date and time are required.';
    }
    if (!formData.capacity || parseInt(formData.capacity, 10) < 1) {
      errors.capacity = 'Capacity must be at least 1 seat.';
    }
    if (!formData.clubId) {
      errors.clubId = 'Please select the organizing club.';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    createMutation.mutate({
      ...formData,
      capacity: parseInt(formData.capacity, 10),
      date: new Date(formData.date).toISOString()
    });
  };

  const events = eventsData?.data || [];
  const clubs = clubsData?.data || [];

  return (
    <div className="container" style={{ padding: '3rem 1.5rem' }}>
      {/* Dashboard Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '2.5rem' }}>
        <div>
          <span className="badge badge-seminar" style={{ marginBottom: '0.4rem' }}>
            Administrative Console
          </span>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Campus Organizer Portal</h1>
          <p style={{ color: 'var(--text-muted)' }}>
            Schedule new events, configure hard seating limits, and view attendee verification rosters.
          </p>
        </div>

        {/* Tab Controls */}
        <div style={{ display: 'flex', gap: '0.5rem', background: 'var(--bg-surface)', padding: '0.35rem', borderRadius: 'var(--radius-md)' }}>
          <button
            onClick={() => setActiveTab('events')}
            className={`btn ${activeTab === 'events' ? 'btn-primary' : 'btn-outline'}`}
            style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
          >
            <Calendar size={16} />
            <span>Manage Events ({events.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('create')}
            className={`btn ${activeTab === 'create' ? 'btn-primary' : 'btn-outline'}`}
            style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
          >
            <PlusCircle size={16} />
            <span>Create New Event</span>
          </button>
        </div>
      </div>

      {/* CREATE EVENT TAB */}
      {activeTab === 'create' && (
        <div className="card" style={{ maxWidth: '800px', margin: '0 auto', padding: '2.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Publish a Campus Event</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '2rem' }}>
            All events enforce automated capacity validation and duplicate registration rejection.
          </p>

          {createSuccess && (
            <div style={{ background: '#ecfdf5', color: '#065f46', padding: '1rem', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <CheckCircle2 size={18} />
              <span>Event published successfully! Redirecting to events list...</span>
            </div>
          )}

          {createMutation.isError && (
            <div style={{ background: '#fef2f2', color: '#991b1b', padding: '1rem', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <AlertTriangle size={18} />
              <span>{createMutation.error?.message || 'Failed to create event.'}</span>
            </div>
          )}

          <form onSubmit={handleCreateSubmit}>
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                Event Title *
              </label>
              <input
                type="text"
                placeholder="e.g. Annual Autonomous Drone Challenge"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-md)', border: `1px solid ${formErrors.title ? 'var(--danger)' : 'var(--border)'}` }}
              />
              {formErrors.title && <span style={{ color: 'var(--danger)', fontSize: '0.75rem' }}>{formErrors.title}</span>}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Organizing Club *
                </label>
                <select
                  value={formData.clubId}
                  onChange={(e) => setFormData({ ...formData, clubId: e.target.value })}
                  style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-md)', border: `1px solid ${formErrors.clubId ? 'var(--danger)' : 'var(--border)'}`, background: 'white' }}
                >
                  <option value="">Select a Campus Club</option>
                  {clubs.map((c) => (
                    <option key={c.id} value={c.id}>{c.name} ({c.category})</option>
                  ))}
                </select>
                {formErrors.clubId && <span style={{ color: 'var(--danger)', fontSize: '0.75rem' }}>{formErrors.clubId}</span>}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'white' }}
                >
                  <option value="Technical">Technical</option>
                  <option value="Cultural">Cultural</option>
                  <option value="Sports">Sports</option>
                  <option value="Workshop">Workshop</option>
                  <option value="Seminar">Seminar</option>
                  <option value="Literary">Literary</option>
                  <option value="Management">Management</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Date & Time *
                </label>
                <input
                  type="datetime-local"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-md)', border: `1px solid ${formErrors.date ? 'var(--danger)' : 'var(--border)'}` }}
                />
                {formErrors.date && <span style={{ color: 'var(--danger)', fontSize: '0.75rem' }}>{formErrors.date}</span>}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Maximum Capacity (Seats) *
                </label>
                <input
                  type="number"
                  min="1"
                  max="1000"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                  style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-md)', border: `1px solid ${formErrors.capacity ? 'var(--danger)' : 'var(--border)'}` }}
                />
                {formErrors.capacity && <span style={{ color: 'var(--danger)', fontSize: '0.75rem' }}>{formErrors.capacity}</span>}
              </div>
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                Campus Venue / Location *
              </label>
              <input
                type="text"
                placeholder="e.g. Science Block Auditorium 2"
                value={formData.venue}
                onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-md)', border: `1px solid ${formErrors.venue ? 'var(--danger)' : 'var(--border)'}` }}
              />
              {formErrors.venue && <span style={{ color: 'var(--danger)', fontSize: '0.75rem' }}>{formErrors.venue}</span>}
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                Event Description *
              </label>
              <textarea
                rows="4"
                placeholder="Detailed event agenda, prerequisites, rules, and outcomes..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-md)', border: `1px solid ${formErrors.description ? 'var(--danger)' : 'var(--border)'}` }}
              />
              {formErrors.description && <span style={{ color: 'var(--danger)', fontSize: '0.75rem' }}>{formErrors.description}</span>}
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setActiveTab('events')}
                className="btn btn-outline"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createMutation.isPending}
                className="btn btn-primary"
                style={{ minWidth: '160px' }}
              >
                {createMutation.isPending ? 'Publishing...' : 'Publish Event'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MANAGE EVENTS TABLE TAB */}
      {activeTab === 'events' && (
        <div>
          {eventsLoading ? (
            <LoadingSpinner message="Fetching campus event records..." />
          ) : eventsError ? (
            <ErrorMessage message="Failed to load events for management." />
          ) : events.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '3.5rem' }}>
              <h3>No events have been created yet.</h3>
              <p style={{ color: 'var(--text-muted)', margin: '0.5rem 0 1.5rem' }}>Click below to create your first campus event.</p>
              <button onClick={() => setActiveTab('create')} className="btn btn-primary">
                Create Event
              </button>
            </div>
          ) : (
            <div className="card" style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)' }}>
                    <th style={{ padding: '1rem 1.25rem' }}>Event Title</th>
                    <th style={{ padding: '1rem' }}>Category</th>
                    <th style={{ padding: '1rem' }}>Club</th>
                    <th style={{ padding: '1rem' }}>Date</th>
                    <th style={{ padding: '1rem' }}>Registered / Capacity</th>
                    <th style={{ padding: '1rem' }}>Status</th>
                    <th style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map((ev) => {
                    const isFull = ev.registeredCount >= ev.capacity;
                    return (
                      <tr key={ev.id} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '1rem 1.25rem', fontWeight: 600 }}>
                          {ev.title}
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <span className="badge badge-tech">{ev.category}</span>
                        </td>
                        <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>
                          {ev.club?.name || 'N/A'}
                        </td>
                        <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>
                          {new Date(ev.date).toLocaleDateString()}
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <span style={{ fontWeight: 700, color: isFull ? 'var(--danger)' : 'var(--text-main)' }}>
                            {ev.registeredCount} / {ev.capacity}
                          </span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-light)', display: 'block' }}>
                            ({ev.remainingSeats} remaining)
                          </span>
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <span className={`badge ${isFull ? 'badge-danger' : 'badge-success'}`}>
                            {isFull ? 'FULL' : ev.status}
                          </span>
                        </td>
                        <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                            <button
                              onClick={() => setViewingRegistrationsEvent(ev)}
                              className="btn btn-outline"
                              style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
                              title="View Registrations"
                            >
                              <Eye size={13} />
                              <span>Registrants</span>
                            </button>

                            <button
                              onClick={() => {
                                if (window.confirm(`Are you sure you want to delete '${ev.title}'?`)) {
                                  deleteMutation.mutate(ev.id);
                                }
                              }}
                              className="btn btn-outline"
                              style={{ padding: '0.35rem 0.5rem', color: 'var(--danger)', borderColor: '#fca5a5' }}
                              title="Delete Event"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* REGISTRATIONS ROSTER MODAL */}
      {viewingRegistrationsEvent && (
        <div className="modal-overlay" onClick={() => setViewingRegistrationsEvent(null)}>
          <div className="modal-card" style={{ maxWidth: '640px' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <span className="badge badge-tech" style={{ marginBottom: '0.25rem' }}>Attendee Roster</span>
                <h3 style={{ fontSize: '1.25rem' }}>{viewingRegistrationsEvent.title}</h3>
              </div>
              <button onClick={() => setViewingRegistrationsEvent(null)} className="btn btn-outline" style={{ padding: '0.35rem 0.6rem' }}>
                Close
              </button>
            </div>

            {registrationsLoading ? (
              <LoadingSpinner message="Retrieving attendee roster..." />
            ) : registrationsData?.data?.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-muted)' }}>
                No students have registered for this event yet.
              </div>
            ) : (
              <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)' }}>
                      <th style={{ padding: '0.65rem' }}>Student Name</th>
                      <th style={{ padding: '0.65rem' }}>Student Email</th>
                      <th style={{ padding: '0.65rem' }}>Status</th>
                      <th style={{ padding: '0.65rem' }}>Registered At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {registrationsData?.data?.map((reg) => (
                      <tr key={reg.id} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '0.65rem', fontWeight: 600 }}>{reg.studentName}</td>
                        <td style={{ padding: '0.65rem', color: 'var(--text-muted)' }}>{reg.studentEmail}</td>
                        <td style={{ padding: '0.65rem' }}>
                          <span className="badge badge-success">{reg.status}</span>
                        </td>
                        <td style={{ padding: '0.65rem', color: 'var(--text-light)', fontSize: '0.75rem' }}>
                          {new Date(reg.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
