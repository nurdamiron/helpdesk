import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Stack,
  Checkbox,
  FormControlLabel,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
} from '@mui/material';
import { toast } from 'src/components/snackbar';
import axiosInstance, { endpoints } from 'src/lib/axios';

export function InvoiceCustomer({ open, onClose, onSave, currentCustomer }) {
  const isEditMode = Boolean(currentCustomer);

  // Здесь — расширенные поля, аналогичные "InvoiceSupplier"
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone_number: '',
    address: '',
    company_type: '',
    bin_iin: '',
    bank_name: '',
    bank_bik: '',
    iik: '',
    kbe: '',
    knp: '',
    is_resident: true,
    additional_info: '',
  });

  // При открытии / смене currentCustomer заполняем или очищаем форму
  useEffect(() => {
    if (isEditMode && currentCustomer) {
      setFormData({
        name: currentCustomer.name || '',
        email: currentCustomer.email || '',
        phone_number: currentCustomer.phone_number || '',
        address: currentCustomer.address || '',
        company_type: currentCustomer.company_type || '',
        bin_iin: currentCustomer.bin_iin || '',
        bank_name: currentCustomer.bank_name || '',
        bank_bik: currentCustomer.bank_bik || '',
        iik: currentCustomer.iik || '',
        kbe: currentCustomer.kbe || '',
        knp: currentCustomer.knp || '',
        is_resident:
          currentCustomer.is_resident !== undefined
            ? currentCustomer.is_resident
            : true,
        // Если additional_info хранится в БД как JSON, преобразуем в строку
        additional_info: currentCustomer.additional_info
          ? JSON.stringify(currentCustomer.additional_info)
          : '',
      });
    } else {
      // Нового клиента создаём
      setFormData({
        name: '',
        email: '',
        phone_number: '',
        address: '',
        company_type: '',
        bin_iin: '',
        bank_name: '',
        bank_bik: '',
        iik: '',
        kbe: '',
        knp: '',
        is_resident: true,
        additional_info: '',
      });
    }
  }, [isEditMode, currentCustomer]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Сабмитим форму: создаём (POST) или обновляем (PUT)
  const handleSubmit = async () => {
    // Простейшая валидация, обязательны поля: name, email, phone_number, address
    if (!formData.name || !formData.email || !formData.phone_number || !formData.address) {
      toast.error('Пожалуйста, заполните поля (Имя, Email, Телефон, Адрес).');
      return;
    }

    try {
      // Преобразуем доп. инфу из строки в JSON (если пользователь ввёл что-то)
      let additionalInfoParsed = null;
      if (formData.additional_info.trim()) {
        try {
          additionalInfoParsed = JSON.parse(formData.additional_info);
        } catch (err) {
          toast.error('Поле "Доп. информация" содержит некорректный JSON');
          return;
        }
      }

      const payload = {
        ...formData,
        additional_info: additionalInfoParsed,
      };

      // Если редактируем
      if (isEditMode) {
        await axiosInstance.put(
          `${endpoints.customer.update}/${currentCustomer.id}`,
          payload
        );
        toast.success('Клиент успешно обновлён!');
      } else {
        // Создаём
        await axiosInstance.post(endpoints.customer.create, payload);
        toast.success('Клиент успешно создан!');
      }

      onSave();   // уведомим родительский компонент (например, чтобы обновить список)
      onClose();  // закроем окно
    } catch (error) {
      console.error('Ошибка при сохранении клиента:', error);
      toast.error('Произошла ошибка при сохранении клиента');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEditMode ? 'Редактировать клиента' : 'Новый клиент'}</DialogTitle>

      <DialogContent dividers>
        <Stack spacing={2}>
          <TextField
            label="Имя / Название (обязательно)"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
          />
          <TextField
            label="E-mail (обязательно)"
            type="email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
          />
          <TextField
            label="Телефон (обязательно)"
            value={formData.phone_number}
            onChange={(e) => handleChange('phone_number', e.target.value)}
          />
          <TextField
            label="Адрес (обязательно)"
            value={formData.address}
            onChange={(e) => handleChange('address', e.target.value)}
          />

          <FormControl fullWidth>
            <InputLabel>Тип организации</InputLabel>
            <Select
              label="Тип организации"
              value={formData.company_type}
              onChange={(e) => handleChange('company_type', e.target.value)}
            >
              <MenuItem value="ИП">ИП — Индивидуальный предприниматель</MenuItem>
              <MenuItem value="ТОО">ТОО — Товарищество с ограниченной ответственностью</MenuItem>
              <MenuItem value="АО">АО — Акционерное общество</MenuItem>
              <MenuItem value="ПК">ПК — Производственный кооператив</MenuItem>
              <MenuItem value="ГП">ГП — Государственное предприятие</MenuItem>
              <MenuItem value="Ф">Ф — Фонд</MenuItem>
              <MenuItem value="ФП">ФП — Филиал/Представительство</MenuItem>
            </Select>
          </FormControl>

          <TextField
            label="БИН/ИИН"
            value={formData.bin_iin}
            onChange={(e) => handleChange('bin_iin', e.target.value)}
          />
          <TextField
            label="Название банка"
            value={formData.bank_name}
            onChange={(e) => handleChange('bank_name', e.target.value)}
          />
          <TextField
            label="БИК (банка)"
            value={formData.bank_bik}
            onChange={(e) => handleChange('bank_bik', e.target.value)}
          />
          <TextField
            label="ИИК"
            value={formData.iik}
            onChange={(e) => handleChange('iik', e.target.value)}
          />
          <TextField
            label="КБЕ"
            value={formData.kbe}
            onChange={(e) => handleChange('kbe', e.target.value)}
          />
          <TextField
            label="КНП"
            value={formData.knp}
            onChange={(e) => handleChange('knp', e.target.value)}
          />

          <FormControlLabel
            label="Является резидентом?"
            control={
              <Checkbox
                checked={formData.is_resident}
                onChange={(e) => handleChange('is_resident', e.target.checked)}
              />
            }
          />

          <TextField
            label="Доп. информация (JSON)"
            multiline
            rows={3}
            value={formData.additional_info}
            onChange={(e) => handleChange('additional_info', e.target.value)}
            helperText="Доп. поля в формате JSON"
          />
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button color="inherit" onClick={onClose}>
          Отмена
        </Button>
        <Button variant="contained" onClick={handleSubmit}>
          Сохранить
        </Button>
      </DialogActions>
    </Dialog>
  );
}
