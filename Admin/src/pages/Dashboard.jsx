import React, { useState, useEffect } from "react";
import DashboardCards from "../components/DashboardCards";
import LineChart from "../components/Charts/LineChart";
import PieChart from "../components/Charts/PieChart";
import RecentOrdersTable from "../components/Charts/RecentOrdersTable";
import Api from "../Services/Api";

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const ordersResponse = await Api.get("/orders/userOrders/all");
      const ordersData = ordersResponse.data;

      let totalUsers = 0;
      try {
        const usersResponse = await Api.get("/dashboard/stats");
        totalUsers = usersResponse.data.totalUsers || 0;
      } catch {
        const uniqueUserIds = new Set(
          ordersData.map((order) =>
            order.user?._id
              ? order.user._id.toString()
              : order.user
              ? order.user.toString()
              : null
          )
        ).size;
        totalUsers = uniqueUserIds;
      }

      const processedData = processDashboardData(ordersData, totalUsers);
      setDashboardData(processedData);
    } catch (err) {
      setError(err.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const processDashboardData = (ordersData, totalUsers) => {
    const totalRevenue = ordersData.reduce(
      (sum, order) => sum + (order.total || 0),
      0
    );
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
      growth: calculateGrowth(ordersData),
    };
  };

  const calculateMonthlyRevenue = (orders) => {
    const monthlyData = Array(12).fill(0);
    orders.forEach((order) => {
      if (order.createdAt) {
        const month = new Date(order.createdAt).getMonth();
        monthlyData[month] += order.total || 0;
      }
    });
    return monthlyData;
  };

  const calculateRevenueByCategory = (orders) => {
    const categories = {};
    orders.forEach((order) => {
      if (order.items) {
        order.items.forEach((item) => {
          if (item.productId && typeof item.productId === "object") {
            const category = item.productId.category || "Uncategorized";
            const itemTotal =
              (item.productId.discountPrice || item.productId.price || 0) *
              (item.quantity || 1);
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
      .filter((order) => {
        if (!order.createdAt) return false;
        const orderDate = new Date(order.createdAt);
        return (
          orderDate.getMonth() === currentMonth &&
          orderDate.getFullYear() === currentYear
        );
      })
      .reduce((sum, order) => sum + (order.total || 0), 0);

    const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    const prevMonthRevenue = orders
      .filter((order) => {
        if (!order.createdAt) return false;
        const orderDate = new Date(order.createdAt);
        return (
          orderDate.getMonth() === prevMonth &&
          orderDate.getFullYear() === prevYear
        );
      })
      .reduce((sum, order) => sum + (order.total || 0), 0);

    if (prevMonthRevenue === 0) return currentMonthRevenue > 0 ? 100 : 0;

    return ((currentMonthRevenue - prevMonthRevenue) / prevMonthRevenue) * 100;
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-[300px] text-sm text-gray-600">
        <div className="animate-spin border-2 border-gray-300 border-t-blue-500 rounded-full w-6 h-6 mr-2"></div>
        Loading dashboard...
      </div>
    );

  if (error)
    return (
      <div className="p-4 bg-red-100 text-red-700 text-sm rounded">
        {error}
        <button
          onClick={fetchDashboardData}
          className="ml-3 text-xs px-2 py-1 bg-red-500 text-white rounded"
        >
          Retry
        </button>
      </div>
    );

  return (
    <div className="px-5 py-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-gray-800">Dashboard Overview</h2>
      </div>

      {/* Cards */}
      <DashboardCards data={dashboardData} />

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div className="bg-white shadow rounded p-3 h-[280px]">
          <h3 className="text-sm font-semibold mb-2 text-gray-700">
            Monthly Revenue
          </h3>
          <LineChart data={dashboardData.monthlyRevenue} />
        </div>

        <div className="bg-white shadow rounded p-3 h-[280px]">
          <h3 className="text-sm font-semibold mb-2 text-gray-700">
            Revenue by Category
          </h3>
          <PieChart data={dashboardData.revenueByCategory} />
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white shadow rounded p-3 mt-4">
        <h3 className="text-sm font-semibold mb-2 text-gray-700">
          Recent Orders
        </h3>
        <RecentOrdersTable orders={dashboardData.recentOrders} />
      </div>
    </div>
  );
};

export default Dashboard;
