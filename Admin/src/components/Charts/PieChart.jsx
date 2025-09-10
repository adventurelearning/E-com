// src/components/Charts/PieChart.jsx
import React from "react";
import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { useTheme, useMediaQuery } from "@mui/material";

ChartJS.register(ArcElement, Tooltip, Legend);

const PieChart = ({ data }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const colors = [
    "rgba(255, 99, 132, 0.7)",
    "rgba(54, 162, 235, 0.7)",
    "rgba(255, 206, 86, 0.7)",
    "rgba(75, 192, 192, 0.7)",
    "rgba(153, 102, 255, 0.7)",
    "rgba(255, 159, 64, 0.7)",
    "rgba(199, 199, 199, 0.7)",
  ];

  const chartData = {
    labels: Object.keys(data || {}),
    datasets: [
      {
        label: "Revenue by Category (₹)",
        data: Object.values(data || {}),
        backgroundColor: colors,
        borderColor: colors.map((color) => color.replace("0.7", "1")),
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: isMobile ? "bottom" : "right", // move legend below on mobile
        labels: {
          font: {
            size: isMobile ? 10 : 18, // smaller legend font
          },
        },
      },
      tooltip: {
        bodyFont: { size: isMobile ? 10 : 14 },
        titleFont: { size: isMobile ? 11 : 15 },
        callbacks: {
          label: function (context) {
            return `${context.label}: ₹${context.raw.toLocaleString("en-IN")}`;
          },
        },
      },
    },
  };

  return (
    <div
      style={{
        height: isMobile ? "200px" : "350px", // smaller height on mobile
        width: isMobile ? "300px" : "490px", // responsive full width
      }}
    >
      <Pie options={options} data={chartData} />
    </div>
  );
};

export default PieChart;
