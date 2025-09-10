// src/components/RecentOrdersTable.jsx
import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";

const RecentOrdersTable = ({ orders }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const getStatusColor = (status) => {
    switch (status) {
      case "delivered":
        return "success";
      case "shipped":
        return "info";
      case "pending":
        return "warning";
      case "cancelled":
        return "error";
      default:
        return "default";
    }
  };

  if (!orders || orders.length === 0) {
    return (
      <Typography
        variant="body2"
        color="textSecondary"
        sx={{ p: 2, fontSize: isMobile ? "0.75rem" : "0.875rem" }}
      >
        No recent orders found.
      </Typography>
    );
  }

  return (
    <TableContainer component={Paper} elevation={0}>
      <Table size={isMobile ? "small" : "medium"}>
        <TableHead>
          <TableRow sx={{ height: isMobile ? 36 : 48 }}>
            <TableCell sx={{ fontSize: isMobile ? "0.7rem" : "0.875rem" }}>
              Order ID
            </TableCell>
            {!isMobile && (
              <TableCell sx={{ fontSize: "0.875rem" }}>Customer</TableCell>
            )}
            <TableCell sx={{ fontSize: isMobile ? "0.7rem" : "0.875rem" }}>
              Amount
            </TableCell>
            <TableCell sx={{ fontSize: isMobile ? "0.7rem" : "0.875rem" }}>
              Status
            </TableCell>
            {!isMobile && (
              <TableCell sx={{ fontSize: "0.875rem" }}>Date</TableCell>
            )}
          </TableRow>
        </TableHead>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order._id} sx={{ height: isMobile ? 36 : 48 }}>
              <TableCell>
                <Typography
                  variant="body2"
                  noWrap
                  sx={{
                    maxWidth: isMobile ? "70px" : "100px",
                    fontSize: isMobile ? "0.7rem" : "0.875rem",
                  }}
                >
                  #{order._id.slice(-8)}
                </Typography>
              </TableCell>

              {!isMobile && (
                <TableCell sx={{ fontSize: "0.8rem" }}>
                  {order.shippingAddress?.fullName || "N/A"}
                </TableCell>
              )}

              <TableCell sx={{ fontSize: isMobile ? "0.7rem" : "0.875rem" }}>
                ₹{order.total?.toLocaleString("en-IN")}
              </TableCell>

              <TableCell>
                <Chip
                  label={order.status}
                  color={getStatusColor(order.status)}
                  size="small"
                  sx={{
                    fontSize: isMobile ? "0.65rem" : "0.75rem",
                    height: isMobile ? 20 : 24,
                  }}
                />
              </TableCell>

              {!isMobile && (
                <TableCell sx={{ fontSize: "0.8rem" }}>
                  {new Date(order.createdAt).toLocaleDateString()}
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default RecentOrdersTable;
