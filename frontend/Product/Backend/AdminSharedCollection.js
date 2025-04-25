// --- Sidebar Toggle Logic ---
const sidebar = document.getElementById('adminSidebar');
const hamburgerButton = document.getElementById('hamburgerButton');
const sidebarOverlay = document.getElementById('sidebarOverlay');
const sidebarCloseButton = document.getElementById('sidebarCloseButton');

function openSidebar() {
    if (sidebar && sidebarOverlay) {
        sidebar.classList.add('open');
        sidebarOverlay.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent body scroll
    }
}

function closeSidebar() {
    if (sidebar && sidebarOverlay) {
        sidebar.classList.remove('open');
        sidebarOverlay.classList.remove('active');
        document.body.style.overflow = ''; // Restore body scroll
    }
}

// Event Listeners for Sidebar
if (hamburgerButton) {
    hamburgerButton.addEventListener('click', (e) => {
        e.stopPropagation();
        openSidebar();
    });
}

if (sidebarOverlay) {
    sidebarOverlay.addEventListener('click', closeSidebar);
}

if (sidebarCloseButton) {
    sidebarCloseButton.addEventListener('click', closeSidebar);
}

console.log("Admin Shared JS Loaded"); // Verify script loading

// You can add other shared admin functions here later