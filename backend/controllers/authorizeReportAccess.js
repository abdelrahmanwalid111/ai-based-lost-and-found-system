
const Report = require('../models/Report');

const authorizeReportAccess = async (req, res, next) => {
  const { id } = req.params; // Assuming route: /report/:id
  try {
    const report = await Report.findById(id);
    if (!report) return res.status(404).json({ message: 'Report not found' });

    // Allow if admin or report owner
    if (req.user.role === 'admin' || req.user._id.toString() === report.userId) {
      req.report = report; // Pass report for next steps
      return next();
    }

    return res.status(403).json({ message: 'Not authorized to access this report' });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { authorizeReportAccess };
