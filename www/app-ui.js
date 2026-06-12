(function () {
    const state = {
        pending: 0,
        ready: false
    };

    function ensureUi() {
        if (state.ready || !document.body) {
            return;
        }

        const toastHost = document.createElement('div');
        toastHost.id = 'global-toast-host';
        toastHost.style.cssText = [
            'position:fixed',
            'left:16px',
            'right:16px',
            'bottom:calc(18px + env(safe-area-inset-bottom, 0px))',
            'display:grid',
            'gap:10px',
            'z-index:99999',
            'pointer-events:none'
        ].join(';');

        const loading = document.createElement('div');
        loading.id = 'global-loading-screen';
        loading.style.cssText = [
            'position:fixed',
            'inset:0',
            'display:none',
            'place-items:center',
            'z-index:99998',
            'background:rgba(244,248,255,0.72)',
            'backdrop-filter:blur(3px)'
        ].join(';');
        loading.innerHTML = [
            '<div style="background:#fff;color:#15428f;border-radius:16px;padding:16px 18px;box-shadow:0 12px 30px rgba(21,66,143,.18);font:700 13px Segoe UI,Tahoma,sans-serif;display:flex;align-items:center;gap:10px;">',
            '<i class="fas fa-spinner fa-spin"></i>',
            '<span id="global-loading-text">Memuat...</span>',
            '</div>'
        ].join('');

        document.body.appendChild(toastHost);
        document.body.appendChild(loading);
        state.ready = true;
    }

    function toast(message, type) {
        ensureUi();

        const host = document.getElementById('global-toast-host');
        if (!host) {
            return;
        }

        const colorMap = {
            success: '#059669',
            error: '#dc2626',
            warning: '#d97706',
            info: '#15428f'
        };
        const item = document.createElement('div');
        item.style.cssText = [
            'pointer-events:auto',
            'background:#fff',
            'border-left:4px solid ' + (colorMap[type] || colorMap.info),
            'border-radius:12px',
            'padding:12px 14px',
            'box-shadow:0 10px 24px rgba(15,23,42,.16)',
            'color:#1f2d3d',
            'font:600 12px Segoe UI,Tahoma,sans-serif',
            'line-height:1.4',
            'transform:translateY(8px)',
            'opacity:0',
            'transition:.2s ease'
        ].join(';');
        item.textContent = String(message || '');
        host.appendChild(item);

        requestAnimationFrame(function () {
            item.style.transform = 'translateY(0)';
            item.style.opacity = '1';
        });

        window.setTimeout(function () {
            item.style.transform = 'translateY(8px)';
            item.style.opacity = '0';
            window.setTimeout(function () {
                item.remove();
            }, 220);
        }, 3200);
    }

    function showLoading(message) {
        ensureUi();
        state.pending += 1;
        const loading = document.getElementById('global-loading-screen');
        const text = document.getElementById('global-loading-text');

        if (text && message) {
            text.textContent = message;
        }

        if (loading) {
            loading.style.display = 'grid';
        }
    }

    function hideLoading(force) {
        ensureUi();
        state.pending = force ? 0 : Math.max(0, state.pending - 1);

        if (state.pending === 0) {
            const loading = document.getElementById('global-loading-screen');
            if (loading) {
                loading.style.display = 'none';
            }
        }
    }

    const nativeAlert = window.alert.bind(window);
    window.showToast = toast;
    window.showLoading = showLoading;
    window.hideLoading = hideLoading;
    window.nativeAlert = nativeAlert;
    window.alert = function (message) {
        toast(message, String(message || '').toLowerCase().includes('gagal') ? 'error' : 'info');
    };

    const originalFetch = window.fetch.bind(window);
    window.fetch = async function (input, init) {
        const method = String((init && init.method) || (input && input.method) || 'GET').toUpperCase();
        const shouldShowLoading = method !== 'GET';

        if (shouldShowLoading) {
            showLoading('Memproses...');
        }

        try {
            const response = await originalFetch(input, init);
            return response;
        } finally {
            if (shouldShowLoading) {
                hideLoading();
            }
        }
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', ensureUi);
    } else {
        ensureUi();
    }
})();
