import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import App from './App';
import { AppProviders } from './providers';
import './index.css';

/**
 * ⚠️ ROUTER LIVES HERE — Do NOT add <BrowserRouter basename="/MIHLab.github.io">, <Router>, or <MemoryRouter> anywhere else.
 * All route definitions go in App.tsx using <Routes> and <Route>.
 */
createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<BrowserRouter basename="/MIHLab.github.io">
			<AppProviders>
				<App />
			</AppProviders>
		</BrowserRouter>
	</StrictMode>,
);
