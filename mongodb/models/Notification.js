const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema(
  {
    recipientEmail: {
      type: String,
      required: true,
      lowercase: true,
      index: true
    },
    title: {
      type: String,
      required: true,
      maxlength: 120
    },
    message: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['REGISTRATION_CONFIRMATION', 'EVENT_REMINDER', 'CAPACITY_ALERT', 'SYSTEM'],
      default: 'REGISTRATION_CONFIRMATION'
    },
    // Reference to external relational event entity
    eventId: {
      type: String,
      ref: 'Event',
      index: true
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true
    },
    // Embedded subdocument demonstrating embedding vs referencing pattern
    deliveryReceipt: {
      sentAt: { type: Date, default: Date.now },
      gateway: { type: String, default: 'Campus-SMTP-Relay' },
      status: { type: String, enum: ['DELIVERED', 'QUEUED', 'FAILED'], default: 'DELIVERED' }
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.models.Notification || mongoose.model('Notification', NotificationSchema);
