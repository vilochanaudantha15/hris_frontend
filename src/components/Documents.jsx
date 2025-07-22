import React, { useState, useEffect } from "react";
import {
  TextField,
  Box,
  Button,
  Modal,
  Paper,
  Typography,
  CircularProgress,
} from "@mui/material";
import axios from "axios";

const Documents = () => {
  const [documents, setDocuments] = useState([]);
  const [newDocument, setNewDocument] = useState({ name: "", file: null });
  const [openModal, setOpenModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const fetchDocuments = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No token found, please login again");
      }
      const response = await axios.get("http://localhost:4000/documents", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDocuments(response.data.user.documents || []);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to fetch documents");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleOpenModal = () => {
    setOpenModal(true);
    setNewDocument({ name: "", file: null });
    setError(null);
    setSuccess(null);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setNewDocument({ name: "", file: null });
    setError(null);
    setSuccess(null);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== "application/pdf") {
        setError("Only PDF files are allowed");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError("File size exceeds 5MB limit");
        return;
      }
      setNewDocument({ ...newDocument, file });
    }
  };

  const handleSubmit = async () => {
    if (!newDocument.file) {
      setError("Please select a file");
      return;
    }
    if (!newDocument.name) {
      setError("Document name is required");
      return;
    }

    const formData = new FormData();
    formData.append("document", newDocument.file);
    formData.append("name", newDocument.name);

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post("http://localhost:4000/documents", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      setSuccess("Document uploaded successfully");
      setDocuments([...documents, response.data.document]);
      setTimeout(() => {
        setOpenModal(false);
        setSuccess(null);
        setNewDocument({ name: "", file: null });
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to upload document");
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: "1200px", margin: "auto", padding: 4 }}>
      <Typography variant="h4" gutterBottom>
        Documents
      </Typography>
      {error && (
        <Typography color="error" gutterBottom>
          {error}
        </Typography>
      )}
      {success && (
        <Typography color="success.main" gutterBottom>
          {success}
        </Typography>
      )}
      <div className="documents-info glassmorphic">
        <div className="documents-grid">
          {documents.length > 0 ? (
            documents.map((doc, index) => (
              <div key={index} className="document-card">
                <div className="document-icon">
                  <i className={`fas fa-file-${doc.type.toLowerCase()}`}></i>
                </div>
                <div className="document-info">
                  <h3>{doc.name}</h3>
                  <p>
                    {doc.type} • {doc.size}
                  </p>
                </div>
                <Button
                  variant="contained"
                  color="primary"
                  href={`http://localhost:4000${doc.path}`}
                  download
                  className="download-btn"
                >
                  <i className="fas fa-download"></i> Download
                </Button>
              </div>
            ))
          ) : (
            <Typography>No documents available</Typography>
          )}
        </div>
        <Button
          variant="contained"
          color="primary"
          onClick={handleOpenModal}
          className="upload-btn"
          startIcon={<i className="fas fa-plus"></i>}
        >
          Upload New Document
        </Button>
      </div>

      <Modal open={openModal} onClose={handleCloseModal}>
        <Paper
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "90%",
            maxWidth: "600px",
            p: 4,
            background: "rgba(255, 255, 255, 0.1)",
            backdropFilter: "blur(10px)",
            borderRadius: "10px",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          }}
        >
          <Typography variant="h5" gutterBottom>
            Upload New Document
          </Typography>
          {error && (
            <Typography color="error" gutterBottom>
              {error}
            </Typography>
          )}
          {success && (
            <Typography color="success.main" gutterBottom>
              {success}
            </Typography>
          )}
          <div className="documents-info glassmorphic">
            <div className="info-grid">
              <div className="info-item">
                <label>Document Name</label>
                <TextField
                  value={newDocument.name}
                  onChange={(e) => setNewDocument({ ...newDocument, name: e.target.value })}
                  fullWidth
                  required
                />
              </div>
              <div className="info-item">
                <label>Upload File (PDF only)</label>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileChange}
                  style={{ marginTop: "8px" }}
                />
              </div>
            </div>
            <Box sx={{ mt: 4, display: "flex", gap: 2, justifyContent: "flex-end" }}>
              <Button variant="contained" color="error" onClick={handleCloseModal}>
                Cancel
              </Button>
              <Button variant="contained" color="success" onClick={handleSubmit}>
                Upload
              </Button>
            </Box>
          </div>
        </Paper>
      </Modal>
    </Box>
  );
};

export default Documents;