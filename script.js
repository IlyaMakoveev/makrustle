let highestZIndex = 100;
const windowStates = {};

function updateClock() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });
    const clockElement = document.getElementById('clock');
    if (clockElement) {
        clockElement.textContent = timeString;
    }
}
setInterval(updateClock, 1000);
updateClock();

// Initialize Lucide icons
if (window.lucide) {
    window.lucide.createIcons();
}

// Menu handling
const menuItems = document.querySelectorAll('.menu-left .menu-item');
menuItems.forEach(item => {
    item.addEventListener('click', (e) => {
        e.stopPropagation();
        const dropdown = item.querySelector('.dropdown');
        if (dropdown) {
            // Close other dropdowns
            document.querySelectorAll('.dropdown').forEach(d => {
                if (d !== dropdown) d.classList.remove('active');
            });
            dropdown.classList.toggle('active');
        }
    });
});

// Handle dropdown items with links
document.querySelectorAll('.dropdown-item[data-link]').forEach(item => {
    item.addEventListener('click', (e) => {
        e.stopPropagation();
        const link = item.getAttribute('data-link');
        if (link) {
            window.open(link, '_blank');
        }
    });
});

document.addEventListener('click', () => {
    document.querySelectorAll('.dropdown').forEach(d => d.classList.remove('active'));
});

function openWindow(id) {
    const win = document.getElementById('window-' + id);
    if (win) {
        win.classList.remove('hidden');
        bringToFront(win);
    }
}

function closeWindow(id) {
    const win = document.getElementById('window-' + id);
    if (win) {
        win.classList.add('hidden');
    }
}

function toggleMaximize(id) {
    const win = document.getElementById('window-' + id);
    if (!win) return;

    if (windowStates[id]?.maximized) {
        // Restore
        win.style.top = windowStates[id].oldTop;
        win.style.left = windowStates[id].oldLeft;
        win.style.width = windowStates[id].oldWidth;
        win.style.height = windowStates[id].oldHeight;
        windowStates[id].maximized = false;
    } else {
        // Maximize
        windowStates[id] = {
            maximized: true,
            oldTop: win.style.top,
            oldLeft: win.style.left,
            oldWidth: win.style.width,
            oldHeight: win.style.height
        };
        win.style.top = '30px';
        win.style.left = '0';
        win.style.width = '100%';
        win.style.height = 'calc(100% - 60px)';
    }
}

// Add event listeners for close and maximize buttons
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.close-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const windowEl = btn.closest('.window');
            const id = windowEl.id.replace('window-', '');
            closeWindow(id);
        });
        btn.addEventListener('touchend', (e) => {
            e.stopPropagation();
            const windowEl = btn.closest('.window');
            const id = windowEl.id.replace('window-', '');
            closeWindow(id);
        }, { passive: false });
    });

    document.querySelectorAll('.maximize-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const windowEl = btn.closest('.window');
            const id = windowEl.id.replace('window-', '');
            toggleMaximize(id);
        });
        btn.addEventListener('touchend', (e) => {
            e.stopPropagation();
            const windowEl = btn.closest('.window');
            const id = windowEl.id.replace('window-', '');
            toggleMaximize(id);
        }, { passive: false });
    });
});

function bringToFront(win) {
    highestZIndex++;
    win.style.zIndex = highestZIndex;
}

// Dragging logic
const windows = document.querySelectorAll('.window');
windows.forEach(win => {
    const header = win.querySelector('.window-header');
    const id = win.id.replace('window-', '');
    let isDragging = false;
    let offsetX, offsetY;

    header.addEventListener('mousedown', startDrag);
    header.addEventListener('touchstart', startDrag, { passive: false });

    function startDrag(e) {
        if (windowStates[id]?.maximized) return;
        
        // Не начинаем перетаскивание, если кликнули на кнопки управления
        if (e.target.closest('.window-controls')) return;
        
        isDragging = true;
        bringToFront(win);
        
        const clientX = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
        const clientY = e.type === 'touchstart' ? e.touches[0].clientY : e.clientY;
        
        offsetX = clientX - win.offsetLeft;
        offsetY = clientY - win.offsetTop;

        document.addEventListener('mousemove', drag);
        document.addEventListener('touchmove', drag, { passive: false });
        document.addEventListener('mouseup', stopDrag);
        document.addEventListener('touchend', stopDrag);
        
        if (e.type === 'touchstart') e.preventDefault();
    }

    function drag(e) {
        if (!isDragging) return;
        
        const clientX = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
        const clientY = e.type === 'touchmove' ? e.touches[0].clientY : e.clientY;

        let x = clientX - offsetX;
        let y = clientY - offsetY;

        // Boundaries
        x = Math.max(0, Math.min(x, window.innerWidth - 50));
        y = Math.max(30, Math.min(y, window.innerHeight - 60));

        win.style.left = x + 'px';
        win.style.top = y + 'px';
        
        if (e.type === 'touchmove') e.preventDefault();
    }

    function stopDrag() {
        isDragging = false;
        document.removeEventListener('mousemove', drag);
        document.removeEventListener('touchmove', drag);
    }

    win.addEventListener('mousedown', () => bringToFront(win));
    win.addEventListener('touchstart', () => bringToFront(win));
});

// Initial mobile check
if (window.innerWidth < 768) {
    const welcome = document.getElementById('window-welcome');
    if (welcome) {
        welcome.style.left = '10px';
        welcome.style.top = '60px';
        welcome.style.width = 'calc(100% - 20px)';
    }
}
