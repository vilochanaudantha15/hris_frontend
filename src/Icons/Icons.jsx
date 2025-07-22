import React from 'react';

// Google Icon (SVG placeholder)
export const GoogleIcon = () => {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.37 4.1-5.37 4.1-3.31 0-5.97-2.69-5.97-6s2.66-6 5.97-6c1.31 0 2.5.43 3.33 1.14l2.41-2.41C16.66 2.43 14.79 1.5 12 1.5c-5.24 0-9.5 4.26-9.5 9.5s4.26 9.5 9.5 9.5c5.38 0 9.25-3.78 9.25-9.25 0-.62-.06-1.22-.17-1.8z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-2.43 5.97-5.44l-2.41-2.41c-.83.71-2.02 1.14-3.33 1.14-2.76 0-5-2.24-5-5s2.24-5 5-5c1.31 0 2.5.43 3.33 1.14l2.41-2.41C16.66 2.43 14.79 1.5 12 1.5c-5.24 0-9.5 4.26-9.5 9.5s4.26 9.5 9.5 9.5z"
        fill="#34A853"
      />
      <path
        d="M5.63 14.65c-.15-.45-.25-.92-.25-1.4s.1-.95.25-1.4v-3h-3c-.56 1.2-.88 2.53-.88 4s.32 2.8.88 4h3z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.97c.96 0 1.82.33 2.5.88l1.88-1.88C15.14 3.87 13.66 3.19 12 3.19c-2.97 0-5.46 2.43-5.97 5.44l3 2.25c.59-.81 1.53-1.34 2.62-1.34z"
        fill="#EA4335"
      />
    </svg>
  );
};

// SitemarkWithText (Logo with text placeholder)
export const SitemarkWithText = () => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="20" cy="20" r="18" stroke="#3498db" strokeWidth="4" />
        <path d="M20 10L30 20L20 30L10 20L20 10Z" fill="#3498db" />
      </svg>
      <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#3498db' }}>HRIS</span>
    </div>
  );
};

// SitemarkIcon (Logo icon placeholder)
export const SitemarkIcon = () => {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" stroke="#3498db" strokeWidth="2" />
      <path d="M12 6L18 12L12 18L6 12L12 6Z" fill="#3498db" />
    </svg>
  );
};