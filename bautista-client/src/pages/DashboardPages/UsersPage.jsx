import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchUsers, updateUser, createUser } from '../../services/UserService';
import { useAuth } from '../../context/AuthContext';

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
  Modal,
  FormControl,
  InputLabel,
  Select,
  Paper
} from '@mui/material';

import AddCircleIcon from '@mui/icons-material/AddCircle';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import HomeIcon from '@mui/icons-material/Home';
import LockIcon from '@mui/icons-material/Lock';
import WcIcon from '@mui/icons-material/Wc';
import AlternateEmailIcon from '@mui/icons-material/AlternateEmail'
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import CakeIcon from '@mui/icons-material/Cake';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';

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

const UsersPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false); // Track if editing
  const [editUserId, setEditUserId] = useState(null); // Track the user being edited
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newUser, setNewUser] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    contactNumber: '',
    address: '',
    role: 'buyer',
    isActive: true,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  useEffect(() => {
    if (user?.role !== 'admin') {
      navigate('/dashboard', { replace: true });
    }
  }, [navigate]);

  const roles = ['admin', 'seller', 'buyer'];

  const labelize = (value) =>
    value.charAt(0).toUpperCase() + value.slice(1);

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      `${u.firstName} ${u.lastName} ${u.email} ${u.username}`
        .toLowerCase()
        .includes(search.toLowerCase());

    const matchesRole = filterRole ? u.role === filterRole : true;

    const matchesStatus =
      filterStatus === ""
        ? true
        : filterStatus === "active"
        ? u.isActive
        : !u.isActive;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const loadUsers = async () => {
    try {
      setLoading(true);
      const {data} = await fetchUsers();
      setUsers(data.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  
  const handleOpen = () => {
    setIsEditing(false); // Reset to "Add" mode
    setNewUser({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        contactNumber: '',
        address: '',
        role: 'buyer',
        isActive: true,
    });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false); 
    setIsEditing(false); 
    setEditUserId(null);
  };

  const handleEdit = (id) => {
    const userToEdit = users.find((user) => user._id === id);
    if (userToEdit) {
      setNewUser({ ...userToEdit, password: '' }); // Set password to an empty string
      setEditUserId(id); // Track the user being edited
      setIsEditing(true); // Switch to "Edit" mode
      setOpen(true); // Open the modal
    };
  }
    
  const handleSaveUser = async () => {
    if (!validate()) return;

    try {
      if (isEditing) {
        // Update user
        const updatedUser = { ...newUser };
        if (!updatedUser.password) {
          delete updatedUser.password; // Exclude password if it's empty
        }
      await updateUser(editUserId, updatedUser);
      } else {
        // Add new user
        await createUser(newUser);
      }
      loadUsers(); // Reload users
      handleClose(); // Close modal
    } catch (error) {
      console.error('Error saving user:', error);
    }
  };

  const handleToggleActive = async (id, isActive) => { 
    try {
      await updateUser(id, { isActive: !isActive });
      loadUsers(); // Reload users after toggling
    } catch (error) {
      console.error('Error toggling user status:', error);
    }
  };

  const columns1 = [
    {
        field: 'name',
        headerName: 'Name',
        flex: 0.9,
        minWidth: 120,
        valueGetter: (value, params) =>
        `${params.firstName || ''} ${params.lastName || ''}`,
    },
    {
        field: 'email',
        headerName: 'Email',
        flex: 1.2,
        minWidth: 150,
    },
    {
        field: 'role',
        headerName: 'Role',
        flex: 0.5,
        minWidth: 75,
        sortable: true,
    },
    {
        field: 'contactNumber',
        headerName: 'Contact',
        flex: 0.8,
        minWidth: 100,
    },
    {
        field: 'address',
        headerName: 'Address',
        flex: 1,
    },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 0.9,
      minWidth: 145,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => (
        <Box>
          <Button
            variant="contained"
            size="small"
            sx={{ minWidth: 50, px: 1, backgroundColor: "#18181b" }}
            onClick={() => handleEdit(params.row._id)}
          >
            Edit
          </Button>

          <Switch
            checked={params.row.isActive}
            onChange={() => handleToggleActive(params.row._id, params.row.isActive)}
            sx={{
              "& .MuiSwitch-switchBase.Mui-checked": {
                color: "#18181b",
              },
              "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                backgroundColor: "#18181b",
              },
            }}
          />
        </Box>
      ),
    },
  ];

  const inputField = (icon, props) => (
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
          setNewUser({ ...newUser, [props.name]: e.target.value });

          setErrors((prev) => ({ ...prev, [props.name]: "" }));

          props.onChange?.(e);
        }}
      />
    </Stack>
  );

  const validate = () => {
    const err = {};

    const firstName = newUser.firstName?.trim() || "";
    const lastName = newUser.lastName?.trim() || "";
    const email = newUser.email?.trim() || "";
    const password = newUser.password || "";
    const contact = newUser.contactNumber?.trim() || "";
    const address = newUser.address?.trim() || "";

    // Name
    if (!firstName) err.firstName = "First name is required";

    if (!lastName) err.lastName = "Last name is required";

    // Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) err.email = "Email is required";
    else if (!emailRegex.test(email))
      err.email = "Enter a valid email address";
    else {
      const emailExists = users.some((user) => {
        const sameEmail = user.email?.toLowerCase() === email.toLowerCase();

        if (isEditing) {
          return sameEmail && user._id !== editUserId;
        }

        return sameEmail;
      });

      if (emailExists) {
        err.email = "Email address is already in use";
      }
    }

    // Password
    if (!isEditing) {
      if (!password) {
        err.password = "Password is required";
      } else if (password.length < 8) {
        err.password = "Password must be at least 8 characters";
      } else if (!/[A-Z]/.test(password)) {
        err.password = "Must contain at least 1 uppercase letter";
      } else if (!/[0-9]/.test(password)) {
        err.password = "Must contain at least 1 number";
      }
    } else {
      // EDIT MODE RULE
      if (password) {
        if (password.length < 8) {
          err.password = "Password must be at least 8 characters";
        } else if (!/[A-Z]/.test(password)) {
          err.password = "Must contain at least 1 uppercase letter";
        } else if (!/[0-9]/.test(password)) {
          err.password = "Must contain at least 1 number";
        }
      }
    }
    
    // Contact Number
    const phoneRegex = /^09\d{9}$/;
    if (!contact) err.contactNumber = "Contact number is required";
    else if (!/^\d+$/.test(contact))
      err.contactNumber = "Contact number must contain only numbers";
    else if (contact.length !== 11)
      err.contactNumber = "Contact number must be exactly 11 digits";
    else if (!phoneRegex.test(contact))
      err.contactNumber = "Must start with 09 (valid PH format)";

    // Address
    if (!address) err.address = "Address is required";
    else if (address.length < 5)
      err.address = "Address seems too short";

    setErrors(err);

    return Object.keys(err).length === 0;
  };

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
              Users
            </Typography>
            <Button variant="contained" startIcon={<AddCircleIcon />} onClick={handleOpen} sx={{ width: { xs: '100%', sm: 'auto', backgroundColor: "#18181b"} }}>
              Add User
            </Button>
          </Box>

          

          <Stack spacing={2} sx={{ mt: 3, pb: 3}}>
            <TextField
              size="small"
              label="Search users"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              fullWidth
            />

            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                select
                size="small"
                label="Role"
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                fullWidth
              >
                <MenuItem value="">All</MenuItem>
                {roles.map((r) => (
                  <MenuItem key={r} value={r}>
                    {labelize(r)}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                select
                size="small"
                label="Status"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                fullWidth
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </TextField>
            </Stack>
          </Stack>

          <Paper elevation={0} sx={card}>
            <DataGrid
              rows={filteredUsers}
              columns={columns1}
              getRowId={(row) => row._id}
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
                {isEditing ? "Edit User" : "Add User"}
              </DialogTitle>
    
              <DialogContent dividers sx={{ px: { xs: 2, sm: 3 } }}>
                <Stack spacing={2} sx={{ pt: 1 }}>
                  <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                    {inputField(<PersonIcon />, {
                      name: "firstName",
                      label: "First Name",
                      value: newUser.firstName,
                      onChange: (e) =>
                        setNewUser({ ...newUser, firstName: e.target.value }),
                    })}

                    {inputField(<PersonIcon />, {
                      name: "lastName",
                      label: "Last Name",
                      value: newUser.lastName,
                      onChange: (e) =>
                        setNewUser({ ...newUser, lastName: e.target.value }),
                    })}
                  </Stack>

                  <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                    {inputField(<PhoneIcon />, {
                      name: "contactNumber",
                      label: "Contact Number",
                      value: newUser.contactNumber,
                      onChange: (e) =>
                        setNewUser({ ...newUser, contactNumber: e.target.value }),
                    })}

                    {inputField(<EmailIcon />, {
                      name: "email",
                      label: "Email",
                      value: newUser.email,
                      onChange: (e) =>
                        setNewUser({ ...newUser, email: e.target.value }),
                    })}
                  </Stack>

                  <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                    {inputField(<ManageAccountsIcon />, {
                      select: true,
                      name: "role",
                      label: "Role",
                      value: newUser.role || 'buyer',
                      onChange: (e) =>
                        setNewUser({ ...newUser, role: e.target.value }),
                      children: roles.map((role) => (
                        <MenuItem key={role} value={role}>
                          {labelize(role)}
                        </MenuItem>
                      )),
                    })}
                  </Stack>

                  {inputField(<LockIcon />, {
                    name: "password",
                    label: "Password",
                    type: showPassword ? "text" : "password",
                    value: newUser.password,
                    onChange: (e) =>
                      setNewUser({ ...newUser, password: e.target.value }),
                    slotProps: {
                      input: {
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              edge="end"
                              onClick={() =>
                                setShowPassword((prev) => !prev)
                              }
                              onMouseDown={(event) =>
                                event.preventDefault()
                              }
                            >
                              {showPassword ? (
                                <Visibility />
                              ) : (
                                <VisibilityOff />
                              )}
                            </IconButton>
                          </InputAdornment>
                        ),
                      },
                    },
                  })}

                  {inputField(<HomeIcon />, {
                    name: "address",
                    label: "Address",
                    value: newUser.address,
                    multiline: true,
                    rows: 3,
                    onChange: (e) =>
                      setNewUser({ ...newUser, address: e.target.value }),
                  })}
                </Stack>
              </DialogContent>
    
              <DialogActions sx={{ px: 3, py: 2 }}>
                <Button variant="outlined" onClick={handleClose} sx={{ color: "#18181b", borderColor: "#18181b" }}>
                  Cancel
                </Button>
                <Button variant="contained" onClick={handleSaveUser} sx={{ backgroundColor: "#18181b" }}>
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

export default UsersPage;