// src/components/DashboardCards.jsx
import React from 'react';
import {
  CurrencyRupee,
  People,
  ShoppingCart,
  TrendingDown,
  TrendingUp
} from '@mui/icons-material';

const DashboardCards = ({ data }) => {
  const cardData = [
    {
      title: 'Total Revenue',
      value: `₹${data?.totalRevenue?.toLocaleString('en-IN') || '0'}`,
      icon: <CurrencyRupee className="h-4 w-4" />,
      subtitle: 'All-time sales',
      trend: '+12% from last month',
      trendPositive: true,
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      borderColor: 'border-blue-100'
    },
    {
      title: 'Total Orders',
      value: data?.totalOrders?.toLocaleString('en-IN') || '0',
      icon: <ShoppingCart className="h-4 w-4" />,
      subtitle: 'Completed orders',
      trend: '+8% from last month',
      trendPositive: true,
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
      borderColor: 'border-green-100'
    },
    {
      title: 'Total Users',
      value: data?.totalUsers?.toLocaleString('en-IN') || '0',
      icon: <People className="h-4 w-4" />,
      subtitle: 'Registered customers',
      trend: '+5% from last month',
      trendPositive: true,
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
      borderColor: 'border-purple-100'
    },
    {
      title: 'Monthly Growth',
      value: `${data?.growth?.toFixed(1)}%`,
      icon: data?.growth >= 0 ? 
        <TrendingUp className="h-4 w-4" /> : 
        <TrendingDown className="h-4 w-4" />,
      subtitle: 'vs previous month',
      trend: data?.growth >= 0 ? 'On track' : 'Needs attention',
      trendPositive: data?.growth >= 0,
      bgColor: data?.growth >= 0 ? 'bg-green-50' : 'bg-yellow-50',
      textColor: data?.growth >= 0 ? 'text-green-600' : 'text-yellow-600',
      borderColor: data?.growth >= 0 ? 'border-green-100' : 'border-yellow-100'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
      
      {cardData.map((card, index) => (
        <div
          key={index}
          className={`bg-white p-3 rounded-lg border ${card.borderColor} shadow-sm hover:shadow-md transition-shadow`}
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-gray-500 font-medium">{card.title}</p>
              <p className={`text-lg font-semibold ${card.textColor} mt-1`}>
                {card.value}
              </p>
            </div>
            <div className={`p-2 rounded-full ${card.bgColor}`}>
              {React.cloneElement(card.icon, {
                className: `h-4 w-4 ${card.textColor}`
              })}
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <p className="text-xs text-gray-400 mt-3">{card.subtitle}</p>
            <span className={`text-xs ${card.trendPositive ? 'text-green-500' : 'text-yellow-500'}`}>
              {card.trend}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DashboardCards;