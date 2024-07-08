import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginForm from './components/LoginForm';
import FormEntry from './components/FormEntry'; // Assuming you have this component

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginForm />} />
        <Route path="/form-entry" element={<FormEntry />} />
      </Routes>
    </Router>
  );
}

export default App;
