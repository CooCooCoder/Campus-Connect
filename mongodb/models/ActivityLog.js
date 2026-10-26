const mongoose = require('mongoose');

const ActivityLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: [true, 'Action name is required'],
      enum: ['REGISTRATION_SUCCESS', 'REGISTRATION_CANCELLED', 'EVENT_CREATED', 'EVENT_UPDATED', 'EVENT_FULL_ALERT'],
      index: true
    },
    eventId: {
      type: String,
      required: [true, 'Event ID is required'],
      index: true
    },
    eventTitle: {
      type: String,
      required: true
    },
    studentEmail: {
      type: String,
      lowercase: true,
      trim: true,
      index: true
    },
    studentName: {
      type: String,
      trim: true
    },
    metadata: {
      ipAddress: { type: String, default: '127.0.0.1' },
      userAgent: { type: String, default: 'CampusConnect-Client/1.0' },
      channel: { type: String, enum: ['WEB', 'MOBILE', 'API'], default: 'WEB' }
    },
    createdAt: {
      type: Date,
      default: Date.now,
      // TTL Index: documents automatically purged after 90 days (7,776,000 seconds)
      expires: 7776000
    }
  },
  {
    timestamps: true
  }
);

// Compound index for frequent audit queries filtering by event and timestamp
ActivityLogSchema.index({ eventId: 1, createdAt: -1 });

// Ensure model compilation is safe across re-imports
module.exports = mongoose.models.ActivityLog || mongoose.model('ActivityLog', ActivityLogSchema);
