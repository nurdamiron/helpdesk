import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { ProductNewEditForm } from '../product-new-edit-form';

// ----------------------------------------------------------------------

export function ProductEditView({ product }) {
  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Изменить"
        backHref={paths.dashboard.product.root}
        links={[
          { name: 'Дашборд', href: paths.dashboard.general.file },
          { name: 'Продукт', href: paths.dashboard.product.root },
          { name: product?.name },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <ProductNewEditForm currentProduct={product} />
    </DashboardContent>
  );
}
