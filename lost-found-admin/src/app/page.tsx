"use client";

import { useState, useEffect } from "react";
import { RefreshCw, TrendingUp, Users, FileText, AlertTriangle, CheckCircle, Clock, MapPin, ChevronRight, BarChart3, PieChart, Activity } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useTheme } from "@/contexts/ThemeContext";
import Link from "next/link";
import { TrendChart, BarChart, PieChart as PieChartComponent } from "@/app/components/charts/ChartComponents";

interface DashboardData {
  overview: {
    totalReports: number;
    totalUsers: number;
    totalFraudReports: number;
    totalFraudUsers: number;
    matchRate: string;
    averageResolutionTime: string;
    activeReports: number;
    matchedReports: number;
    closedReports: number;
  };
  reportTypes: {
    lost: number;
    found: number;
  };
  reportStatus: {
    active: number;
    matched: number;
    closed: number;
  };
  categories: Array<{
    _id: string;
    count: number;
  }>;
  subCategories: Array<{
    _id: {
      category: string;
      subCategory: string;
    };
    count: number;
  }>;
  topCities: Array<{
    _id: string;
    count: number;
  }>;
  trends: {
    monthly: Array<{
      _id: {
        year: number;
        month: number;
      };
      lostCount: number;
      foundCount: number;
      totalCount: number;
    }>;
    daily: Array<{
      _id: string;
      lostCount: number;
      foundCount: number;
      totalCount: number;
    }>;
    userRegistration: Array<{
      _id: {
        year: number;
        month: number;
      };
      count: number;
    }>;
    fraud: Array<{
      _id: {
        year: number;
        month: number;
      };
      fraudCount: number;
      totalCount: number;
    }>;
  };
  charts: {
    statusDistribution: Array<{ name: string; value: number; color: string }>;
    reportTypeDistribution: Array<{ name: string; value: number; color: string }>;
    categoryData: Array<{ _id: string; count: number }>;
    cityData: Array<{ _id: string; count: number }>;
  };
  recentReports: Array<any>;
  lastUpdated: string;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetchTime, setLastFetchTime] = useState<Date | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const { colors, theme } = useTheme();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async (showLoading = true) => {
    try {
      if (showLoading) {
        setIsLoading(true);
      } else {
        setIsRefreshing(true);
      }
      setError(null);
      
      const response = await fetch('/api/dashboard', {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Failed to fetch dashboard data`);
      }
      
      const dashboardData = await response.json();
      setData(dashboardData);
      setLastFetchTime(new Date());
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError(`Failed to load dashboard data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      if (showLoading) {
        setIsLoading(false);
      } else {
        setIsRefreshing(false);
      }
    }
  };

  const handleManualRefresh = async () => {
    await fetchDashboardData(false);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
                width: '48px',
                height: '48px',
                border: `4px solid ${colors.border}`,
                borderTop: `4px solid ${colors.primary}`,
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 24px auto',
              }}></div>
              <h3 style={{ 
                color: colors.textPrimary, 
                fontSize: '18px',
                fontWeight: '600',
                marginBottom: '8px',
                margin: 0 
              }}>
                Loading Dashboard
              </h3>
              <p style={{ 
                color: colors.textMuted, 
                fontSize: '14px',
                margin: 0 
              }}>
                Fetching latest statistics and reports...
              </p>
            </div>
          </div>
          <style jsx>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
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
            padding: '32px',
            background: colors.surface,
            border: `1px solid ${colors.error}`,
            borderRadius: '16px',
            maxWidth: '600px',
            margin: '0 auto',
            textAlign: 'center',
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              background: colors.error + '20',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px',
            }}>
              <AlertTriangle size={32} style={{ color: colors.error }} />
            </div>
            <h3 style={{ 
              fontSize: '20px', 
              fontWeight: '600', 
              color: colors.textPrimary,
              marginBottom: '12px',
              margin: 0 
            }}>
              Dashboard Error
            </h3>
            <p style={{ 
              fontSize: '14px', 
              color: colors.textMuted, 
              marginBottom: '24px',
              lineHeight: 1.5 
            }}>
              {error}
            </p>
            <button
              onClick={() => fetchDashboardData(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 24px',
                background: colors.primary,
                border: 'none',
                borderRadius: '8px',
                color: colors.primaryText,
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                margin: '0 auto',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = colors.primaryHover;
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = colors.primary;
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <RefreshCw size={16} />
              Retry Loading
            </button>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!data) {
    return null;
  }

  const StatCard = ({ 
    title, 
    value, 
    subtitle, 
    icon: Icon, 
    color, 
    trend 
  }: { 
    title: string; 
    value: string | number; 
    subtitle?: string; 
    icon: any; 
    color: string;
    trend?: { value: number; isPositive: boolean };
  }) => (
    <div style={{
      background: colors.surface,
      border: `1px solid ${colors.border}`,
      borderRadius: '16px',
      padding: '24px',
      boxShadow: colors.shadow,
      transition: 'all 0.3s ease',
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-4px)';
      e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = colors.shadow;
    }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{
          width: '48px',
          height: '48px',
          background: color + '20',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Icon size={24} style={{ color }} />
        </div>
        {trend && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '4px 8px',
            borderRadius: '12px',
            background: trend.isPositive ? colors.success + '20' : colors.error + '20',
          }}>
            <TrendingUp 
              size={12} 
              style={{ 
                color: trend.isPositive ? colors.success : colors.error,
                transform: trend.isPositive ? 'none' : 'rotate(180deg)'
              }} 
            />
            <span style={{
              fontSize: '12px',
              fontWeight: '600',
              color: trend.isPositive ? colors.success : colors.error,
            }}>
              {trend.value}%
            </span>
          </div>
        )}
      </div>
      <div>
        <h3 style={{
          fontSize: '28px',
          fontWeight: '700',
          color: colors.textPrimary,
          marginBottom: '4px',
          margin: 0,
        }}>
          {value}
        </h3>
        <p style={{
          fontSize: '14px',
          fontWeight: '500',
          color: colors.textSecondary,
          marginBottom: subtitle ? '4px' : 0,
          margin: 0,
        }}>
          {title}
        </p>
        {subtitle && (
          <p style={{
            fontSize: '12px',
            color: colors.textMuted,
            margin: 0,
          }}>
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );

  return (
    <ProtectedRoute>
      <div style={{
        padding: '24px',
        minHeight: '100vh',
        background: colors.background,
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
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
                fontSize: '32px',
                fontWeight: '700',
                color: colors.textPrimary,
                marginBottom: '8px',
                margin: 0,
              }}>
                Dashboard Overview
              </h1>
              <p style={{
                fontSize: '16px',
                color: colors.textMuted,
                margin: 0,
              }}>
                Real-time insights and analytics for LostLink platform
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              {lastFetchTime && (
                <span style={{
                  fontSize: '12px',
                  color: colors.textMuted,
                }}>
                  Last updated: {formatDate(lastFetchTime)}
                </span>
              )}
              <button
                onClick={handleManualRefresh}
                disabled={isRefreshing}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 20px',
                  background: colors.primary,
                  color: colors.primaryText,
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: isRefreshing ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                  opacity: isRefreshing ? 0.6 : 1,
                }}
                onMouseEnter={(e) => {
                  if (!isRefreshing) {
                    (e.target as HTMLButtonElement).style.backgroundColor = colors.primaryHover;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isRefreshing) {
                    (e.target as HTMLButtonElement).style.backgroundColor = colors.primary;
                  }
                }}
              >
                <RefreshCw size={16} style={{
                  animation: isRefreshing ? 'spin 1s linear infinite' : 'none',
                }} />
                {isRefreshing ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>
          </div>

          {/* Key Metrics */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '20px',
            marginBottom: '32px',
          }}>
            <StatCard
              title="Total Reports"
              value={data.overview.totalReports.toLocaleString()}
              subtitle={`${data.reportTypes.lost} lost, ${data.reportTypes.found} found`}
              icon={FileText}
              color={colors.primary}
            />
            <StatCard
              title="Total Users"
              value={data.overview.totalUsers.toLocaleString()}
              subtitle={`${data.overview.totalFraudUsers} flagged users`}
              icon={Users}
              color={colors.info}
            />
            <StatCard
              title="Match Rate"
              value={`${data.overview.matchRate}%`}
              subtitle={`${data.overview.matchedReports} successful matches`}
              icon={CheckCircle}
              color={colors.success}
            />
            <StatCard
              title="Avg Resolution"
              value={`${data.overview.averageResolutionTime} days`}
              subtitle="Average time to match"
              icon={Clock}
              color={colors.warning}
            />
          </div>

          {/* Charts Section */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
            gap: '24px',
            marginBottom: '32px',
          }}>
            {/* Reports Trend Chart */}
            <div style={{ gridColumn: 'span 2' }}>
              <TrendChart
                monthlyData={data.trends.monthly}
                title="Reports Trend (Last 12 Months)"
              />
            </div>

            {/* Status Distribution */}
            <PieChartComponent
              data={data.charts.statusDistribution}
              title="Report Status Distribution"
              type="doughnut"
            />

            {/* Report Types */}
            <PieChartComponent
              data={data.charts.reportTypeDistribution}
              title="Report Types"
              type="pie"
            />
          </div>

          {/* Additional Charts */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
            gap: '24px',
            marginBottom: '32px',
          }}>
            {/* Top Categories */}
            <BarChart
              data={data.charts.categoryData}
              xKey="_id"
              yKey="count"
              title="Top Item Categories"
              color={colors.primary}
            />

            {/* Top Cities */}
            <BarChart
              data={data.charts.cityData}
              xKey="_id"
              yKey="count"
              title="Top Cities by Reports"
              color={colors.info}
            />
          </div>

          {/* Recent Activity & Quick Stats */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr',
            gap: '24px',
            marginBottom: '32px',
          }}>
            {/* Recent Reports */}
            <div style={{
              background: colors.surface,
              border: `1px solid ${colors.border}`,
              borderRadius: '16px',
              padding: '24px',
              boxShadow: colors.shadow,
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px',
              }}>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: colors.textPrimary,
                  margin: 0,
                }}>
                  Recent Reports
                </h3>
                <Link
                  href="/reports"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    color: colors.primary,
                    textDecoration: 'none',
                    fontSize: '14px',
                    fontWeight: '500',
                  }}
                >
                  View All
                  <ChevronRight size={16} />
                </Link>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {data.recentReports.slice(0, 5).map((report, index) => (
                  <div
                    key={index}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px',
                      background: colors.surfaceHover,
                      borderRadius: '8px',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: report.reportType === 'lost' ? colors.error : colors.success,
                      }} />
                      <div>
                        <p style={{
                          fontSize: '14px',
                          fontWeight: '500',
                          color: colors.textPrimary,
                          margin: 0,
                        }}>
                          {report.itemDetails?.title || 'Untitled Item'}
                        </p>
                        <p style={{
                          fontSize: '12px',
                          color: colors.textMuted,
                          margin: 0,
                        }}>
                          {report.itemDetails?.category} • {report.locationDetails?.lastSeenLocation?.city}
                        </p>
                      </div>
                    </div>
                    <div style={{
                      padding: '4px 8px',
                      borderRadius: '12px',
                      background: report.status === 'Active' ? colors.primary + '20' : 
                                 report.status === 'Matched' ? colors.success + '20' : colors.textMuted + '20',
                      color: report.status === 'Active' ? colors.primary : 
                             report.status === 'Matched' ? colors.success : colors.textMuted,
                      fontSize: '12px',
                      fontWeight: '500',
                    }}>
                      {report.status}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Stats */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}>
              <div style={{
                background: colors.surface,
                border: `1px solid ${colors.border}`,
                borderRadius: '16px',
                padding: '20px',
                boxShadow: colors.shadow,
              }}>
                <h4 style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: colors.textPrimary,
                  marginBottom: '16px',
                  margin: 0,
                }}>
                  Quick Stats
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '14px', color: colors.textMuted }}>Active Reports</span>
                    <span style={{ fontSize: '16px', fontWeight: '600', color: colors.textPrimary }}>
                      {data.overview.activeReports}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '14px', color: colors.textMuted }}>Matched Reports</span>
                    <span style={{ fontSize: '16px', fontWeight: '600', color: colors.success }}>
                      {data.overview.matchedReports}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '14px', color: colors.textMuted }}>Fraud Reports</span>
                    <span style={{ fontSize: '16px', fontWeight: '600', color: colors.error }}>
                      {data.overview.totalFraudReports}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '14px', color: colors.textMuted }}>Closed Reports</span>
                    <span style={{ fontSize: '16px', fontWeight: '600', color: colors.textMuted }}>
                      {data.overview.closedReports}
                    </span>
                  </div>
                </div>
              </div>

              <div style={{
                background: colors.surface,
                border: `1px solid ${colors.border}`,
                borderRadius: '16px',
                padding: '20px',
                boxShadow: colors.shadow,
              }}>
                <h4 style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: colors.textPrimary,
                  marginBottom: '16px',
                  margin: 0,
                }}>
                  Top Categories
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {data.categories.slice(0, 4).map((category, index) => (
                    <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '14px', color: colors.textMuted }}>
                        {category._id || 'Unknown'}
                      </span>
                      <span style={{ fontSize: '14px', fontWeight: '600', color: colors.textPrimary }}>
                        {category.count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
