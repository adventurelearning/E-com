import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Avatar, 
  Paper, 
  Divider, 
  Button, 
  TextField, 
  Grid,
  Card,
  CardContent,
  CardHeader,
  IconButton,
  Skeleton,
  Alert,
  Snackbar
} from '@mui/material';
import { 
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import Api from '../../Services/Api';

const ProfilePage = () => {
    const [user, setUser] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: ''
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await Api.get('/users/me', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                setUser(response.data.data);
                setFormData({
                    name: response.data.data.name,
                    email: response.data.data.email,
                    phone: response.data.data.phone || ''
                });
                setLoading(false);
            } catch (error) {
                console.error('Error fetching user data:', error);
                setError('Failed to load profile data');
                setLoading(false);
                if (error.response?.status === 401) {
                    navigate('/login');
                }
            }
        };

        fetchUserData();
    }, [navigate]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await Api.put('/users/update', formData, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            setUser(prev => ({ ...prev, ...formData }));
            setEditMode(false);
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (error) {
            console.error('Error updating profile:', error);
            setError('Failed to update profile');
            setTimeout(() => setError(null), 3000);
        }
    };

    const handleCloseSnackbar = () => {
        setError(null);
        setSuccess(false);
    };

    if (loading) {
        return (
            <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 800, mx: 'auto' }}>
                <Typography variant="h4" gutterBottom>
                    <Skeleton width="40%" />
                </Typography>
                <Paper sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                        <Skeleton variant="circular" width={64} height={64} sx={{ mr: 2 }} />
                        <Box>
                            <Skeleton width={150} height={30} />
                            <Skeleton width={200} height={20} />
                        </Box>
                    </Box>
                    <Divider sx={{ my: 2 }} />
                    <Grid container spacing={2}>
                        {[...Array(3)].map((_, i) => (
                            <Grid item xs={12} sm={6} key={i}>
                                <Skeleton width="30%" height={24} />
                                <Skeleton width="80%" height={30} />
                            </Grid>
                        ))}
                    </Grid>
                    <Skeleton width={120} height={40} sx={{ mt: 3 }} />
                </Paper>
            </Box>
        );
    }

    if (!user) {
        return (
            <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 800, mx: 'auto' }}>
                <Alert severity="error">Failed to load profile data</Alert>
            </Box>
        );
    }

    return (
        <>
        <Box sx={{ 
            p: { xs: 2, md: 3 }, 
            maxWidth: 800, 
            mx: 'auto',
            minHeight: 'calc(100vh - 64px - 56px)' // Adjust based on your header/footer height
        }}>
            <Typography 
                variant="h4" 
                gutterBottom
                sx={{ 
                    fontWeight: 600,
                    color: 'text.primary',
                    mb: 3
                }}
            >
                My Profile
            </Typography>
            
            <Paper 
                elevation={3} 
                sx={{ 
                    p: { xs: 2, md: 3 },
                    borderRadius: 2,
                    boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.08)'
                }}
            >
                <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    mb: 3,
                    flexDirection: { xs: 'column', sm: 'row' },
                    textAlign: { xs: 'center', sm: 'left' }
                }}>
                    <Avatar 
                        sx={{ 
                            width: 80, 
                            height: 80, 
                            bgcolor: '#d10024', 
                            fontSize: '2.5rem',
                            mr: { xs: 0, sm: 2 },
                            mb: { xs: 2, sm: 0 }
                        }}
                    >
                        {user.name.charAt(0).toUpperCase()}
                    </Avatar>
                    <Box>
                        <Typography 
                            variant="h5" 
                            sx={{ 
                                fontWeight: 600,
                                mb: 0.5
                            }}
                        >
                            {user.name}
                        </Typography>
                        <Typography 
                            variant="body1" 
                            color="text.secondary"
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: { xs: 'center', sm: 'flex-start' }
                            }}
                        >
                            {user.email}
                        </Typography>
                    </Box>
                </Box>

                <Divider sx={{ my: 3 }} />

                {!editMode ? (
                    <>
                        <Grid container spacing={3}>
                            <Grid item xs={12} sm={6}>
                                <Card variant="outlined" sx={{ p: 2 }}>
                                    <Typography 
                                        variant="subtitle1" 
                                        color="text.secondary"
                                        sx={{ mb: 1 }}
                                    >
                                        Full Name
                                    </Typography>
                                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                        {user.name}
                                    </Typography>
                                </Card>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Card variant="outlined" sx={{ p: 2 }}>
                                    <Typography 
                                        variant="subtitle1" 
                                        color="text.secondary"
                                        sx={{ mb: 1 }}
                                    >
                                        Email
                                    </Typography>
                                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                        {user.email}
                                    </Typography>
                                </Card>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Card variant="outlined" sx={{ p: 2 }}>
                                    <Typography 
                                        variant="subtitle1" 
                                        color="text.secondary"
                                        sx={{ mb: 1 }}
                                    >
                                        Phone
                                    </Typography>
                                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                        {user.phone || 'Not provided'}
                                    </Typography>
                                </Card>
                            </Grid>
                        </Grid>
                        <Box sx={{ 
                            mt: 4,
                            display: 'flex',
                            justifyContent: 'flex-end'
                        }}>
                            <Button 
                                variant="contained"
                                startIcon={<EditIcon />}
                                onClick={() => setEditMode(true)}
                                sx={{
                                    px: 3,
                                    py: 1,
                                    textTransform: 'none',
                                    fontWeight: 500
                                }}
                            >
                                Edit Profile
                            </Button>
                        </Box>
                    </>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <Grid container spacing={3}>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Full Name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    required
                                    variant="outlined"
                                    size="medium"
                                    InputProps={{
                                        sx: {
                                            borderRadius: 1
                                        }
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Email"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    required
                                    disabled
                                    variant="outlined"
                                    size="medium"
                                    InputProps={{
                                        sx: {
                                            borderRadius: 1
                                        }
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Phone Number"
                                    name="phone"
                                    type="tel"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    variant="outlined"
                                    size="medium"
                                    InputProps={{
                                        sx: {
                                            borderRadius: 1
                                        }
                                    }}
                                />
                            </Grid>
                        </Grid>
                        <Box sx={{ 
                            mt: 4,
                            display: 'flex',
                            justifyContent: 'flex-end',
                            gap: 2
                        }}>
                            <Button 
                                variant="outlined"
                                startIcon={<CancelIcon />}
                                onClick={() => setEditMode(false)}
                                sx={{
                                    px: 3,
                                    py: 1,
                                    textTransform: 'none',
                                    fontWeight: 500
                                }}
                            >
                                Cancel
                            </Button>
                            <Button 
                                type="submit" 
                                variant="contained"
                                color="primary"
                                startIcon={<SaveIcon />}
                                sx={{
                                    px: 3,
                                    py: 1,
                                    textTransform: 'none',
                                    fontWeight: 500
                                }}
                            >
                                Save Changes
                            </Button>
                        </Box>
                    </form>
                )}
            </Paper>

            {/* Success/Error Notifications */}
            <Snackbar
                open={success}
                autoHideDuration={3000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert 
                    severity="success" 
                    icon={<CheckCircleIcon fontSize="inherit" />}
                    onClose={handleCloseSnackbar}
                    sx={{ width: '100%' }}
                >
                    Profile updated successfully!
                </Alert>
            </Snackbar>

            <Snackbar
                open={!!error}
                autoHideDuration={3000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert 
                    severity="error"
                    onClose={handleCloseSnackbar}
                    sx={{ width: '100%' }}
                >
                    {error}
                </Alert>
            </Snackbar>
        </Box>
        </>
    );
};

export default ProfilePage;