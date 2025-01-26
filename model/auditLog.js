const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.Mixed, // Allow ObjectId or String
    ref: "users",
    required: true,
  },
  operation: {
    type: String,
    enum: ["create", "update", "delete", "login"],
    required: true,
  },
  collectionName: {
    type: String,
    required: true,
  },
  documentId: {
    type: mongoose.Schema.Types.ObjectId,
    required: false,
  },
  oldValue: {
    type: mongoose.Schema.Types.Mixed,
    required: false,
  },
  newValue: {
    type: mongoose.Schema.Types.Mixed,
    required: false,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const AuditLog = mongoose.model("AuditLog", auditLogSchema);
module.exports = AuditLog;
