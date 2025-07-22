// src/pages/Dashboard.jsx
import React from 'react';
import { Grid, Paper, Typography } from '@mui/material';
import DashboardCards from '../components/DashboardCards';
import LineChart from '../components/Charts/LineChart';
import PieChart from '../components/Charts/PieChart';

const Dashboard = () => {
  return (
    <div>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <DashboardCards />
      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Sales Overview
            </Typography>
            <LineChart />
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Revenue Sources
            </Typography>
            <PieChart />
          </Paper>
        </Grid>
      </Grid>
    </div>
  );
};

export default Dashboard;