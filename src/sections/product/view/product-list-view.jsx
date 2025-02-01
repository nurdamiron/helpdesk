import { useBoolean, useSetState } from 'minimal-shared/hooks';
import { useState, useEffect, useRef, forwardRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';


import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import {
  DataGrid,
  gridClasses,
  GridToolbarExport,
  GridActionsCellItem,
  GridToolbarContainer,
  GridToolbarQuickFilter,
  GridToolbarFilterButton,
  GridToolbarColumnsButton,
} from '@mui/x-data-grid';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { PRODUCT_STOCK_OPTIONS } from 'src/_mock';
import { useGetProducts } from 'src/actions/product';
import { DashboardContent } from 'src/layouts/dashboard';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { EmptyContent } from 'src/components/empty-content';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { ProductTableToolbar } from '../product-table-toolbar';
import { ProductTableFiltersResult } from '../product-table-filters-result';
import {
  RenderCellStock,
  RenderCellPrice,
  RenderCellPublish,
  RenderCellProduct,
  RenderCellCreatedAt,
} from '../product-table-row';

// ----------------------------------------------------------------------

const PUBLISH_OPTIONS = [
  { value: 'published', label: 'В наличии' },
  { value: 'draft', label: 'Нету в наличии' },
];

const WS_URL = import.meta.env ? import.meta.env.VITE_WS_URL : 'wss://biz360-backend.onrender.com/ws';


const HIDE_COLUMNS = { category: false };

const HIDE_COLUMNS_TOGGLABLE = ['category', 'actions'];

// ----------------------------------------------------------------------

export function ProductListView() {
  const ws = useRef(null);
  const confirmDialog = useBoolean();
  
  const { products, productsLoading, productsError } = useGetProducts();

  const [tableData, setTableData] = useState([]);
  const [selectedRowIds, setSelectedRowIds] = useState([]);
  const [filterButtonEl, setFilterButtonEl] = useState(null);

  const filters = useSetState({ publish: [], stock: [] });
  const { state: currentFilters } = filters;

  const [columnVisibilityModel, setColumnVisibilityModel] = useState(HIDE_COLUMNS);


  useEffect(() => {
    if (products?.products && Array.isArray(products.products)) {
      console.log('Setting table data:', products.products);
      setTableData(products.products);
    }
  }, [products]);


  useEffect(() => {
    let isComponentMounted = true;
  
    const connectWebSocket = () => {
      ws.current = new WebSocket(WS_URL);
  
      ws.current.onopen = () => {
        if (isComponentMounted) {
          console.log('WebSocket Connected');
        }
      };
  
      ws.current.onmessage = (event) => {
        if (isComponentMounted) {
          try {
            const updatedProduct = JSON.parse(event.data);
            setTableData(prevData =>
              prevData.map(product =>
                product.id === updatedProduct.id ? updatedProduct : product
              )
            );
          } catch (error) {
            console.error('WebSocket message parsing error:', error);
          }
        }
      };
  
      ws.current.onclose = () => {
        if (isComponentMounted) {
          setTimeout(connectWebSocket, 5000);
        }
      };

      ws.current.onerror = (error) => {
        console.error('WebSocket Error:', error);
      };
    };
  
    connectWebSocket();
  
    return () => {
      isComponentMounted = false;
      if (ws.current?.readyState === WebSocket.OPEN) {
        ws.current.close();
      }
    };
  }, []);
  

  
  const canReset = currentFilters.publish.length > 0 || currentFilters.stock.length > 0;

  const dataFiltered = applyFilter({
    inputData: tableData,
    filters: currentFilters,
  });

  const handleDeleteRow = useCallback(
    (id) => {
      const deleteRow = tableData.filter((row) => row.id !== id);

      toast.success('Delete success!');

      setTableData(deleteRow);
    },
    [tableData]
  );

  const handleDeleteRows = useCallback(() => {
    const deleteRows = tableData.filter((row) => !selectedRowIds.includes(row.id));

    toast.success('Delete success!');

    setTableData(deleteRows);
  }, [selectedRowIds, tableData]);

  const CustomToolbarCallback = useCallback(
    () => (
      <CustomToolbar
        filters={filters}
        canReset={canReset}
        selectedRowIds={selectedRowIds}
        setFilterButtonEl={setFilterButtonEl}
        filteredResults={dataFiltered.length}
        onOpenConfirmDeleteRows={confirmDialog.onTrue}
      />
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentFilters, selectedRowIds]
  );

  const columns = [
    { field: 'category', headerName: 'Category', filterable: false },
    {
      field: 'name',
      headerName: 'Название',
      flex: 1,
      minWidth: 200,
      hideable: false,
      renderCell: (params) => (
        <RenderCellProduct params={params} href={paths.dashboard.product.details(params.row.id)} />
      ),
    },
    
    {
      field: 'inventoryType',
      headerName: 'Наличие',
      width: 150,
      type: 'singleSelect',
      valueOptions: PRODUCT_STOCK_OPTIONS,
      renderCell: (params) => <RenderCellStock params={params} />,
    },
    {
      field: 'price',
      headerName: 'Стоимость',
      width: 160,
      editable: true,
      renderCell: (params) => <RenderCellPrice params={params} />,
    },
    {
      field: 'createdAt',
      headerName: 'Создан',
      width: 160,
      renderCell: (params) => <RenderCellCreatedAt params={params} />,
    },
    {
      field: 'publish',
      headerName: 'Статус',
      width: 110,
      type: 'singleSelect',
      editable: true,
      valueOptions: PUBLISH_OPTIONS,
      renderCell: (params) => <RenderCellPublish params={params} />,
    },
    {
      type: 'actions',
      field: 'actions',
      headerName: ' ',
      align: 'right',
      headerAlign: 'right',
      width: 40,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      getActions: (params) => [
        <GridActionsLinkItem
          showInMenu
          icon={<Iconify icon="solar:eye-bold" />}
          label="Посмотреть"
          href={paths.dashboard.product.details(params.row.id)}
        />,
        <GridActionsLinkItem
          showInMenu
          icon={<Iconify icon="solar:pen-bold" />}
          label="Изменить"
          href={paths.dashboard.product.edit(params.row.id)}
        />,
        <GridActionsCellItem
          showInMenu
          icon={<Iconify icon="solar:trash-bin-trash-bold" />}
          label="Удалить"
          onClick={() => handleDeleteRow(params.row.id)}
          sx={{ color: 'error.main' }}
        />,
      ],
    },
  ];

  const getTogglableColumns = () =>
    columns
      .filter((column) => !HIDE_COLUMNS_TOGGLABLE.includes(column.field))
      .map((column) => column.field);

  const renderConfirmDialog = () => (
    <ConfirmDialog
      open={confirmDialog.value}
      onClose={confirmDialog.onFalse}
      title="Удалить"
      content={
        <>
          Вы уверены, что хотите удалить <strong> {selectedRowIds.length} </strong> предметы?
        </>
      }
      action={
        <Button
          variant="contained"
          color="error"
          onClick={() => {
            handleDeleteRows();
            confirmDialog.onFalse();
          }}
        >
          Удалить
        </Button>
      }
    />
  );

  

  useEffect(() => {
    setTableData(products);
  }, [products]);
  
  // if (!products || products.length === 0) {
  //   return <EmptyContent title="Нет данных" />;
  // }

  if (productsLoading) {
    return (
      <DashboardContent>
        <EmptyContent title="Загрузка данных..." />
      </DashboardContent>
    );
  }
  
  if (!tableData || tableData.length === 0) {
    const emptyMessage = productsError ? 'Ошибка загрузки данных' : 'Нет данных для отображения';
    return (
      <DashboardContent>
        <CustomBreadcrumbs
          heading="Список"
          links={[
            { name: 'Дэшборд', href: paths.dashboard.general.file },
            { name: 'Продукты', href: paths.dashboard.product.root },
            { name: 'Список' },
          ]}
          action={
            <Button
              component={RouterLink}
              href={paths.dashboard.product.new}
              variant="contained"
              startIcon={<Iconify icon="mingcute:add-line" />}
            >
              Новый продукт
            </Button>
          }
        />
        <EmptyContent 
          title={emptyMessage}
          description={productsError?.message} 
        />
      </DashboardContent>
    );
  }
  
  if (productsError) {
    return (
      <DashboardContent>
        <EmptyContent 
          title="Ошибка загрузки данных" 
          description={productsError.message || 'Произошла ошибка при загрузке продуктов'}
        />
      </DashboardContent>
    );
  }

  if (!Array.isArray(tableData) || tableData.length === 0) {
    return (
      <DashboardContent>
        <CustomBreadcrumbs
          heading="Список"
          links={[
            { name: 'Дэшборд', href: paths.dashboard.general.file },
            { name: 'Продукты', href: paths.dashboard.product.root },
            { name: 'Список' },
          ]}
          action={
            <Button
              component={RouterLink}
              href={paths.dashboard.product.new}
              variant="contained"
              startIcon={<Iconify icon="mingcute:add-line" />}
            >
              Новый продукт
            </Button>
          }
        />
        <EmptyContent title="Нет данных для отображения" />
      </DashboardContent>
    );
  }

  
  return (
    <>
      <DashboardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <CustomBreadcrumbs
          heading="Список"
          links={[
            { name: 'Дэшборд', href: paths.dashboard.general.file },
            { name: 'Продукты', href: paths.dashboard.product.root },
            { name: 'Список' },
          ]}
          action={
            <Button
              component={RouterLink}
              href={paths.dashboard.product.new}
              variant="contained"
              startIcon={<Iconify icon="mingcute:add-line" />}
            >
              Новый продукт
            </Button>
          }
          sx={{ mb: { xs: 3, md: 5 } }}
        />

        <Card
          sx={{
            minHeight: 640,
            flexGrow: { md: 1 },
            display: { md: 'flex' },
            height: { xs: 800, md: '1px' },
            flexDirection: { md: 'column' },
          }}
        >
          <DataGrid
            checkboxSelection
            disableRowSelectionOnClick
            rows={dataFiltered}
            columns={columns}
            loading={productsLoading}
            getRowHeight={() => 'auto'}
            pageSizeOptions={[10, 20, { value: -1, label: 'Все' }]}
            initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
            onRowSelectionModelChange={(newSelectionModel) => setSelectedRowIds(newSelectionModel)}
            columnVisibilityModel={columnVisibilityModel}
            onColumnVisibilityModelChange={(newModel) => setColumnVisibilityModel(newModel)}
            slots={{
              toolbar: CustomToolbarCallback,
              noRowsOverlay: () => <EmptyContent />,
              noResultsOverlay: () => <EmptyContent title="No results found" />,
            }}
            slotProps={{
              toolbar: { setFilterButtonEl },
              panel: { anchorEl: filterButtonEl },
              columnsManagement: { getTogglableColumns },
            }}
            sx={{ [`& .${gridClasses.cell}`]: { alignItems: 'center', display: 'inline-flex' } }}
          />
        </Card>
      </DashboardContent>

      {renderConfirmDialog()}
    </>
  );
}

// ----------------------------------------------------------------------

function CustomToolbar({
  filters,
  canReset,
  selectedRowIds,
  filteredResults,
  setFilterButtonEl,
  onOpenConfirmDeleteRows,
}) {
  return (
    <>
      <GridToolbarContainer>
        <ProductTableToolbar
          filters={filters}
          options={{ stocks: PRODUCT_STOCK_OPTIONS, publishs: PUBLISH_OPTIONS }}
        />

        <GridToolbarQuickFilter />

        <Box
          sx={{
            gap: 1,
            flexGrow: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
          }}
        >
          {!!selectedRowIds.length && (
            <Button
              size="small"
              color="error"
              startIcon={<Iconify icon="solar:trash-bin-trash-bold" />}
              onClick={onOpenConfirmDeleteRows}
            >
              Удалить ({selectedRowIds.length})
            </Button>
          )}

          <GridToolbarColumnsButton />
          <GridToolbarFilterButton ref={setFilterButtonEl} />
          <GridToolbarExport />
        </Box>
      </GridToolbarContainer>

      {canReset && (
        <ProductTableFiltersResult
          filters={filters}
          totalResults={filteredResults}
          sx={{ p: 2.5, pt: 0 }}
        />
      )}
    </>
  );
}

// ----------------------------------------------------------------------

export const GridActionsLinkItem = forwardRef((props, ref) => {
  const { href, label, icon, sx } = props;

  return (
    <MenuItem ref={ref} sx={sx}>
      <Link
        component={RouterLink}
        href={href}
        underline="none"
        color="inherit"
        sx={{ width: 1, display: 'flex', alignItems: 'center' }}
      >
        {icon && <ListItemIcon>{icon}</ListItemIcon>}
        {label}
      </Link>
    </MenuItem>
  );
});

// ----------------------------------------------------------------------

function applyFilter({ inputData, filters }) {
  const { stock, publish } = filters;

  if (stock.length) {
    inputData = inputData.filter((product) => stock.includes(product.inventoryType));
  }

  if (publish.length) {
    inputData = inputData.filter((product) => publish.includes(product.publish));
  }

  return inputData;
}
