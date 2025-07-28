// Bootstrap for FormMonkey application
// This file initializes the application and global services
// Import global styles
import './styles/global.css';
// Initialize API service
import './services/api';
// Set up error logging
window.addEventListener('error', (event) => {
    // Log errors to console in development
    // In production, this would send to a monitoring service
    console.error('Application error:', event.error);
});
// Export startup function for potential programmatic use
export function initializeApp() {
    console.log('FormMonkey application initialized');
}
// Auto-run initialization
initializeApp();
