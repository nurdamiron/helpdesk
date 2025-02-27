import { useState } from 'react';
import { varAlpha } from 'minimal-shared/utils';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import Grid from '@mui/material/Grid';
import FormHelperText from '@mui/material/FormHelperText';
import Alert from '@mui/material/Alert';

import { DashboardContent } from 'src/layouts/dashboard';
import { createTicket } from 'src/actions/chat';

// University department categories
const TICKET_CATEGORIES = [
  { value: 'it_support', label: 'IT поддержка' },
  { value: 'accounting', label: 'Бухгалтерия' },
  { value: 'library', label: 'Библиотека' },
  { value: 'student_affairs', label: 'Студенческий отдел' },
  { value: 'academic_issues', label: 'Учебная часть' },
  { value: 'dormitory', label: 'Общежитие' },
  { value: 'scholarship', label: 'Вопросы стипендий' },
  { value: 'other', label: 'Другое' }
];

// Ticket priority options
const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Низкий' },
  { value: 'medium', label: 'Средний' },
  { value: 'high', label: 'Высокий' },
  { value: 'urgent', label: 'Срочный' }
];

export function BlankView({ title = 'Заявки', sx }) {
  const [formData, setFormData] = useState({
    // Ticket information
    subject: '',
    description: '',
    category: '',
    priority: 'medium',
    
    // Requester information
    fullName: '',
    email: '',
    phone: '',
    studentId: '',
    faculty: '',
    preferredContact: 'email'
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    // Basic validation
    if (!formData.subject || !formData.description || !formData.fullName || !formData.email) {
      setError('Пожалуйста, заполните все обязательные поля');
      return;
    }
  
    try {
      setLoading(true);
  
      const ticketData = {
        subject: formData.subject,
        description: formData.description,
        category: formData.category,
        priority: formData.priority,
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        studentId: formData.studentId,
        faculty: formData.faculty,
        preferredContact: formData.preferredContact
      };
  
      const response = await createTicket(ticketData);
      
      setSuccess(`Заявка #${response.conversation.id} успешно создана! Мы свяжемся с вами в ближайшее время.`);
      
      // Reset form
      setFormData({
        subject: '',
        description: '',
        category: '',
        priority: 'medium',
        fullName: '',
        email: '',
        phone: '',
        studentId: '',
        faculty: '',
        preferredContact: 'email'
      });
    } catch (err) {
      console.error('Ошибка при создании тикета:', error);
      setError(error.response?.data?.error || 'Произошла ошибка при создании заявки');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardContent maxWidth="xl">
      <Typography variant="h4" sx={{ mb: 3 }}>
        {title}
      </Typography>

      <Box
        sx={[
          (theme) => ({
            mt: 3,
            width: 1,
            borderRadius: 2,
            border: `solid 1px ${theme.vars.palette.divider}`,
            bgcolor: 'background.paper',
            p: 3,
            boxShadow: theme.shadows[1]
          }),
          ...(Array.isArray(sx) ? sx : [sx]),
        ]}
      >
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {success}
          </Alert>
        )}

        <form onSubmit={handleCreateTicket}>
          <Grid container spacing={3}>
            {/* Ticket Information Section */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 1 }}>
                Информация о заявке
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={8}>
              <TextField
                fullWidth
                label="Тема заявки"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
                helperText="Кратко опишите суть проблемы"
              />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <FormControl fullWidth required>
                <InputLabel>Категория</InputLabel>
                <Select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  label="Категория"
                >
                  {TICKET_CATEGORIES.map((category) => (
                    <MenuItem key={category.value} value={category.value}>
                      {category.label}
                    </MenuItem>
                  ))}
                </Select>
                <FormHelperText>Выберите отдел для обработки заявки</FormHelperText>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={8}>
              <TextField
                fullWidth
                label="Подробное описание"
                name="description"
                value={formData.description}
                onChange={handleChange}
                multiline
                rows={4}
                required
                helperText="Опишите вашу проблему как можно подробнее"
              />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Приоритет</InputLabel>
                <Select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  label="Приоритет"
                >
                  {PRIORITY_OPTIONS.map((priority) => (
                    <MenuItem key={priority.value} value={priority.value}>
                      {priority.label}
                    </MenuItem>
                  ))}
                </Select>
                <FormHelperText>Насколько срочно требуется решение</FormHelperText>
              </FormControl>
            </Grid>

            {/* Requester Information Section */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 1, mt: 2 }}>
                Ваши контактные данные
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="ФИО"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
                helperText="Укажите ваше полное имя"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                helperText="На этот адрес будут приходить уведомления"
              />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Номер телефона"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                helperText="Альтернативный способ связи"
              />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Студенческий ID"
                name="studentId"
                value={formData.studentId}
                onChange={handleChange}
                helperText="Номер студенческого билета (если применимо)"
              />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Факультет/Кафедра"
                name="faculty"
                value={formData.faculty}
                onChange={handleChange}
                helperText="Укажите ваш факультет или кафедру"
              />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Предпочитаемый способ связи</InputLabel>
                <Select
                  name="preferredContact"
                  value={formData.preferredContact}
                  onChange={handleChange}
                  label="Предпочитаемый способ связи"
                >
                  <MenuItem value="email">Email</MenuItem>
                  <MenuItem value="phone">Телефон</MenuItem>
                </Select>
                <FormHelperText>Как с вами лучше связаться</FormHelperText>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={loading}
                sx={{ mt: 2 }}
              >
                {loading ? 'Отправка...' : 'Отправить заявку'}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Box>
    </DashboardContent>
  );
}