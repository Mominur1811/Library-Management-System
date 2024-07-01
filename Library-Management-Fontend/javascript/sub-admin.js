document.addEventListener('DOMContentLoaded', function () {
    // Fetch admin data and populate table
    fetchAdminData();

    // Form submission handling
    const form = document.getElementById('createAdminForm');
    form.addEventListener('submit', function (event) {
        event.preventDefault();
        createAdmin();
    });
});

function fetchAdminData() {
    axios.get('http://localhost:3000/admin/fetchadmin')
        .then(function (response) {
            const admins = response.data;
            console.log(admins)
            populateAdminTable(admins)


        })
        .catch(function (error) {
            console.error('Error fetching admin data:', error);
        });
}

function createAdmin() {
    const email = document.getElementById('newEmail').value;
    const password = document.getElementById('newPassword').value;

    axios.post('http://localhost:3000/admin/addadmin', {
        email: email,
        password: password
    })
        .then(response => {
            alert('Admin created successfully!'); // Alert the user
            //  document.getElementById('Signup-form').reset(); // Clear the form
            fetchAdminData()
        })
        .catch(error => {
            // Handle error
            console.error('Error:', error); // Log any errors to the console
            alert('Admin creation failed failed. Please try again.'); // Alert the user about the error
        });
}

function populateAdminTable(data) {

    const tableBody = document.getElementById('tableBody');
    tableBody.innerHTML = '';

    data.data.forEach(user => {
        const row = `
                <tr>
                    <td>${user.email}</td>
                    <td>
                    <img src="../image/trash.png" alt="Accept" onclick="deleteAdmin('${user.email}')">
                </td>
                </tr>
            `;
        tableBody.innerHTML += row;
    });   //shows error -fetching admin data: TypeError: data.forEach is not a function
}

function deleteAdmin(adminEmail) {

    const confirmation = confirm('Are you sure you want to borrow this book?');
    if (confirmation) {
        ConfirmDelete(adminEmail); // Call your function here
    } else {
        alert('Borrow canceled.');
    }
}
function ConfirmDelete(adminEmail) { // Prepare parameters object
    const params = {};
    params.email = adminEmail
    axios.delete(`http://localhost:3000/admin/deleteadmin`, {
        params: params
    })
        .then(function (response) {
            console.log('Admin deleted:', response.data);
            // Refresh admin table
            fetchAdminData();
        })
        .catch(function (error) {
            console.error('Error deleting admin:', error);
        });
}
