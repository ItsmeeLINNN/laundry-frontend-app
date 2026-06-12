(function () {
    const API_BASE = window.LAUNDRY_API_BASE || localStorage.getItem('laundry_api_base') || 'https://laundry-backend-api-production.up.railway.app/api';
    const PUBLIC_PAGES = ['index.html', 'login.html'];
    const VALID_LOGIN_ROLES = ['Admin', 'Kasir'];
    const SESSION_KEYS = [
        'auth_token',
        'laundry_token',
        'user_id',
        'user_name',
        'username',
        'user_role',
        'id_kasir',
        'nama_kasir',
        'username_kasir',
        'role_kasir'
    ];

    function currentPage() {
        const page = window.location.pathname.split('/').pop();
        return page || 'index.html';
    }

    function getToken() {
        return localStorage.getItem('auth_token') || localStorage.getItem('laundry_token') || '';
    }

    function normalizeRole(role) {
        const value = String(role || '').trim().toLowerCase();
        return VALID_LOGIN_ROLES.find(function (validRole) {
            return validRole.toLowerCase() === value;
        }) || '';
    }

    function getRole() {
        return normalizeRole(localStorage.getItem('user_role') || localStorage.getItem('role_kasir'));
    }

    function hasValidSession() {
        return Boolean(getToken() && getRole());
    }

    function setToken(token) {
        if (!token) {
            return;
        }

        localStorage.setItem('auth_token', token);
        localStorage.setItem('laundry_token', token);
    }

    function setSession(user, token) {
        const role = normalizeRole(user && (user.role || user.jabatan || user.user_role));

        if (!token || !role) {
            clearAuth();
            return false;
        }

        const id = user.id || user.user_id || '';
        const name = user.nama || user.name || user.user_name || user.username || '';
        const username = user.username || '';

        setToken(token);
        localStorage.setItem('user_id', id);
        localStorage.setItem('user_name', name);
        localStorage.setItem('username', username);
        localStorage.setItem('user_role', role);

        localStorage.setItem('id_kasir', id);
        localStorage.setItem('nama_kasir', name);
        localStorage.setItem('username_kasir', username);
        localStorage.setItem('role_kasir', role);

        return true;
    }

    function clearAuth() {
        SESSION_KEYS.forEach(function (key) {
            localStorage.removeItem(key);
        });
    }

    function redirectToLogin() {
        if (!PUBLIC_PAGES.includes(currentPage())) {
            window.location.href = 'index.html';
        }
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
            if (response.status === 401) {
                clearAuth();
                if (window.showToast && !PUBLIC_PAGES.includes(currentPage())) {
                    window.showToast('Sesi login habis. Silakan login ulang.', 'warning');
                }
                window.setTimeout(redirectToLogin, 700);
            }

            return response;
        });
    };

    async function checkPageAccess() {
        const page = currentPage();

        if (PUBLIC_PAGES.includes(page)) {
            if (hasValidSession()) {
                window.location.href = 'dashboard.html';
                return;
            }

            if (getToken() && !getRole()) {
                clearAuth();
            }

            return;
        }

        if (!getToken() || !getRole()) {
            clearAuth();
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
        VALID_LOGIN_ROLES,
        getToken,
        setToken,
        setSession,
        clearAuth,
        authHeaders,
        hasValidSession,
        role: getRole,
        userId: function () {
            return localStorage.getItem('user_id') || localStorage.getItem('id_kasir') || '';
        },
        userName: function () {
            return localStorage.getItem('user_name') || localStorage.getItem('nama_kasir') || '';
        },
        username: function () {
            return localStorage.getItem('username') || localStorage.getItem('username_kasir') || '';
        },
        isAdmin: function () {
            return getRole() === 'Admin';
        },
        isKasir: function () {
            return getRole() === 'Kasir';
        }
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', checkPageAccess);
    } else {
        checkPageAccess();
    }
})();
