import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Dashboard from './Dashboard';
import Login from './Login';
import Download from './Download';
import DeleteAccount from './DeleteAccount';
import SeekerProfile from './SeekerProfile';
import ProviderProfile from './ProviderProfile';
import AddProviders from './AddProviders';
import ContactUs from './ContactUs';
import TermsAndConditions from './TermsAndConditions';
import RefundPolicy from './RefundPolicy';
import AddSeeker from './AddSeeker';
import AddJob from './AddJob';
import Subscriptions from './Subscriptions';
import Applications from './Applications';
import Notifications from './Notifications';
import ManageSubscriptions from './ManageSubscriptions.js';

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
        <Route path='/add-seeker' element={<AddSeeker />} />
        <Route path='/contact-us' element={<ContactUs />} />
        <Route path='/terms-and-conditions' element={<TermsAndConditions />} />
        <Route path='/refund-policy' element={<RefundPolicy />} />
        <Route path="/add-job/:providerId" element={<AddJob />} />
        <Route path="/subscriptions_users" element={<Subscriptions />} />
       <Route path="/Applications/:id" element={<Applications />} />
       <Route path="/notifications" element={<Notifications />} />
        <Route path="/manage-subscriptions" element={<ManageSubscriptions />} />

      </Routes>
    </Router>
  );
};

export default App;
