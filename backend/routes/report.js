const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs-extra");
const Report = require("../models/Report");
const authenticate = require("../middlewares/auth");
const { getReports, createReport } = require("../controllers/report");
console.log("Report routes loaded");
// Multer setup for temp directory
const tempStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const tempDir = path.join(__dirname, "..", "uploads", "temp");
    fs.ensureDirSync(tempDir);
    cb(null, tempDir);
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}_${file.originalname}`);
  },
});
const upload = multer({ storage: tempStorage });

// Authorize user or admin for specific report
const authorizeReportAccess = async (req, res, next) => {
  const { id } = req.params;
  try {
    const report = await Report.findById(id);
    if (!report) return res.status(404).json({ message: "Report not found" });
    if (req.user.role === "admin" || req.user.userId === report.userId) {
      req.report = report;
      return next();
    }
    return res.status(403).json({ message: "Not authorized to access this report" });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

// GET /report - List all reports (admin) or only user's reports (user)
router.get("/", authenticate, getReports);

// POST /report - Create a new report (with optional image)
router.post("/", authenticate, upload.single("image"), createReport);
// GET /report/:id - Get a specific report by ID
router.get("/:id", authenticate, authorizeReportAccess, async (req, res) => {
  try {
    res.status(200).json(req.report); // already fetched in authorizeReportAccess
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch report", error: err.message });
  }
});

// PUT /report/:id - Update a report
router.put("/:id", authenticate, authorizeReportAccess, async (req, res) => {
  try {
    const updates = req.body;
    const updatedReport = await Report.findByIdAndUpdate(req.report._id, updates, { new: true });
    res.status(200).json({ message: "Report updated", report: updatedReport });
  } catch (err) {
    res.status(500).json({ message: "Failed to update report", error: err.message });
  }
});

// DELETE /report/:id - Delete a report
router.delete("/:id", authenticate, authorizeReportAccess, async (req, res) => {
  try {
    await req.report.deleteOne();
    res.status(200).json({ message: "Report deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete report", error: err.message });
  }
});



module.exports = router;
