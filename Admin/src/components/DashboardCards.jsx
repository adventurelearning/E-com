// src/components/DashboardCards.jsx
import React from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  AttachMoney as AttachMoneyIcon,
  ShoppingCart as ShoppingCartIcon,
  People as PeopleIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon
} from '@mui/icons-material';

const DashboardCards = ({ data }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const cardData = [
    {
      title: 'Total Revenue',
      value: `₹${data?.totalRevenue?.toLocaleString('en-IN') || '0'}`,
      icon: <AttachMoneyIcon color='black' />,
      subtitle: 'All-time sales'
    },
    {
      title: 'Total Orders',
      value: data?.totalOrders?.toLocaleString('en-IN') || '0',
      icon: <ShoppingCartIcon color='black' />,
      subtitle: 'Completed orders'
    },
    {
      title: 'Total Users',
      value: data?.totalUsers?.toLocaleString('en-IN') || '0',
      icon: <PeopleIcon color='black' />,
      subtitle: 'Registered customers'
    },
    {
      title: 'Monthly Growth',
      value: `${data?.growth?.toFixed(1)}%`,
      icon: data?.growth >= 0 ? <TrendingUpIcon color='black' /> : <TrendingDownIcon color='black' />,
      subtitle: 'vs previous month'
    }
  ];

  return (
    <Grid container spacing={isMobile ? 4 : 6}>
      {cardData.map((card, index) => (
        <Grid
          // item
          // xs={6}  
          // sm={6}  
          // md={4}   
          // lg={3}   
          key={index}
        >
          <Paper
            sx={{
              p: { xs: 1.5, sm: 2, md: 2.5 },
              backgroundColor: theme.palette.primary.main,
              color: "white",
              borderRadius: 2,
              boxShadow: 3,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              height: { xs: 110, sm: 130, md: 150 }, // ✅ fixed height for all cards
            }}
          >
            <Box>
              <Typography
                variant="subtitle2"
                sx={{
                  opacity: 0.85,
                  fontSize: { xs: "0.65rem", sm: "0.75rem", md: "0.875rem" },
                }}
              >
                {card.title}
              </Typography>

              <Typography
                variant="h4"
                sx={{
                  fontSize: { xs: "1.2rem", sm: "1.5rem", md: "2rem" },
                  fontWeight: "bold",
                  lineHeight: 1.2,
                }}
              >
                {card.value}
              </Typography>

              <Typography
                variant="caption"
                sx={{
                  opacity: 0.8,
                  fontSize: { xs: "0.6rem", sm: "0.7rem", md: "0.8rem" },
                }}
              >
                {card.subtitle}
              </Typography>
            </Box>

            <Box sx={{ opacity: 0.9 }}>
              {React.cloneElement(card.icon, {
                sx: { fontSize: { xs: 32, sm: 40, md: 64 } },
              })}
            </Box>
          </Paper>
        </Grid>
      ))}
    </Grid>

  );
};

export default DashboardCards;
