import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Report from '@/models/Report';
import User from '@/models/User';

export async function GET() {
  try {
    console.log('[Dashboard API] Starting dashboard data fetch...');
    await connectDB();
    console.log('[Dashboard API] Database connected successfully');

    // Get total counts with error handling
    const [
      totalReports,
      totalUsers,
      totalFraudReports,
      totalFraudUsers,
      lostReports,
      foundReports,
      activeReports,
      matchedReportsCount,
      closedReports
    ] = await Promise.all([
      Report.countDocuments().catch(() => 0),
      User.countDocuments().catch(() => 0),
      Report.countDocuments({ fraud: true }).catch(() => 0),
      User.countDocuments({ fraudUser: 'true' }).catch(() => 0),
      Report.countDocuments({ reportType: 'lost' }).catch(() => 0),
      Report.countDocuments({ reportType: 'found' }).catch(() => 0),
      Report.countDocuments({ status: 'Active' }).catch(() => 0),
      Report.countDocuments({ status: 'Matched' }).catch(() => 0),
      Report.countDocuments({ status: 'Closed' }).catch(() => 0)
    ]);

    console.log('[Dashboard API] Basic counts fetched:', {
      totalReports,
      totalUsers,
      totalFraudReports,
      totalFraudUsers,
      lostReports,
      foundReports,
      activeReports,
      matchedReportsCount,
      closedReports
    });

    // Get actual status distribution using aggregation with null handling
    const actualStatusDistribution = await Report.aggregate([
      {
        $group: {
          _id: { $ifNull: ['$status', 'Unknown'] },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]).catch((error) => {
      console.error('[Dashboard API] Error fetching actual status distribution:', error);
      return [];
    });

    // Get actual report type distribution using aggregation with null handling
    const actualReportTypeDistribution = await Report.aggregate([
      {
        $group: {
          _id: { $ifNull: ['$reportType', 'Unknown'] },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]).catch((error) => {
      console.error('[Dashboard API] Error fetching actual report type distribution:', error);
      return [];
    });

    console.log('[Dashboard API] Actual status distribution from DB:', actualStatusDistribution);
    console.log('[Dashboard API] Actual report type distribution from DB:', actualReportTypeDistribution);

    // Get reports by category with better error handling
    const reportsByCategory = await Report.aggregate([
      {
        $match: {
          'itemDetails.category': { $exists: true, $ne: null, $ne: '' }
        }
      },
      {
        $group: {
          _id: '$itemDetails.category',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 10
      }
    ]).catch((error) => {
      console.error('[Dashboard API] Error fetching categories:', error);
      return [];
    });

    // Get reports by subcategory
    const reportsBySubCategory = await Report.aggregate([
      {
        $match: {
          'itemDetails.category': { $exists: true, $ne: null, $ne: '' },
          'itemDetails.subCategory': { $exists: true, $ne: null, $ne: '' }
        }
      },
      {
        $group: {
          _id: {
            category: '$itemDetails.category',
            subCategory: '$itemDetails.subCategory'
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 15
      }
    ]).catch((error) => {
      console.error('[Dashboard API] Error fetching subcategories:', error);
      return [];
    });

    // Get reports by city with better filtering
    const reportsByCity = await Report.aggregate([
      {
        $match: {
          'locationDetails.lastSeenLocation.city': { $exists: true, $ne: null, $ne: '' }
        }
      },
      {
        $group: {
          _id: '$locationDetails.lastSeenLocation.city',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 10
      }
    ]).catch((error) => {
      console.error('[Dashboard API] Error fetching cities:', error);
      return [];
    });

    // Get monthly reports trend (last 12 months)
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const monthlyReportsTrend = await Report.aggregate([
      {
        $match: {
          createdAt: { $gte: twelveMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          lostCount: {
            $sum: { $cond: [{ $eq: ['$reportType', 'lost'] }, 1, 0] }
          },
          foundCount: {
            $sum: { $cond: [{ $eq: ['$reportType', 'found'] }, 1, 0] }
          },
          totalCount: { $sum: 1 }
        }
      },
      {
        $sort: {
          '_id.year': 1,
          '_id.month': 1
        }
      }
    ]).catch((error) => {
      console.error('[Dashboard API] Error fetching monthly trends:', error);
      return [];
    });

    // Get daily reports trend (last 30 days for better visualization)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const dailyReportsTrend = await Report.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          lostCount: {
            $sum: { $cond: [{ $eq: ['$reportType', 'lost'] }, 1, 0] }
          },
          foundCount: {
            $sum: { $cond: [{ $eq: ['$reportType', 'found'] }, 1, 0] }
          },
          totalCount: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]).catch((error) => {
      console.error('[Dashboard API] Error fetching daily trends:', error);
      return [];
    });

    // Get user registration trend (last 12 months)
    const userRegistrationTrend = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: twelveMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: {
          '_id.year': 1,
          '_id.month': 1
        }
      }
    ]).catch((error) => {
      console.error('[Dashboard API] Error fetching user registration trends:', error);
      return [];
    });

    // Get fraud trends (last 12 months)
    const fraudTrend = await Report.aggregate([
      {
        $match: {
          createdAt: { $gte: twelveMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          fraudCount: {
            $sum: { $cond: [{ $eq: ['$fraud', true] }, 1, 0] }
          },
          totalCount: { $sum: 1 }
        }
      },
      {
        $sort: {
          '_id.year': 1,
          '_id.month': 1
        }
      }
    ]).catch((error) => {
      console.error('[Dashboard API] Error fetching fraud trends:', error);
      return [];
    });

    // Calculate match rate and resolution time statistics
    const matchedReportsWithDetails = await Report.find({
      'matchDetails.isMatched': true,
      'matchDetails.matchDate': { $exists: true },
      createdAt: { $exists: true }
    }).lean().catch((error) => {
      console.error('[Dashboard API] Error fetching matched reports:', error);
      return [];
    });

    let totalResolutionTime = 0;
    let matchedCount = 0;

    if (matchedReportsWithDetails && Array.isArray(matchedReportsWithDetails)) {
      matchedCount = matchedReportsWithDetails.length;
      matchedReportsWithDetails.forEach((report: any) => {
        if (report.createdAt && report.matchDetails?.matchDate) {
          const createdDate = new Date(report.createdAt);
          const matchDate = new Date(report.matchDetails.matchDate);
          const resolutionTime = (matchDate.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24); // in days
          if (resolutionTime > 0) {
            totalResolutionTime += resolutionTime;
          }
        }
      });
    }

    const averageResolutionTime = matchedCount > 0 ? totalResolutionTime / matchedCount : 0;
    const matchRate = totalReports > 0 ? (matchedCount / totalReports) * 100 : 0;

    // Get recent reports with better data
    const recentReports = await Report.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select('reportType itemDetails.category itemDetails.title locationDetails.lastSeenLocation.city status createdAt fraud')
      .lean()
      .catch((error) => {
        console.error('[Dashboard API] Error fetching recent reports:', error);
        return [];
      });

    // Get status distribution for pie chart using actual data with all statuses
    const statusDistribution = actualStatusDistribution.map(status => {
      const statusName = status._id || 'Unknown';
      let color = '#6b7280'; // Default gray
      
      switch (statusName) {
        case 'Active':
          color = '#3b82f6'; // Blue
          break;
        case 'Matched':
          color = '#22c55e'; // Green
          break;
        case 'Closed':
          color = '#6b7280'; // Gray
          break;
        case 'Unknown':
          color = '#f59e0b'; // Orange
          break;
        default:
          color = '#8b5cf6'; // Purple for any other status
      }
      
      return {
        name: statusName,
        value: status.count,
        color: color
      };
    });

    // Get report type distribution using actual data with all types
    const reportTypeDistribution = actualReportTypeDistribution.map(type => {
      const typeName = type._id || 'Unknown';
      let color = '#6b7280'; // Default gray
      let displayName = typeName;
      
      switch (typeName) {
        case 'lost':
          color = '#ef4444'; // Red
          displayName = 'Lost Items';
          break;
        case 'found':
          color = '#22c55e'; // Green
          displayName = 'Found Items';
          break;
        case 'Unknown':
          color = '#f59e0b'; // Orange
          displayName = 'Unknown Type';
          break;
        default:
          color = '#8b5cf6'; // Purple for any other type
          displayName = typeName.charAt(0).toUpperCase() + typeName.slice(1);
      }
      
      return {
        name: displayName,
        value: type.count,
        color: color
      };
    });

    console.log('[Dashboard API] Status distribution data:', {
      actualStatusDistribution,
      actualReportTypeDistribution,
      statusDistribution,
      reportTypeDistribution
    });

    const dashboardData = {
      overview: {
        totalReports,
        totalUsers,
        totalFraudReports,
        totalFraudUsers,
        matchRate: matchRate.toFixed(2),
        averageResolutionTime: averageResolutionTime.toFixed(1),
        activeReports,
        matchedReports: matchedReportsCount,
        closedReports
      },
      reportTypes: {
        lost: lostReports,
        found: foundReports
      },
      reportStatus: {
        active: activeReports,
        matched: matchedReportsCount,
        closed: closedReports
      },
      categories: reportsByCategory,
      subCategories: reportsBySubCategory,
      topCities: reportsByCity,
      trends: {
        monthly: monthlyReportsTrend,
        daily: dailyReportsTrend,
        userRegistration: userRegistrationTrend,
        fraud: fraudTrend
      },
      charts: {
        statusDistribution,
        reportTypeDistribution,
        categoryData: reportsByCategory.slice(0, 8), // Top 8 categories for chart
        cityData: reportsByCity.slice(0, 6) // Top 6 cities for chart
      },
      recentReports,
      lastUpdated: new Date().toISOString()
    };

    console.log('[Dashboard API] Dashboard data prepared successfully');
    return NextResponse.json(dashboardData);

  } catch (error) {
    console.error('[Dashboard API] Critical error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch dashboard data',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
} 