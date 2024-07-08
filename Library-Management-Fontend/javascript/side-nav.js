function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    sidebar.classList.toggle('active');
}


var logoutButton = document.getElementById('logout')
logoutButton.addEventListener('click', performLogout)


function performLogout() {
    localStorage.removeItem('email')
    localStorage.removeItem('jwt_token')
    localStorage.removeItem('role')
    localStorage.removeItem('username')
    top.window.location.href = 'admin-login.html';
}