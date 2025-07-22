// src/components/DashboardCards.jsx
import React from 'react';
import { Grid, Paper, Typography } from '@mui/material';
import {
  AttachMoney as AttachMoneyIcon,
  ShoppingCart as ShoppingCartIcon,
  People as PeopleIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';

const cardData = [
  { title: 'Total Revenue', value: '$24,345', icon: <AttachMoneyIcon />, color: '#3f51b5' },
  { title: 'Total Orders', value: '1,235', icon: <ShoppingCartIcon />, color: '#4caf50' },
  { title: 'Total Users', value: '2,543', icon: <PeopleIcon />, color: '#f44336' },
  { title: 'Growth', value: '+12%', icon: <TrendingUpIcon />, color: '#ff9800' },
];

const DashboardCards = () => {
  return (
    <Grid container spacing={3}>
      {cardData.map((card, index) => (
        <Grid item xs={12} sm={6} md={3} key={index}>
          <Paper sx={{ p: 2, backgroundColor: card.color, color: 'white' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <Typography variant="subtitle1">{card.title}</Typography>
                <Typography variant="h4">{card.value}</Typography>
              </div>
              <div style={{ alignSelf: 'center' }}>
                {React.cloneElement(card.icon, { style: { fontSize: 40 } })}
              </div>
            </div>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
};

export default DashboardCards;