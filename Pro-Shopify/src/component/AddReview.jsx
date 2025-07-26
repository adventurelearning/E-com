import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Rating,
  Box,
  Typography,
  CircularProgress,
  IconButton,
  Grid
} from '@mui/material';
import { PhotoCamera, Close, Delete } from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import Api from '../Services/Api';

const AddReview = ({ open, onClose, product, onSubmit }) => {
  const [rating, setRating] = useState(0);
  const [detailedRatings, setDetailedRatings] = useState({});
  const [comment, setComment] = useState('');
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { enqueueSnackbar } = useSnackbar();

  const handleImageSelect = async (e) => {
    const files = Array.from(e.target.files);
    
    // Reset file input
    e.target.value = null;

    // Check max image limit
    if (files.length + images.length > 5) {
      enqueueSnackbar('Maximum 5 images allowed', { variant: 'error' });
      return;
    }

    const newImages = files.map(file => ({
      url: URL.createObjectURL(file),
      serverFilename: '',
      status: 'pending',
      file
    }));

    // Add all image previews to UI immediately
    setImages(prev => [...prev, ...newImages]);

    // Upload one-by-one
    for (const img of newImages) {
      await uploadImage(img);
    }
  };

  const uploadImage = async (img) => {
    // Update status to uploading
    setImages(prev =>
      prev.map(i =>
        i.url === img.url ? { ...i, status: 'uploading' } : i
      )
    );

    try {
      const fd = new FormData();
      fd.append('photo', img.file);

      const response = await Api.post('/upload', fd, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
console.log(response.data);

      // Update with server URL and filename
      setImages(prev =>
        prev.map(i =>
          i.url === img.url
            ? {
                url: response.data.location,
                serverFilename: response.data.location,
                status: 'uploaded'
              }
            : i
        )
      );

      // Clean up blob URL
      URL.revokeObjectURL(img.url);
    } catch (err) {
      setImages(prev =>
        prev.map(i =>
          i.url === img.url ? { ...i, status: 'error' } : i
        )
      );
      enqueueSnackbar('Image upload failed', { variant: 'error' });
    }
  };

  const removeImage = (index) => {
    const img = images[index];
    
    // Revoke blob URL if it exists
    if (img.url.startsWith('blob:')) {
      URL.revokeObjectURL(img.url);
    }
    
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleDetailedRatingChange = (attribute, value) => {
    setDetailedRatings(prev => ({
      ...prev,
      [attribute]: value
    }));
  };

  const handleSubmit = async () => {
    if (!rating) {
      setError('Please provide a rating');
      return;
    }
    
    // Check if any images are still uploading
    if (images.some(img => img.status === 'uploading' || img.status === 'pending')) {
      setError('Please wait for all images to finish uploading');
      return;
    }
    
    setLoading(true);
    try {
      const reviewData = {
        productId: product._id,
        rating,
        comment,
        detailedRatings,
        images: images
          .filter(img => img.status === 'uploaded')
          .map(img => img.serverFilename)
      };
      console.log('reviewData:', reviewData);
      
      await onSubmit(reviewData);
    } catch (err) {
      setError(err.message || 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  };
console.log(images);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Review {product?.name}</Typography>
          <IconButton onClick={onClose}>
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <Typography variant="body1" gutterBottom>
            Overall Rating*
          </Typography>
          <Rating
            value={rating}
            onChange={(e, newValue) => setRating(newValue)}
            size="large"
          />
          
          {/* Detailed Ratings Section */}
          {product?.ratingAttributes?.length > 0 && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="body1" gutterBottom>
                Detailed Ratings
              </Typography>
              <Grid container spacing={2}>
                {product.ratingAttributes.map((attribute) => (
                  <Grid item xs={12} sm={6} key={attribute}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography variant="body2" sx={{ mr: 2, minWidth: 80 }}>
                        {attribute.charAt(0).toUpperCase() + attribute.slice(1)}
                      </Typography>
                      <Rating
                        value={detailedRatings[attribute] || 0}
                        onChange={(e, newValue) => 
                          handleDetailedRatingChange(attribute, newValue)
                        }
                        size="medium"
                      />
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
          
          <TextField
            label="Your Review"
            multiline
            rows={4}
            fullWidth
            variant="outlined"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            sx={{ mt: 3 }}
          />
          
          <Box sx={{ mt: 3, p: 2, bgcolor: 'background.paper', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
            <Typography variant="body1" sx={{ fontWeight: 600, mb: 1, color: 'primary.main' }}>
              Product Images
            </Typography>
            
            <Box sx={{ mb: 2 }}>
              <Button
                variant="outlined"
                component="label"
                startIcon={<PhotoCamera />}
                disabled={images.length >= 5}
                sx={{ 
                  bgcolor: images.length >= 5 ? 'action.disabledBackground' : '',
                  '&:hover': {
                    bgcolor: images.length >= 5 ? 'action.disabledBackground' : ''
                  }
                }}
              >
                Select Images
                <input
                  type="file"
                  hidden
                  multiple
                  accept="image/*"
                  onChange={handleImageSelect}
                  disabled={images.length >= 5}
                />
              </Button>
              
              <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
                {images.length} of 5 images selected
              </Typography>
            </Box>
            
            {error && (
              <Typography color="error" sx={{ mt: 1 }}>
                {error}
              </Typography>
            )}
            
<Grid container  spacing={2} sx={{ mt: 1 }}>
  {images.map((image, index) => (
    <Grid item key={index}>
      <Box
        sx={{
          position: 'relative',
          width: 150, // or any fixed width you like
          height: 150,
          bgcolor: 'grey.100',
          borderRadius: 1,
          overflow: 'hidden',
          border: '1px solid',
          borderColor: image.status === 'error' ? 'error.main' : 'divider'
        }}
      >
        <img
          src={image.url}
          alt={`Preview ${index}`}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain'
          }}
        />

        {/* Delete Button */}
        <IconButton
          size="small"
          onClick={() => removeImage(index)}
          sx={{
            position: 'absolute',
            top: 4,
            right: 4,
            bgcolor: 'error.main',
            color: 'white',
            '&:hover': {
              bgcolor: 'error.dark'
            }
          }}
        >
          <Delete fontSize="small" />
        </IconButton>

        {/* Uploading Overlay */}
        {image.status === 'uploading' && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'rgba(255,255,255,0.7)'
            }}
          >
            <CircularProgress size={24} />
          </Box>
        )}

        {/* Error Overlay */}
        {image.status === 'error' && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'rgba(255,0,0,0.1)'
            }}
          >
            <Typography variant="caption" color="error">
              Upload Failed
            </Typography>
          </Box>
        )}
      </Box>
    </Grid>
  ))}
</Grid>

            
            <Typography variant="caption" sx={{ mt: 1, display: 'block', color: 'text.secondary' }}>
              Max 5 images. Recommended size: 800x800px. Formats: JPG, PNG, WEBP.
            </Typography>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose} disabled={loading} variant="outlined">
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading || images.some(img => img.status === 'uploading')}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          Submit Review
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddReview;