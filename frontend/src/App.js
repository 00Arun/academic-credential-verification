import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Box, Container, CssBaseline } from '@mui/material';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Components
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import IssueCredential from './pages/IssueCredential';
import VerifyCredential from './pages/VerifyCredential';
import CredentialList from './pages/CredentialList';
import UniversityManagement from './pages/UniversityManagement';
import BlockchainInfo from './pages/BlockchainInfo';

// Context
import { BlockchainProvider } from './context/BlockchainContext';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  // Close sidebar when route changes
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <BlockchainProvider>
      <Box sx={{ display: 'flex', minHeight: '100vh' }}>
        <CssBaseline />
        
        {/* Header */}
        <Header onMenuClick={handleSidebarToggle} />
        
        {/* Sidebar */}
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        
        {/* Main Content */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            pt: { xs: 8, sm: 9 },
            pl: { xs: 0, sm: 0, md: 0 },
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          }}
        >
          <Container maxWidth="xl" sx={{ py: 3 }}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/issue" element={<IssueCredential />} />
              <Route path="/verify" element={<VerifyCredential />} />
              <Route path="/credentials" element={<CredentialList />} />
              <Route path="/universities" element={<UniversityManagement />} />
              <Route path="/blockchain" element={<BlockchainInfo />} />
            </Routes>
          </Container>
        </Box>
        
        {/* Toast Notifications */}
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </Box>
    </BlockchainProvider>
  );
}

export default App;
