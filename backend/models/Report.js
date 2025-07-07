const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ReportSchema = new Schema(
  {
    reportType: { type: String, required: true },
    userId: { type: String, required: true },
    itemDetails: {
      title: { type: String, required: true },
      description: { type: String },
      category: { type: String },
      subCategory: { type: String },
      itemType: { type: String },
      primaryColor: { type: String },
      secondaryColor: { type: String },
      images: [{ type: String }],
    },
    locationDetails: {
      lastSeenLocation: {
        lat: { type: Number, required: true },
        lng: { type: Number, required: true },
        city: { type: String, required: true },
        area: { type: String, required: true },
      },
      lostDate: { type: Date, default: Date.now },
    },
    id: { type: String }, // to keep a string version of _id
    status: {
      type: String,
      enum: ["active", "resolved", "archived"],
      default: "active",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Report", ReportSchema);
