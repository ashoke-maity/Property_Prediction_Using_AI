import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import WebHome from '../pages/web/Home';
import MobileHome from '../pages/mobile/Home';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<WebHome />} />
        <Route path="/mobile" element={<MobileHome />} />
      </Routes>
    </Router>
  );
}

export default App;
