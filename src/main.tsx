import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import App from './App';
import { AppProviders } from './providers';
import './index.css';

/**
<<<<<<< HEAD
 * ⚠️ ROUTER LIVES HERE — Do NOT add <BrowserRouter>, <Router>, or <MemoryRouter> anywhere else.
=======
 * ⚠️ ROUTER LIVES HERE — Do NOT add <BrowserRouter>, <Router>, or <MemoryRouter> anywhere else.
>>>>>>> refs/remotes/origin/main
 * All route definitions go in App.tsx using <Routes> and <Route>.
 */
createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<BrowserRouter>
			<AppProviders>
				<App />
			</AppProviders>
		</BrowserRouter>
	</StrictMode>,
);
