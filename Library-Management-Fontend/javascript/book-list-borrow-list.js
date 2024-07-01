const searchInput1 = document.getElementById('searchInput1');
const categoryDropdown1 = document.getElementById('category1');
const dateSearch = document.getElementById('dateInput1')

// Event listeners
searchInput1.addEventListener('input', filterBorrowBooks);
categoryDropdown1.addEventListener('change', filterBorrowBooks);
dateSearch.addEventListener('input', filterBorrowBooks)

// Function to filter books based on search query and category
async function filterBorrowBooks() {
    const searchTerm = searchInput1.value.trim().toLowerCase();
    const selectedCategory = categoryDropdown1.value;
    const selectDateSearch = dateSearch.value

    try {
        // Define your API endpoint
        const apiUrl = 'http://localhost:3000/admin/borrowedbook'; // Replace with your actual API endpoint URL

        // Prepare headers
        const headers = {
            'Content-Type': 'application/json',
            'authorization': localStorage.getItem('jwt'),
        };

        // Prepare parameters object
        const params = {};
        if (searchTerm) {
            params.search = searchTerm;
        }
        if (selectedCategory !== 'all') {
            params.category = selectedCategory;
        }
        if (selectDateSearch) {
            params.dateSearch = selectDateSearch
        }

        // Make a GET request using Axios
        const response = await axios.get(apiUrl, {
            params: params,
            headers: headers  // Corrected property name to 'headers'
        });

        // Handle successful response
        const items = response.data.data; // Extract the 'items' array from the response
        console.log(items)
        displayResults1(items);
    } catch (error) {
        // Handle error
        console.error('Error fetching data:', error);
        displayError('Failed to fetch books. Please try again.');
    }

}

function displayResults1(items) {
    const tableBody = document.getElementById('borrowListBody');
    // Clear existing table rows
    tableBody.innerHTML = '';
    console.log("Hello")
    console.log(items)
    items.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
                <td>${item.book_id}</td>
                <td>${item.book_title}</td>
                <td>${item.reader_name}</td>
                <td>${item.issued_at}</td>
            `;
        tableBody.appendChild(row);
    });
}