const signUpButton = document.getElementById('signUp');
const signInButton = document.getElementById('signIn');
const container = document.getElementById('container');

signUpButton.addEventListener('click', () => {
    container.classList.add("right-panel-active");

});

signInButton.addEventListener('click', () => {
    container.classList.remove("right-panel-active");
});


function handleSignINFormSubmit(event) {
    event.preventDefault();
    sendLoginData();
}

// Function to handle signup form submission
function handleSignupFormSubmit(event) {
    event.preventDefault();
    sendSignupData();
}

//Function to send signin data to the API
function sendLoginData() {

    var email = document.getElementById('loginemail').value;
    var password = document.getElementById('loginpassword').value;
    console.log(email, password)
    axios.post('http://localhost:3000/reader/login', {
        email: email,
        password: password
    })
        .then(response => {

            console.log(response.data.data.jwt_token)
            localStorage.setItem('username', response.data.data.username)
            localStorage.setItem('email', response.data.data.email)
            localStorage.setItem('jwt_token', response.data.data.jwt_token)
            alert('Login Data successful!'); // Alert the user
            //document.getElementById('Signup-form').reset(); // Clear the form
            // window.location.href = 'Home.html';
        })
        .catch(error => {
            // Handle error
            console.error('Error:', error); // Log any errors to the console
            alert('Login failed. Please try again.'); // Alert the user about the error
        });
}

// Function to send signup data to the API
function sendSignupData() {
    // Get values from form inputs
    var username = document.getElementById('username').value;
    var email = document.getElementById('email').value;
    var password = document.getElementById('password').value;
    console.log(username, email, password)

    // Configure the Axios POST request
    axios.post('http://localhost:3000/reader/register', {
        name: username,
        email: email,
        password: password
    })
        .then(response => {
            // Handle successful response
            console.log('Signup successful:', response.data); // Log the successful response data
            alert('Signup successful!'); // Alert the user
            document.getElementById('signup-form').reset(); // Clear the form
        })
        .catch(error => {
            // Handle error
            console.error('Error:', error); // Log any errors to the console
            alert('Signup failed. Please try again.'); // Alert the user about the error
        });
}


// Event listener for SignUp form submission
document.getElementById('Signup-form').addEventListener('submit', handleSignupFormSubmit);

// Event listener for SignIn form submission
document.getElementById('Signin-form').addEventListener('submit', handleSignINFormSubmit);