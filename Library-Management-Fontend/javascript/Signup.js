// Function to handle signup form submission
function handleSignupFormSubmit(event) {
    event.preventDefault();
    // Call the function to make the API request
    sendSignupData();
}

// Function to send signup data to the API
function sendSignupData() {
    // Get values from form inputs
    var username = document.getElementById('username').value;
    var email = document.getElementById('email').value;
    var password = document.getElementById('password').value;

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

// Event listener for form submission
document.getElementById('signup-form').addEventListener('submit', handleSignupFormSubmit);


