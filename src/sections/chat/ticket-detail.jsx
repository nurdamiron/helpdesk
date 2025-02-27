import { useState } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import { useTheme, alpha } from '@mui/material/styles';

import { fDate } from 'src/utils/format-time';
import { Iconify } from 'src/components/iconify';

import { updateTicketStatus } from 'src/actions/chat';

// Priority colors
const getPriorityColor = (priority) => {
  switch(priority) {
    case 'urgent':
      return 'error';
    case 'high':
      return 'warning';
    case 'medium':
      return 'info';
    case 'low':
      return 'success';
    default:
      return 'info';
  }
};

// Status colors
const getStatusColor = (status) => {
  switch(status) {
    case 'new':
      return 'info';
    case 'in_progress':
      return 'warning';
    case 'resolved':
      return 'success';
    case 'closed':
      return 'default';
    default:
      return 'info';
  }
};

// Category labels
const getCategoryLabel = (category) => {
  const categories = {
    'it_support': 'IT поддержка',
    'accounting': 'Бухгалтерия',
    'library': 'Библиотека',
    'student_affairs': 'Студенческий отдел',
    'academic_issues': 'Учебная часть',
    'dormitory': 'Общежитие',
    'scholarship': 'Вопросы стипендий',
    'other': 'Другое'
  };
  
  return categories[category] || 'Другое';
};

export function TicketDetail({ conversation }) {
  const theme = useTheme();
  const [status, setStatus] = useState(conversation?.status || 'new');
  
  // Extract ticket data
  const {
    id,
    subject,
    priority = 'medium',
    category = 'other',
    created_at,
    updated_at,
    messages = [],
    metadata
  } = conversation || {};
  
  // Get requester info from metadata
  const requesterInfo = metadata?.requester || {};
  const {
    full_name = 'Unknown',
    email = '',
    phone = '',
    student_id = '',
    faculty = '',
    preferred_contact = 'email'
  } = requesterInfo;
  
  // Get the first message as description
  const description = messages[0]?.body || 'No description';
  
  const handleStatusChange = async (event) => {
    const newStatus = event.target.value;
    setStatus(newStatus);
    
    try {
      await updateTicketStatus(id, newStatus);
    } catch (error) {
      console.error('Error updating ticket status:', error);
      // Revert status if update fails
      setStatus(conversation?.status || 'new');
    }
  };
  
  if (!conversation) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="subtitle1">No ticket selected</Typography>
      </Box>
    );
  }
  
  return (
    <Box sx={{ p: 3 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
        <Typography variant="h6">Ticket Details</Typography>
        
        <Box>
          <IconButton color="primary" size="small">
            <Iconify icon="solar:printer-bold" />
          </IconButton>
        </Box>
      </Stack>
      
      <Card sx={{ p: 3, mb: 3 }}>
        <Stack spacing={3}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="subtitle1">{subject}</Typography>
            <Chip 
              label={`#${id}`}
              variant="outlined"
              size="small"
            />
          </Stack>
          
          <Divider />
          
          <Stack direction="row" spacing={2}>
            <Chip 
              label={getCategoryLabel(category)}
              color="default"
              size="small"
            />
            
            <Chip 
              label={priority.charAt(0).toUpperCase() + priority.slice(1)}
              color={getPriorityColor(priority)}
              size="small"
            />
            
            <Box flexGrow={1} />
            
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel id="status-select-label">Status</InputLabel>
              <Select
                labelId="status-select-label"
                id="status-select"
                value={status}
                label="Status"
                onChange={handleStatusChange}
              >
                <MenuItem value="new">New</MenuItem>
                <MenuItem value="in_progress">In Progress</MenuItem>
                <MenuItem value="resolved">Resolved</MenuItem>
                <MenuItem value="closed">Closed</MenuItem>
              </Select>
            </FormControl>
          </Stack>
          
          <Divider />
          
          <Box>
            <Typography variant="subtitle2" gutterBottom>Description</Typography>
            <Typography variant="body2">{description}</Typography>
          </Box>
          
          <Divider />
          
          <Box>
            <Typography variant="subtitle2" gutterBottom>Requester Information</Typography>
            
            <Stack spacing={1}>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">Name:</Typography>
                <Typography variant="body2">{full_name}</Typography>
              </Stack>
              
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">Email:</Typography>
                <Typography variant="body2">{email}</Typography>
              </Stack>
              
              {phone && (
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">Phone:</Typography>
                  <Typography variant="body2">{phone}</Typography>
                </Stack>
              )}
              
              {student_id && (
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">Student ID:</Typography>
                  <Typography variant="body2">{student_id}</Typography>
                </Stack>
              )}
              
              {faculty && (
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">Faculty:</Typography>
                  <Typography variant="body2">{faculty}</Typography>
                </Stack>
              )}
              
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">Preferred Contact:</Typography>
                <Typography variant="body2">{preferred_contact}</Typography>
              </Stack>
            </Stack>
          </Box>
          
          <Divider />
          
          <Box>
            <Typography variant="subtitle2" gutterBottom>Ticket Information</Typography>
            
            <Stack spacing={1}>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">Created:</Typography>
                <Typography variant="body2">{fDate(created_at)}</Typography>
              </Stack>
              
              {updated_at && updated_at !== created_at && (
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">Last Updated:</Typography>
                  <Typography variant="body2">{fDate(updated_at)}</Typography>
                </Stack>
              )}
            </Stack>
          </Box>
        </Stack>
      </Card>
      
      <Box sx={{ textAlign: 'right' }}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<Iconify icon="solar:chat-round-dots-bold" />}
        >
          Reply to Ticket
        </Button>
      </Box>
    </Box>
  );
}