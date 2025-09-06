// src/components/Charts/LineChart.jsx
import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { useTheme, useMediaQuery } from "@mui/material";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const LineChart = ({ data }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const chartData = {
    labels: months,
    datasets: [
      {
        label: "Monthly Revenue (₹)",
        data: data || Array(12).fill(0),
        borderColor: "rgb(75, 192, 192)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        tension: 0.4,
        fill: true,
        borderWidth: isMobile ? 2 : 3, // thinner line on mobile
        pointRadius: isMobile ? 2 : 4, // smaller points on mobile
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          font: {
            size: isMobile ? 10 : 14, // smaller legend text on mobile
          },
        },
      },
      tooltip: {
        bodyFont: { size: isMobile ? 10 : 14 },
        titleFont: { size: isMobile ? 11 : 15 },
      },
    },
    scales: {
      x: {
        ticks: {
          font: { size: isMobile ? 9 : 13 },
        },
      },
      y: {
        beginAtZero: true,
        ticks: {
          callback: function (value) {
            return "₹" + value.toLocaleString("en-IN");
          },
          font: { size: isMobile ? 9 : 13 },
        },
      },
    },
  };

  return (
    <div
      style={{
        height: isMobile ? "200px" : "300px", // smaller chart on mobile
        width:  isMobile ? "300px" : "500px", // full width instead of fixed 440px
      }}
    >
      <Line options={options} data={chartData} />
    </div>
  );
};

export default LineChart;
