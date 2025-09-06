// src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  CircularProgress,
  Alert,
  useMediaQuery,
  useTheme,
  Button
} from '@mui/material';
import DashboardCards from '../components/DashboardCards';
import LineChart from '../components/Charts/LineChart';
import PieChart from '../components/Charts/PieChart';
import RecentOrdersTable from '../components/Charts/RecentOrdersTable';
import Api from '../Services/Api';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch orders data using Axios
      const ordersResponse = await Api.get('/orders/userOrders/all');
      const ordersData = ordersResponse.data;

      // Try to fetch user stats
      let totalUsers = 0;
      try {
        const usersResponse = await Api.get('/dashboard/stats');
        totalUsers = usersResponse.data.totalUsers || 0;
      } catch (userError) {
        console.warn('User stats endpoint not available, calculating from orders:', userError);
        // Calculate unique users from orders if user stats endpoint fails
        const uniqueUserIds = new Set(ordersData.map(order =>
          order.user?._id ? order.user._id.toString() : order.user ? order.user.toString() : null
        )).size;
        totalUsers = uniqueUserIds;
      }

      // Process data for dashboard
      const processedData = processDashboardData(ordersData, totalUsers);
      setDashboardData(processedData);

    } catch (err) {
      console.error('Dashboard data fetch error:', err);
      if (err.response?.status === 401) {
        setError('Authentication failed. Please login again.');
      } else if (err.response?.status === 403) {
        setError('You do not have permission to view dashboard data.');
      } else {
        setError(err.message || 'Failed to load dashboard data');
      }
    } finally {
      setLoading(false);
    }
  };

  const processDashboardData = (ordersData, totalUsers) => {
    const totalRevenue = ordersData.reduce((sum, order) => sum + (order.total || 0), 0);
    const totalOrders = ordersData.length;
    const recentOrders = ordersData.slice(0, 5);

    const monthlyRevenue = calculateMonthlyRevenue(ordersData);
    const revenueByCategory = calculateRevenueByCategory(ordersData);

    return {
      totalRevenue,
      totalOrders,
      totalUsers,
      monthlyRevenue,
      revenueByCategory,
      recentOrders,
      growth: calculateGrowth(ordersData)
    };
  };

  const calculateMonthlyRevenue = (orders) => {
    const monthlyData = Array(12).fill(0);
    orders.forEach(order => {
      if (order.createdAt) {
        const month = new Date(order.createdAt).getMonth();
        monthlyData[month] += order.total || 0;
      }
    });
    return monthlyData;
  };

  const calculateRevenueByCategory = (orders) => {
    const categories = {};
    orders.forEach(order => {
      if (order.items) {
        order.items.forEach(item => {
          if (item.productId && typeof item.productId === 'object') {
            const category = item.productId.category || 'Uncategorized';
            const itemTotal = (item.productId.discountPrice || item.productId.price || 0) * (item.quantity || 1);
            categories[category] = (categories[category] || 0) + itemTotal;
          }
        });
      }
    });
    return categories;
  };

  const calculateGrowth = (orders) => {
    if (!orders || orders.length < 2) return 0;

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const currentMonthRevenue = orders
      .filter(order => {
        if (!order.createdAt) return false;
        const orderDate = new Date(order.createdAt);
        return orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear;
      })
      .reduce((sum, order) => sum + (order.total || 0), 0);

    const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const previousMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    const previousMonthRevenue = orders
      .filter(order => {
        if (!order.createdAt) return false;
        const orderDate = new Date(order.createdAt);
        return orderDate.getMonth() === previousMonth && orderDate.getFullYear() === previousMonthYear;
      })
      .reduce((sum, order) => sum + (order.total || 0), 0);

    if (previousMonthRevenue === 0) return currentMonthRevenue > 0 ? 100 : 0;

    return ((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100;
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
        <Typography variant="body1" sx={{ ml: 2 }}>
          Loading dashboard data...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert
          severity="error"
          sx={{ mb: 2 }}
          action={
            <Button color="inherit" size="small" onClick={fetchDashboardData}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{
      ml: { xs: 5, sm: 5, lg: 5 },
    }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: { xs: 2, sm: 3 },
          mt: { xs: 4, sm: 4 },
        }}
      >
        <Typography
          variant="h4"
          sx={{
            fontSize: { xs: "1rem", sm: "1rem", md: "2rem" }, // smaller on mobile
            fontWeight: "bold",
          }}
        >
          Dashboard Overview
        </Typography>

        {/* <Button
          variant="outlined"
          onClick={fetchDashboardData}
          size="small"
          sx={{
            fontSize: { xs: "0.7rem", sm: "0.8rem", md: "0.9rem" },
            px: { xs: 1.5, sm: 2 },
            py: { xs: 0.5, sm: 0.75 },
          }}
        >
          Refresh Data
        </Button> */}
      </Box>

      {/* Dashboard Cards */}
      <DashboardCards data={dashboardData} />

      {/* Charts */}
      <Grid container spacing={{ xs: 2, md: 3 }} sx={{ mt: { xs: 1, md: 2 } }}>
        <Grid >
          <Paper sx={{ p: { xs: 1.5, sm: 2 }, height: { xs: 250, sm: 300, md: 400 }, width: "100%" }}>
            <Typography
              variant="h6"
              gutterBottom
              sx={{ fontSize: { xs: "1rem", sm: "1.1rem", md: "1.25rem" } }}
            >
              Monthly Revenue
            </Typography>
            <LineChart data={dashboardData.monthlyRevenue} />
          </Paper>
        </Grid>

        <Grid >
          <Paper sx={{ p: { xs: 1.5, sm: 2 }, height: { xs: 250, sm: 300, md: 400 }, width: "100%" }}>
            <Typography
              variant="h2"
              gutterBottom
              sx={{ fontSize: { xs: "1rem", sm: "1.1rem", md: "1.25rem" } }}
            >
              Revenue by Category
            </Typography>
            <PieChart data={dashboardData.revenueByCategory} />
          </Paper>
        </Grid>
      </Grid>

      {/* Recent Orders */}
      <Grid  sx={{ mt: { xs: 2, md: 3 } }}>
        <Paper sx={{ p: { xs: 1.5, sm: 2 }, width: "100%" }}>
          <Typography
            variant="h6"
            gutterBottom
            sx={{ fontSize: { xs: "1rem", sm: "1.1rem", md: "1.25rem" } }}
          >
            Recent Orders
          </Typography>
          <RecentOrdersTable orders={dashboardData.recentOrders} />
        </Paper>
      </Grid>
    </Box>

  );
};

export default Dashboard;