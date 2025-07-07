"use client";

import { useState, useEffect } from "react";
import { Search, Filter, Download, Eye, MoreHorizontal, RefreshCw, Trash2, X, AlertTriangle, Shield, ShieldCheck } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useTheme } from "@/contexts/ThemeContext";

interface Report {
  _id: string;
  id?: string;
  reportType?: 'lost' | 'found';
  type?: 'lost' | 'found'; // fallback for compatibility
  status: string;
  userId?: string;
  itemDetails?: {
    title?: string;
    category?: string;
    subCategory?: string;
    description?: string;
    itemType?: string;
    primaryColor?: string;
    secondaryColor?: string;
    images?: string[];
  };
  locationDetails?: {
    lastSeenLocation?: {
      lat?: number;
      lng?: number;
      city?: string;
      area?: string;
    };
    lostDate?: string;
  };
  location?: {
    address?: string;
    city?: string;
  };
  createdAt: string;
  updatedAt?: string;
  user?: {
    firstname?: string;
    lastname?: string;
    email?: string;
  };
  fraud?: boolean;
  fraud_checked?: boolean;
  fraud_reason?: string;
  matchDetails?: Array<{
    report_id: string;
    score?: number;
    matched_on: string;
  }>;
  matchedReportIds?: string[];
}

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [filteredReports, setFilteredReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [fraudFilter, setFraudFilter] = useState("all");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastFetchTime, setLastFetchTime] = useState<Date | null>(null);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const { colors } = useTheme();

  useEffect(() => {
    fetchReports();
  }, []);

  useEffect(() => {
    filterReports();
  }, [reports, searchTerm, statusFilter, typeFilter, fraudFilter]);

  const fetchReports = async (showLoading = true) => {
    try {
      if (showLoading) setIsLoading(true);
      setError(null);
      
      // Add timestamp to prevent caching
      const timestamp = Date.now();
      const response = await fetch(`/api/reports?_t=${timestamp}`, {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch reports: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Validate and sanitize the data
      const validatedReports = Array.isArray(data) ? data.map((report: any) => ({
        _id: report._id || report.id || '',
        id: report.id || report._id || '',
        reportType: report.reportType || report.type || 'lost',
        type: report.reportType || report.type || 'lost', // for compatibility
        status: report.status || 'Active',
        userId: report.userId || '',
        itemDetails: {
          title: report.itemDetails?.title || 'Untitled',
          category: report.itemDetails?.category || 'Unknown',
          subCategory: report.itemDetails?.subCategory || 'Unknown',
          description: report.itemDetails?.description || '',
          itemType: report.itemDetails?.itemType || '',
          primaryColor: report.itemDetails?.primaryColor || '',
          secondaryColor: report.itemDetails?.secondaryColor || '',
          images: report.itemDetails?.images || []
        },
        locationDetails: report.locationDetails ? {
          lastSeenLocation: {
            lat: report.locationDetails.lastSeenLocation?.lat || 0,
            lng: report.locationDetails.lastSeenLocation?.lng || 0,
            city: report.locationDetails.lastSeenLocation?.city || 'Unknown',
            area: report.locationDetails.lastSeenLocation?.area || 'Unknown'
          },
          lostDate: report.locationDetails.lostDate || ''
        } : undefined,
        location: report.location ? {
          address: report.location.address || '',
          city: report.location.city || ''
        } : {
          city: report.locationDetails?.lastSeenLocation?.city || 'Unknown',
          address: report.locationDetails?.lastSeenLocation?.area || ''
        },
        createdAt: report.createdAt || new Date().toISOString(),
        updatedAt: report.updatedAt || '',
        user: report.user ? {
          firstname: report.user.firstname || '',
          lastname: report.user.lastname || '',
          email: report.user.email || ''
        } : undefined,
        fraud: report.fraud || false,
        fraud_checked: report.fraud_checked || false,
        fraud_reason: report.fraud_reason || '',
        matchDetails: report.matchDetails || [],
        matchedReportIds: report.matchedReportIds || []
      })) : [];
      
      setReports(validatedReports);
      setLastFetchTime(new Date());
    } catch (error) {
      console.error('Failed to fetch reports:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch reports');
      setReports([]);
    } finally {
      if (showLoading) setIsLoading(false);
    }
  };

  const filterReports = () => {
    try {
      let filtered = reports;

      if (searchTerm && searchTerm.trim()) {
        const searchLower = searchTerm.toLowerCase().trim();
        filtered = filtered.filter(report => {
          const title = report.itemDetails?.title?.toLowerCase() || '';
          const category = report.itemDetails?.category?.toLowerCase() || '';
          const city = report.location?.city?.toLowerCase() || '';
          
          return title.includes(searchLower) || 
                 category.includes(searchLower) || 
                 city.includes(searchLower);
        });
      }

      if (statusFilter !== "all") {
        filtered = filtered.filter(report => report.status === statusFilter);
      }

      if (typeFilter !== "all") {
        filtered = filtered.filter(report => (report.reportType || report.type) === typeFilter);
      }

      if (fraudFilter !== "all") {
        if (fraudFilter === "fraud") {
          filtered = filtered.filter(report => report.fraud === true);
        } else if (fraudFilter === "clean") {
          filtered = filtered.filter(report => report.fraud !== true);
        }
      }

      setFilteredReports(filtered);
    } catch (error) {
      console.error('Error filtering reports:', error);
      setFilteredReports([]);
    }
  };

  const getStatusColor = (status: string) => {
    if (!status) return { color: '#6b7280', bg: '#f3f4f6' };
    
    switch (status.toLowerCase()) {
      case 'active':
        return { color: '#f59e0b', bg: '#fef3c7' };
      case 'matched':
        return { color: '#8b5cf6', bg: '#e9d5ff' };
      case 'closed':
        return { color: '#10b981', bg: '#d1fae5' };
      default:
        return { color: '#6b7280', bg: '#f3f4f6' };
    }
  };

  const getTypeColor = (type: string | undefined) => {
    if (!type) return { color: '#6b7280', bg: '#f3f4f6' };
    
    return type === 'lost' 
      ? { color: '#dc2626', bg: '#fee2e2' }
      : { color: '#059669', bg: '#d1fae5' };
  };

  const getFraudColor = (fraud: boolean | undefined) => {
    if (fraud) {
      return { color: '#dc2626', bg: '#fee2e2' }; // Red for fraud
    }
    return { color: '#16a34a', bg: '#dcfce7' }; // Green for clean
  };

  const handleManualRefresh = async () => {
    console.log('[Reports] Manual refresh triggered');
    setIsRefreshing(true);
    try {
      await fetchReports(false); // Don't show main loading state
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleExport = () => {
    try {
      // Create CSV content
      const headers = ['Report ID', 'Item', 'Type', 'Status', 'Location', 'Reporter Name', 'Reporter Email', 'User ID', 'Date', 'Fraud Status', 'Fraud Reason'];
      const csvContent = [
        headers.join(','),
        ...filteredReports.map(report => [
          report._id,
          `"${report.itemDetails?.title || 'Untitled'}"`,
          report.reportType || report.type || 'Unknown',
          report.status || 'Unknown',
          `"${report.location?.city || 'N/A'}"`,
          `"${report.user?.firstname || ''} ${report.user?.lastname || ''}"`.trim() || 'Unknown',
          `"${report.user?.email || 'No email'}"`,
          report.userId || 'N/A',
          formatDate(report.createdAt),
          report.fraud ? 'Fraud' : 'Clean',
          `"${report.fraud_reason || 'N/A'}"`
        ].join(','))
      ].join('\n');

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `reports_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      console.log('[Reports] Export completed successfully');
    } catch (error) {
      console.error('[Reports] Export failed:', error);
      alert('Failed to export reports. Please try again.');
    }
  };

  const handleViewReport = (report: Report) => {
    setSelectedReport(report);
    setShowViewModal(true);
  };

  const handleDeleteReport = async (reportId: string) => {
    if (!window.confirm('Are you sure you want to delete this report? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch('/api/reports', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: reportId }),
      });

      if (response.ok) {
        console.log('[Reports] Report deleted successfully');
        // Refresh the reports list
        await fetchReports(false);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete report');
      }
    } catch (error) {
      console.error('[Reports] Delete failed:', error);
      alert('Failed to delete report. Please try again.');
    }
  };

  const handleMarkFraud = async (reportId: string, isFraud: boolean, reason?: string) => {
    try {
      const response = await fetch(`/api/reports/${reportId}/fraud`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fraud: isFraud,
          fraud_checked: true,
          fraud_reason: reason || (isFraud ? 'Marked as fraudulent by admin' : 'Cleared by admin'),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update fraud status');
      }

      // Refresh the reports list
      await fetchReports(false);
      
      // Update selected report if it's the same one
      if (selectedReport && selectedReport._id === reportId) {
        const updatedReport = reports.find(r => r._id === reportId);
        if (updatedReport) {
          setSelectedReport(updatedReport);
        }
      }
    } catch (error) {
      console.error('Error updating fraud status:', error);
      alert('Failed to update fraud status. Please try again.');
    }
  };

  const closeViewModal = () => {
    setShowViewModal(false);
    setSelectedReport(null);
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (error) {
      return 'Invalid Date';
    }
  };

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div style={{
          padding: '24px',
          minHeight: '100vh',
          background: colors.background,
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '400px',
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '32px',
                height: '32px',
                border: `3px solid ${colors.border}`,
                borderTop: `3px solid ${colors.primary}`,
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 16px auto',
              }}></div>
              <p style={{ color: colors.textMuted, margin: 0 }}>Loading reports...</p>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error) {
    return (
      <ProtectedRoute>
        <div style={{
          padding: '24px',
          minHeight: '100vh',
          background: colors.background,
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '400px',
          }}>
            <div style={{
              background: colors.surface,
              padding: '32px',
              borderRadius: '12px',
              border: `1px solid ${colors.border}`,
              boxShadow: colors.shadow,
              textAlign: 'center',
              maxWidth: '400px',
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                background: colors.error + '20',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
              }}>
                <span style={{ color: colors.error, fontSize: '20px' }}>⚠</span>
              </div>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: colors.textPrimary,
                marginBottom: '8px',
                margin: 0,
              }}>
                Error Loading Reports
              </h3>
              <p style={{
                color: colors.textMuted,
                fontSize: '14px',
                marginBottom: '16px',
                margin: 0,
              }}>
                {error}
              </p>
              <button
                onClick={() => fetchReports()}
                style={{
                  padding: '8px 16px',
                  background: colors.primary,
                  color: colors.primaryText,
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  (e.target as HTMLButtonElement).style.backgroundColor = colors.primaryHover;
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLButtonElement).style.backgroundColor = colors.primary;
                }}
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div style={{
        padding: '24px',
        minHeight: '100vh',
        background: colors.background,
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <style jsx>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>

          {/* Header */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '32px',
          }}>
          <div>
            <h1 style={{
              fontSize: '28px',
              fontWeight: '700',
              color: colors.textPrimary,
              margin: '0 0 8px 0',
            }}>
              Reports
            </h1>
            <p style={{
              fontSize: '16px',
              color: colors.textMuted,
              margin: 0,
            }}>
              Manage and track all lost and found reports
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {lastFetchTime && (
              <span style={{
                fontSize: '12px',
                color: colors.textMuted,
              }}>
                Last updated: {formatDate(lastFetchTime.toISOString())}
              </span>
            )}
            <button
              onClick={handleManualRefresh}
              disabled={isRefreshing}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 14px',
                background: colors.surface,
                color: colors.textSecondary,
                border: `1px solid ${colors.border}`,
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: isRefreshing ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                opacity: isRefreshing ? 0.6 : 1,
              }}
              onMouseEnter={(e) => {
                if (!isRefreshing) {
                  (e.target as HTMLButtonElement).style.backgroundColor = colors.surfaceHover;
                  (e.target as HTMLButtonElement).style.borderColor = colors.borderLight;
                }
              }}
              onMouseLeave={(e) => {
                if (!isRefreshing) {
                  (e.target as HTMLButtonElement).style.backgroundColor = colors.surface;
                  (e.target as HTMLButtonElement).style.borderColor = colors.border;
                }
              }}
            >
              <RefreshCw size={16} style={{
                animation: isRefreshing ? 'spin 1s linear infinite' : 'none',
              }} />
              Refresh
            </button>
            <button
              onClick={handleExport}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 16px',
                background: colors.primary,
                color: colors.primaryText,
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'background-color 0.2s ease',
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLButtonElement).style.backgroundColor = colors.primaryHover;
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLButtonElement).style.backgroundColor = colors.primary;
              }}
            >
              <Download size={16} />
              Export
            </button>
          </div>
        </div>

        {/* Filters */}
        <div style={{
          background: colors.surface,
          padding: '24px',
          borderRadius: '12px',
          border: `1px solid ${colors.border}`,
          boxShadow: colors.shadow,
          marginBottom: '24px',
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
            alignItems: 'end',
          }}>
            {/* Search */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: colors.textSecondary,
                marginBottom: '6px',
              }}>
                Search
              </label>
              <div style={{ position: 'relative' }}>
                <Search size={20} style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: colors.textMuted,
                }} />
                <input
                  type="text"
                  placeholder="Search reports..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px 10px 40px',
                    border: `1px solid ${colors.border}`,
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'border-color 0.2s ease',
                    boxSizing: 'border-box',
                    background: colors.surface,
                    color: colors.textPrimary,
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = colors.primary;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = colors.border;
                  }}
                />
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: colors.textSecondary,
                marginBottom: '6px',
              }}>
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: `1px solid ${colors.border}`,
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'border-color 0.2s ease',
                  boxSizing: 'border-box',
                  background: colors.surface,
                  color: colors.textPrimary,
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = colors.primary;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = colors.border;
                }}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="matched">Matched</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            {/* Type Filter */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: colors.textSecondary,
                marginBottom: '6px',
              }}>
                Type
              </label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: `1px solid ${colors.border}`,
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'border-color 0.2s ease',
                  boxSizing: 'border-box',
                  background: colors.surface,
                  color: colors.textPrimary,
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = colors.primary;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = colors.border;
                }}
              >
                <option value="all">All Types</option>
                <option value="lost">Lost</option>
                <option value="found">Found</option>
              </select>
            </div>

            {/* Fraud Filter */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: colors.textSecondary,
                marginBottom: '6px',
              }}>
                Fraud
              </label>
              <select
                value={fraudFilter}
                onChange={(e) => setFraudFilter(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: `1px solid ${colors.border}`,
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'border-color 0.2s ease',
                  boxSizing: 'border-box',
                  background: colors.surface,
                  color: colors.textPrimary,
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = colors.primary;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = colors.border;
                }}
              >
                <option value="all">All Fraud</option>
                <option value="fraud">Fraud</option>
                <option value="clean">Clean</option>
              </select>
            </div>
          </div>
        </div>

        {/* Reports Table */}
        <div style={{
          background: colors.surface,
          borderRadius: '12px',
          border: `1px solid ${colors.border}`,
          boxShadow: colors.shadow,
          overflow: 'hidden',
        }}>
          {filteredReports.length === 0 ? (
            <div style={{
              padding: '48px',
              textAlign: 'center',
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                background: colors.surfaceHover,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
              }}>
                <Search size={20} style={{ color: colors.textMuted }} />
              </div>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: colors.textPrimary,
                marginBottom: '8px',
                margin: 0,
              }}>
                No reports found
              </h3>
              <p style={{
                color: colors.textMuted,
                fontSize: '14px',
                margin: 0,
              }}>
                {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
                  ? 'Try adjusting your filters'
                  : 'No reports available'}
              </p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
              }}>
                <thead>
                  <tr style={{
                    background: colors.surfaceHover,
                    borderBottom: `1px solid ${colors.border}`,
                  }}>
                    <th style={{
                      padding: '12px 16px',
                      textAlign: 'left',
                      fontSize: '12px',
                      fontWeight: '600',
                      color: colors.textSecondary,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}>
                      ID
                    </th>
                    <th style={{
                      padding: '12px 16px',
                      textAlign: 'left',
                      fontSize: '12px',
                      fontWeight: '600',
                      color: colors.textSecondary,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}>
                      Item
                    </th>
                    <th style={{
                      padding: '12px 16px',
                      textAlign: 'left',
                      fontSize: '12px',
                      fontWeight: '600',
                      color: colors.textSecondary,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}>
                      Type
                    </th>
                    <th style={{
                      padding: '12px 16px',
                      textAlign: 'left',
                      fontSize: '12px',
                      fontWeight: '600',
                      color: colors.textSecondary,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}>
                      Status
                    </th>
                    <th style={{
                      padding: '12px 16px',
                      textAlign: 'left',
                      fontSize: '12px',
                      fontWeight: '600',
                      color: colors.textSecondary,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}>
                      Location
                    </th>
                    <th style={{
                      padding: '12px 16px',
                      textAlign: 'left',
                      fontSize: '12px',
                      fontWeight: '600',
                      color: colors.textSecondary,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}>
                      Reporter
                    </th>
                    <th style={{
                      padding: '12px 16px',
                      textAlign: 'left',
                      fontSize: '12px',
                      fontWeight: '600',
                      color: colors.textSecondary,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}>
                      Date
                    </th>
                    <th style={{
                      padding: '12px 16px',
                      textAlign: 'center',
                      fontSize: '12px',
                      fontWeight: '600',
                      color: colors.textSecondary,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}>
                      Fraud
                    </th>
                    <th style={{
                      padding: '12px 16px',
                      textAlign: 'center',
                      fontSize: '12px',
                      fontWeight: '600',
                      color: colors.textSecondary,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReports.map((report, index) => {
                    const statusStyle = getStatusColor(report.status);
                    const typeStyle = getTypeColor(report.reportType || report.type);
                    
                    return (
                      <tr
                        key={report._id || index}
                        style={{
                          borderBottom: index < filteredReports.length - 1 ? `1px solid ${colors.border}` : 'none',
                          transition: 'background-color 0.2s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = colors.surfaceHover;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                      >
                        <td style={{ padding: '16px' }}>
                          <div>
                            <div style={{
                              fontSize: '12px',
                              fontFamily: 'monospace',
                              color: colors.textMuted,
                              background: colors.surfaceHover,
                              padding: '2px 6px',
                              borderRadius: '4px',
                              display: 'inline-block',
                              marginBottom: '4px',
                            }}>
                              {report._id.slice(-8)}
                            </div>
                            <div style={{
                              fontSize: '11px',
                              color: colors.textMuted,
                            }}>
                              Full: {report._id}
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '16px' }}>
                          <div>
                            <div style={{
                              fontSize: '14px',
                              fontWeight: '500',
                              color: colors.textPrimary,
                              marginBottom: '4px',
                            }}>
                              {report.itemDetails?.title || 'Untitled'}
                            </div>
                            <div style={{
                              fontSize: '12px',
                              color: colors.textMuted,
                            }}>
                              {report.itemDetails?.category || 'Unknown'} • {report.itemDetails?.subCategory || 'Unknown'}
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '16px' }}>
                          <span style={{
                            padding: '4px 8px',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: '500',
                            color: typeStyle.color,
                            background: typeStyle.bg,
                            textTransform: 'capitalize',
                          }}>
                            {report.reportType || report.type || 'Unknown'}
                          </span>
                        </td>
                        <td style={{ padding: '16px' }}>
                          <span style={{
                            padding: '4px 8px',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: '500',
                            color: statusStyle.color,
                            background: statusStyle.bg,
                            textTransform: 'capitalize',
                          }}>
                            {report.status || 'Unknown'}
                          </span>
                        </td>
                        <td style={{ padding: '16px' }}>
                          <div style={{
                            fontSize: '14px',
                            color: colors.textPrimary,
                            marginBottom: '2px',
                          }}>
                            {report.location?.city || 'N/A'}
                          </div>
                          <div style={{
                            fontSize: '12px',
                            color: colors.textMuted,
                            maxWidth: '200px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}>
                            {report.location?.address || 'No address provided'}
                          </div>
                        </td>
                        <td style={{ padding: '16px' }}>
                          <div>
                            <div style={{
                              fontSize: '14px',
                              fontWeight: '500',
                              color: colors.textPrimary,
                              marginBottom: '4px',
                            }}>
                              {report.user?.firstname && report.user?.lastname 
                                ? `${report.user.firstname} ${report.user.lastname}`
                                : 'Unknown User'
                              }
                            </div>
                            <div style={{
                              fontSize: '12px',
                              color: colors.textMuted,
                              marginBottom: '2px',
                            }}>
                              {report.user?.email || 'No email'}
                            </div>
                            {report.userId && (
                              <div style={{
                                fontSize: '11px',
                                fontFamily: 'monospace',
                                color: colors.textMuted,
                                background: colors.surfaceHover,
                                padding: '1px 4px',
                                borderRadius: '3px',
                                display: 'inline-block',
                              }}>
                                User ID: {report.userId.slice(-6)}
                              </div>
                            )}
                          </div>
                        </td>
                        <td style={{ padding: '16px' }}>
                          <div style={{
                            fontSize: '14px',
                            color: colors.textPrimary,
                          }}>
                            {formatDate(report.createdAt)}
                          </div>
                        </td>
                        <td style={{ padding: '16px', textAlign: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                            {report.fraud ? (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <AlertTriangle size={14} style={{ color: getFraudColor(report.fraud).color }} />
                                <span style={{
                                  padding: '2px 6px',
                                  borderRadius: '8px',
                                  fontSize: '11px',
                                  fontWeight: '500',
                                  color: getFraudColor(report.fraud).color,
                                  background: getFraudColor(report.fraud).bg,
                                }}>
                                  Fraud
                                </span>
                              </div>
                            ) : (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <ShieldCheck size={14} style={{ color: getFraudColor(report.fraud).color }} />
                                <span style={{
                                  padding: '2px 6px',
                                  borderRadius: '8px',
                                  fontSize: '11px',
                                  fontWeight: '500',
                                  color: getFraudColor(report.fraud).color,
                                  background: getFraudColor(report.fraud).bg,
                                }}>
                                  Clean
                                </span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td style={{ padding: '16px', textAlign: 'center' }}>
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                            <button 
                              onClick={() => handleViewReport(report)}
                              style={{
                                padding: '6px',
                                background: colors.surface,
                                border: `1px solid ${colors.border}`,
                                borderRadius: '6px',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                              }}
                              onMouseEnter={(e) => {
                                (e.target as HTMLButtonElement).style.backgroundColor = colors.primary + '20';
                                (e.target as HTMLButtonElement).style.borderColor = colors.primary;
                              }}
                              onMouseLeave={(e) => {
                                (e.target as HTMLButtonElement).style.backgroundColor = colors.surface;
                                (e.target as HTMLButtonElement).style.borderColor = colors.border;
                              }}
                              title="View Report"
                            >
                              <Eye size={14} style={{ color: colors.primary }} />
                            </button>
                            {report.fraud ? (
                              <button 
                                onClick={() => handleMarkFraud(report._id, false)}
                                style={{
                                  padding: '6px',
                                  background: colors.surface,
                                  border: `1px solid ${colors.border}`,
                                  borderRadius: '6px',
                                  cursor: 'pointer',
                                  transition: 'all 0.2s ease',
                                }}
                                onMouseEnter={(e) => {
                                  (e.target as HTMLButtonElement).style.backgroundColor = '#16a34a20';
                                  (e.target as HTMLButtonElement).style.borderColor = '#16a34a';
                                }}
                                onMouseLeave={(e) => {
                                  (e.target as HTMLButtonElement).style.backgroundColor = colors.surface;
                                  (e.target as HTMLButtonElement).style.borderColor = colors.border;
                                }}
                                title="Mark as Clean"
                              >
                                <Shield size={14} style={{ color: '#16a34a' }} />
                              </button>
                            ) : (
                              <button 
                                onClick={() => handleMarkFraud(report._id, true)}
                                style={{
                                  padding: '6px',
                                  background: colors.surface,
                                  border: `1px solid ${colors.border}`,
                                  borderRadius: '6px',
                                  cursor: 'pointer',
                                  transition: 'all 0.2s ease',
                                }}
                                onMouseEnter={(e) => {
                                  (e.target as HTMLButtonElement).style.backgroundColor = '#dc262620';
                                  (e.target as HTMLButtonElement).style.borderColor = '#dc2626';
                                }}
                                onMouseLeave={(e) => {
                                  (e.target as HTMLButtonElement).style.backgroundColor = colors.surface;
                                  (e.target as HTMLButtonElement).style.borderColor = colors.border;
                                }}
                                title="Mark as Fraud"
                              >
                                <AlertTriangle size={14} style={{ color: '#dc2626' }} />
                              </button>
                            )}
                            <button 
                              onClick={() => handleDeleteReport(report._id)}
                              style={{
                                padding: '6px',
                                background: colors.surface,
                                border: `1px solid ${colors.border}`,
                                borderRadius: '6px',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                              }}
                              onMouseEnter={(e) => {
                                (e.target as HTMLButtonElement).style.backgroundColor = colors.error + '20';
                                (e.target as HTMLButtonElement).style.borderColor = colors.error;
                              }}
                              onMouseLeave={(e) => {
                                (e.target as HTMLButtonElement).style.backgroundColor = colors.surface;
                                (e.target as HTMLButtonElement).style.borderColor = colors.border;
                              }}
                              title="Delete Report"
                            >
                              <Trash2 size={14} style={{ color: colors.error }} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* View Report Modal */}
        {showViewModal && selectedReport && (
          <>
            <div
              style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0, 0, 0, 0.5)',
                zIndex: 50,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '16px',
              }}
              onClick={closeViewModal}
            >
              <div
                style={{
                  background: colors.surface,
                  borderRadius: '12px',
                  border: `1px solid ${colors.border}`,
                  boxShadow: colors.shadow,
                  maxWidth: '600px',
                  width: '100%',
                  maxHeight: '80vh',
                  overflow: 'auto',
                }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal Header */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '20px 24px',
                  borderBottom: `1px solid ${colors.border}`,
                }}>
                  <div>
                    <h2 style={{
                      fontSize: '20px',
                      fontWeight: '600',
                      color: colors.textPrimary,
                      margin: '0 0 4px 0',
                    }}>
                      Report Details
                    </h2>
                    <div style={{
                      fontSize: '12px',
                      fontFamily: 'monospace',
                      color: colors.textMuted,
                      background: colors.surfaceHover,
                      padding: '2px 6px',
                      borderRadius: '4px',
                      display: 'inline-block',
                    }}>
                      ID: {selectedReport._id}
                    </div>
                  </div>
                  <button
                    onClick={closeViewModal}
                    style={{
                      padding: '8px',
                      background: 'none',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      (e.target as HTMLButtonElement).style.backgroundColor = colors.surfaceHover;
                    }}
                    onMouseLeave={(e) => {
                      (e.target as HTMLButtonElement).style.backgroundColor = 'transparent';
                    }}
                  >
                    <X size={20} style={{ color: colors.textMuted }} />
                  </button>
                </div>

                {/* Modal Content */}
                <div style={{ padding: '24px' }}>
                  <div style={{
                    display: 'grid',
                    gap: '20px',
                  }}>
                    {/* Report & Reporter Information */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '16px',
                    }}>
                      <div>
                        <h3 style={{
                          fontSize: '16px',
                          fontWeight: '600',
                          color: colors.textPrimary,
                          marginBottom: '12px',
                          margin: 0,
                        }}>
                          Report Information
                        </h3>
                        <div style={{
                          background: colors.surfaceHover,
                          padding: '16px',
                          borderRadius: '8px',
                          border: `1px solid ${colors.border}`,
                        }}>
                          <div style={{ marginBottom: '8px' }}>
                            <span style={{ color: colors.textMuted, fontSize: '14px' }}>Report ID: </span>
                            <span style={{ 
                              color: colors.textPrimary, 
                              fontFamily: 'monospace',
                              fontSize: '13px',
                              background: colors.surface,
                              padding: '2px 4px',
                              borderRadius: '3px',
                            }}>
                              {selectedReport._id}
                            </span>
                          </div>
                          <div style={{ marginBottom: '8px' }}>
                            <span style={{ color: colors.textMuted, fontSize: '14px' }}>Short ID: </span>
                            <span style={{ 
                              color: colors.textPrimary, 
                              fontFamily: 'monospace',
                              fontWeight: '500',
                            }}>
                              {selectedReport._id.slice(-8)}
                            </span>
                          </div>
                          <div>
                            <span style={{ color: colors.textMuted, fontSize: '14px' }}>Created: </span>
                            <span style={{ color: colors.textPrimary }}>
                              {formatDate(selectedReport.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h3 style={{
                          fontSize: '16px',
                          fontWeight: '600',
                          color: colors.textPrimary,
                          marginBottom: '12px',
                          margin: 0,
                        }}>
                          Reporter Information
                        </h3>
                        <div style={{
                          background: colors.surfaceHover,
                          padding: '16px',
                          borderRadius: '8px',
                          border: `1px solid ${colors.border}`,
                        }}>
                          <div style={{ marginBottom: '8px' }}>
                            <span style={{ color: colors.textMuted, fontSize: '14px' }}>Name: </span>
                            <span style={{ color: colors.textPrimary, fontWeight: '500' }}>
                              {selectedReport.user?.firstname && selectedReport.user?.lastname 
                                ? `${selectedReport.user.firstname} ${selectedReport.user.lastname}`
                                : 'Unknown User'
                              }
                            </span>
                          </div>
                          <div style={{ marginBottom: '8px' }}>
                            <span style={{ color: colors.textMuted, fontSize: '14px' }}>Email: </span>
                            <span style={{ color: colors.textPrimary }}>
                              {selectedReport.user?.email || 'No email provided'}
                            </span>
                          </div>
                          {selectedReport.userId && (
                            <div>
                              <span style={{ color: colors.textMuted, fontSize: '14px' }}>User ID: </span>
                              <span style={{ 
                                color: colors.textPrimary, 
                                fontFamily: 'monospace',
                                fontSize: '13px',
                                background: colors.surface,
                                padding: '2px 4px',
                                borderRadius: '3px',
                              }}>
                                {selectedReport.userId}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Item Details */}
                    <div>
                      <h3 style={{
                        fontSize: '16px',
                        fontWeight: '600',
                        color: colors.textPrimary,
                        marginBottom: '12px',
                        margin: 0,
                      }}>
                        Item Information
                      </h3>
                      <div style={{
                        background: colors.surfaceHover,
                        padding: '16px',
                        borderRadius: '8px',
                        border: `1px solid ${colors.border}`,
                      }}>
                        <div style={{ marginBottom: '8px' }}>
                          <span style={{ color: colors.textMuted, fontSize: '14px' }}>Title: </span>
                          <span style={{ color: colors.textPrimary, fontWeight: '500' }}>
                            {selectedReport.itemDetails?.title || 'Untitled'}
                          </span>
                        </div>
                        <div style={{ marginBottom: '8px' }}>
                          <span style={{ color: colors.textMuted, fontSize: '14px' }}>Category: </span>
                          <span style={{ color: colors.textPrimary }}>
                            {selectedReport.itemDetails?.category || 'Unknown'}
                          </span>
                        </div>
                                                 <div style={{ marginBottom: '8px' }}>
                           <span style={{ color: colors.textMuted, fontSize: '14px' }}>Sub-category: </span>
                           <span style={{ color: colors.textPrimary }}>
                             {selectedReport.itemDetails?.subCategory || 'Unknown'}
                           </span>
                         </div>
                         {selectedReport.itemDetails?.itemType && (
                           <div style={{ marginBottom: '8px' }}>
                             <span style={{ color: colors.textMuted, fontSize: '14px' }}>Item Type: </span>
                             <span style={{ color: colors.textPrimary }}>
                               {selectedReport.itemDetails.itemType}
                             </span>
                           </div>
                         )}
                         {(selectedReport.itemDetails?.primaryColor || selectedReport.itemDetails?.secondaryColor) && (
                           <div style={{ marginBottom: '8px' }}>
                             <span style={{ color: colors.textMuted, fontSize: '14px' }}>Colors: </span>
                             <span style={{ color: colors.textPrimary }}>
                               {[selectedReport.itemDetails?.primaryColor, selectedReport.itemDetails?.secondaryColor]
                                 .filter(Boolean).join(', ') || 'Not specified'}
                             </span>
                           </div>
                         )}
                         {selectedReport.itemDetails?.description && (
                           <div>
                             <span style={{ color: colors.textMuted, fontSize: '14px' }}>Description: </span>
                             <p style={{ 
                               color: colors.textPrimary, 
                               margin: '4px 0 0 0',
                               lineHeight: '1.5',
                             }}>
                               {selectedReport.itemDetails.description}
                             </p>
                           </div>
                         )}
                      </div>
                    </div>

                    {/* Status and Type */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '16px',
                    }}>
                      <div>
                        <h4 style={{
                          fontSize: '14px',
                          fontWeight: '600',
                          color: colors.textSecondary,
                          marginBottom: '8px',
                          margin: 0,
                        }}>
                          Type
                        </h4>
                                                 <span style={{
                           padding: '6px 12px',
                           borderRadius: '12px',
                           fontSize: '14px',
                           fontWeight: '500',
                           color: getTypeColor(selectedReport.reportType || selectedReport.type).color,
                           background: getTypeColor(selectedReport.reportType || selectedReport.type).bg,
                           textTransform: 'capitalize',
                         }}>
                           {selectedReport.reportType || selectedReport.type}
                         </span>
                      </div>
                      <div>
                        <h4 style={{
                          fontSize: '14px',
                          fontWeight: '600',
                          color: colors.textSecondary,
                          marginBottom: '8px',
                          margin: 0,
                        }}>
                          Status
                        </h4>
                        <span style={{
                          padding: '6px 12px',
                          borderRadius: '12px',
                          fontSize: '14px',
                          fontWeight: '500',
                          color: getStatusColor(selectedReport.status).color,
                          background: getStatusColor(selectedReport.status).bg,
                          textTransform: 'capitalize',
                        }}>
                          {selectedReport.status}
                        </span>
                      </div>
                    </div>

                    {/* Fraud Information */}
                    <div>
                      <h3 style={{
                        fontSize: '16px',
                        fontWeight: '600',
                        color: colors.textPrimary,
                        marginBottom: '12px',
                        margin: 0,
                      }}>
                        Fraud Status
                      </h3>
                      <div style={{
                        background: colors.surfaceHover,
                        padding: '16px',
                        borderRadius: '8px',
                        border: `1px solid ${colors.border}`,
                      }}>
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '8px',
                          marginBottom: selectedReport.fraud_reason ? '12px' : '0',
                        }}>
                          {selectedReport.fraud ? (
                            <>
                              <AlertTriangle size={16} style={{ color: getFraudColor(selectedReport.fraud).color }} />
                              <span style={{
                                padding: '4px 8px',
                                borderRadius: '12px',
                                fontSize: '14px',
                                fontWeight: '500',
                                color: getFraudColor(selectedReport.fraud).color,
                                background: getFraudColor(selectedReport.fraud).bg,
                              }}>
                                Fraudulent Report
                              </span>
                            </>
                          ) : (
                            <>
                              <ShieldCheck size={16} style={{ color: getFraudColor(selectedReport.fraud).color }} />
                              <span style={{
                                padding: '4px 8px',
                                borderRadius: '12px',
                                fontSize: '14px',
                                fontWeight: '500',
                                color: getFraudColor(selectedReport.fraud).color,
                                background: getFraudColor(selectedReport.fraud).bg,
                              }}>
                                Clean Report
                              </span>
                            </>
                          )}
                        </div>
                        {selectedReport.fraud_reason && (
                          <div>
                            <span style={{ color: colors.textMuted, fontSize: '14px' }}>Reason: </span>
                            <span style={{ color: colors.textPrimary }}>
                              {selectedReport.fraud_reason}
                            </span>
                          </div>
                        )}
                        <div style={{ 
                          display: 'flex', 
                          gap: '8px', 
                          marginTop: '12px',
                          paddingTop: '12px',
                          borderTop: `1px solid ${colors.border}`,
                        }}>
                          {selectedReport.fraud ? (
                            <button
                              onClick={() => handleMarkFraud(selectedReport._id, false)}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '8px 12px',
                                background: '#16a34a',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                fontSize: '14px',
                                fontWeight: '500',
                                cursor: 'pointer',
                                transition: 'background-color 0.2s ease',
                              }}
                              onMouseEnter={(e) => {
                                (e.target as HTMLButtonElement).style.backgroundColor = '#15803d';
                              }}
                              onMouseLeave={(e) => {
                                (e.target as HTMLButtonElement).style.backgroundColor = '#16a34a';
                              }}
                            >
                              <Shield size={14} />
                              Mark as Clean
                            </button>
                          ) : (
                            <button
                              onClick={() => handleMarkFraud(selectedReport._id, true)}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '8px 12px',
                                background: '#dc2626',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                fontSize: '14px',
                                fontWeight: '500',
                                cursor: 'pointer',
                                transition: 'background-color 0.2s ease',
                              }}
                              onMouseEnter={(e) => {
                                (e.target as HTMLButtonElement).style.backgroundColor = '#b91c1c';
                              }}
                              onMouseLeave={(e) => {
                                (e.target as HTMLButtonElement).style.backgroundColor = '#dc2626';
                              }}
                            >
                              <AlertTriangle size={14} />
                              Mark as Fraud
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Matching Details */}
                    {selectedReport.matchDetails && selectedReport.matchDetails.length > 0 && (
                      <div>
                        <h3 style={{
                          fontSize: '16px',
                          fontWeight: '600',
                          color: colors.textPrimary,
                          marginBottom: '12px',
                          margin: 0,
                        }}>
                          Matching Details
                        </h3>
                        <div style={{
                          background: colors.surfaceHover,
                          padding: '16px',
                          borderRadius: '8px',
                          border: `1px solid ${colors.border}`,
                        }}>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            marginBottom: '12px',
                          }}>
                            <div style={{
                              width: '12px',
                              height: '12px',
                              borderRadius: '50%',
                              background: '#8b5cf6',
                            }}></div>
                            <span style={{
                              color: colors.textPrimary,
                              fontSize: '14px',
                              fontWeight: '500',
                            }}>
                              {selectedReport.matchDetails.length} match{selectedReport.matchDetails.length !== 1 ? 'es' : ''} found
                            </span>
                          </div>
                          {selectedReport.matchDetails.map((match, index) => (
                            <div key={index} style={{
                              background: colors.surface,
                              padding: '12px',
                              borderRadius: '6px',
                              border: `1px solid ${colors.border}`,
                              marginBottom: index < selectedReport.matchDetails!.length - 1 ? '8px' : '0',
                            }}>
                              <div style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr',
                                gap: '12px',
                                marginBottom: '8px',
                              }}>
                                <div>
                                  <span style={{ color: colors.textMuted, fontSize: '12px' }}>Matched Report ID: </span>
                                  <div style={{ 
                                    color: colors.textPrimary, 
                                    fontFamily: 'monospace',
                                    fontSize: '13px',
                                    background: colors.surfaceHover,
                                    padding: '2px 6px',
                                    borderRadius: '3px',
                                    marginTop: '2px',
                                    display: 'inline-block',
                                  }}>
                                    {match.report_id}
                                  </div>
                                </div>
                                {match.score && (
                                  <div>
                                    <span style={{ color: colors.textMuted, fontSize: '12px' }}>Match Score: </span>
                                    <div style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '8px',
                                      marginTop: '2px',
                                    }}>
                                      <span style={{
                                        color: colors.textPrimary,
                                        fontSize: '14px',
                                        fontWeight: '600',
                                      }}>
                                        {(match.score * 100).toFixed(1)}%
                                      </span>
                                      <div style={{
                                        flex: 1,
                                        height: '4px',
                                        background: colors.border,
                                        borderRadius: '2px',
                                        overflow: 'hidden',
                                      }}>
                                        <div style={{
                                          width: `${match.score * 100}%`,
                                          height: '100%',
                                          background: match.score >= 0.9 ? '#16a34a' : match.score >= 0.7 ? '#f59e0b' : '#dc2626',
                                          borderRadius: '2px',
                                        }}></div>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                              <div>
                                <span style={{ color: colors.textMuted, fontSize: '12px' }}>Matched On: </span>
                                <span style={{ color: colors.textPrimary, fontSize: '13px' }}>
                                  {formatDate(match.matched_on)}
                                </span>
                              </div>
                            </div>
                          ))}
                          
                          {/* Show matched report IDs if different from matchDetails */}
                          {selectedReport.matchedReportIds && selectedReport.matchedReportIds.length > 0 && (
                            <div style={{
                              marginTop: '12px',
                              paddingTop: '12px',
                              borderTop: `1px solid ${colors.border}`,
                            }}>
                              <span style={{ color: colors.textMuted, fontSize: '12px' }}>All Matched Report IDs: </span>
                              <div style={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                gap: '4px',
                                marginTop: '4px',
                              }}>
                                {selectedReport.matchedReportIds.map((id, index) => (
                                  <span key={index} style={{
                                    color: colors.textPrimary,
                                    fontFamily: 'monospace',
                                    fontSize: '11px',
                                    background: colors.surface,
                                    padding: '2px 6px',
                                    borderRadius: '3px',
                                    border: `1px solid ${colors.border}`,
                                  }}>
                                    {id}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Location */}
                    {selectedReport.location && (
                      <div>
                        <h3 style={{
                          fontSize: '16px',
                          fontWeight: '600',
                          color: colors.textPrimary,
                          marginBottom: '12px',
                          margin: 0,
                        }}>
                          Location
                        </h3>
                        <div style={{
                          background: colors.surfaceHover,
                          padding: '16px',
                          borderRadius: '8px',
                          border: `1px solid ${colors.border}`,
                        }}>
                          <div style={{ marginBottom: '8px' }}>
                            <span style={{ color: colors.textMuted, fontSize: '14px' }}>City: </span>
                            <span style={{ color: colors.textPrimary }}>
                              {selectedReport.location.city || 'N/A'}
                            </span>
                          </div>
                          {selectedReport.location.address && (
                            <div>
                              <span style={{ color: colors.textMuted, fontSize: '14px' }}>Address: </span>
                              <span style={{ color: colors.textPrimary }}>
                                {selectedReport.location.address}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}


                  </div>
                </div>
              </div>
            </div>
          </>
        )}
        </div>
      </div>
    </ProtectedRoute>
  );
} 