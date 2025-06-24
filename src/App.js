import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Dashboard from './Dashboard';
import Login from './Login';
import Download from './Download';
import DeleteAccount from './DeleteAccount';
import SeekerProfile from './SeekerProfile';
import ProviderProfile from './ProviderProfile';
import AddProviders from './AddProviders';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Dashboard />} />
        <Route path="/download" element={<Download />} />
        <Route path="/delete-account" element={<DeleteAccount />} />
        <Route path="/seeker-profile/:id" element={<SeekerProfile />} />
        <Route path="/provider/:id" element={<ProviderProfile />} />
        <Route path='/add-providers' element={<AddProviders />} />

      </Routes>
    </Router>
  );
};

export default App;
