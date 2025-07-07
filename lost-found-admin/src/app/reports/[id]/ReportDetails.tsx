"use client";

import { useState, useEffect } from "react";
import { Eye, Trash2, AlertTriangle, CheckCircle, ArrowLeft, ImageIcon } from "lucide-react";
import { IReport } from "@/models/Report";
import Link from "next/link";

interface ReportDetailsProps {
  reportId: string;
}

export default function ReportDetails({ reportId }: ReportDetailsProps) {
  const [report, setReport] = useState<IReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageErrors, setImageErrors] = useState<{[key: string]: boolean}>({});
  const [imageLoading, setImageLoading] = useState<{[key: string]: boolean}>({});
  const [imageRetries, setImageRetries] = useState<{[key: string]: number}>({});

  useEffect(() => {
    fetchReport();
  }, [reportId]);

  useEffect(() => {
    // Initialize loading states for images when report changes
    if (report?.itemDetails?.images) {
      const initialLoadingState = report.itemDetails.images.reduce((acc, image) => {
        acc[image] = true;
        return acc;
      }, {} as {[key: string]: boolean});
      
      setImageLoading(initialLoadingState);
      setImageErrors({});
      setImageRetries({});
    }
  }, [report]);

  const fetchReport = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(`/api/reports/${reportId}`);
      if (!response.ok) throw new Error('Failed to fetch report');
      const data = await response.json();
      console.log('Report data:', data);
      if (data.itemDetails?.images) {
        console.log('Image paths:', data.itemDetails.images);
      }
      setReport(data);
    } catch (error) {
      console.error("Failed to fetch report:", error);
      setError('Failed to fetch report details. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const validateImageUrl = (url: string) => {
    if (!url) {
      console.log('Invalid image URL: URL is empty');
      return false;
    }
    
    try {
      const parsedUrl = new URL(url);
      // Check if the URL uses a valid protocol
      const isValid = ['http:', 'https:'].includes(parsedUrl.protocol);
      if (!isValid) {
        console.log('Invalid image URL protocol:', parsedUrl.protocol);
      }
      return isValid;
    } catch (error) {
      console.log('Invalid image URL format:', url, error);
      return false;
    }
  };

  const handleImageLoad = (image: string) => {
    setImageLoading(prev => ({ ...prev, [image]: false }));
    setImageErrors(prev => ({ ...prev, [image]: false }));
  };

  const handleImageError = async (image: string) => {
    console.log('Image failed to load:', image);
    const currentRetries = imageRetries[image] || 0;
    
    if (currentRetries < 2) { // Try loading the image up to 2 times
      console.log('Retrying image load, attempt:', currentRetries + 1);
      setImageRetries(prev => ({ ...prev, [image]: currentRetries + 1 }));
      
      // Add a small delay before retrying
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Force reload the image
      const img = new Image();
      img.src = `${image}${image.includes('?') ? '&' : '?'}retry=${currentRetries}`;
      
      img.onload = () => {
        console.log('Image loaded successfully on retry:', image);
        handleImageLoad(image);
      };
      img.onerror = () => {
        console.log('Image failed to load on retry:', image);
        setImageLoading(prev => ({ ...prev, [image]: false }));
        setImageErrors(prev => ({ ...prev, [image]: true }));
      };
    } else {
      console.log('Max retries reached for image:', image);
      setImageLoading(prev => ({ ...prev, [image]: false }));
      setImageErrors(prev => ({ ...prev, [image]: true }));
    }
  };

  const ImagePlaceholder = ({ isLoading = false, hasError = false }: { isLoading?: boolean, hasError?: boolean }) => (
    <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg">
      {isLoading ? (
        <div className="animate-pulse flex items-center justify-center">
          <div className="h-12 w-12 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
        </div>
      ) : hasError ? (
        <div className="flex flex-col items-center justify-center text-red-500">
          <AlertTriangle className="h-12 w-12 mb-2" />
          <span className="text-sm">Failed to load image</span>
        </div>
      ) : (
        <ImageIcon className="h-12 w-12 text-gray-400" />
      )}
    </div>
  );

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="container-modern">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600 mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading report details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="container-modern">
        <div className="glass-card p-6">
          <div className="flex items-center text-red-600 dark:text-red-400">
            <AlertTriangle className="h-5 w-5 mr-2" />
            <h3 className="font-medium">Error Loading Report</h3>
          </div>
          <p className="text-sm mt-2 text-slate-600 dark:text-slate-300">{error || 'Report not found'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-modern">
      <div className="mb-8">
        <Link 
          href="/reports" 
          className="inline-flex items-center text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Reports
        </Link>
      </div>

      <div className="section-header">
        <div>
          <h1 className="section-title">Report Details</h1>
          <p className="text-muted-foreground">Detailed information about the report</p>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Main Content Column */}
        <div className="col-span-2 space-y-6">
          {/* Item Details */}
          <div className="glass-card">
            <div className="dashboard-header">
              <h2 className="text-xl font-semibold">Item Details</h2>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <p className="font-medium mb-2 text-foreground">Title</p>
                <p className="text-muted-foreground">{report.itemDetails.title}</p>
              </div>
              <div>
                <p className="font-medium mb-2 text-foreground">Description</p>
                <p className="text-muted-foreground whitespace-pre-wrap">{report.itemDetails.description}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="font-medium mb-2 text-foreground">Category</p>
                  <p className="text-muted-foreground">{report.itemDetails.category}</p>
                </div>
                <div>
                  <p className="font-medium mb-2 text-foreground">Sub Category</p>
                  <p className="text-muted-foreground">{report.itemDetails.subCategory}</p>
                </div>
              </div>
              <div>
                <p className="font-medium mb-2 text-foreground">Colors</p>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-8 h-8 rounded-full border-2 border-gray-200 dark:border-gray-700 shadow-sm" 
                      style={{ backgroundColor: report.itemDetails.primaryColor }}
                      title="Primary Color"
                    />
                    <p className="text-muted-foreground">Primary</p>
                  </div>
                  {report.itemDetails.secondaryColor && (
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-8 h-8 rounded-full border-2 border-gray-200 dark:border-gray-700 shadow-sm" 
                        style={{ backgroundColor: report.itemDetails.secondaryColor }}
                        title="Secondary Color"
                      />
                      <p className="text-muted-foreground">Secondary</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Images */}
          {report.itemDetails.images && report.itemDetails.images.length > 0 && (
            <div className="glass-card">
              <div className="dashboard-header">
                <h2 className="text-xl font-semibold">Images</h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  {report.itemDetails.images.map((image, index) => {
                    const isValidUrl = validateImageUrl(image);
                    if (!isValidUrl) {
                      return <ImagePlaceholder key={index} hasError={true} />;
                    }

                    return (
                      <div 
                        key={index} 
                        className="relative aspect-square cursor-pointer group rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                        onClick={() => !imageErrors[image] && !imageLoading[image] && setSelectedImage(image)}
                      >
                        {imageErrors[image] ? (
                          <ImagePlaceholder hasError={true} />
                        ) : imageLoading[image] ? (
                          <ImagePlaceholder isLoading={true} />
                        ) : (
                          <>
                            <img
                              src={image}
                              alt={`Item image ${index + 1}`}
                              className="object-cover w-full h-full group-hover:opacity-90 transition-opacity"
                              onError={() => handleImageError(image)}
                              onLoad={() => handleImageLoad(image)}
                              loading="lazy"
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-opacity flex items-center justify-center">
                              <Eye className="text-white opacity-0 group-hover:opacity-100 h-6 w-6 drop-shadow-lg" />
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Location Details */}
          <div className="glass-card">
            <div className="dashboard-header">
              <h2 className="text-xl font-semibold">Location Details</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="font-medium mb-2 text-foreground">City</p>
                  <p className="text-muted-foreground">{report.locationDetails.lastSeenLocation.city}</p>
                </div>
                <div>
                  <p className="font-medium mb-2 text-foreground">Lost/Found Date</p>
                  <p className="text-muted-foreground">{formatDate(report.locationDetails.lostDate)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Match Details */}
          {report.matchDetails && report.matchDetails.length > 0 && (
            <div className="glass-card">
              <div className="dashboard-header">
                <h2 className="text-xl font-semibold">Match Details</h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {report.matchDetails.map((match, index) => (
                    <div key={index} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="font-medium mb-2 text-foreground">Matched Report ID</p>
                          <p className="text-muted-foreground">{match.report_id}</p>
                        </div>
                        <div>
                          <p className="font-medium mb-2 text-foreground">Matched On</p>
                          <p className="text-muted-foreground">{formatDate(new Date(match.matched_on))}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Side Column */}
        <div className="space-y-6">
          {/* Status Card */}
          <div className="glass-card">
            <div className="dashboard-header">
              <h2 className="text-xl font-semibold">Report Status</h2>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <p className="font-medium mb-3 text-foreground">Report Type</p>
                <span
                  className={`px-4 py-2 inline-flex text-sm font-semibold rounded-full ${
                    report.reportType === "lost"
                      ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                      : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                  }`}
                >
                  {report.reportType.charAt(0).toUpperCase() + report.reportType.slice(1)}
                </span>
              </div>
              <div>
                <p className="font-medium mb-3 text-foreground">Status</p>
                <span
                  className={`px-4 py-2 inline-flex text-sm font-semibold rounded-full ${
                    report.status === "Active"
                      ? "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200"
                      : report.status === "Matched"
                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                      : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
                  }`}
                >
                  {report.status}
                </span>
              </div>
              <div>
                <p className="font-medium mb-3 text-foreground">Fraud Status</p>
                <div className="flex items-center p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                  {report.fraud ? (
                    <>
                      <AlertTriangle className="h-5 w-5 text-red-500 mr-3" />
                      <p className="text-red-500 font-medium">Flagged as Fraud</p>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                      <p className="text-green-500 font-medium">No Fraud Detected</p>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Timestamps Card */}
          <div className="glass-card">
            <div className="dashboard-header">
              <h2 className="text-xl font-semibold">Timestamps</h2>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <p className="font-medium mb-2 text-foreground">Created At</p>
                <p className="text-muted-foreground">{formatDate(report.createdAt)}</p>
              </div>
              <div>
                <p className="font-medium mb-2 text-foreground">Last Updated</p>
                <p className="text-muted-foreground">{formatDate(report.updatedAt)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-5xl w-full h-full flex items-center justify-center">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setSelectedImage(null);
              }}
              className="absolute top-4 right-4 text-white hover:text-gray-300 z-50 p-2 rounded-full bg-black bg-opacity-50 hover:bg-opacity-75 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="relative w-full h-full flex items-center justify-center">
              {imageErrors[selectedImage] ? (
                <ImagePlaceholder hasError={true} />
              ) : imageLoading[selectedImage] ? (
                <ImagePlaceholder isLoading={true} />
              ) : (
                <img
                  src={selectedImage}
                  alt="Full size image"
                  className="max-h-[90vh] max-w-full object-contain rounded-lg shadow-2xl"
                  onError={() => handleImageError(selectedImage)}
                  onLoad={() => handleImageLoad(selectedImage)}
                  loading="lazy"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 