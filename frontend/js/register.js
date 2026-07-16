const API_URL = 'http://localhost:3000/api';

document.getElementById('btn-register').addEventListener('click', async () => {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (!username || !password) {
        alert('Username dan password wajib diisi');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();
        alert(data.message);

        if (response.ok) {
            window.location.href = 'login.html';
        }
    } catch (err) {
        alert('Gagal terhubung ke server');
    }
});
