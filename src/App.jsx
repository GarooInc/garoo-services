import './App.module.css';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';

import { WorkerProvider } from './config/WorkerProvider.jsx';
import Workers from './pages/Workers';
import Home from './pages/Home';
import Gallery from './pages/Gallery';

function App() {
  return (

    <WorkerProvider>

      <Router>
        <main className='min-vh-100 border border-5 rounded p-3'>

          <Routes>
            <Route path="/" element={<Workers />} />
            <Route path="/workers" element={<Workers />} />
            <Route path="/gallery" element={<Gallery />} />
          </Routes>

        </main>
      </Router>

    </WorkerProvider>

  );
}

export default App;