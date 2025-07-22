import React, { useState, useEffect } from 'react';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { 
  Typography, Breadcrumbs, Link, CssBaseline, Box, Stack, 
  Dialog, DialogContent, DialogTitle, DialogActions, Button,
  TextField, MenuItem, IconButton, Tooltip, Checkbox, Avatar,
  Paper, Chip, CircularProgress, Alert, Divider
} from '@mui/material';
import AppTheme from '../shared-theme/AppTheme';
import ColorModeSelect from '../shared-theme/ColorModeSelect';
import { 
  Home, Work, People, DeleteOutline, EditOutlined,
  AddPhotoAlternate, DateRange, Badge, Engineering,
  Business, AssignmentInd, Person, AdminPanelSettings,
  Close, Add
} from '@mui/icons-material';

const formatDateToYYYYMMDD = (isoDate) => {
  if (!isoDate) return '';
  const date = new Date(isoDate);
  const offset = date.getTimezoneOffset();
  date.setMinutes(date.getMinutes() - offset);
  return date.toISOString().split('T')[0];
};

const Employees = (props) => {
  // Define API base URL for server deployment
  const API_BASE_URL = '/api'; // For Ubuntu server with reverse proxy (e.g., Nginx)
  // Alternative: Use absolute URL if backend is on a different domain/port
  // const API_BASE_URL = 'https://your-domain.com/api';
  // const API_BASE_URL = 'http://<server-ip>:4000';

  const [rows, setRows] = useState([]);
  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openImageDialog, setOpenImageDialog] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');
  const [openUpdateDialog, setOpenUpdateDialog] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    emp_no: '',
    appointed_date: '',
    designation: '',
    contract_type: '',
    plant_id: '',
    user_type: '',
    profile_pic: null,
    is_manager: false
  });
  const [formErrors, setFormErrors] = useState({});
  const [plants, setPlants] = useState([]);
  const [successAlert, setSuccessAlert] = useState(null);

  const handleImageClick = (imageUrl) => {
    setSelectedImage(imageUrl);
    setOpenImageDialog(true);
  };

  const handleImageDialogClose = () => {
    setOpenImageDialog(false);
    setSelectedImage('');
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Name is required';
    if (!formData.emp_no || !/^[A-Za-z0-9-]{1,50}$/.test(formData.emp_no.trim())) {
      errors.emp_no = 'Valid employee number (alphanumeric with dashes, max 50) is required';
    }
    if (!formData.appointed_date || !/^\d{4}-\d{2}-\d{2}$/.test(formData.appointed_date)) {
      errors.appointed_date = 'Valid date (YYYY-MM-DD) is required';
    }
    if (!formData.designation.trim()) errors.designation = 'Designation is required';
    if (!formData.contract_type || !['permanent', 'probation'].includes(formData.contract_type)) {
      errors.contract_type = 'Contract type must be Permanent or Probation';
    }
    if (!formData.plant_id) errors.plant_id = 'Power plant is required';
    if (!formData.user_type || !['Executive', 'NonExecutive'].includes(formData.user_type)) {
      errors.user_type = 'User type must be Executive or NonExecutive';
    }
    if (formData.profile_pic && formData.profile_pic.size > 10 * 1024 * 1024) {
      errors.profile_pic = 'Profile picture must be less than 10MB';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleUpdateClick = (employee) => {
    setSelectedEmployee(employee);
    setFormData({
      name: employee.name,
      emp_no: employee.emp_no,
      appointed_date: formatDateToYYYYMMDD(employee.appointed_date),
      designation: employee.designation,
      contract_type: employee.contract_type.toLowerCase(),
      plant_id: employee.plant_id ? employee.plant_id.toString() : '',
      user_type: employee.user_type,
      profile_pic: null,
      is_manager: employee.is_manager
    });
    setFormErrors({});
    setOpenUpdateDialog(true);
  };

  const handleUpdateSubmit = async () => {
    if (!validateForm()) return;

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name.trim());
      formDataToSend.append('emp_no', formData.emp_no.trim());
      formDataToSend.append('appointed_date', formData.appointed_date);
      formDataToSend.append('designation', formData.designation.trim());
      formDataToSend.append('contract_type', formData.contract_type);
      formDataToSend.append('plant_id', formData.plant_id);
      formDataToSend.append('user_type', formData.user_type);
      formDataToSend.append('is_manager', formData.is_manager);
      if (formData.profile_pic) {
        formDataToSend.append('profile_pic', formData.profile_pic);
      }

      const response = await fetch(`${API_BASE_URL}/employ/employees/${selectedEmployee.id}`, {
        method: 'PUT',
        body: formDataToSend,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update employee');
      }

      const updatedEmployee = await response.json();
      setRows(rows.map(row => row.id === updatedEmployee.id ? {
        ...updatedEmployee,
        appointed_date: formatDateToYYYYMMDD(updatedEmployee.appointed_date),
        plant_name: plants.find(p => p.id === parseInt(updatedEmployee.plant_id))?.name || 'N/A',
        is_manager: updatedEmployee.is_manager
      } : row));
      setOpenUpdateDialog(false);
      setSuccessAlert('Employee updated successfully');
      setTimeout(() => setSuccessAlert(null), 3000);
    } catch (err) {
      console.error('Error updating employee:', err.message);
      setError(`Error: ${err.message}`);
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleDeleteClick = async (employee) => {
    if (!window.confirm(`Are you sure you want to delete ${employee.name}?`)) return;

    try {
      const response = await fetch(`${API_BASE_URL}/employ/employees/${employee.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete employee');
      }

      setRows(rows.filter(row => row.id !== employee.id));
      setSuccessAlert('Employee deleted successfully');
      setTimeout(() => setSuccessAlert(null), 3000);
    } catch (err) {
      console.error('Error deleting employee:', err.message);
      setError(`Error: ${err.message}`);
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData(prev => ({ ...prev, profile_pic: file }));
    if (formErrors.profile_pic) {
      setFormErrors(prev => ({ ...prev, profile_pic: '' }));
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [empResponse, plantResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/employ/employees`),
          fetch(`${API_BASE_URL}/employ/power-plants`)
        ]);

        if (!empResponse.ok) throw new Error(`Failed to fetch employees: ${empResponse.statusText}`);
        if (!plantResponse.ok) throw new Error(`Failed to fetch power plants: ${plantResponse.statusText}`);

        const [empData, plantData] = await Promise.all([
          empResponse.json(),
          plantResponse.json()
        ]);

        setPlants(plantData);

        if (empData.length > 0) {
          const formattedEmpData = empData.map(emp => ({
            ...emp,
            appointed_date: formatDateToYYYYMMDD(emp.appointed_date),
            is_manager: emp.is_manager
          }));

          const profilePicColumn = {
            field: 'profile_pic_path',
            headerName: 'Profile',
            flex: 0.5,
            minWidth: 80,
            renderCell: (params) => (
              <Avatar
                src={params.value}
                alt="Profile"
                sx={{ 
                  width: 40, 
                  height: 40,
                  cursor: 'pointer',
                  bgcolor: 'primary.main',
                }}
                onClick={() => handleImageClick(params.value)}
              >
                {params.row.name.charAt(0)}
              </Avatar>
            ),
            sortable: false,
            filterable: false,
          };

          const isManagerColumn = {
            field: 'user_type',
            headerName: 'Role',
            flex: 0.7,
            minWidth: 120,
            renderCell: (params) => (
              <Chip
                label={params.value}
                size="small"
                color={params.value === 'Executive' ? 'primary' : 'default'}
                variant="outlined"
                icon={params.value === 'Executive' ? <AdminPanelSettings fontSize="small" /> : <Person fontSize="small" />}
              />
            ),
            sortable: true,
            filterable: true,
          };

          const actionColumn = {
            field: 'actions',
            headerName: 'Actions',
            flex: 0.7,
            minWidth: 120,
            renderCell: (params) => (
              <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                <Tooltip title="Edit employee">
                  <IconButton
                    size="small"
                    onClick={() => handleUpdateClick(params.row)}
                    color="primary"
                    sx={{ 
                      backgroundColor: 'primary.light', 
                      '&:hover': { backgroundColor: 'primary.main', color: 'white' }
                    }}
                  >
                    <EditOutlined fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete employee">
                  <IconButton
                    size="small"
                    onClick={() => handleDeleteClick(params.row)}
                    color="error"
                    sx={{ 
                      backgroundColor: 'error.light', 
                      '&:hover': { backgroundColor: 'error.main', color: 'white' }
                    }}
                  >
                    <DeleteOutline fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            ),
            sortable: false,
            filterable: false,
            disableColumnMenu: true,
          };

          const staticColumns = [
            { 
              field: 'name', 
              headerName: 'Name', 
              flex: 1.2,
              minWidth: 200,
              renderCell: (params) => (
                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                  <Typography variant="body2" fontWeight="medium">{params.value}</Typography>
                  <Typography variant="caption" color="text.secondary">{params.row.designation}</Typography>
                </Box>
              )
            },
            { 
              field: 'emp_no', 
              headerName: 'ID', 
              flex: 0.7,
              minWidth: 120,
              renderCell: (params) => (
                <Chip
                  label={params.value}
                  size="small"
                  color="default"
                  variant="outlined"
                  icon={<Badge fontSize="small" />}
                />
              )
            },
            { 
              field: 'appointed_date', 
              headerName: 'Joined', 
              flex: 0.7,
              minWidth: 120,
              renderCell: (params) => (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <DateRange fontSize="small" color="action" />
                  <Typography variant="body2">{params.value}</Typography>
                </Box>
              )
            },
            { 
              field: 'contract_type', 
              headerName: 'Contract', 
              flex: 0.7,
              minWidth: 120,
              renderCell: (params) => (
                <Chip
                  label={params.value.charAt(0).toUpperCase() + params.value.slice(1)}
                  size="small"
                  color={params.value === 'permanent' ? 'success' : 'warning'}
                />
              )
            },
            { 
              field: 'plant_name', 
              headerName: 'Plant', 
              flex: 1,
              minWidth: 180,
              renderCell: (params) => (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Business fontSize="small" color="action" />
                  <Typography variant="body2">{params.value || 'N/A'}</Typography>
                </Box>
              )
            },
          ];

          setColumns([profilePicColumn, ...staticColumns, isManagerColumn, actionColumn]);
          setRows(formattedEmpData);
        } else {
          setColumns([]);
          setRows([]);
          if (plantData.length === 0) {
            setError('No power plants available. Please add a power plant first.');
          }
        }
      } catch (err) {
        console.error('Error fetching data:', err.message);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        bgcolor: 'background.default'
      }}>
        <CircularProgress size={60} thickness={4} />
      </Box>
    );
  }

  return (
    <AppTheme {...props}>
      <CssBaseline enableColorScheme />
      <Box
        sx={{
          minHeight: '100vh',
          bgcolor: 'background.default',
          color: 'text.primary',
          p: { xs: 2, sm: 4 },
          width: '100%',
          maxWidth: '100%',
          boxSizing: 'border-box'
        }}
      >
        <ColorModeSelect sx={{ 
          position: 'fixed', 
          top: '1.5rem', 
          right: '1.5rem', 
          zIndex: 1200,
          bgcolor: 'background.paper',
          borderRadius: 2,
          boxShadow: 1,
          p: 1
        }} />
        
        <Box sx={{ position: 'fixed', top: 100, right: 20, zIndex: 1200, width: { xs: 300, sm: 350 } }}>
          {error && (
            <Alert 
              severity="error" 
              onClose={() => setError(null)} 
              sx={{ mb: 2, boxShadow: 3 }}
            >
              {error}
            </Alert>
          )}
          {successAlert && (
            <Alert 
              severity="success" 
              onClose={() => setSuccessAlert(null)}
              sx={{ boxShadow: 3 }}
            >
              {successAlert}
            </Alert>
          )}
        </Box>

        <Stack spacing={4} sx={{ maxWidth: '100%' }}>
          <Box>
            <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
              <Link
                underline="hover"
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  color: 'text.secondary',
                  '&:hover': { color: 'primary.main' }
                }}
                href="/"
              >
                <Home sx={{ mr: 0.5, fontSize: '1rem' }} />
                Home
              </Link>
              <Link
                underline="hover"
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  color: 'text.secondary',
                  '&:hover': { color: 'primary.main' }
                }}
                href="/employees"
              >
                <Work sx={{ mr: 0.5, fontSize: '1rem' }} />
                HR Management
              </Link>
              <Typography
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  color: 'text.primary'
                }}
              >
                <People sx={{ mr: 0.5, fontSize: '1rem' }} />
                Employee Directory
              </Typography>
            </Breadcrumbs>

            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              mb: 3,
              flexWrap: 'wrap',
              gap: 2
            }}>
              <Box>
                <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
                  Employee Management
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  View and manage all employee records
                </Typography>
              </Box>
              <Button 
                variant="contained" 
                startIcon={<Add />}
                onClick={() => {
                  setSelectedEmployee(null);
                  setFormData({
                    name: '',
                    emp_no: '',
                    appointed_date: '',
                    designation: '',
                    contract_type: '',
                    plant_id: '',
                    user_type: '',
                    profile_pic: null,
                    is_manager: false
                  });
                  setOpenUpdateDialog(true);
                }}
                sx={{
                  height: 48,
                  px: 3,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontSize: '0.9375rem',
                  minWidth: 160
                }}
              >
                New Employee
              </Button>
            </Box>
            <Divider />
          </Box>

          <Paper 
            elevation={0} 
            sx={{ 
              p: 3, 
              borderRadius: 4,
              bgcolor: 'background.paper',
              border: '1px solid',
              borderColor: 'divider',
              width: '100%',
              overflowX: 'auto'
            }}
          >
            <Box sx={{ 
              width: '100%',
              minWidth: 800,
              '& .MuiDataGrid-root': {
                border: 'none',
                width: '100%'
              },
              '& .MuiDataGrid-cell': {
                borderBottom: '1px solid',
                borderColor: 'divider',
                py: 1
              },
              '& .MuiDataGrid-columnHeaders': {
                bgcolor: 'background.paper',
                borderBottom: '2px solid',
                borderColor: 'divider',
                py: 1
              },
              '& .MuiDataGrid-footerContainer': {
                borderTop: '1px solid',
                borderColor: 'divider',
                py: 1
              },
              '& .MuiDataGrid-columnHeaderTitle': {
                fontWeight: 'bold'
              }
            }}>
              <DataGrid
                rows={rows}
                columns={columns}
                pageSize={10}
                rowsPerPageOptions={[10, 25, 50]}
                disableSelectionOnClick
                components={{ Toolbar: GridToolbar }}
                componentsProps={{
                  toolbar: {
                    showQuickFilter: true,
                    quickFilterProps: { debounceMs: 500 },
                    csvOptions: { 
                      fileName: `employees_${new Date().toISOString().slice(0,10)}`,
                      delimiter: ','
                    },
                    printOptions: { disableToolbarButton: true },
                    sx: {
                      p: 1,
                      mb: 2,
                      '& .MuiButton-root': {
                        textTransform: 'none',
                        mr: 1,
                        px: 2,
                        borderRadius: 1
                      }
                    }
                  },
                }}
                sx={{
                  '& .MuiDataGrid-toolbarContainer': {
                    p: 1,
                    mb: 2,
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 1
                  },
                  '& .MuiDataGrid-main': {
                    width: '100%'
                  }
                }}
              />
            </Box>
          </Paper>
        </Stack>

        <Dialog 
          open={openImageDialog} 
          onClose={handleImageDialogClose}
          maxWidth="md"
          PaperProps={{
            sx: {
              bgcolor: 'transparent',
              boxShadow: 'none',
              overflow: 'visible',
              maxWidth: '90vw',
              maxHeight: '90vh'
            }
          }}
        >
          <Box sx={{ 
            position: 'relative',
            borderRadius: 2,
            overflow: 'hidden',
            boxShadow: 24
          }}>
            <img 
              src={selectedImage} 
              alt="Profile Preview" 
              style={{ 
                maxWidth: '100%', 
                maxHeight: '80vh',
                display: 'block',
                objectFit: 'contain'
              }}
            />
            <IconButton
              aria-label="close"
              onClick={handleImageDialogClose}
              sx={{
                position: 'absolute',
                right: 8,
                top: 8,
                color: 'common.white',
                bgcolor: 'rgba(0,0,0,0.5)',
                '&:hover': {
                  bgcolor: 'rgba(0,0,0,0.7)'
                }
              }}
            >
              <Close fontSize="small" />
            </IconButton>
          </Box>
        </Dialog>

        <Dialog 
          open={openUpdateDialog} 
          onClose={() => setOpenUpdateDialog(false)} 
          maxWidth="sm" 
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 4,
              m: { xs: 1, sm: 2 },
              maxWidth: 600
            }
          }}
        >
          <DialogTitle sx={{ 
            bgcolor: 'primary.main', 
            color: 'primary.contrastText',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            py: 2,
            px: 3
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <People fontSize="medium" />
              <Typography variant="h6" fontWeight="medium">
                {selectedEmployee ? 'Update Employee' : 'Add New Employee'}
              </Typography>
            </Box>
            <IconButton
              onClick={() => setOpenUpdateDialog(false)}
              sx={{ color: 'primary.contrastText' }}
            >
              <Close />
            </IconButton>
          </DialogTitle>
          <DialogContent sx={{ pt: 4, px: 3, pb: 3 }}>
            <Stack spacing={3}>
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column',
                alignItems: 'center',
                gap: 1.5,
                mb: 2
              }}>
                <Avatar
                  src={selectedEmployee?.profile_pic_path}
                  sx={{ 
                    width: 100, 
                    height: 100,
                    bgcolor: 'primary.main',
                    fontSize: '2.5rem',
                    border: '3px solid',
                    borderColor: 'divider'
                  }}
                >
                  {formData.name.charAt(0)}
                </Avatar>
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<AddPhotoAlternate />}
                  sx={{
                    borderRadius: 2,
                    px: 3,
                    textTransform: 'none',
                    minWidth: 160
                  }}
                >
                  Upload Photo
                  <input
                    type="file"
                    hidden
                    accept="image/jpeg,image/png"
                    onChange={handleFileChange}
                  />
                </Button>
                {formData.profile_pic && (
                  <Typography variant="caption" color="text.secondary">
                    Selected: {formData.profile_pic.name}
                  </Typography>
                )}
                {formErrors.profile_pic && (
                  <Typography variant="caption" color="error">
                    {formErrors.profile_pic}
                  </Typography>
                )}
              </Box>

              <TextField
                label="Full Name"
                name="name"
                value={formData.name}
                onChange={handleFormChange}
                error={!!formErrors.name}
                helperText={formErrors.name}
                fullWidth
                size="small"
                InputProps={{
                  startAdornment: <Person sx={{ color: 'action.active', mr: 1 }} />
                }}
              />

              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <TextField
                  label="Employee ID"
                  name="emp_no"
                  value={formData.emp_no}
                  onChange={handleFormChange}
                  error={!!formErrors.emp_no}
                  helperText={formErrors.emp_no}
                  size="small"
                  sx={{ flex: '1 1 200px' }}
                  InputProps={{
                    startAdornment: <Badge sx={{ color: 'action.active', mr: 1 }} />
                  }}
                />
                <TextField
                  label="Appointed Date"
                  name="appointed_date"
                  type="date"
                  value={formData.appointed_date}
                  onChange={handleFormChange}
                  error={!!formErrors.appointed_date}
                  helperText={formErrors.appointed_date}
                  size="small"
                  sx={{ flex: '1 1 200px' }}
                  InputLabelProps={{ shrink: true }}
                  InputProps={{
                    startAdornment: <DateRange sx={{ color: 'action.active', mr: 1 }} />
                  }}
                />
              </Box>

              <TextField
                label="Designation"
                name="designation"
                value={formData.designation}
                onChange={handleFormChange}
                error={!!formErrors.designation}
                helperText={formErrors.designation}
                fullWidth
                size="small"
                InputProps={{
                  startAdornment: <AssignmentInd sx={{ color: 'action.active', mr: 1 }} />
                }}
              />

              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <TextField
                  select
                  label="Contract Type"
                  name="contract_type"
                  value={formData.contract_type}
                  onChange={handleFormChange}
                  error={!!formErrors.contract_type}
                  helperText={formErrors.contract_type}
                  size="small"
                  sx={{ flex: '1 1 200px' }}
                >
                  <MenuItem value="permanent">Permanent</MenuItem>
                  <MenuItem value="probation">Probation</MenuItem>
                </TextField>

                <TextField
                  select
                  label="User Type"
                  name="user_type"
                  value={formData.user_type}
                  onChange={handleFormChange}
                  error={!!formErrors.user_type}
                  helperText={formErrors.user_type}
                  size="small"
                  sx={{ flex: '1 1 200px' }}
                  InputProps={{
                    startAdornment: <Engineering sx={{ color: 'action.active', mr: 1 }} />
                  }}
                >
                  <MenuItem value="Executive">Executive</MenuItem>
                  <MenuItem value="NonExecutive">NonExecutive</MenuItem>
                </TextField>
              </Box>

              <TextField
                select
                label="Power Plant"
                name="plant_id"
                value={formData.plant_id}
                onChange={handleFormChange}
                error={!!formErrors.plant_id}
                helperText={formErrors.plant_id}
                fullWidth
                size="small"
                disabled={plants.length === 0}
                InputProps={{
                  startAdornment: <Business sx={{ color: 'action.active', mr: 1 }} />
                }}
              >
                <MenuItem value="">Select Plant</MenuItem>
                {plants.map(plant => (
                  <MenuItem key={plant.id} value={plant.id.toString()}>{plant.name}</MenuItem>
                ))}
              </TextField>

              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center',
                p: 1.5,
                borderRadius: 1,
                bgcolor: formData.is_manager ? 'primary.lighter' : 'action.hover',
                border: '1px solid',
                borderColor: formData.is_manager ? 'primary.light' : 'divider'
              }}>
                <Checkbox
                  name="is_manager"
                  checked={formData.is_manager}
                  onChange={handleFormChange}
                  color="primary"
                />
                <Typography variant="body1">Managerial Position</Typography>
              </Box>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider', justifyContent: 'flex-end', gap: 1 }}>
            <Button 
              onClick={() => setOpenUpdateDialog(false)}
              variant="outlined"
              sx={{ 
                borderRadius: 2,
                px: 3,
                textTransform: 'none',
                minWidth: 120
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleUpdateSubmit} 
              variant="contained" 
              disabled={plants.length === 0}
              sx={{ 
                borderRadius: 2,
                px: 3,
                textTransform: 'none',
                minWidth: 120
              }}
            >
              {selectedEmployee ? 'Update Employee' : 'Create Employee'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </AppTheme>
  );
};

export default Employees;