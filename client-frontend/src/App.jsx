import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ProblemsList from './pages/ProblemsList';
import Workspace from './pages/Workspace';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/problems" element={<ProblemsList />} />
          <Route path="/problems/:slug" element={<Workspace />} />
        </Route>

        {/* Catch all (404) */}
        <Route path="*" element={<h2>404 Not Found</h2>} />
      </Route>
    </Routes>
  );
}

export default App;