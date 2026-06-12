(function () {
    const API_BASE = window.LAUNDRY_API_BASE || localStorage.getItem('laundry_api_base') || 'https://laundry-backend-api-production.up.railway.app/api';
    const PUBLIC_PAGES = ['index.html', 'login.html'];

    function currentPage() {
        const page = window.location.pathname.split('/').pop();
        return page || 'index.html';
    }

    function getToken() {
        return localStorage.getItem('auth_token') || localStorage.getItem('laundry_token') || '';
    }

    function setToken(token) {
        if (!token) {
            return;
        }

        localStorage.setItem('auth_token', token);
        localStorage.setItem('laundry_token', token);
    }

    function clearAuth() {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('laundry_token');
        localStorage.removeItem('id_kasir');
        localStorage.removeItem('nama_kasir');
        localStorage.removeItem('username_kasir');
        localStorage.removeItem('role_kasir');
    }

    function isApiUrl(value) {
        return String(value || '').includes('/api/');
    }

    function authHeaders(extraHeaders) {
        const headers = new Headers(extraHeaders || {});
        const token = getToken();

        if (token && !headers.has('Authorization')) {
            headers.set('Authorization', 'Bearer ' + token);
        }

        return headers;
    }

    const previousFetch = window.fetch.bind(window);
    window.fetch = function (input, init) {
        const url = input instanceof Request ? input.url : String(input);
        const options = { ...(init || {}) };

        if (isApiUrl(url)) {
            options.headers = authHeaders(options.headers || (input instanceof Request ? input.headers : undefined));
        }

        return previousFetch(input, options).then(function (response) {
            if (response.status === 401 && !PUBLIC_PAGES.includes(currentPage())) {
                clearAuth();
                if (window.showToast) {
                    window.showToast('Sesi login habis. Silakan login ulang.', 'warning');
                }
                window.setTimeout(function () {
                    window.location.href = 'index.html';
                }, 700);
            }

            return response;
        });
    };

    async function checkPageAccess() {
        const page = currentPage();

        if (PUBLIC_PAGES.includes(page)) {
            return;
        }

        if (!getToken()) {
            window.location.href = 'index.html';
            return;
        }

        try {
            const response = await fetch(`${API_BASE}/access-control/me?path=${encodeURIComponent(page)}`, {
                headers: { Accept: 'application/json' }
            });
            const result = await response.json();
            const allowed = result && result.data ? result.data.allowed : true;

            if (!allowed) {
                if (window.showToast) {
                    window.showToast('Akses halaman ini ditolak untuk jabatan Anda.', 'error');
                }

                window.setTimeout(function () {
                    window.location.href = 'dashboard.html';
                }, 700);
            }
        } catch (error) {
            console.warn('Access guard fallback:', error.message);
        }
    }

    window.LaundryAuth = {
        API_BASE,
        getToken,
        setToken,
        clearAuth,
        authHeaders,
        role: function () {
            return localStorage.getItem('role_kasir') || 'Karyawan';
        },
        isAdmin: function () {
            return this.role() === 'Admin';
        }
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', checkPageAccess);
    } else {
        checkPageAccess();
    }
})();
