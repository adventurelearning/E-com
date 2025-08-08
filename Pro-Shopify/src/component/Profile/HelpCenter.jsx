import React, { useState } from 'react';
import { 
  Container, 
  Typography, 
  Accordion, 
  AccordionSummary, 
  AccordionDetails, 
  Box, 
  TextField, 
  Button,
  Grid,
  Paper,
  Avatar,
  Divider,
  Chip,
  useMediaQuery,
  useTheme,
  Fade,
  Slide,
  Grow,
  Zoom
} from '@mui/material';
import { 
  ExpandMore, 
  Send, 
  Phone, 
  Email, 
  LiveHelp, 
  CheckCircle,
  ShoppingCart,
  Payment,
  LocalShipping,
  AssignmentReturn,
  Search,
  Chat,
  Info,
  SupportAgent
} from '@mui/icons-material';

const HelpCenter = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [expanded, setExpanded] = useState(null);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleAccordionChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : null);
  };

  const handleContactChange = (e) => {
    const { name, value } = e.target;
    setContactForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate form submission
    setTimeout(() => {
      console.log('Contact form submitted:', contactForm);
      setSubmitSuccess(true);
      setContactForm({
        name: '',
        email: '',
        message: ''
      });
      setTimeout(() => setSubmitSuccess(false), 5000);
    }, 1000);
  };

  const faqs = [
    {
      question: 'How do I place an order?',
      answer: 'To place an order, simply browse our products, add items to your cart, and proceed to checkout. You\'ll need to provide shipping information and payment details to complete your purchase.',
      icon: <ShoppingCart color="error" />
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and bank transfers. All payments are processed securely.',
      icon: <Payment color="error" />
    },
    {
      question: 'How can I track my order?',
      answer: 'Once your order has shipped, you\'ll receive a tracking number via email. You can use this number on our website or the carrier\'s website to track your package.',
      icon: <LocalShipping color="error" />
    },
    {
      question: 'What is your return policy?',
      answer: 'We offer a 30-day return policy for most items. Items must be unused and in their original packaging. Please contact our customer service to initiate a return.',
      icon: <AssignmentReturn color="error" />
    },
    {
      question: 'How do I contact customer support?',
      answer: 'You can reach our customer support team 24/7 through the contact form below, by email at support@example.com, or by phone at +1 (800) 123-4567.',
      icon: <LiveHelp color="error" />
    }
  ];

  const popularTopics = [
    { title: 'Order Status', icon: <LocalShipping color="error" />, color: '#4caf50' },
    { title: 'Shipping Info', icon: <LocalShipping color="error" />, color: '#2196f3' },
    { title: 'Returns & Exchanges', icon: <AssignmentReturn color="error" />, color: '#ff9800' },
    { title: 'Payment Options', icon: <Payment color="error" />, color: '#9c27b0' }
  ];

  const filteredFaqs = faqs.filter(faq => 
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Hero Section */}
      <Slide direction="down" in timeout={500}>
        <Box sx={{ 
          bgcolor: 'primary.main', 
          color: 'white', 
          p: isMobile ? 3 : 4, 
          borderRadius: 2,
          mb: 4,
          textAlign: 'center',
          backgroundImage: 'linear-gradient(135deg, #d10024 0%, #b10024 100%)',
          boxShadow: 3
        }}>
          <Typography variant={isMobile ? 'h4' : 'h3'} component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
            How can we help you?
          </Typography>
          <Typography variant={isMobile ? 'body1' : 'h6'} sx={{ mb: 3 }}>
            We're here to help with any questions or issues you might have.
          </Typography>
          <Box sx={{ maxWidth: '600px', mx: 'auto' }}>
            <TextField
              placeholder="Search help articles..."
              variant="outlined"
              fullWidth
              value={searchQuery}
              onChange={handleSearchChange}
              sx={{ 
                bgcolor: 'white',
                borderRadius: 1,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 1
                }
              }}
              InputProps={{
                startAdornment: (
                  <Box sx={{ color: 'text.secondary', mr: 1 }}>
                    <Search />
                  </Box>
                )
              }}
            />
          </Box>
        </Box>
      </Slide>

      {/* Popular Topics */}
      <Fade in timeout={800}>
        <Box sx={{ mb: 6 }}>
          <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'medium', mb: 3 }}>
            Popular Topics
          </Typography>
          <Grid container spacing={2}>
            {popularTopics.map((topic, index) => (
              <Grow in timeout={800 + (index * 200)} key={index}>
                <Grid item xs={12} sm={6} md={3}>
                  <Paper 
                    elevation={3} 
                    sx={{ 
                      p: 3, 
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      textAlign: 'center',
                      transition: 'transform 0.3s, box-shadow 0.3s',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: 6,
                        borderLeft: `4px solid ${topic.color}`
                      },
                      borderLeft: '4px solid transparent'
                    }}
                  >
                    <Avatar sx={{ bgcolor: `${topic.color}20`, color: topic.color, mb: 2 }}>
                      {topic.icon}
                    </Avatar>
                    <Typography variant="h6" sx={{ fontWeight: 'medium' }}>
                      {topic.title}
                    </Typography>
                    {/* <Button 
                      size="small" 
                      sx={{ mt: 2, color: topic.color }}
                      endIcon={<Info />}
                    >
                      Learn more
                    </Button> */}
                  </Paper>
                </Grid>
              </Grow>
            ))}
          </Grid>
        </Box>
      </Fade>

      {/* FAQ Section */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'medium', mb: 3 }}>
          Frequently Asked Questions
        </Typography>
        
        {filteredFaqs.length > 0 ? (
          filteredFaqs.map((faq, index) => (
            <Zoom in timeout={500} key={index}>
              <Accordion 
                expanded={expanded === `panel${index}`} 
                onChange={handleAccordionChange(`panel${index}`)}
                sx={{ 
                  mb: 1,
                  borderRadius: '8px !important',
                  overflow: 'hidden',
                  '&:before': {
                    display: 'none'
                  },
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    boxShadow: 2
                  }
                }}
              >
                <AccordionSummary 
                  expandIcon={<ExpandMore />}
                  sx={{
                    bgcolor: expanded === `panel${index}` ? 'action.selected' : 'background.paper',
                    '&:hover': {
                      bgcolor: 'action.hover'
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
                    {faq.icon}
                  </Box>
                  <Typography sx={{ fontWeight: 'medium' }}>{faq.question}</Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ bgcolor: 'background.default' }}>
                  <Typography>{faq.answer}</Typography>
                </AccordionDetails>
              </Accordion>
            </Zoom>
          ))
        ) : (
          <Paper elevation={0} sx={{ p: 3, textAlign: 'center', bgcolor: 'action.hover' }}>
            <Typography variant="body1" color="text.secondary">
              No results found for "{searchQuery}". Try different keywords.
            </Typography>
          </Paper>
        )}
      </Box>

      {/* Contact Form Section */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'medium', mb: 3 }}>
          Contact Our Support Team
        </Typography>
        
        <Grid container spacing={isMobile ? 2 : 4}>
          <Grid item xs={12} md={6}>
            <Fade in timeout={800}>
              <Paper elevation={3} sx={{ 
                p: isMobile ? 2 : 4, 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                borderRadius: 2
              }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'medium', mb: 3 }}>
                  Send us a message
                </Typography>
                <Box 
                  component="form" 
                  onSubmit={handleSubmit}
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2,
                    flex: 1
                  }}
                >
                  <TextField
                    required
                    fullWidth
                    label="Your Name"
                    name="name"
                    value={contactForm.name}
                    onChange={handleContactChange}
                    variant="outlined"
                    size={isMobile ? 'small' : 'medium'}
                  />
                  
                  <TextField
                    required
                    fullWidth
                    label="Email Address"
                    name="email"
                    type="email"
                    value={contactForm.email}
                    onChange={handleContactChange}
                    variant="outlined"
                    size={isMobile ? 'small' : 'medium'}
                  />
                  
                  <TextField
                    required
                    fullWidth
                    label="Your Message"
                    name="message"
                    value={contactForm.message}
                    onChange={handleContactChange}
                    multiline
                    rows={isMobile ? 3 : 4}
                    variant="outlined"
                    size={isMobile ? 'small' : 'medium'}
                  />
                  
                  <Box sx={{ mt: 'auto', display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      size={isMobile ? 'medium' : 'large'}
                      endIcon={<Send />}
                      sx={{ 
                        px: 4,
                        flexShrink: 0
                      }}
                    >
                      Send Message
                    </Button>

                    {submitSuccess && (
                      <Chip
                        icon={<CheckCircle fontSize="small" />}
                        label="Message sent!"
                        color="success"
                        variant="outlined"
                        sx={{ height: 'auto', py: 0.5 }}
                      />
                    )}
                  </Box>
                </Box>
              </Paper>
            </Fade>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Fade in timeout={1000}>
              <Paper elevation={3} sx={{ 
                p: isMobile ? 2 : 4, 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                borderRadius: 2
              }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'medium', mb: 3 }}>
                  Other Ways to Reach Us
                </Typography>
                
                <Box sx={{ mb: 4, flex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 3 }}>
                    <Avatar sx={{ bgcolor: 'error.main', color: 'white', mr: 2 }}>
                      <SupportAgent />
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>Phone Support</Typography>
                      <Typography variant="body1">+91 00000-00000</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Available 24/7
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 3 }}>
                    <Avatar sx={{ bgcolor: 'error.main', color: 'white', mr: 2 }}>
                      <Email />
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>Email Us</Typography>
                      <Typography variant="body1">Adventure.support@gmail.com</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Typically respond within 24 hours
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                    <Avatar sx={{ bgcolor: 'error.main', color: 'white', mr: 2 }}>
                      <Chat />
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>Live Chat</Typography>
                      <Typography variant="body1">Click the chat icon</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Available Mon-Fri, 9am-5pm EST
                      </Typography>
                    </Box>
                  </Box>
                </Box>
                
                <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                  "Our customer service team is committed to providing you with the best support experience."
                </Typography>
              </Paper>
            </Fade>
          </Grid>
        </Grid>
      </Box>

      {/* Helpful Resources */}
      <Fade in timeout={1200}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'medium', mb: 3 }}>
            Helpful Resources
          </Typography>
          <Grid container spacing={2} justifyContent="center">
            {['Shipping Information', 'Return Policy', 'Size Guide', 'Product Care'].map((item, index) => (
              <Grid item key={index}>
                <Button 
                  variant="outlined" 
                  color="primary" 
                  size={isMobile ? 'medium' : 'large'}
                  sx={{ 
                    borderRadius: 2,
                    textTransform: 'none',
                    px: 3
                  }}
                >
                  {item}
                </Button>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Fade>
    </Container>
  );
};

export default HelpCenter;