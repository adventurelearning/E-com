import React, { useState, useRef, useEffect } from 'react';
import { Bar, Pie, Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement
} from 'chart.js';
import * as XLSX from 'xlsx';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Api from '../../Services/Api';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement
);

const SalesReport = () => {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [productFilter, setProductFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('overview');
  const chartRef = useRef(null);

  // Fetch orders and products
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [ordersResponse, productsResponse] = await Promise.all([
          Api.get('/orders/userOrders/all'),
          Api.get('/products')
        ]);
console.log(ordersResponse, productsResponse);

     
        const ordersData = ordersResponse.data;
        const productsData = await productsResponse.data;

        setOrders(ordersData);
        setProducts(productsData.products || productsData);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Get unique products and categories for filter
  const allProducts = [...new Set(orders.flatMap(order => 
    order.items.map(item => item.productId?.name).filter(Boolean)
  ))];
  
  const allCategories = [...new Set(orders.flatMap(order => 
    order.items.map(item => item.productId?.category).filter(Boolean)
  ))];
  
  // Filter orders based on selected filters
  const filterOrders = () => {
    let filtered = [...orders];
    
    // Status filter
    if (filter !== 'all') {
      filtered = filtered.filter(order => order.status === filter);
    }
    
    // Product filter
    if (productFilter !== 'all') {
      filtered = filtered.filter(order => 
        order.items.some(item => item.productId?.name === productFilter)
      );
    }
    
    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(order => 
        order.items.some(item => item.productId?.category === categoryFilter)
      );
    }
    
    // Date filter
    if (dateFilter === 'custom' && startDate && endDate) {
      filtered = filtered.filter(order => {
        const orderDate = new Date(order.createdAt);
        return orderDate >= startDate && orderDate <= endDate;
      });
    } else if (dateFilter === 'today') {
      const today = new Date();
      filtered = filtered.filter(order => {
        const orderDate = new Date(order.createdAt);
        return orderDate.toDateString() === today.toDateString();
      });
    } else if (dateFilter === 'monthly') {
      const thisMonth = new Date().getMonth();
      const thisYear = new Date().getFullYear();
      filtered = filtered.filter(order => {
        const orderDate = new Date(order.createdAt);
        return orderDate.getMonth() === thisMonth && orderDate.getFullYear() === thisYear;
      });
    } else if (dateFilter === 'daily') {
      const last7Days = new Date();
      last7Days.setDate(last7Days.getDate() - 7);
      filtered = filtered.filter(order => {
        const orderDate = new Date(order.createdAt);
        return orderDate >= last7Days;
      });
    }
    
    return filtered;
  };
  
  const filteredOrders = filterOrders();

  // Calculate totals
  const totalRevenue = filteredOrders.reduce((sum, order) => sum + order.total, 0);
  const completedOrders = filteredOrders.filter(o => o.status === 'completed');
  const pendingOrders = filteredOrders.filter(o => o.status === 'pending');
  const refundedOrders = filteredOrders.filter(o => o.status === 'refunded');
  const failedOrders = filteredOrders.filter(o => o.status === 'failed');
  
  const completedAmount = completedOrders.reduce((sum, order) => sum + order.total, 0);
  const pendingAmount = pendingOrders.reduce((sum, order) => sum + order.total, 0);
  const refundedAmount = refundedOrders.reduce((sum, order) => sum + order.total, 0);
  const failedAmount = failedOrders.reduce((sum, order) => sum + order.total, 0);

  // Calculate category sales
  const categorySales = {};
  filteredOrders.forEach(order => {
    order.items.forEach(item => {
      const category = item.productId?.category || 'Uncategorized';
      if (!categorySales[category]) {
        categorySales[category] = 0;
      }
      categorySales[category] += (item.productId?.discountPrice || item.productId?.originalPrice || 0) * item.quantity;
    });
  });

  // Calculate product sales
  const productSales = {};
  filteredOrders.forEach(order => {
    order.items.forEach(item => {
      const productName = item.productId?.name || 'Unknown Product';
      if (!productSales[productName]) {
        productSales[productName] = 0;
      }
      productSales[productName] += (item.productId?.discountPrice || item.productId?.originalPrice || 0) * item.quantity;
    });
  });

  // Format currency in rupees
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  // Get status badge class
  const getStatusClass = (status) => {
    switch(status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'refunded': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Export to Excel function with detailed data
  const exportToExcel = () => {
    // Create detailed data for export
    const detailedData = filteredOrders.flatMap(order => 
      order.items.map(item => ({
        'Order ID': order.orderId || order._id,
        'Customer': order.user?.name || 'Unknown',
        'Date': formatDate(order.createdAt),
        'Product': item.productId?.name || 'Unknown',
        'Category': item.productId?.category || 'Uncategorized',
        'Quantity': item.quantity,
        'Unit Price': item.productId?.discountPrice || item.productId?.originalPrice || 0,
        'Total Price': (item.productId?.discountPrice || item.productId?.originalPrice || 0) * item.quantity,
        'Payment Method': order.paymentMethod === 'razorpay' ? 'Razorpay' : 'Cash on Delivery',
        'Status': order.status.charAt(0).toUpperCase() + order.status.slice(1),
        'Order Total': order.total
      }))
    );
    
    // Add summary data
    const summaryData = [{
      'Total Orders': filteredOrders.length,
      'Total Revenue': totalRevenue,
      'Completed Orders': completedOrders.length,
      'Pending Orders': pendingOrders.length,
      'Refunded Orders': refundedOrders.length,
      'Failed Orders': failedOrders.length
    }];
    
    const workbook = XLSX.utils.book_new();
    
    // Add detailed worksheet
    const worksheet = XLSX.utils.json_to_sheet(detailedData);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sales Details');
    
    // Add summary worksheet
    const summaryWorksheet = XLSX.utils.json_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summaryWorksheet, 'Summary');
    
    XLSX.writeFile(workbook, 'Sales_Report.xlsx');
  };

  // Export chart as image
  const exportChartAsImage = () => {
    if (chartRef.current) {
      const link = document.createElement('a');
      link.download = 'sales_chart.png';
      link.href = chartRef.current.toBase64Image();
      link.click();
    }
  };

  // Data for charts
  const barChartData = {
    labels: ['Completed', 'Pending', 'Refunded', 'Failed'],
    datasets: [
      {
        label: 'Revenue by Status (₹)',
        data: [completedAmount, pendingAmount, refundedAmount, failedAmount],
        backgroundColor: [
          'rgba(75, 192, 192, 0.6)',
          'rgba(255, 205, 86, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 99, 132, 0.6)'
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)',
          'rgba(255, 205, 86, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 99, 132, 1)'
        ],
        borderWidth: 1,
      },
    ],
  };

  const pieChartData = {
    labels: ['Razorpay', 'Cash on Delivery'],
    datasets: [
      {
        data: [
          filteredOrders.filter(o => o.paymentMethod === 'razorpay').length,
          filteredOrders.filter(o => o.paymentMethod === 'cod').length
        ],
        backgroundColor: [
          'rgba(153, 102, 255, 0.6)',
          'rgba(255, 159, 64, 0.6)'
        ],
        borderColor: [
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)'
        ],
        borderWidth: 1,
      },
    ],
  };

  // Category sales data
  const categorySalesData = {
    labels: Object.keys(categorySales),
    datasets: [
      {
        label: 'Revenue by Category (₹)',
        data: Object.values(categorySales),
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)'
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)'
        ],
        borderWidth: 1,
      },
    ],
  };

  // Top products data
  const topProducts = Object.entries(productSales)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  
  const topProductsData = {
    labels: topProducts.map(p => p[0]),
    datasets: [
      {
        label: 'Revenue (₹)',
        data: topProducts.map(p => p[1]),
        backgroundColor: 'rgba(153, 102, 255, 0.6)',
        borderColor: 'rgba(153, 102, 255, 1)',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Sales Overview',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return '₹' + value.toLocaleString('en-IN');
          }
        }
      }
    }
  };

  const lineChartOptions = {
    ...chartOptions,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return '₹' + value.toLocaleString('en-IN');
          }
        }
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading sales data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-2xl mb-4">Error</div>
          <p className="text-gray-600">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      {/* <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Sales Analytics Dashboard</h1>
        </div>
      </header> */}

      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-1 text-sm font-medium ${
                activeTab === 'overview'
                  ? 'border-indigo-500 text-indigo-600 border-b-2'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('products')}
              className={`py-4 px-1 text-sm font-medium ${
                activeTab === 'products'
                  ? 'border-indigo-500 text-indigo-600 border-b-2'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Product Analytics
            </button>
            <button
              onClick={() => setActiveTab('detailed')}
              className={`py-4 px-1 text-sm font-medium ${
                activeTab === 'detailed'
                  ? 'border-indigo-500 text-indigo-600 border-b-2'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Detailed Report
            </button>
          </nav>
        </div>
        {/* Filters Section */}
        <div className="bg-white shadow rounded-lg p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status Filter</label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                <option value="all">All Statuses</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>

            {/* Product Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Product Filter</label>
              <select
                value={productFilter}
                onChange={(e) => setProductFilter(e.target.value)}
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                <option value="all">All Products</option>
                {allProducts.map(product => (
                  <option key={product} value={product}>{product}</option>
                ))}
              </select>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category Filter</label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                <option value="all">All Categories</option>
                {allCategories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            {/* Date Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date Filter</label>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                <option value="all">All Time</option>
                <option value="daily">Last 7 Days</option>
                <option value="monthly">This Month</option>
                <option value="today">Today</option>
                <option value="custom">Custom Range</option>
              </select>
            </div>
          </div>

          {/* Custom Date Range Picker */}
          {dateFilter === 'custom' && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                <DatePicker
                  selected={startDate}
                  onChange={date => setStartDate(date)}
                  selectsStart
                  startDate={startDate}
                  endDate={endDate}
                  className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  placeholderText="Select start date"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                <DatePicker
                  selected={endDate}
                  onChange={date => setEndDate(date)}
                  selectsEnd
                  startDate={startDate}
                  endDate={endDate}
                  minDate={startDate}
                  className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  placeholderText="Select end date"
                />
              </div>
            </div>
          )}

          {/* Results Count and Export Button */}
          <div className="mt-4 flex justify-between items-center">
            <p className="text-sm text-gray-600">
              Showing {filteredOrders.length} of {orders.length} orders
            </p>
            <button
              onClick={exportToExcel}
              className="bg-green-500 hover:bg-green-700 text-white font-medium py-2 px-4 rounded flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              Export to Excel
            </button>
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-6">
              {/* Total Revenue Card */}
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
                      <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Total Revenue</dt>
                        <dd>
                          <div className="text-lg font-semibold text-gray-900">{formatCurrency(totalRevenue)}</div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              {/* Completed Payments Card */}
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                      <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Completed</dt>
                        <dd>
                          <div className="text-lg font-semibold text-gray-900">{formatCurrency(completedAmount)}</div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pending Payments Card */}
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-yellow-500 rounded-md p-3">
                      <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Pending</dt>
                        <dd>
                          <div className="text-lg font-semibold text-gray-900">{formatCurrency(pendingAmount)}</div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              {/* Refunded Payments Card */}
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                      <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Refunded</dt>
                        <dd>
                          <div className="text-lg font-semibold text-gray-900">{formatCurrency(refundedAmount)}</div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-semibold mb-4">Revenue by Status</h2>
                <div className="h-80">
                  <Bar ref={chartRef} data={barChartData} options={chartOptions} />
                </div>
                <button
                  onClick={exportChartAsImage}
                  className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded"
                >
                  Export Chart as Image
                </button>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-semibold mb-4">Payment Methods</h2>
                <div className="h-80">
                  <Pie data={pieChartData} options={chartOptions} />
                </div>
              </div>
            </div>
          </>
        )}

        {/* Product Analytics Tab */}
        {activeTab === 'products' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Revenue by Category</h2>
              <div className="h-80">
                <Doughnut data={categorySalesData} options={chartOptions} />
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Top Products by Revenue</h2>
              <div className="h-80">
                <Bar 
                  data={topProductsData} 
                  options={{
                    ...chartOptions,
                    indexAxis: 'y',
                  }} 
                />
              </div>
            </div>
          </div>
        )}

        {/* Detailed Report Tab */}
        {activeTab === 'detailed' && (
          <div className="bg-white shadow overflow-hidden rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Order Details
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                {filteredOrders.length} orders found
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order ID
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Products
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payment Method
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredOrders.map((order) => (
                    <tr key={order._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {order.orderId || order._id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {order.user?.name || 'Unknown'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(order.createdAt)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {order.items.map(item => (
                          <div key={item._id || item.productId?._id}>
                            {item.productId?.name || 'Unknown'} (x{item.quantity})
                          </div>
                        ))}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {order.items.map(item => (
                          <div key={item._id || item.productId?._id}>
                            {item.productId?.category || 'Uncategorized'}
                          </div>
                        ))}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${order.paymentMethod === 'razorpay' ? 'bg-purple-100 text-purple-800' : 'bg-yellow-100 text-yellow-800'}`}>
                          {order.paymentMethod === 'razorpay' ? 'Razorpay' : 'Cash on Delivery'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatCurrency(order.total)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusClass(order.status)}`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default SalesReport;