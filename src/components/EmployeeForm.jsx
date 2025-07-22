import React, { useState, useEffect } from 'react';
import '../scss/employeeForm.scss';

const EmployeeForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    emp_no: '',
    appointed_date: '',
    designation: '',
    contract_type: '',
    plant_id: ''
  });
  const [profilePic, setProfilePic] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState('');
  const [errors, setErrors] = useState({});
  const [showCustomDesignation, setShowCustomDesignation] = useState(false);

  const designations = [
    'Electrical Engineer',
    'Civil Engineer',
    'Mechanical Engineer',
    'Software Engineer',
    'HR Manager',
    'Accountant',
    'Finance Manager',
    'Supervisor',
    'Laborer'
  ];

  const contractTypes = ['Probation', 'Permanent'];

  useEffect(() => {
    const fetchPlants = async () => {
      try {
        const response = await fetch('http://localhost:4000/employ/power-plants');
        if (!response.ok) throw new Error('Failed to fetch plants');
        const data = await response.json();
        setPlants(data);
        if (data.length > 0) {
          setFormData(prev => ({
            ...prev,
            plant_id: data[0].id.toString()
          }));
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'designation' && value === 'custom') {
      setShowCustomDesignation(true);
      setFormData(prev => ({ ...prev, designation: '' }));
      return;
    }
    
    setFormData(prev => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePic(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }

    if (errors.profile_pic) {
      setErrors(prev => ({ ...prev, profile_pic: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) return;

    const data = new FormData();
    data.append('name', formData.name.trim());
    data.append('emp_no', formData.emp_no.trim());
    data.append('appointed_date', formData.appointed_date);
    data.append('designation', formData.designation.trim());
    data.append('contract_type', formData.contract_type.toLowerCase());
    data.append('plant_id', formData.plant_id);
    if (profilePic) data.append('profile_pic', profilePic);

    try {
      const response = await fetch('http://localhost:4000/employ/employees', {
        method: 'POST',
        body: data
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

  const resetForm = () => {
    setFormData({
      name: '',
      emp_no: '',
      appointed_date: '',
      designation: '',
      contract_type: '',
      plant_id: plants.length > 0 ? plants[0].id.toString() : ''
    });
    setProfilePic(null);
    setPreviewImage(null);
    setShowCustomDesignation(false);
    setTimeout(() => setSuccess(''), 3000);
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.emp_no.trim()) newErrors.emp_no = 'Employee number is required';
    else if (!/^[A-Za-z0-9-]{1,50}$/.test(formData.emp_no.trim())) {
      newErrors.emp_no = 'Employee number must be alphanumeric with dashes (max 50 characters)';
    }
    if (!formData.appointed_date) {
      newErrors.appointed_date = 'Appointed date is required';
    } else if (!/^\d{4}-\d{2}-\d{2}$/.test(formData.appointed_date)) {
      newErrors.appointed_date = 'Date must be in YYYY-MM-DD format';
    }
    if (!formData.designation.trim()) newErrors.designation = 'Designation is required';
    if (!formData.contract_type) newErrors.contract_type = 'Contract type is required';
    if (!formData.plant_id) newErrors.plant_id = 'Plant is required';
    if (profilePic?.size > 10 * 1024 * 1024) {
      newErrors.profile_pic = 'File too large (max 10MB)';
    }

    setErrors(newErrors);
    return newErrors;
  };

  if (loading) return <div className="loading">Loading plant data...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="employee-form-container">
      <h2>Add New Employee</h2>
      {success && <div className="success-message">{success}</div>}
      
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <div className="form-group">
          <label>Full Name:</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={errors.name ? 'error' : ''}
            placeholder="Enter employee's full name"
          />
          {errors.name && <span className="error-message">{errors.name}</span>}
        </div>

        <div className="form-group">
          <label>Employee Number:</label>
          <input
            type="text"
            name="emp_no"
            value={formData.emp_no}
            onChange={handleChange}
            className={errors.emp_no ? 'error' : ''}
            placeholder="Enter employee ID number"
          />
          {errors.emp_no && <span className="error-message">{errors.emp_no}</span>}
        </div>

        <div className="form-group">
          <label>Appointed Date:</label>
          <input
            type="date"
            name="appointed_date"
            value={formData.appointed_date}
            onChange={handleChange}
            className={errors.appointed_date ? 'error' : ''}
          />
          {errors.appointed_date && <span className="error-message">{errors.appointed_date}</span>}
        </div>

        <div className="form-group">
          <label>Designation:</label>
          {!showCustomDesignation ? (
            <>
              <select
                name="designation"
                value={formData.designation}
                onChange={handleChange}
                className={errors.designation ? 'error' : ''}
              >
                <option value="">Select designation</option>
                {designations.map(des => (
                  <option key={des} value={des}>{des}</option>
                ))}
                <option value="custom">Other...</option>
              </select>
              {errors.designation && <span className="error-message">{errors.designation}</span>}
            </>
          ) : (
            <div className="custom-designation">
              <input
                type="text"
                name="designation"
                value={formData.designation}
                onChange={handleChange}
                placeholder="Enter custom designation"
                className={errors.designation ? 'error' : ''}
                autoFocus
              />
              <button
                type="button"
                className="back-button"
                onClick={() => setShowCustomDesignation(false)}
              >
                ← Back to list
              </button>
              {errors.designation && <span className="error-message">{errors.designation}</span>}
            </div>
          )}
        </div>

        <div className="form-group">
          <label>Plant:</label>
          <select
            name="plant_id"
            value={formData.plant_id}
            onChange={handleChange}
            className={errors.plant_id ? 'error' : ''}
            disabled={plants.length === 0}
          >
            <option value="">Select plant</option>
            {plants.map(plant => (
              <option key={plant.id} value={plant.id}>{plant.name}</option>
            ))}
          </select>
          {errors.plant_id && <span className="error-message">{errors.plant_id}</span>}
        </div>

        <div className="form-group">
          <label>Contract Type:</label>
          <select
            name="contract_type"
            value={formData.contract_type}
            onChange={handleChange}
            className={errors.contract_type ? 'error' : ''}
          >
            <option value="">Select contract type</option>
            {contractTypes.map(type => (
              <option key={type} value={type.toLowerCase()}>{type}</option>
            ))}
          </select>
          {errors.contract_type && <span className="error-message">{errors.contract_type}</span>}
        </div>

        <div className="form-group">
          <label>Profile Picture:</label>
          <div className="file-upload">
            <input
              type="file"
              id="profile_pic"
              name="profile_pic"
              accept="image/jpeg,image/png"
              onChange={handleFileChange}
              className={errors.profile_pic ? 'error' : ''}
            />
            <label htmlFor="profile_pic" className="file-upload-label">
              {profilePic ? 'Change Image' : 'Choose Image'}
            </label>
            {profilePic && (
              <span className="file-name">{profilePic.name}</span>
            )}
            {errors.profile_pic && <span className="error-message">{errors.profile_pic}</span>}
          </div>
          
          {previewImage && (
            <div className="image-preview">
              <img src={previewImage} alt="Preview" />
            </div>
          )}
        </div>

        <button type="submit" className="submit-button" disabled={plants.length === 0}>
          Add Employee
        </button>
      </form>
    </div>
  );
};

export default EmployeeForm;