const searchInput = document.getElementById('searchInput');
const categoryDropdown = document.getElementById('categoryDropdown');
const searchButton = document.getElementById('searchButton');
const searchResults = document.getElementById('searchResults');

// Event listeners
searchButton.addEventListener('click', filterBooks);
searchInput.addEventListener('input', filterBooks);
categoryDropdown.addEventListener('change', filterBooks);
// Function to filter books based on search query and category
async function filterBooks() {
    const searchTerm = searchInput.value.trim().toLowerCase();
    const selectedCategory = categoryDropdown.value;

    try {
        // Define your API endpoint
        const apiUrl = 'http://localhost:3000/reader/searchbook'; // Replace with your actual API endpoint URL

        // Prepare headers
        const headers = {
            'Content-Type': 'application/json',
            'authorization': localStorage.getItem('jwt_token'),
        };
        console.log(localStorage.getItem('jwt_token'))

        // Prepare parameters object
        const params = {};
        if (searchTerm) {
            params.search = searchTerm;
        }
        if (selectedCategory !== 'all') {
            params.category = selectedCategory;
        }

        // Make a GET request using Axios
        const response = await axios.get(apiUrl, {
            params: params,
            headers: headers  // Corrected property name to 'headers'
        });

        // Handle successful response
        const items = response.data.data.items; // Extract the 'items' array from the response
        displayResults(items);
    } catch (error) {
        // Handle error
        console.error('Error fetching data:', error);
        displayError('Failed to fetch books. Please try again.');
    }

}

// Function to display filtered results
function displayResults(results) {
    searchResults.innerHTML = ''; // Clear previous results

    if (results.length === 0) {
        searchResults.innerHTML = '<p>No results found.</p>';
        return;
    }
    console.log(results)

    const resultList = document.createElement('ul');
    resultList.classList.add('book-list');

    results.forEach(book => {
        // Create a card container for each book
        const bookCard = document.createElement('div');
        bookCard.classList.add('book-card');

        // Image
        const imageElement = document.createElement('img');
        imageElement.src = '/home/mominur/Downloads/' + book.image; // Assuming 'imagePath' is the property containing the image URL
        imageElement.alt = book.title; // Optional: Provide alt text for the image
        imageElement.classList.add('book-image');
        bookCard.appendChild(imageElement);

        // Details container
        const detailsContainer = document.createElement('div');
        detailsContainer.classList.add('book-details');

        // Title
        const titleElement = document.createElement('div');
        titleElement.textContent = book.title;
        titleElement.classList.add('title');
        detailsContainer.appendChild(titleElement);

        // Author
        const authorElement = document.createElement('div');
        authorElement.textContent = 'Author: ' + book.author; // Assuming 'author' is the property containing the author name
        authorElement.classList.add('author');
        detailsContainer.appendChild(authorElement);

        // Available count
        const availableElement = document.createElement('div');
        availableElement.textContent = 'Available: ' + book.available; // Assuming 'available' is the property containing the available count
        availableElement.classList.add('available-count');
        detailsContainer.appendChild(availableElement);

        // Short description (optional)
        const descriptionElement = document.createElement('p');
        descriptionElement.textContent = book.summary; // Assuming 'summary' is the property containing the short description
        detailsContainer.appendChild(descriptionElement);

        // Borrow button
        const borrowButton = document.createElement('a');
        borrowButton.textContent = 'Borrow';
        borrowButton.href = '#'; // Example link, replace with actual borrow functionality
        borrowButton.classList.add('borrow-button');
        borrowButton.addEventListener('click', function (event) {
            event.preventDefault(); // Prevent default link behavior (optional)
            const confirmation = confirm('Are you sure you want to borrow this book?');
            if (confirmation) {
                orderPlaced(book.id); // Call your function here
            } else {
                alert('Borrow canceled.');
            }
        });
        detailsContainer.appendChild(borrowButton);

        // Append details container to book card
        bookCard.appendChild(detailsContainer);

        // Append book card to searchResults
        searchResults.appendChild(bookCard);
    });

    searchResults.appendChild(resultList);
}

function displayError(message) {
    searchResults.innerHTML = `<p>${message}</p>`;
}

function orderPlaced(bookId) {
    try {
        // Define your API endpoint
        const apiUrl = 'http://localhost:3000/reader/bookrequest';

        // Prepare headers
        const headers = {
            'Content-Type': 'application/json',
            'authorization': localStorage.getItem('jwt'),
        };

        // Data to send in the POST request
        const postData = {
            bookid: parseInt(bookId),
            readerid: parseInt(0), // Assuming you want to send readerid as integer 0
            request_status: "pending"
        };

        // Make a POST request using Axios
        axios.post(apiUrl, postData, {
            headers: headers
        })
            .then(response => {
                // Handle successful response
                console.log('Order Placed Successfully:', response.data); // Log the successful response data
                alert('Order Placed'); // Alert the user
                // Reset form if needed
                // document.getElementById('Signup-form').reset();
                // Redirect to Home.html
                window.location.href = 'Home.html';
            })
            .catch(error => {
                // Handle error
                console.error('Error:', error); // Log any errors to the console
                alert('Failed to place order. Please try again.'); // Alert the user about the error
            });

    } catch (error) {
        // Handle any unexpected errors
        console.error('Unexpected error occurred:', error);
        alert('An unexpected error occurred. Please try again.');
    }
}
