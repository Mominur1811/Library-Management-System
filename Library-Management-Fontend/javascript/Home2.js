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

        // Prepare parameters object
        const params = {};
        if (searchTerm) {
            params.search = searchTerm;
        }
        if (selectedCategory !== 'all') {
            params.category = selectedCategory;
        }
        // Make a GET request using Axios
        const response = await axios.get(apiUrl, { params });
        console.log(response.data.data.items)

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

    const resultList = document.createElement('ul');
    resultList.classList.add('book-list');

    results.forEach(book => {
        // Create a card container for each book
        const bookCard = document.createElement('div');
        bookCard.classList.add('book-card');

        // Title
        const titleElement = document.createElement('div');
        titleElement.textContent = book.book;
        titleElement.classList.add('title');
        bookCard.appendChild(titleElement);

        // Author
        const authorElement = document.createElement('div');
        authorElement.textContent = 'Author: ' + book.author; // Assuming 'author' is the property containing the author name
        authorElement.classList.add('author');
        bookCard.appendChild(authorElement);

        // Available count
        const availableElement = document.createElement('div');
        availableElement.textContent = 'Available: ' + book.available; // Assuming 'available' is the property containing the available count
        availableElement.classList.add('available-count');
        bookCard.appendChild(availableElement);

        // Short description (optional)
        const descriptionElement = document.createElement('p');
        descriptionElement.textContent = book.summary; // Assuming 'summary' is the property containing the short description
        bookCard.appendChild(descriptionElement);

        // Borrow button
        if (book.available > 0) {
            const borrowButton = document.createElement('a');
            borrowButton.textContent = 'Borrow';
            borrowButton.href = '#'; // Example link, replace with actual borrow functionality
            borrowButton.classList.add('borrow-button');

            // Add event listener to the borrow button
            borrowButton.addEventListener('click', function (event) {
                event.preventDefault(); // Prevent default link behavior (optional)

                // Show alert with confirm and cancel options
                const confirmation = confirm('Are you sure you want to borrow this book?');

                // If user confirms, call OrderPlaced function
                if (confirmation) {
                    orderPlaced(); // Call your function here
                } else {
                    // Handle cancel action (optional)
                    alert('Borrow canceled.');
                }
            });

            bookCard.appendChild(borrowButton);
        } else {
            const borrowButton = document.createElement('span');
            borrowButton.textContent = 'Not Available';
            borrowButton.classList.add('borrow-button', 'disabled');
            bookCard.appendChild(borrowButton);
        }

        // Append the book card to searchResults
        searchResults.appendChild(bookCard);
    });

    searchResults.appendChild(resultList);
}

function displayError(message) {
    searchResults.innerHTML = `<p>${message}</p>`;
}

function orderPlaced() {
    console.log("I am pressed")
}
