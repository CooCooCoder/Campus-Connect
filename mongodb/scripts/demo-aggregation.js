/**
 * MongoDB Aggregation Pipeline Demonstration Script
 * Advanced Database Systems Practical Demonstration
 * Demonstrates: $facet, $group, $sort, $lookup, $unwind, $project
 */

const mongoose = require('mongoose');
const ActivityLog = require('../models/ActivityLog');
const Notification = require('../models/Notification');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/campusconnect_logs';

async function runAggregationDemo() {
  console.log('Connecting to MongoDB at:', MONGO_URI);
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB successfully.');

  // Clean and insert sample activity records for demonstration
  await ActivityLog.deleteMany({});
  await Notification.deleteMany({});

  const sampleLogs = [
    {
      action: 'REGISTRATION_SUCCESS',
      eventId: 'ev-101',
      eventTitle: 'HackCampus 2026',
      studentEmail: 'shivamsh.menon@campus.edu',
      studentName: 'Shivamsh Anil Menon',
      metadata: { channel: 'WEB', userAgent: 'Chrome/125.0' }
    },
    {
      action: 'REGISTRATION_SUCCESS',
      eventId: 'ev-101',
      eventTitle: 'HackCampus 2026',
      studentEmail: 'aarav.sharma@campus.edu',
      studentName: 'Aarav Sharma',
      metadata: { channel: 'MOBILE', userAgent: 'CampusApp/2.1' }
    },
    {
      action: 'REGISTRATION_SUCCESS',
      eventId: 'ev-102',
      eventTitle: 'AI Masterclass',
      studentEmail: 'priya.nair@campus.edu',
      studentName: 'Priya Nair',
      metadata: { channel: 'WEB', userAgent: 'Firefox/124.0' }
    },
    {
      action: 'EVENT_FULL_ALERT',
      eventId: 'ev-102',
      eventTitle: 'AI Masterclass',
      studentEmail: 'system@campus.edu',
      studentName: 'System Monitor',
      metadata: { channel: 'API', userAgent: 'Daemon/1.0' }
    },
    {
      action: 'REGISTRATION_SUCCESS',
      eventId: 'ev-103',
      eventTitle: 'Acoustic Sunset Concert',
      studentEmail: 'rohan.v@campus.edu',
      studentName: 'Rohan Verma',
      metadata: { channel: 'WEB', userAgent: 'Safari/17.2' }
    }
  ];

  await ActivityLog.insertMany(sampleLogs);
  console.log(`Inserted ${sampleLogs.length} sample activity documents.`);

  console.log('\n--- EXECUTING ADVANCED AGGREGATION PIPELINE ($facet multi-dimensional analytics) ---');
  
  const analyticsPipeline = [
    {
      $facet: {
        // Facet 1: Action Distribution
        actionsBreakdown: [
          {
            $group: {
              _id: '$action',
              count: { $sum: 1 }
            }
          },
          { $sort: { count: -1 } }
        ],
        // Facet 2: Most Active Events
        topEvents: [
          {
            $group: {
              _id: { eventId: '$eventId', eventTitle: '$eventTitle' },
              totalActivities: { $sum: 1 }
            }
          },
          { $sort: { totalActivities: -1 } },
          { $limit: 5 }
        ],
        // Facet 3: Channel Breakdown
        channelStats: [
          {
            $group: {
              _id: '$metadata.channel',
              count: { $sum: 1 }
            }
          }
        ]
      }
    }
  ];

  const result = await ActivityLog.aggregate(analyticsPipeline);
  console.log('Multi-Faceted Aggregation Result:');
  console.log(JSON.stringify(result, null, 2));

  await mongoose.disconnect();
  console.log('\nAggregation demonstration completed and connection closed.');
}

if (require.main === module) {
  runAggregationDemo().catch(err => {
    console.error('Aggregation demo error:', err.message);
    process.exit(1);
  });
}

module.exports = { runAggregationDemo };
