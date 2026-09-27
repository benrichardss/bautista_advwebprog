import { useEffect, useState } from 'react';
import {
  fetchProducts,
  fetchProductsBySeller,
  createProduct,
  updateProduct,
  fetchCategories,
} from '../../services/ProductService';
import { useAuth } from '../../context/AuthContext';
import { fetchUsers } from '../../services/UserService';
import placeholderImage from '../../assets/img/placeholder-product.png';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Button,
  MenuItem,
  Stack,
  Switch,
  TextField,
  Typography,
  Paper
} from '@mui/material';

import AddCircleIcon from '@mui/icons-material/AddCircle';
import TitleIcon from '@mui/icons-material/Title';
import CategoryIcon from '@mui/icons-material/Category';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import SellIcon from '@mui/icons-material/Sell';
import InventoryIcon from '@mui/icons-material/Inventory';
import AssistantIcon from '@mui/icons-material/Assistant';
import PersonIcon from '@mui/icons-material/Person';
import ImageIcon from '@mui/icons-material/Image';
import ShortTextIcon from '@mui/icons-material/ShortText';
import StarIcon from '@mui/icons-material/Star';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

import { DataGrid } from '@mui/x-data-grid';

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

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',

  width: {
    xs: '90%',
    sm: 600,
    md: 700,
  },

  maxHeight: '90vh',
  overflowY: 'auto',

  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
  borderRadius: 2,
};

const DashProductListPage = () => {
  const [open, setOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editProductId, setEditProductId] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  const [newProduct, setNewProduct] = useState({
    productName: '',
    description: '',
    price: '',
    stock: '',
    seller: '',
    category: '',
    condition: 'New',
    status: 'Available',
  });
  const [errors, setErrors] = useState({});
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [imageError, setImageError] = useState('');
  const [saveError, setSaveError] = useState('');
  const [removeImage, setRemoveImage] = useState(false);

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const { user } = useAuth();

  const [sellers, setSellers] = useState([]);

  const loadSellers = async () => {
    try {
      const { data } = await fetchUsers({ params: { role: 'seller' } });
      setSellers(data.data.filter((user) => user.role === 'seller'));
    } catch (error) {
      console.error('Error fetching sellers:', error);
    }
  };

  const loadProducts = async () => {
    try {
      setLoading(true);

      const response =
        user?.role === 'admin'
          ? await fetchProducts({ limit: 100 })
          : await fetchProductsBySeller(user?.id || user?._id);

      setProducts(response.data.data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const { data } = await fetchCategories();
      setCategories(data.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  useEffect(() => {
    loadProducts();
    loadCategories();

    if (user?.role === 'admin') {
      loadSellers();
    }
  }, [user]);

  const filteredProducts = products.filter((product) => {
    const categoryName =
      typeof product.category === 'object'
        ? product.category.categoryName
        : '';

    const matchesSearch =
      `${product.productName} ${product.description || ''} ${categoryName}`
        .toLowerCase()
        .includes(search.toLowerCase());

    const matchesStatus = filterStatus
      ? product.status === filterStatus
      : true;

    return matchesSearch && matchesStatus;
  });

  const handleOpen = () => {
    setIsEditing(false);
    setEditProductId(null);
    setImageFile(null);
    setImagePreview('');
    setImageError('');
    setSaveError('');
    setRemoveImage(false);
    setNewProduct({
      productName: '',
      description: '',
      price: '',
      stock: '',
      seller: user?.role === 'seller' ? user.id || user._id : '',
      category: '',
      condition: 'New',
      status: 'Available',
    });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setIsEditing(false);
    setEditProductId(null);
    setImageFile(null);
    setImagePreview('');
    setRemoveImage(false);
    setImageError('');
    setSaveError('');
  };

  const handleEdit = (id) => {
    const product = products.find((item) => item._id === id);

    if (!product) return;

    const sellerId = product.seller?._id || product.seller;
    const currentUserId = user?.id || user?._id;

    if (
      user?.role !== 'admin' &&
      String(sellerId) !== String(currentUserId)
    ) {
      return;
    }

    setImageFile(null);
    setImagePreview(product.images?.[0] || '');
    setImageError('');
    setSaveError('');
    setRemoveImage(false);

    setNewProduct({
      productName: product.productName || '',
      description: product.description || '',
      price: product.price ?? '',
      stock: product.stock ?? '',
      seller: product.seller?._id || product.seller || '',
      category: product.category?._id || product.category || '',
      condition: product.condition || 'New',
      status: product.status || 'Available',
    });

    setEditProductId(id);
    setIsEditing(true);
    setOpen(true);
  };

  const handleSaveProduct = async () => {
    if (!validate()) return;

    const stock = Number(newProduct.stock);

    const payload = {
      ...newProduct,
      price: Number(newProduct.price),
      stock: Number(newProduct.stock),
      status: stock === 0 ? 'Sold' : 'Available',
      removeImage,
    };

    try {
      if (isEditing) {
        await updateProduct(editProductId, payload, imageFile);
      } else {
        await createProduct(payload, imageFile);
      }

      await loadProducts();
      handleClose();
    } catch (error) {
      console.error('Error saving product:', error);
      setSaveError(
        error.response?.data?.message || 'Unable to save the product.'
      );
    }
  };

  const handleProductChange = (event) => {
    const { name, value } = event.target;

    setNewProduct((current) => ({
      ...current,
      [name]: value,
      ...(name === 'stock'
        ? {
          status:
            value !== '' && Number(value) === 0
              ? 'Sold'
              : value !== ''
                ? 'Available'
                : current.status,
        }
        : {}),
    }));

    setErrors((current) => ({
      ...current,
      [name]: '',
    }));
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file) return;

    const allowedTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);

    if (!allowedTypes.has(file.type)) {
      setImageFile(null);
      setRemoveImage(false)
      setImagePreview('');
      setImageError('Choose a JPEG, PNG, or WebP image.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setImageFile(null);
      setRemoveImage(false)
      setImagePreview('');
      setImageError('Image must be 5 MB or smaller.');
      return;
    }

    setImageFile(file);
    setImageError('');
    setSaveError('');

    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result);
    reader.onerror = () => setImageError('Could not preview this image.');
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview('');
    setImageError('');
    setRemoveImage(true);
  };

  const inputField = (icon, props, ...children) => (
    <Stack direction="row" spacing={1.5} alignItems="center" sx={{ flex: 1 }}>
      <Box sx={{ display: "flex", minWidth: 32, color: "text.secondary" }}>
        {icon}
      </Box>

      <TextField
        fullWidth
        size="small"
        {...props}
        error={!!errors[props.name]}
        helperText={errors[props.name]}
        onChange={(e) => {
          setNewProduct({ ...newProduct, [props.name]: e.target.value });

          setErrors((prev) => ({ ...prev, [props.name]: "" }));

          props.onChange?.(e);
        }}
      >
        {children.flat()}
      </TextField>
    </Stack>
  );

  const validate = () => {
    const nextErrors = {};

    if (!newProduct.productName.trim()) {
      nextErrors.productName = 'Product name is required';
    }

    if (!newProduct.price || Number(newProduct.price) < 0) {
      nextErrors.price = 'Enter a valid price';
    }

    if (newProduct.stock === '' || Number(newProduct.stock) < 0) {
      nextErrors.stock = 'Stock cannot be negative';
    }

    if (!newProduct.category) {
      nextErrors.category = 'Category is required';
    }

    if (!newProduct.seller) {
      nextErrors.seller = 'Seller is required';
    }

    if (imageError) {
      nextErrors.image = imageError;
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const columns = [
    {
      field: 'productName',
      headerName: 'Product',
      flex: 1.4,
      minWidth: 220,
      renderCell: (params) => {
        const image = params.row.images?.[0] || placeholderImage;

        return (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              width: '100%',
              height: '100%',
            }}
          >
            {image ? (
              <Box
                component="img"
                src={image}
                onError={(event) => {
                  event.currentTarget.onerror = null;
                  event.currentTarget.src = placeholderImage;
                }}
                sx={{
                  width: 42,
                  height: 42,
                  objectFit: 'cover',
                  borderRadius: 1,
                  border: '1px solid #18181b',
                  flexShrink: 0,
                }}
              />
            ) : (
              <Box
                sx={{
                  width: 42,
                  height: 42,
                  borderRadius: 1,
                  bgcolor: '#e4e4e7',
                  flexShrink: 0,
                }}
              />
            )}

            <Typography
              variant="body2"
              sx={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {params.row.productName}
            </Typography>
          </Box>
        );
      },
    },
    {
      field: 'category',
      headerName: 'Category',
      flex: 0.8,
      minWidth: 120,
      valueGetter: (value, row) =>
        row.category?.categoryName || 'Uncategorized',
    },
    {
      field: 'price',
      headerName: 'Price',
      flex: 0.6,
      minWidth: 100,
      valueFormatter: (value) => `PHP ${Number(value).toFixed(2)}`,
    },
    {
      field: 'stock',
      headerName: 'Stock',
      flex: 0.5,
      minWidth: 80,
      headerAlign: 'center',
      align: 'center',
    },
    {
      field: 'condition',
      headerName: 'Condition',
      flex: 0.6,
      minWidth: 100,
      headerAlign: 'center',
      align: 'center',
    },
    {
      field: 'status',
      headerName: 'Status',
      flex: 0.7,
      minWidth: 110,
      headerAlign: 'center',
      align: 'center',
    },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 0.7,
      minWidth: 90,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => (
        <Button
          variant="contained"
          size="small"
          onClick={() => handleEdit(params.row._id)}
          sx={{ backgroundColor: '#18181b' }}
        >
          Edit
        </Button>
      ),
    },
  ];

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Box sx={section}>
        <Box sx={container}>
          <Box
            sx={{
              mb: 3,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 2,
              flexWrap: 'wrap',
            }}
          >
            <Typography
              sx={{
                fontSize: { xs: "1.75rem", md: "1.9rem" },
                fontWeight: 700,
                color: "#18181b",
                lineHeight: 1.1,
              }}
            >
              Products
            </Typography>
            <Button variant="contained" startIcon={<AddCircleIcon />} onClick={handleOpen} sx={{ width: { xs: '100%', sm: 'auto', backgroundColor: "#18181b" } }}>
              Add Product
            </Button>
          </Box>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mt: 3, pb: 3 }}>
            <TextField
              size="small"
              label="Search products"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              fullWidth
            />

            <TextField
              select
              size="small"
              label="Status"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              sx={{ minWidth: 200 }}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="Available">Available</MenuItem>
              <MenuItem value="Sold">Sold</MenuItem>
            </TextField>
          </Stack>

          <Paper elevation={0} sx={card}>
            <DataGrid
              rows={filteredProducts}
              columns={columns}
              getRowId={(row) => row._id}
              getRowHeight={() => 60}
              loading={loading}
              pageSizeOptions={[10, 20, 50]}
              columnBuffer={10}
              disableRowSelectionOnClick
              sx={{
                border: "none",
                borderRadius: "18px",
                overflow: "hidden",
                fontSize: "0.78rem",

                "& .MuiDataGrid-columnHeaders": {
                  backgroundColor: "#e4e4e7",
                },

                "& .MuiDataGrid-cell": {
                  borderBottom: "1px solid #e4e4e7",
                },

                "& .MuiDataGrid-cell:focus, & .MuiDataGrid-columnHeader:focus": {
                  outline: "none",
                },
              }}
            />
          </Paper>

          <Dialog
            open={open}
            onClose={handleClose}
            fullWidth
            maxWidth="md"
            PaperProps={{
              sx: {
                borderRadius: "24px",
                border: "2px solid #18181b",
                bgcolor: "#fafafa",
              },
            }}
          >
            <Box>
              <DialogTitle sx={{ fontWeight: 700 }}>
                {isEditing ? "Edit Product" : "Add Product"}
              </DialogTitle>

              <DialogContent dividers sx={{ px: { xs: 2, sm: 3 } }}>
                <Stack spacing={2} sx={{ pt: 1 }}>
                  <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                    {inputField(<TitleIcon />, {
                      name: "productName",
                      label: "Product Name",
                      value: newProduct.productName,
                      onChange: handleProductChange,
                    })}

                    {inputField(
                      <StarIcon />,
                      {
                        select: true,
                        name: 'category',
                        label: 'Category',
                        value: newProduct.category,
                        onChange: handleProductChange,
                      },
                      categories.map((category) => (
                        <MenuItem key={category._id} value={category._id}>
                          {category.categoryName}
                        </MenuItem>
                      ))
                    )}
                  </Stack>

                  <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                    {inputField(<MonetizationOnIcon />, {
                      name: "price",
                      label: "Price",
                      type: "number",
                      value: newProduct.price,
                      onChange: handleProductChange,
                    })}

                    {inputField(<InventoryIcon />, {
                      name: "stock",
                      label: "Stock",
                      type: "number",
                      value: newProduct.stock,
                      onChange: handleProductChange,
                    })}
                  </Stack>

                  <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                    {inputField(
                      <SellIcon />,
                      {
                        select: true,
                        name: 'condition',
                        label: 'Condition',
                        value: newProduct.condition,
                        onChange: handleProductChange,
                      },
                      <MenuItem value="New">New</MenuItem>,
                      <MenuItem value="Used">Used</MenuItem>
                    )}

                    {inputField(
                      <AssistantIcon />,
                      {
                        name: 'status',
                        label: 'Status',
                        value: newProduct.status,
                        disabled: true,
                      },
                    )}
                  </Stack>

                  {user?.role === 'admin' &&
                    inputField(
                      <PersonIcon />,
                      {
                        select: true,
                        name: 'seller',
                        label: 'Seller',
                        value: newProduct.seller,
                        onChange: handleProductChange,
                      },
                      sellers.map((seller) => (
                        <MenuItem key={seller._id} value={seller._id}>
                          {seller.firstName} {seller.lastName}
                        </MenuItem>
                      ))
                    )}

                  <Stack direction="row" spacing={1.5} alignItems="flex-start" sx={{ flex: 1 }}>
                    <Box
                      sx={{
                        display: 'flex',
                        minWidth: 32,
                        color: 'text.secondary',
                        pt: 0.75,
                      }}
                    >
                      <ImageIcon />
                    </Box>

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, flex: 1, minWidth: 0 }}>
                      <Button
                        component="label"
                        variant="outlined"
                        sx={{ alignSelf: 'flex-start' }}
                      >
                        Choose product image
                        <input
                          hidden
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          onChange={handleImageChange}
                        />
                      </Button>

                      <Typography variant="caption" color="text.secondary">
                        JPEG, PNG, or WebP. Maximum file size: 5 MB.
                      </Typography>

                      {imagePreview && (
                        <Box
                          component="img"
                          src={imagePreview}
                          alt="Product image preview"
                          sx={{
                            width: 180,
                            height: 140,
                            objectFit: 'cover',
                            border: '1px solid',
                            borderColor: 'divider',
                            borderRadius: 1,
                          }}
                        />
                      )}

                      {imagePreview && (
                        <Button color="error" onClick={handleRemoveImage}>
                          Remove image
                        </Button>
                      )}

                      {(imageError || saveError) && (
                        <Typography color="error" variant="body2">
                          {imageError || saveError}
                        </Typography>
                      )}
                    </Box>
                  </Stack>

                  {inputField(<ShortTextIcon />, {
                    name: "description",
                    label: "Description",
                    value: newProduct.description,
                    onChange: handleProductChange,
                    multiline: true,
                    rows: 4,
                  })}
                </Stack>
              </DialogContent>

              <DialogActions sx={{ px: 3, py: 2 }}>
                <Button variant="outlined" onClick={handleClose} sx={{ color: "#18181b", borderColor: "#18181b" }}>
                  Cancel
                </Button>
                <Button variant="contained" onClick={handleSaveProduct} sx={{ backgroundColor: "#18181b" }}>
                  {isEditing ? 'Save Changes' : 'Add'}
                </Button>
              </DialogActions>
            </Box>
          </Dialog>
        </Box>
      </Box>
    </Box>
  );
};

export default DashProductListPage;
