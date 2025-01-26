const AuditLog = require("../model/auditLog");

const auditLogger = async (req, res, next) => {
  const { user, method, originalUrl, body, params } = req;

  try {
    const operation = determineOperation(method, originalUrl);
    if (!operation) return next();

    const logEntry = new AuditLog({
      userId: user?.id || "System", // User ID if available; "System" for system actions
      operation: operation,
      collectionName: determineCollectionName(originalUrl),
      documentId: params.id || body.id,
      oldValue: req.oldValue || null, // Previous data for updates/deletes
      newValue: body || null, // New data for updates/creates
    });

    await logEntry.save();
    next();
  } catch (error) {
    console.error("Audit log error:", error.message);
    next(); // Allow the operation to continue even if logging fails
  }
};

// Helper function to determine the operation type
const determineOperation = (method, url) => {
  if (method === "POST") return "create";
  if (method === "PUT") return "update";
  if (method === "DELETE") return "delete";
  if (url.includes("/login")) return "login";
  return null;
};

// Helper function to extract the collection name
const determineCollectionName = (url) => {
  const segments = url.split("/");
  return segments[segments.length - 2]; // Assumes URL structure like /api/{collection}/{id}
};

module.exports = auditLogger;
