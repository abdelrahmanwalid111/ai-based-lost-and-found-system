import mongoose from 'mongoose';

interface LocationDetails {
  lat: number;
  lng: number;
  city: string;
  area: string;
}

interface ItemDetails {
  title: string;
  description: string;
  category: string;
  subCategory: string;
  primaryColor: string;
  secondaryColor: string;
  images: string[];
}

interface MatchDetail {
  report_id: string;
  score?: number;
  matched_on: string;
}

export interface IReport {
  _id: string;
  reportType: 'lost' | 'found';
  userId: string;
  itemDetails: ItemDetails;
  locationDetails: {
    lastSeenLocation: LocationDetails;
    lostDate: Date;
  };
  status: 'Active' | 'Matched' | 'Closed';
  matchDetails?: MatchDetail[];
  matchedReportIds?: string[];
  fraud: boolean;
  fraud_checked: boolean;
  fraud_reason: string;
  createdAt: Date;
  updatedAt: Date;
  isUpdating?: boolean;
}

const reportSchema = new mongoose.Schema<IReport>({
  reportType: { type: String, required: true, enum: ['lost', 'found'] },
  userId: { type: String, required: true },
  itemDetails: {
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    subCategory: { type: String, required: true },
    primaryColor: { type: String, required: true },
    secondaryColor: { type: String },
    images: [{ type: String }]
  },
  locationDetails: {
    lastSeenLocation: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
      city: { type: String, required: true },
      area: { type: String, required: true }
    },
    lostDate: { type: Date, required: true }
  },
  status: { 
    type: String, 
    required: true, 
    enum: ['Active', 'Matched', 'Closed'],
    default: 'Active'
  },
  matchDetails: [{
    report_id: { type: String },
    score: { type: Number },
    matched_on: { type: String }
  }],
  matchedReportIds: [{ type: String }],
  fraud: { type: Boolean, default: false },
  fraud_checked: { type: Boolean, default: false },
  fraud_reason: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  isUpdating: { type: Boolean }
});

const Report = mongoose.models.Report || mongoose.model<IReport>('Report', reportSchema);

export default Report; 