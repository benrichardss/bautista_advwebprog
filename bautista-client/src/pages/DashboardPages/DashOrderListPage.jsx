import { useEffect, useState } from 'react';
import {
  Box,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
  Button,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { useAuth } from '../../context/AuthContext';
import {
  fetchDashboardOrders,
  updateOrderStatus,
} from '../../services/OrderService';

const statuses = [
  'Pending',
  'Processing',
  'Shipped',
  'Delivered',
  'Cancelled',
];

const section = {
  borderTop: "2px solid #18181b",
  borderBottom: "2px solid #18181b",
  backgroundColor: "#fafafa",
  px: { xs: 2, sm: 3, md: 4 },
  py: 3,
};

const container = {
  width: "100%",
};

const card = {
  border: "2px solid #18181b",
  borderRadius: "24px",
  bgcolor: "#f4f4f5",
  p: 2,
};

const DashOrderListPage = () => {
  const { user } = useAuth();
  const userId = user?.id || user?._id;

  const [orders, setOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const loadOrders = async () => {
    try {
      setLoading(true);

      const { data } = await fetchDashboardOrders(
        user.role,
        userId,
        { status: statusFilter, limit: 100 }
      );

      setOrders(data.data || []);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'admin' || user?.role === 'seller') {
      loadOrders();
    }
  }, [user, statusFilter]);

  const handleStatusChange = async (orderId, orderStatus) => {
    try {
      await updateOrderStatus(orderId, orderStatus);
      await loadOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const columns = [
    {
        field: '_id',
        headerName: 'Order',
        flex: 0.7,
        minWidth: 110,
        valueGetter: (value) => `#${String(value).slice(-8)}`,
    },
    {
        field: 'buyer',
        headerName: 'Buyer',
        flex: 1,
        minWidth: 140,
        valueGetter: (value, row) =>
        `${row.buyer?.firstName || ''} ${row.buyer?.lastName || ''}`.trim(),
    },
    {
        field: 'products',
        headerName: 'Products',
        flex: 1.5,
        minWidth: 200,
        renderCell: (params) => (
        <Box
            sx={{
            whiteSpace: 'normal',
            overflowWrap: 'anywhere',
            lineHeight: 1.3,
            py: 1,
            }}
        >
            {params.row.products
            .map(
                (item) =>
                `${item.product?.productName || 'Unavailable'} x${item.quantity}`
            )
            .join(', ')}
        </Box>
        ),
    },
    {
        field: 'totalAmount',
        headerName: 'Total',
        flex: 0.8,
        minWidth: 110,
        valueFormatter: (value) =>
        `PHP ${Number(value).toFixed(2)}`,
    },
    {
        field: 'paymentMethod',
        headerName: 'Payment',
        flex: 0.8,
        minWidth: 110,
    },
    {
        field: 'shippingAddress',
        headerName: 'Address',
        flex: 1.3,
        minWidth: 180,
        renderCell: (params) => (
        <Box
            sx={{
            whiteSpace: 'normal',
            overflowWrap: 'anywhere',
            lineHeight: 1.3,
            py: 1,
            }}
        >
            {params.value || 'No address'}
        </Box>
        ),
    },
    {
        field: 'orderStatus',
        headerName: 'Status',
        flex: 0.9,
        minWidth: 140,
        headerAlign: 'center',
        align: 'center',
        renderCell: (params) => (
            <Box
                sx={{
                display: 'flex',
                alignItems: 'center',
                width: '100%',
                height: '100%',
                }}
            >
                <TextField
                select
                size="small"
                value={params.row.orderStatus}
                onChange={(event) =>
                    handleStatusChange(params.row._id, event.target.value)
                }
                fullWidth
                >
                {statuses.map((status) => (
                    <MenuItem key={status} value={status}>
                    {status}
                    </MenuItem>
                ))}
                </TextField>
            </Box>
            ),
    },
  ];

  if (!user || !['admin', 'seller'].includes(user.role)) {
    return (
      <Typography sx={{ p: 3 }}>
        Only administrators and sellers can access orders.
      </Typography>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Box sx={section}>
            <Box sx={container}>
                <Typography
                    sx={{
                    fontSize: { xs: '1.75rem', md: '1.9rem' },
                    fontWeight: 700,
                    color: '#18181b',
                    lineHeight: 1.1,
                    }}
                >
                    Orders
                </Typography>

                <Stack spacing={2} sx={{ mt: 3, pb: 3 }}>
                    <TextField
                        select
                        size="small"
                        label="Filter by status"
                        value={statusFilter}
                        onChange={(event) => setStatusFilter(event.target.value)}
                        sx={{ maxWidth: 200 }}
                    >
                        <MenuItem value="">All statuses</MenuItem>

                        {statuses.map((status) => (
                        <MenuItem key={status} value={status}>
                            {status}
                        </MenuItem>
                        ))}
                    </TextField>
                </Stack>

                <Paper elevation={0} sx={card}>
                    <DataGrid
                        rows={orders}
                        columns={columns}
                        getRowId={(row) => row._id}
                        getRowHeight={() => 60}
                        loading={loading}
                        pageSizeOptions={[10, 20, 50]}
                        columnBuffer={10}
                        disableRowSelectionOnClick
                        sx={{
                        border: 'none',
                        borderRadius: '18px',
                        overflow: 'hidden',
                        fontSize: '0.78rem',

                        '& .MuiDataGrid-columnHeaders': {
                            backgroundColor: '#e4e4e7',
                        },

                        '& .MuiDataGrid-cell': {
                            borderBottom: '1px solid #e4e4e7',
                        },

                        '& .MuiDataGrid-cell:focus, & .MuiDataGrid-columnHeader:focus': {
                            outline: 'none',
                        },

                        '& .MuiDataGrid-row:hover': {
                            backgroundColor: '#fafafa',
                        },
                        }}
                    />
                </Paper>
            </Box>
        </Box>
    </Box>
    );
};

export default DashOrderListPage;