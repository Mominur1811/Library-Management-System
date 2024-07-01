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

    // Dummy check for successful login (replace with your own authentication logic)
    if (emailValue !== '' && passwordValue !== '') {
        alert('Login successful!');
        form.reset(); // Reset form after successful login
    }
});

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
