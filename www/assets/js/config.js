(function () {
    const remoteApi = 'https://laundry-backend-api-production.up.railway.app/api';
    const isLocal = window.location.protocol === 'file:' || ['localhost', '127.0.0.1', '::1'].includes(window.location.hostname);
    window.LAUNDRY_API_BASE = localStorage.getItem('laundry_api_base') || (isLocal ? 'http://localhost:3000/api' : remoteApi);
})();
