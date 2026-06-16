import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import PatientManagement from './pages/PatientManagement';
import AddPatient from './pages/AddPatient';
import EditPatient from './pages/EditPatient';


function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/patients" element={<PatientManagement />} />
        <Route path="/patients/add" element={<AddPatient />} />
        <Route path="/patients/edit/:id" element={<EditPatient />} />
      </Routes>
    </Layout>
  );
}

export default App;