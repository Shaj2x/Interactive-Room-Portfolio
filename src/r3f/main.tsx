import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import Room3D from './Room3D';
import '../styles/global.css';
import '../styles/glass.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Room3D />
  </StrictMode>,
);
