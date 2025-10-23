import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import QuantumSimulator from './Simulador.jsx'

createRoot(document.getElementById('root')).render(
	<StrictMode>
		{/* <QuantumSimulator /> */}
		<QuantumSimulator />
	</StrictMode>
);
