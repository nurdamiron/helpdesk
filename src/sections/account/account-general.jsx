// account-general.jsx

import { z as zod } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { isValidPhoneNumber } from 'react-phone-number-input/input';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid2';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';

import { fData } from 'src/utils/format-number';
import { toast } from 'src/components/snackbar';
import { Form, Field, schemaHelper } from 'src/components/hook-form';

import { useMockedEmployee } from 'src/auth/hooks';

// ----------------------------------------------------------------------

// Схема "аккаунта" (пример, если нужна отдельная)
export const UpdateEmployeeSchema = zod.object({
  displayName: zod.string().min(1, { message: 'Name is required!' }),
  email: zod
    .string()
    .min(1, { message: 'Email is required!' })
    .email({ message: 'Email must be a valid email address!' }),
  photoURL: schemaHelper.file({ message: 'Avatar is required!' }),
  phoneNumber: schemaHelper.phoneNumber({ isValid: isValidPhoneNumber }),
  country: schemaHelper.nullableInput(zod.string().min(1, { message: 'Country is required!' }), {
    message: 'Country is required!',
  }),
  address: zod.string().min(1, { message: 'Address is required!' }),
  state: zod.string().min(1, { message: 'State is required!' }),
  city: zod.string().min(1, { message: 'City is required!' }),
  zipCode: zod.string().min(1, { message: 'Zip code is required!' }),
  about: zod.string().min(1, { message: 'About is required!' }),
  // Можно добавить поля isPublic и т.д.
  isPublic: zod.boolean(),
});

// ----------------------------------------------------------------------

/**
 * Пример формы для "General" настроек аккаунта сотрудника (mock).
 */
export function AccountGeneral() {
  const { employee } = useMockedEmployee();

  // Инициируем данные для формы, если есть employee
  const currentEmployee = {
    displayName: employee?.displayName,
    email: employee?.email,
    photoURL: employee?.photoURL,
    phoneNumber: employee?.phoneNumber,
    country: employee?.country,
    address: employee?.address,
    state: employee?.state,
    city: employee?.city,
    zipCode: employee?.zipCode,
    about: employee?.about,
    isPublic: employee?.isPublic,
  };

  const defaultValues = {
    displayName: '',
    email: '',
    photoURL: null,
    phoneNumber: '',
    country: null,
    address: '',
    state: '',
    city: '',
    zipCode: '',
    about: '',
    isPublic: false,
  };

  // useForm
  const methods = useForm({
    mode: 'all',
    resolver: zodResolver(UpdateEmployeeSchema),
    defaultValues,
    values: currentEmployee,
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  // Сабмит (имитация)
  const onSubmit = handleSubmit(async (data) => {
    try {
      // Здесь реальный запрос PUT/PATCH к серверу
      await new Promise((resolve) => setTimeout(resolve, 500));
      toast.success('Update success!');
      console.info('DATA', data);
    } catch (error) {
      console.error(error);
    }
  });

  return (
    <Form methods={methods} onSubmit={onSubmit}>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card
            sx={{
              pt: 10,
              pb: 5,
              px: 3,
              textAlign: 'center',
            }}
          >
            <Field.UploadAvatar
              name="photoURL"
              maxSize={3145728}
              helperText={
                <Typography
                  variant="caption"
                  sx={{
                    mt: 3,
                    mx: 'auto',
                    display: 'block',
                    textAlign: 'center',
                    color: 'text.disabled',
                  }}
                >
                  Allowed *.jpeg, *.jpg, *.png, *.gif
                  <br /> max size of {fData(3145728)}
                </Typography>
              }
            />

            <Field.Switch
              name="isPublic"
              labelPlacement="start"
              label="Public profile"
              sx={{ mt: 5 }}
            />

            <Button variant="soft" color="error" sx={{ mt: 3 }}>
              Delete employee
            </Button>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 8 }}>
          <Card sx={{ p: 3 }}>
            <Box
              sx={{
                rowGap: 3,
                columnGap: 2,
                display: 'grid',
                gridTemplateColumns: { xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)' },
              }}
            >
              <Field.Text name="displayName" label="ФИО" />
              <Field.Text name="email" label="Эл. почта" />
              <Field.Phone name="phoneNumber" label="Номер телефона" />
              <Field.Text name="address" label="Адрес" />

              {/* Например, label="Страна" вместо "Отдел" */}
              <Field.CountrySelect name="country" label="Страна" placeholder="Выберите страну" />

              <Field.Text name="state" label="Область/Регион" />
              <Field.Text name="city" label="Город" />
              <Field.Text name="zipCode" label="Индекс" />
            </Box>

            <Stack spacing={3} sx={{ mt: 3, alignItems: 'flex-end' }}>
              <Field.Text name="about" multiline rows={4} label="About" />

              <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
                Сохранить изменения
              </LoadingButton>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </Form>
  );
}
