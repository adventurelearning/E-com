// src/components/Charts/RecentOrdersTable.jsx
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
        return { bg: "#e6f4ea", text: "#137333" };
      case "shipped":
        return { bg: "#e8f0fe", text: "#1a73e8" };
      case "pending":
        return { bg: "#fef7e0", text: "#f9ab00" };
      case "cancelled":
        return { bg: "#fce8e6", text: "#c5221f" };
      default:
        return { bg: "#f3e5f5", text: "#9c27b0" };
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
    <TableContainer 
      component={Paper} 
      elevation={0}
      sx={{ 
        borderRadius: 1,
        maxHeight: isMobile ? 250 : 300,
        '&::-webkit-scrollbar': {
          width: '6px',
        },
        '&::-webkit-scrollbar-track': {
          background: '#f1f1f1',
        },
        '&::-webkit-scrollbar-thumb': {
          background: '#c1c1c1',
          borderRadius: '3px',
        },
      }}
    >
      <Table size="small" stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell 
              sx={{ 
                fontSize: isMobile ? "0.7rem" : "0.8rem", 
                fontWeight: 600, 
                py: 1,
                background: theme.palette.grey[100]
              }}
            >
              Order ID
            </TableCell>
            {!isMobile && (
              <TableCell 
                sx={{ 
                  fontSize: "0.8rem", 
                  fontWeight: 600,
                  background: theme.palette.grey[100]
                }}
              >
                Customer
              </TableCell>
            )}
            <TableCell 
              sx={{ 
                fontSize: isMobile ? "0.7rem" : "0.8rem", 
                fontWeight: 600,
                background: theme.palette.grey[100]
              }}
            >
              Amount
            </TableCell>
            <TableCell 
              sx={{ 
                fontSize: isMobile ? "0.7rem" : "0.8rem", 
                fontWeight: 600,
                background: theme.palette.grey[100]
              }}
            >
              Status
            </TableCell>
            {!isMobile && (
              <TableCell 
                sx={{ 
                  fontSize: "0.8rem", 
                  fontWeight: 600,
                  background: theme.palette.grey[100]
                }}
              >
                Date
              </TableCell>
            )}
          </TableRow>
        </TableHead>
        <TableBody>
          {orders.map((order) => {
            const statusColors = getStatusColor(order.status);
            return (
            <TableRow key={order._id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
              <TableCell sx={{ fontSize: isMobile ? "0.7rem" : "0.8rem", py: 1 }}>
                <Typography
                  variant="body2"
                  noWrap
                  sx={{
                    maxWidth: isMobile ? "70px" : "100px",
                    fontSize: isMobile ? "0.7rem" : "0.8rem",
                    fontWeight: 500,
                  }}
                >
                  #{order._id.slice(-8)}
                </Typography>
              </TableCell>

              {!isMobile && (
                <TableCell sx={{ fontSize: "0.8rem", py: 1 }}>
                  {order.shippingAddress?.fullName || "N/A"}
                </TableCell>
              )}

              <TableCell sx={{ fontSize: isMobile ? "0.7rem" : "0.8rem", fontWeight: 500, py: 1 }}>
                ₹{order.total?.toLocaleString("en-IN")}
              </TableCell>

              <TableCell sx={{ py: 1 }}>
                <Chip
                  label={order.status}
                  size="small"
                  sx={{
                    fontSize: isMobile ? "0.65rem" : "0.7rem",
                    height: isMobile ? 20 : 24,
                    backgroundColor: statusColors.bg,
                    color: statusColors.text,
                    fontWeight: 500,
                    minWidth: 70
                  }}
                />
              </TableCell>

              {!isMobile && (
                <TableCell sx={{ fontSize: "0.8rem", py: 1 }}>
                  {new Date(order.createdAt).toLocaleDateString()}
                </TableCell>
              )}
            </TableRow>
          )})}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default RecentOrdersTable;