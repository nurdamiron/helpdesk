import { useState } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import ListItemText from '@mui/material/ListItemText';
import { useTheme, alpha } from '@mui/material/styles';

import { fToNow } from 'src/utils/format-time';
import { Iconify } from 'src/components/iconify';

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

export function ChatTicketItem({ conversation, selected, onSelectConversation }) {
  const theme = useTheme();
  
  // Extract ticket data from conversation
  const {
    id,
    subject,
    status = 'new',
    priority = 'medium',
    category = 'other',
    created_at,
    updated_at,
    requester_id,
    messages = []
  } = conversation;
  
  // Get requester info from metadata if available
  const requesterInfo = conversation.metadata?.requester || {};
  const requesterName = requesterInfo.full_name || 'Unknown';
  
  // Get the first message as description
  const description = messages[0]?.body || 'No description';
  
  // Format timestamps
  const lastActivityTime = updated_at || created_at;
  const timeLabel = lastActivityTime ? fToNow(lastActivityTime) : '';
  
  return (
    <Card
      sx={{
        p: 2,
        mb: 2,
        cursor: 'pointer',
        transition: theme.transitions.create('all'),
        borderColor: 'divider',
        ...(selected && {
          boxShadow: theme.customShadows.z20,
          borderColor: 'transparent',
          bgcolor: alpha(theme.palette.primary.main, 0.08),
        }),
      }}
      onClick={() => onSelectConversation(id)}
    >
      <Stack direction="row" spacing={2} alignItems="flex-start">
        <Avatar
          alt={requesterName}
          src={null}
          sx={{ 
            width: 48, 
            height: 48,
            bgcolor: () => alpha(theme.palette.primary.main, 0.8)
          }}
        >
          {requesterName.charAt(0).toUpperCase()}
        </Avatar>
        
        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
            <Typography variant="subtitle2" noWrap>
              {subject}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.disabled', flexShrink: 0 }}>
              {timeLabel}
            </Typography>
          </Stack>
          
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 0.5 }}>
            <Chip 
              size="small" 
              label={getCategoryLabel(category)}
              sx={{ fontSize: '0.75rem', height: 20 }}
            />
            
            <Chip 
              size="small" 
              color={getPriorityColor(priority)}
              label={priority.charAt(0).toUpperCase() + priority.slice(1)}
              sx={{ fontSize: '0.75rem', height: 20 }}
            />
            
            <Chip 
              size="small"
              color={getStatusColor(status)}
              label={status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
              sx={{ fontSize: '0.75rem', height: 20 }}
            />
          </Stack>
          
          <Typography
            noWrap
            variant="body2"
            sx={{
              mt: 0.5,
              color: 'text.secondary',
              ...(selected && { color: 'text.primary' }),
            }}
          >
            {requesterName}: {description}
          </Typography>
        </Box>
      </Stack>
    </Card>
  );
}