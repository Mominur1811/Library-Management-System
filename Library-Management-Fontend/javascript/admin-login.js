const form = document.getElementById('loginForm');

form.addEventListener('submit', function (event) {
    event.preventDefault();

    // Validation
    const email = document.getElementById('email');
    const password = document.getElementById('password');
    const emailValue = email.value.trim();
    const passwordValue = password.value.trim();

    if (emailValue === '') {
        setErrorFor(email, 'Email cannot be blank');
    } else if (!isEmail(emailValue)) {
        setErrorFor(email, 'Not a valid email');
    } else {
        setSuccessFor(email);
    }

    if (passwordValue === '') {
        setErrorFor(password, 'Password cannot be blank');
    } else {
        setSuccessFor(password);
    }

    validateLogin()
});

//Function to send signin data to the API
function validateLogin() {

    var email = document.getElementById('email').value;
    var password = document.getElementById('password').value;
    console.log(email, password)
    axios.post('http://localhost:3000/admin/login', {
        email: email,
        password: password
    })
        .then(response => {

            console.log(response.data.data)
            localStorage.setItem('username', response.data.data.username)
            localStorage.setItem('email', response.data.data.email)
            localStorage.setItem('jwt_token', response.data.data.jwt_token)
            localStorage.setItem('role', response.data.data.role)
            alert('Login Data successful!'); // Alert the user
            //document.getElementById('Signup-form').reset(); // Clear the form
            window.location.href = 'admin-dashboard.html';
        })
        .catch(error => {
            // Handle error
            console.error('Error:', error); // Log any errors to the console
            alert('Login failed. Please try again.'); // Alert the user about the error
        });
}

function setErrorFor(input, message) {
    const formGroup = input.parentElement;
    const small = formGroup.querySelector('small');
    small.innerText = message;
    small.style.display = 'block';
    formGroup.className = 'form-group error';
}

function setSuccessFor(input) {
    const formGroup = input.parentElement;
    const small = formGroup.querySelector('small');
    small.style.display = 'none';
    formGroup.className = 'form-group success';
}

function isEmail(email) {
    // Simple regex for email validation
    return /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email);
}
