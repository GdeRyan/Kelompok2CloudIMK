// --- Create Folder ---
async function createNewFolder() {
    const folderName = prompt("Nama Folder:");
    if (!folderName) return;

    document.getElementById('loading').style.display = 'block';

    try {
        const response = await fetch('http://localhost:3000/api/files/create-folder', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ name: folderName, parentId: null })
        });

        if (response.ok) {
            showNotification("Folder BERHASIL dibuat", "success");
            loadFiles();
        } else {
            showNotification("Gagal buat folder", "error");
        }
    } catch (err) {
        showNotification("Server error", "error");
    } finally {
        document.getElementById('loading').style.display = 'none';
    }
}

// --- Notifikasi ---
function showNotification(message, type) {
    const container = document.getElementById('notif-container');
    const notif = document.createElement('div');
    notif.className = type === 'success' ? 'notif-success' : 'notif-error';
    notif.innerHTML = `<h4>${message}</h4>`;
    container.appendChild(notif);
    setTimeout(() => notif.remove(), 3000);
}

// --- Tampil File & Folder ---
async function loadFiles() {
    const container = document.querySelector('.file-preview-wrapper');
    try {
        const response = await fetch('http://localhost:3000/api/files/list', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const files = await response.json();
        container.innerHTML = '';
        
        files.forEach(item => {
            const div = document.createElement('div');
            div.className = item.type === 'folder' ? 'folder-container' : 'file-container';
            div.innerHTML = `<span>${item.name}</span>`;
            container.appendChild(div);
        });
    } catch (err) {
        console.error("Gagal memuat data", err);
    }
}

document.addEventListener('DOMContentLoaded', loadFiles);

function toggleMenu(el) {
    const menu = el.nextElementSibling;
    menu.style.display = (menu.style.display === 'none') ? 'flex' : 'none';
}