(function () {
    const API_BASE_URL = 'https://laundry-backend-api-production.up.railway.app/api';
    const savedApiBase = localStorage.getItem('laundry_api_base') || '';
    const isLocalhostApi = /^https?:\/\/(localhost|127\.0\.0\.1|\[?::1\]?)(:\d+)?\/api/i.test(savedApiBase);

    if (isLocalhostApi) {
        localStorage.removeItem('laundry_api_base');
    }

    window.API_BASE_URL = API_BASE_URL;
    window.LAUNDRY_API_BASE = isLocalhostApi ? API_BASE_URL : (savedApiBase || API_BASE_URL);
})();
