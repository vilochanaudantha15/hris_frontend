import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import CssBaseline from '@mui/material/CssBaseline';
import Divider from '@mui/material/Divider';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormLabel from '@mui/material/FormLabel';
import FormControl from '@mui/material/FormControl';
import Link from '@mui/material/Link';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import MuiCard from '@mui/material/Card';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Alert from '@mui/material/Alert';
import { styled } from '@mui/material/styles';
import AppTheme from '../shared-theme/AppTheme';
import ColorModeSelect from '../shared-theme/ColorModeSelect';
import { GoogleIcon, SitemarkWithText } from '../Icons/Icons';
import '../scss/signup.scss';

const Card = styled(MuiCard)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignSelf: 'center',
  width: '100%',
  maxWidth: '800px',
  minHeight: 'auto',
  maxHeight: '85vh',
  overflowY: 'auto',
  padding: theme.spacing(5),
  gap: theme.spacing(4),
  margin: 'auto',
  boxShadow:
    'hsla(220, 30%, 5%, 0.1) 0px 8px 20px 0px, hsla(220, 25%, 10%, 0.1) 0px 20px 40px -5px',
  borderRadius: '16px',
  [theme.breakpoints.up('sm')]: {
    width: '800px',
  },
  ...theme.applyStyles('dark', {
    boxShadow:
      'hsla(220, 30%, 5%, 0.6) 0px 8px 20px 0px, hsla(220, 25%, 10%, 0.12) 0px 20px 40px -5px',
  }),
}));

const SignUpContainer = styled(Stack)(({ theme }) => ({
  minHeight: '100vh',
  padding: theme.spacing(4),
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  '&::before': {
    content: '""',
    display: 'block',
    position: 'absolute',
    zIndex: -1,
    inset: 0,
    backgroundImage:
      'radial-gradient(ellipse at 50% 50%, hsl(210, 100%, 98%), hsl(0, 0%, 100%))',
    backgroundRepeat: 'no-repeat',
    ...theme.applyStyles('dark', {
      backgroundImage:
        'radial-gradient(at 50% 50%, hsla(210, 100%, 20%, 0.6), hsl(220, 30%, 5%))',
    }),
  },
}));

export default function SignUp(props) {
  // Define API base URL for server deployment
  const API_BASE_URL = '/api'; // For Ubuntu server with reverse proxy (e.g., Nginx)
  // Alternative: Use absolute URL if backend is on a different domain/port
  // const API_BASE_URL = 'https://your-domain.com/api';
  // const API_BASE_URL = 'http://<server-ip>:4000';

  const [formData, setFormData] = React.useState({
    name: '',
    email: '',
    mobile: '',
    userType: '',
    password: '',
    department: '',
    designation: '',
    appointed_date: '',
    employeeId: '',
    contract_type: '',
    plant_id: '',
  });
  const [profilePic, setProfilePic] = React.useState(null);
  const [previewImage, setPreviewImage] = React.useState(null);
  const [plants, setPlants] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [success, setSuccess] = React.useState('');
  const [formErrors, setFormErrors] = React.useState({
    name: { error: false, message: '' },
    email: { error: false, message: '' },
    mobile: { error: false, message: '' },
    userType: { error: false, message: '' },
    password: { error: false, message: '' },
    department: { error: false, message: '' },
    designation: { error: false, message: '' },
    appointed_date: { error: false, message: '' },
    employeeId: { error: false, message: '' },
    contract_type: { error: false, message: '' },
    plant_id: { error: false, message: '' },
    profile_pic: { error: false, message: '' },
  });
  const [showCustomDesignation, setShowCustomDesignation] = React.useState(false);

  const designations = [
    'Electrical Engineer',
    'Civil Engineer',
    'Mechanical Engineer',
    'Software Engineer',
    'HR Manager',
    'Accountant',
    'Finance Manager',
    'Supervisor',
    'Laborer',
  ];

  const contractTypes = ['Probation', 'Permanent'];

  React.useEffect(() => {
    const fetchPlants = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/employ/power-plants`);
        if (!response.ok) throw new Error('Failed to fetch plants');
        const data = await response.json();
        setPlants(data);
        if (data.length > 0) {
          setFormData(prev => ({ ...prev, plant_id: data[0].id.toString() }));
        } else {
          setError('No power plants available. Please add a power plant first.');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPlants();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    if (name === 'designation' && value === 'custom') {
      setShowCustomDesignation(true);
      setFormData(prev => ({ ...prev, designation: '' }));
      return;
    }
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name].error) {
      setFormErrors(prev => ({ ...prev, [name]: { error: false, message: '' } }));
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (!['image/jpeg', 'image/png'].includes(file.type)) {
        setFormErrors(prev => ({
          ...prev,
          profile_pic: { error: true, message: 'Only JPEG and PNG images allowed.' },
        }));
        return;
      }
      setProfilePic(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
    if (formErrors.profile_pic.error) {
      setFormErrors(prev => ({ ...prev, profile_pic: { error: false, message: '' } }));
    }
  };

  const validateInputs = () => {
    let isValid = true;
    const newErrors = { ...formErrors };

    if (!formData.name.trim()) {
      newErrors.name = { error: true, message: 'Name is required.' };
      isValid = false;
    } else {
      newErrors.name = { error: false, message: '' };
    }

    if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = { error: true, message: 'Please enter a valid email address.' };
      isValid = false;
    } else {
      newErrors.email = { error: false, message: '' };
    }

    if (!formData.mobile.trim() || !/^\d{10,}$/.test(formData.mobile.replace(/\D/g, ''))) {
      newErrors.mobile = { error: true, message: 'Please enter a valid mobile number (at least 10 digits).' };
      isValid = false;
    } else {
      newErrors.mobile = { error: false, message: '' };
    }

    if (!formData.userType || !['Executive', 'NonExecutive'].includes(formData.userType)) {
      newErrors.userType = { error: true, message: 'Please select a valid user type.' };
      isValid = false;
    } else {
      newErrors.userType = { error: false, message: '' };
    }

    if (!formData.password || formData.password.length < 6) {
      newErrors.password = { error: true, message: 'Password must be at least 6 characters long.' };
      isValid = false;
    } else {
      newErrors.password = { error: false, message: '' };
    }

    if (!formData.department || !['IT', 'HR', 'Finance'].includes(formData.department)) {
      newErrors.department = { error: true, message: 'Please select a valid department.' };
      isValid = false;
    } else {
      newErrors.department = { error: false, message: '' };
    }

    if (!formData.designation.trim()) {
      newErrors.designation = { error: true, message: 'Designation is required.' };
      isValid = false;
    } else {
      newErrors.designation = { error: false, message: '' };
    }

    if (!formData.appointed_date || !/^\d{4}-\d{2}-\d{2}$/.test(formData.appointed_date)) {
      newErrors.appointed_date = { error: true, message: 'Appointed date is required in YYYY-MM-DD format.' };
      isValid = false;
    } else {
      newErrors.appointed_date = { error: false, message: '' };
    }

    if (!formData.employeeId.trim() || !/^[A-Za-z0-9-]{1,50}$/.test(formData.employeeId)) {
      newErrors.employeeId = { error: true, message: 'Employee ID must be alphanumeric with dashes (max 50 characters).' };
      isValid = false;
    } else {
      newErrors.employeeId = { error: false, message: '' };
    }

    if (!formData.contract_type || !['probation', 'permanent'].includes(formData.contract_type.toLowerCase())) {
      newErrors.contract_type = { error: true, message: 'Please select a valid contract type.' };
      isValid = false;
    } else {
      newErrors.contract_type = { error: false, message: '' };
    }

    if (!formData.plant_id) {
      newErrors.plant_id = { error: true, message: 'Please select a valid plant.' };
      isValid = false;
    } else {
      newErrors.plant_id = { error: false, message: '' };
    }

    if (profilePic && profilePic.size > 10 * 1024 * 1024) {
      newErrors.profile_pic = { error: true, message: 'File too large (max 10MB).' };
      isValid = false;
    } else {
      newErrors.profile_pic = { error: false, message: '' };
    }

    setFormErrors(newErrors);
    return isValid;
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      mobile: '',
      userType: '',
      password: '',
      department: '',
      designation: '',
      appointed_date: '',
      employeeId: '',
      contract_type: '',
      plant_id: plants.length > 0 ? plants[0].id.toString() : '',
    });
    setProfilePic(null);
    setPreviewImage(null);
    setShowCustomDesignation(false);
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateInputs()) {
      return;
    }

    const data = new FormData();
    data.append('name', formData.name.trim());
    data.append('emp_no', formData.employeeId.trim());
    data.append('appointed_date', formData.appointed_date);
    data.append('designation', formData.designation.trim());
    data.append('contract_type', formData.contract_type.toLowerCase());
    data.append('plant_id', formData.plant_id);
    if (profilePic) data.append('profile_pic', profilePic);
    data.append('email', formData.email);
    data.append('mobile', formData.mobile);
    data.append('user_type', formData.userType);
    data.append('password', formData.password);
    data.append('department', formData.department);

    try {
      const response = await fetch(`${API_BASE_URL}/employ/employees`, {
        method: 'POST',
        body: data,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add employee');
      }

      const result = await response.json();
      setSuccess(`Employee added successfully (ID: ${result.id})`);
      resetForm();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <SignUpContainer direction="column" justifyContent="center">
        <Alert severity="info">Loading plant data...</Alert>
      </SignUpContainer>
    );
  }

  if (error) {
    return (
      <SignUpContainer direction="column" justifyContent="center">
        <Alert severity="error">Error: {error}</Alert>
      </SignUpContainer>
    );
  }

  return (
    <AppTheme {...props}>
      <CssBaseline enableColorScheme />
      <ColorModeSelect sx={{ position: 'fixed', top: '1.5rem', right: '1.5rem' }} />
      <SignUpContainer direction="column" justifyContent="center">
        <Card variant="outlined" className="glassmorphic">
          <SitemarkWithText />
          <Typography
            component="h1"
            variant="h4"
            sx={{ width: '100%', fontSize: 'clamp(2.2rem, 10vw, 2.8rem)', textAlign: 'center', fontWeight: 600 }}
          >
            Add New Employee
          </Typography>
          {success && <Alert severity="success">{success}</Alert>}
          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}
            encType="multipart/form-data"
          >
            <Accordion defaultExpanded>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6" className="section-title">Personal Information</Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ gap: 3, display: 'flex', flexDirection: 'column' }}>
                <FormControl>
                  <FormLabel htmlFor="name">Full Name</FormLabel>
                  <TextField
                    autoComplete="name"
                    name="name"
                    required
                    fullWidth
                    id="name"
                    placeholder="Jon Snow"
                    value={formData.name}
                    onChange={handleChange}
                    error={formErrors.name.error}
                    helperText={formErrors.name.message}
                    color={formErrors.name.error ? 'error' : 'primary'}
                    sx={{ backgroundColor: 'background.paper', borderRadius: '8px' }}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel htmlFor="email">Email</FormLabel>
                  <TextField
                    required
                    fullWidth
                    id="email"
                    placeholder="your@email.com"
                    name="email"
                    autoComplete="email"
                    variant="outlined"
                    value={formData.email}
                    onChange={handleChange}
                    error={formErrors.email.error}
                    helperText={formErrors.email.message}
                    color={formErrors.email.error ? 'error' : 'primary'}
                    sx={{ backgroundColor: 'background.paper', borderRadius: '8px' }}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel htmlFor="mobile">Mobile Number</FormLabel>
                  <TextField
                    required
                    fullWidth
                    id="mobile"
                    placeholder="1234567890"
                    name="mobile"
                    autoComplete="tel"
                    variant="outlined"
                    value={formData.mobile}
                    onChange={handleChange}
                    error={formErrors.mobile.error}
                    helperText={formErrors.mobile.message}
                    color={formErrors.mobile.error ? 'error' : 'primary'}
                    sx={{ backgroundColor: 'background.paper', borderRadius: '8px' }}
                  />
                </FormControl>
              </AccordionDetails>
            </Accordion>

            <Accordion defaultExpanded>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6" className="section-title">Employment Details</Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ gap: 3, display: 'flex', flexDirection: 'column' }}>
                <FormControl>
                  <FormLabel htmlFor="userType">User Type</FormLabel>
                  <Select
                    required
                    fullWidth
                    id="userType"
                    name="userType"
                    value={formData.userType}
                    onChange={handleChange}
                    error={formErrors.userType.error}
                    color={formErrors.userType.error ? 'error' : 'primary'}
                    sx={{ backgroundColor: 'background.paper', borderRadius: '8px' }}
                  >
                    <MenuItem value="" disabled>Select user type</MenuItem>
                    <MenuItem value="Executive">Executive</MenuItem>
                    <MenuItem value="NonExecutive">Non-Executive</MenuItem>
                  </Select>
                  {formErrors.userType.error && (
                    <Typography variant="caption" color="error">
                      {formErrors.userType.message}
                    </Typography>
                  )}
                </FormControl>
                <FormControl>
                  <FormLabel htmlFor="department">Department</FormLabel>
                  <Select
                    required
                    fullWidth
                    id="department"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    error={formErrors.department.error}
                    color={formErrors.department.error ? 'error' : 'primary'}
                    sx={{ backgroundColor: 'background.paper', borderRadius: '8px' }}
                  >
                    <MenuItem value="" disabled>Select department</MenuItem>
                    <MenuItem value="IT">IT</MenuItem>
                    <MenuItem value="HR">HR</MenuItem>
                    <MenuItem value="Finance">Finance</MenuItem>
                  </Select>
                  {formErrors.department.error && (
                    <Typography variant="caption" color="error">
                      {formErrors.department.message}
                    </Typography>
                  )}
                </FormControl>
                <FormControl>
                  <FormLabel htmlFor="designation">Designation</FormLabel>
                  {!showCustomDesignation ? (
                    <>
                      <Select
                        required
                        fullWidth
                        id="designation"
                        name="designation"
                        value={formData.designation}
                        onChange={handleChange}
                        error={formErrors.designation.error}
                        color={formErrors.designation.error ? 'error' : 'primary'}
                        sx={{ backgroundColor: 'background.paper', borderRadius: '8px' }}
                      >
                        <MenuItem value="" disabled>Select designation</MenuItem>
                        {designations.map(des => (
                          <MenuItem key={des} value={des}>{des}</MenuItem>
                        ))}
                        <MenuItem value="custom">Other...</MenuItem>
                      </Select>
                      {formErrors.designation.error && (
                        <Typography variant="caption" color="error">
                          {formErrors.designation.message}
                        </Typography>
                      )}
                    </>
                  ) : (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <TextField
                        required
                        fullWidth
                        id="customDesignation"
                        name="designation"
                        placeholder="Enter custom designation"
                        value={formData.designation}
                        onChange={handleChange}
                        error={formErrors.designation.error}
                        helperText={formErrors.designation.message}
                        color={formErrors.designation.error ? 'error' : 'primary'}
                        sx={{ backgroundColor: 'background.paper', borderRadius: '8px' }}
                        autoFocus
                      />
                      <Button
                        variant="outlined"
                        onClick={() => setShowCustomDesignation(false)}
                        sx={{ alignSelf: 'flex-start' }}
                      >
                        Back to list
                      </Button>
                    </Box>
                  )}
                </FormControl>
                <FormControl>
                  <FormLabel htmlFor="appointed_date">Appointed Date</FormLabel>
                  <TextField
                    required
                    fullWidth
                    id="appointed_date"
                    type="date"
                    name="appointed_date"
                    value={formData.appointed_date}
                    onChange={handleChange}
                    error={formErrors.appointed_date.error}
                    helperText={formErrors.appointed_date.message}
                    color={formErrors.appointed_date.error ? 'error' : 'primary'}
                    sx={{ backgroundColor: 'background.paper', borderRadius: '8px' }}
                    InputLabelProps={{ shrink: true }}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel htmlFor="employeeId">Employee ID</FormLabel>
                  <TextField
                    required
                    fullWidth
                    id="employeeId"
                    placeholder="EMP-20458"
                    name="employeeId"
                    value={formData.employeeId}
                    onChange={handleChange}
                    error={formErrors.employeeId.error}
                    helperText={formErrors.employeeId.message}
                    color={formErrors.employeeId.error ? 'error' : 'primary'}
                    sx={{ backgroundColor: 'background.paper', borderRadius: '8px' }}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel htmlFor="contract_type">Contract Type</FormLabel>
                  <Select
                    required
                    fullWidth
                    id="contract_type"
                    name="contract_type"
                    value={formData.contract_type}
                    onChange={handleChange}
                    error={formErrors.contract_type.error}
                    color={formErrors.contract_type.error ? 'error' : 'primary'}
                    sx={{ backgroundColor: 'background.paper', borderRadius: '8px' }}
                  >
                    <MenuItem value="" disabled>Select contract type</MenuItem>
                    {contractTypes.map(type => (
                      <MenuItem key={type} value={type.toLowerCase()}>{type}</MenuItem>
                    ))}
                  </Select>
                  {formErrors.contract_type.error && (
                    <Typography variant="caption" color="error">
                      {formErrors.contract_type.message}
                    </Typography>
                  )}
                </FormControl>
                <FormControl>
                  <FormLabel htmlFor="plant_id">Plant</FormLabel>
                  <Select
                    required
                    fullWidth
                    id="plant_id"
                    name="plant_id"
                    value={formData.plant_id}
                    onChange={handleChange}
                    error={formErrors.plant_id.error}
                    color={formErrors.plant_id.error ? 'error' : 'primary'}
                    sx={{ backgroundColor: 'background.paper', borderRadius: '8px' }}
                    disabled={plants.length === 0}
                  >
                    <MenuItem value="" disabled>Select plant</MenuItem>
                    {plants.map(plant => (
                      <MenuItem key={plant.id} value={plant.id.toString()}>{plant.name}</MenuItem>
                    ))}
                  </Select>
                  {formErrors.plant_id.error && (
                    <Typography variant="caption" color="error">
                      {formErrors.plant_id.message}
                    </Typography>
                  )}
                </FormControl>
                <FormControl>
                  <FormLabel htmlFor="profile_pic">Profile Picture</FormLabel>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Button
                      variant="outlined"
                      component="label"
                      sx={{ backgroundColor: 'background.paper', borderRadius: '8px' }}
                    >
                      {profilePic ? 'Change Image' : 'Choose Image'}
                      <input
                        type="file"
                        id="profile_pic"
                        name="profile_pic"
                        accept="image/jpeg,image/png"
                        hidden
                        onChange={handleFileChange}
                      />
                    </Button>
                    {profilePic && (
                      <Typography variant="body2" color="text.secondary">
                        {profilePic.name}
                      </Typography>
                    )}
                  </Box>
                  {formErrors.profile_pic.error && (
                    <Typography variant="caption" color="error">
                      {formErrors.profile_pic.message}
                    </Typography>
                  )}
                  {previewImage && (
                    <Box sx={{ mt: 2 }}>
                      <img
                        src={previewImage}
                        alt="Profile Preview"
                        style={{ maxWidth: '200px', maxHeight: '200px', borderRadius: '8px' }}
                      />
                    </Box>
                  )}
                </FormControl>
              </AccordionDetails>
            </Accordion>

            <FormControl>
              <FormLabel htmlFor="password">Password</FormLabel>
              <TextField
                required
                fullWidth
                name="password"
                placeholder="••••••"
                type="password"
                id="password"
                autoComplete="new-password"
                variant="outlined"
                value={formData.password}
                onChange={handleChange}
                error={formErrors.password.error}
                helperText={formErrors.password.message}
                color={formErrors.password.error ? 'error' : 'primary'}
                sx={{ backgroundColor: 'background.paper', borderRadius: '8px' }}
              />
            </FormControl>
            <FormControlLabel
              control={<Checkbox value="allowExtraEmails" color="primary" />}
              label="I want to receive updates via email."
              sx={{ color: 'text.secondary', fontWeight: 500 }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              className="submit-btn"
              sx={{ padding: '12px 24px', fontSize: '1.1rem', fontWeight: 600 }}
              disabled={plants.length === 0}
            >
              Add Employee
            </Button>
            <Typography sx={{ textAlign: 'center', color: 'text.secondary', fontWeight: 500 }}>
              Already have an account?{' '}
              <Link href="/signin" variant="body2" className="link">
                Sign in
              </Link>
            </Typography>
          </Box>
          <Divider sx={{ my: 3, color: 'text.secondary' }}>or</Divider>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<GoogleIcon />}
              className="google-btn"
              sx={{ padding: '12px 24px', fontSize: '1rem', fontWeight: 600 }}
            >
              Sign up with Google
            </Button>
          </Box>
        </Card>
      </SignUpContainer>
    </AppTheme>
  );
}