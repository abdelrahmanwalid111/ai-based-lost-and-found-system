const path = require("path");
const fs = require("fs-extra");

const Report = require("../models/Report");

const createReport = async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized: User not authenticated" });
    }

    const {
      reportType,
      title,
      description,
      category,
      subCategory,
      itemType,
      primaryColor,
      secondaryColor,
      latitude,
      longitude,
      city,
      area,
      lostDate,
    } = req.body;

    if (!reportType || !title) {
      return res.status(400).json({ message: "Missing 'reportType' or 'title'." });
    }

    // Capitalize first letter of reportType for folder name
    const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    const folderName = capitalize(reportType); // 'Found' or 'Lost'

    // Build the report object
    const newReport = new Report({
      reportType,
      userId,
      itemDetails: {
        title,
        description,
        category,
        subCategory,
        itemType,
        primaryColor,
        secondaryColor,
        images: [],
      },
      locationDetails: {
        lastSeenLocation: {
          lat: latitude ? parseFloat(latitude) : 0,
          lng: longitude ? parseFloat(longitude) : 0,
          city: city || "",
          area: area || "",
        },
        lostDate: lostDate ? new Date(lostDate) : new Date(),
      },
    });

    newReport.id = newReport._id.toString();

    // Handle image upload and saving
    if (req.file) {
      const destinationFolder = path.join(__dirname, "..", "uploads", folderName);

      await fs.ensureDir(destinationFolder);

      const destPath = path.join(destinationFolder, req.file.filename);
      await fs.move(req.file.path, destPath);

      const relativePath = path.posix.join("/uploads", folderName, req.file.filename);
      newReport.itemDetails.images = [relativePath];
    }

    await newReport.save();

    res.status(201).json({ message: "Report created successfully", report: newReport });
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
};

const getReports = async (req, res) => {
  console.log('userId:', req.user.userId, 'role:', req.user.role);
  try {
    const { userId, role } = req.user;

    let reports;

    if (role === "admin") {
      reports = await Report.find({});
      console.log('Admin sees:', reports.length, 'reports');
    } else {
      reports = await Report.find({ userId });
      console.log('User sees:', reports.length, 'reports');
    }

    res.json(reports);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = { createReport, getReports };
