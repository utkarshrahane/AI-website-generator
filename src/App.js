//App.js

import React from 'react';
import GenerateWebsite from './components/GenerateWebsite';
import './styles.css';

const App = () => {
  return (
    <div className="app-container">
      <h1>Generate your website</h1>
      <GenerateWebsite />
    </div>
  );
};

export default App;