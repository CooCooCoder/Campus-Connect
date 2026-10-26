-- ==============================================================================
-- CampusConnect: Advanced SQL Demonstrations & Query Performance
-- Author: Shivamsh Anil Menon
-- Subject: Advanced Database Systems
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. CTE-BASED MULTI-DIMENSIONAL EVENT ANALYTICS
-- Calculates total capacity, fill rates, and organizer metrics per club
-- ------------------------------------------------------------------------------
WITH ClubEventMetrics AS (
    SELECT 
        c.id AS club_id,
        c.name AS club_name,
        c.category AS club_category,
        COUNT(e.id) AS total_events,
        COALESCE(SUM(e.capacity), 0) AS aggregate_capacity,
        COALESCE(SUM(e.registered_count), 0) AS total_registrations
    FROM clubs c
    LEFT JOIN events e ON c.id = e.club_id
    GROUP BY c.id, c.name, c.category
),
ClubPerformanceRank AS (
    SELECT 
        club_name,
        club_category,
        total_events,
        aggregate_capacity,
        total_registrations,
        CASE 
            WHEN aggregate_capacity > 0 
            THEN ROUND((total_registrations::numeric / aggregate_capacity::numeric) * 100, 2)
            ELSE 0 
        END AS overall_fill_percentage
    FROM ClubEventMetrics
)
SELECT 
    club_name,
    club_category,
    total_events,
    aggregate_capacity,
    total_registrations,
    overall_fill_percentage,
    CASE 
        WHEN overall_fill_percentage >= 80 THEN 'High Demand'
        WHEN overall_fill_percentage >= 40 THEN 'Moderate Engagement'
        ELSE 'Open Slots Available'
    END AS engagement_tier
FROM ClubPerformanceRank
ORDER BY total_registrations DESC;


-- ------------------------------------------------------------------------------
-- 2. WINDOW FUNCTION DEMONSTRATION
-- Partitions events by category and calculates relative registration popularity ranks
-- Demonstrates DENSE_RANK(), PERCENT_RANK(), and cumulative registration totals
-- ------------------------------------------------------------------------------
SELECT 
    e.id AS event_id,
    e.title AS event_title,
    e.category,
    c.name AS club_name,
    e.capacity,
    e.registered_count,
    -- Rank within each event category
    DENSE_RANK() OVER (
        PARTITION BY e.category 
        ORDER BY e.registered_count DESC
    ) AS category_popularity_rank,
    -- Percentage rank within category
    ROUND((PERCENT_RANK() OVER (
        PARTITION BY e.category 
        ORDER BY e.registered_count
    ))::numeric, 2) AS category_percentile,
    -- Running cumulative registrations across category
    SUM(e.registered_count) OVER (
        PARTITION BY e.category 
        ORDER BY e.event_date
        ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
    ) AS cumulative_category_registrations
FROM events e
JOIN clubs c ON e.club_id = c.id
ORDER BY e.category, category_popularity_rank;


-- ------------------------------------------------------------------------------
-- 3. CONCURRENCY CONTROL TRANSACTION DEMONSTRATION
-- Simulates atomic reservation with Compare-And-Swap conditional update
-- Guarantees that concurrent workers cannot exceed event capacity
-- ------------------------------------------------------------------------------
BEGIN;

-- Set transaction isolation level
SET TRANSACTION ISOLATION LEVEL READ COMMITTED;

-- Atomic compare-and-swap reservation
-- The WHERE clause ensures registered_count < capacity at the exact moment of execution
UPDATE events
SET registered_count = registered_count + 1,
    updated_at = CURRENT_TIMESTAMP
WHERE id = 'e82b3a41-1111-4f11-9a22-000000000001'
  AND registered_count < capacity
RETURNING id, title, capacity, registered_count;

-- If rows affected == 1:
INSERT INTO registrations (event_id, student_name, student_email, status)
VALUES ('e82b3a41-1111-4f11-9a22-000000000001', 'Priya Sharma', 'priya.s@campus.edu', 'CONFIRMED');

COMMIT;


-- ------------------------------------------------------------------------------
-- 4. EXPLAIN ANALYZE DEMONSTRATION: PARTIAL INDEX VS SEQUENTIAL SCAN
-- Evaluates the query planner on index scan efficiency for available upcoming events
-- ------------------------------------------------------------------------------
EXPLAIN ANALYZE
SELECT 
    e.id, 
    e.title, 
    e.category, 
    e.venue, 
    e.event_date, 
    e.capacity, 
    e.registered_count
FROM events e
WHERE e.status = 'UPCOMING' 
  AND e.registered_count < e.capacity
ORDER BY e.event_date ASC
LIMIT 10;
