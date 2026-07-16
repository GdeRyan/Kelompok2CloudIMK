const API_URL = 'http://localhost:3000/api';

let currentParentId = null;
let navigationStack = [];

function getToken() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
        return null;
    }
    return token;
}

function authHeaders() {
    const token = getToken();
    if (!token) return null;
    return { 'Authorization': `Bearer ${token}` };
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    window.location.href = 'login.html';
}

document.addEventListener('DOMContentLoaded', () => {
    if (!localStorage.getItem('token')) {
        window.location.href = 'login.html';
        return;
    }
    loadFiles();

    const logoutBtn = document.getElementById('btn-logout');
    if (logoutBtn) logoutBtn.addEventListener('click', logout);

    const searchForm = document.getElementById('search-form');
    if (searchForm) {
        searchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const q = document.getElementById('search-input').value;
            searchFiles(q);
        });
    }
});

function showNotification(message, type = 'success') {
    const container = document.getElementById('notif-container');
    const notif = document.createElement('div');
    notif.className = type === 'success' ? 'notif-success' : 'notif-error';
    notif.innerHTML = `<h4>${message}</h4>`;
    container.appendChild(notif);
    setTimeout(() => notif.remove(), 3000);
}

function getFileIcon(type, name) {
    if (type === 'folder') return 'fa-folder';
    const ext = name.split('.').pop().toLowerCase();
    const iconMap = {
        pdf: 'fa-file-pdf', doc: 'fa-file-word', docx: 'fa-file-word',
        xls: 'fa-file-excel', xlsx: 'fa-file-excel',
        ppt: 'fa-file-powerpoint', pptx: 'fa-file-powerpoint',
        jpg: 'fa-file-image', jpeg: 'fa-file-image', png: 'fa-file-image', gif: 'fa-file-image',
        mp4: 'fa-file-video', avi: 'fa-file-video', mov: 'fa-file-video',
        mp3: 'fa-file-audio', wav: 'fa-file-audio',
        zip: 'fa-file-zipper', rar: 'fa-file-zipper',
        txt: 'fa-file-lines', js: 'fa-file-code', json: 'fa-file-code'
    };
    return iconMap[ext] || 'fa-file';
}

async function loadFiles(parentId = null) {
    const container = document.getElementById('file-preview-wrapper');
    if (!container) return;

    const headers = authHeaders();
    if (!headers) return;

    currentParentId = parentId;

    try {
        let url = `${API_URL}/files/list`;
        if (parentId) url += `?parentId=${parentId}`;

        const response = await fetch(url, { headers });
        if (response.status === 403) {
            logout();
            return;
        }
        const files = await response.json();
        renderFiles(files);
    } catch (error) {
        showNotification('GAGAL muat file', 'error');
    }
}

function renderFiles(files) {
    const container = document.getElementById('file-preview-wrapper');
    container.innerHTML = '';

    if (navigationStack.length > 0) {
        const backBtn = document.createElement('div');
        backBtn.className = 'folder-item back-item';
        backBtn.innerHTML = '<i class="fa-solid fa-arrow-left"></i> <span>Kembali</span>';
        backBtn.onclick = () => {
            navigationStack.pop();
            const prevParent = navigationStack[navigationStack.length - 1] || null;
            loadFiles(prevParent);
        };
        container.appendChild(backBtn);
    }

    if (!files || files.length === 0) {
        container.innerHTML += '<p class="empty-state">Belum ada file atau folder</p>';
        return;
    }

    files.forEach(item => {
        const div = document.createElement('div');
        div.className = item.type === 'folder' ? 'folder-container' : 'file-container';
        const icon = getFileIcon(item.type, item.name);

        div.innerHTML = `
            <i class="fa-solid ${icon}"></i>
            <span class="item-name" title="${item.name}">${item.name}</span>
            <i class="fa-solid fa-ellipsis-vertical menu-dots" onclick="toggleMenu(event, this)"></i>
            <div class="file-menu" style="display: none;" data-id="${item.id}" data-name="${item.name}" data-type="${item.type}">
                ${item.type === 'folder' ? '<button onclick="openFolder(event, this)"><i class="fa-solid fa-arrow-up-right-from-square"></i>Buka</button>' : '<button onclick="previewFile(event, this)"><i class="fa-solid fa-eye"></i>Preview</button>'}
                <button onclick="shareLink(event, this)"><i class="fa-solid fa-link"></i>Bagikan</button>
                <button onclick="renameItem(event, this)"><i class="fa-solid fa-pen"></i>Rename</button>
                ${item.type === 'file' ? '<button onclick="downloadFile(event, this)"><i class="fa-solid fa-download"></i>Unduh</button>' : ''}
                <button class="delete-btn" onclick="deleteItem(event, this)"><i class="fa-solid fa-trash"></i>Hapus</button>
            </div>
        `;

        if (item.type === 'folder') {
            div.querySelector('.item-name').addEventListener('click', () => openFolderById(item.id));
        }

        container.appendChild(div);
    });
}

function toggleMenu(event, el) {
    event.stopPropagation();
    document.querySelectorAll('.file-menu').forEach(m => {
        if (m !== el.nextElementSibling) m.style.display = 'none';
    });
    const menu = el.nextElementSibling;
    menu.style.display = (menu.style.display === 'flex') ? 'none' : 'flex';
}

document.addEventListener('click', () => {
    document.querySelectorAll('.file-menu').forEach(m => m.style.display = 'none');
});

function openFolder(event, btn) {
    event.stopPropagation();
    const menu = btn.parentElement;
    const folderId = menu.dataset.id;
    openFolderById(folderId);
}

function openFolderById(folderId) {
    navigationStack.push(currentParentId);
    loadFiles(folderId);
}

async function createNewFolder() {
    const { value: folderName } = await Swal.fire({
        title: 'Folder Baru',
        input: 'text',
        inputPlaceholder: 'apekaden...',
        showCancelButton: true,
        confirmButtonText: 'Ok',
        cancelButtonText: 'Ko',
        inputValidator: (value) => {
            if (!value) return 'ISIIIIIIII WOYYY';
        }
    });

    if (!folderName) return;

    const headers = authHeaders();
    if (!headers) return;

    try {
        const response = await fetch(`${API_URL}/files/create-folder`, {
            method: 'POST',
            headers: { ...headers, 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: folderName, parentId: currentParentId })
        });

        const result = await response.json();
        if (response.ok) {
            Swal.fire('Berhasil!', result.message, 'success');
            loadFiles(currentParentId);
        } else {
            Swal.fire('Error', result.message || 'GAGAL BUAT FOLDER', 'error');
        }
    } catch (error) {
        Swal.fire('Error', 'Gagal terhubung ke server', 'error');
    }
}

async function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const headers = authHeaders();
    if (!headers) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('parentId', currentParentId || '');

    try {
        const response = await fetch(`${API_URL}/files/upload`, {
            method: 'POST',
            headers: headers,
            body: formData
        });

        const result = await response.json();
        if (response.ok) {
            showNotification('File berhasil diupload!');
            loadFiles(currentParentId);
        } else {
            showNotification(result.message || 'Gagal upload', 'error');
        }
    } catch (error) {
        showNotification('Gagal terhubung ke server', 'error');
    }
    event.target.value = '';
}

async function handleFolderUpload(event) {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const headers = authHeaders();
    if (!headers) return;

    const folderName = files[0].webkitRelativePath.split('/')[0];

    try {
        const folderRes = await fetch(`${API_URL}/files/create-folder`, {
            method: 'POST',
            headers: { ...headers, 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: folderName, parentId: currentParentId })
        });
        const folderData = await folderRes.json();
        if (!folderRes.ok) {
            showNotification(folderData.message || 'Gagal membuat folder', 'error');
            return;
        }

        const newFolderId = folderData.folderId;

        for (const file of files) {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('parentId', newFolderId);
            await fetch(`${API_URL}/files/upload`, {
                method: 'POST',
                headers: headers,
                body: formData
            });
        }

        showNotification('Folder berhasil diupload!');
        loadFiles(currentParentId);
    } catch (error) {
        showNotification('Gagal upload folder', 'error');
    }
    event.target.value = '';
}

async function renameItem(event, btn) {
    event.stopPropagation();
    const menu = btn.parentElement;
    const id = parseInt(menu.dataset.id);
    const oldName = menu.dataset.name;

    const { value: newName } = await Swal.fire({
        title: 'Rename',
        input: 'text',
        inputValue: oldName,
        showCancelButton: true,
        confirmButtonText: 'Simpan',
        cancelButtonText: 'Batal',
        inputValidator: (value) => {
            if (!value) return 'Nama tidak boleh kosong';
        }
    });

    if (!newName || newName === oldName) return;

    const headers = authHeaders();
    if (!headers) return;

    try {
        const response = await fetch(`${API_URL}/files/rename`, {
            method: 'PATCH',
            headers: { ...headers, 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, newName })
        });

        const result = await response.json();
        if (response.ok) {
            showNotification(result.message);
            loadFiles(currentParentId);
        } else {
            showNotification(result.message || 'Gagal rename', 'error');
        }
    } catch (error) {
        showNotification('Gagal terhubung ke server', 'error');
    }
}

async function deleteItem(event, btn) {
    event.stopPropagation();
    const menu = btn.parentElement;
    const name = menu.dataset.name;
    const type = menu.dataset.type;

    const confirm = await Swal.fire({
        title: `Hapus ${type === 'folder' ? 'folder' : 'file'}?`,
        text: `"${name}" akan dihapus permanen`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Hapus',
        cancelButtonText: 'Batal',
        confirmButtonColor: '#d33'
    });

    if (!confirm.isConfirmed) return;

    const headers = authHeaders();
    if (!headers) return;

    try {
        let url;
        if (type === 'folder') {
            const id = menu.dataset.id;
            url = `${API_URL}/files/delete-folder/${id}`;
        } else {
            url = `${API_URL}/files/delete/${encodeURIComponent(name)}`;
        }

        const response = await fetch(url, { method: 'DELETE', headers });
        const result = await response.json();
        if (response.ok) {
            showNotification(result.message);
            loadFiles(currentParentId);
        } else {
            showNotification(result.message || 'Gagal hapus', 'error');
        }
    } catch (error) {
        showNotification('Gagal terhubung ke server', 'error');
    }
}

async function downloadFile(event, btn) {
    event.stopPropagation();
    const menu = btn.parentElement;
    const name = menu.dataset.name;

    const headers = authHeaders();
    if (!headers) return;

    try {
        const response = await fetch(`${API_URL}/files/download/${encodeURIComponent(name)}`, { headers });
        const result = await response.json();
        if (response.ok && result.downloadUrl) {
            window.open(result.downloadUrl, '_blank');
        } else {
            showNotification(result.message || 'Gagal download', 'error');
        }
    } catch (error) {
        showNotification('Gagal terhubung ke server', 'error');
    }
}

async function previewFile(event, btn) {
    event.stopPropagation();
    const menu = btn.parentElement;
    const name = menu.dataset.name;

    const headers = authHeaders();
    if (!headers) return;

    try {
        const response = await fetch(`${API_URL}/files/preview/${encodeURIComponent(name)}`, { headers });
        const result = await response.json();
        if (response.ok && result.url) {
            window.open(result.url, '_blank');
        } else {
            showNotification(result.message || 'Gagal preview', 'error');
        }
    } catch (error) {
        showNotification('Gagal terhubung ke server', 'error');
    }
}

async function shareLink(event, btn) {
    event.stopPropagation();
    const menu = btn.parentElement;
    const id = parseInt(menu.dataset.id);
    const name = menu.dataset.name;
    const isPublic = menu.dataset.type === 'file';

    const headers = authHeaders();
    if (!headers) return;

    try {
        const response = await fetch(`${API_URL}/files/update-access`, {
            method: 'PATCH',
            headers: { ...headers, 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, isPublic: true })
        });

        const result = await response.json();
        if (response.ok) {
            const shareUrl = `${window.location.origin}/preview.html?file=${encodeURIComponent(name)}`;
            await navigator.clipboard.writeText(shareUrl);
            Swal.fire({
                title: 'Link Disalin!',
                html: `Link share: <br><code style="word-break:break-all">${shareUrl}</code>`,
                icon: 'success'
            });
        } else {
            showNotification(result.message || 'Gagal share', 'error');
        }
    } catch (error) {
        showNotification('Gagal terhubung ke server', 'error');
    }
}

async function searchFiles(query) {
    if (!query || query.trim() === '') {
        loadFiles(currentParentId);
        return;
    }

    const headers = authHeaders();
    if (!headers) return;

    try {
        const response = await fetch(`${API_URL}/files/search?q=${encodeURIComponent(query)}`, { headers });
        const results = await response.json();
        renderFiles(results);
    } catch (error) {
        showNotification('Gagal mencari file', 'error');
    }
}
