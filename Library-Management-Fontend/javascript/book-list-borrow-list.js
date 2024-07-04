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
            'authorization': localStorage.getItem('jwt_token'),
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



// View Book details 

const searchInput2 = document.getElementById('searchInput2');
const categoryDropdown2 = document.getElementById('category2');

searchInput2.addEventListener('input', filterBooks);
categoryDropdown2.addEventListener('change', filterBooks);

//Change page
var pageNum = 1
const nextButton = document.getElementById('next_button')
const prevButton = document.getElementById('prev_button')
nextButton.addEventListener('click', increasePageNum)
prevButton.addEventListener('click', decreasePageNum)

async function filterBooks() {
    const searchTerm = searchInput2.value.trim().toLowerCase();
    const selectedCategory = categoryDropdown2.value;

    try {
        // Define your API endpoint
        const apiUrl = 'http://localhost:3000/admin/searchbook'; // Replace with your actual API endpoint URL
        // Prepare headers
        const headers = {
            'Content-Type': 'application/json',
            'authorization': localStorage.getItem('jwt_token'),
        };
        console.log(localStorage.getItem('jwt_token'))

        // Prepare parameters object
        const params = {};
        params.pageNumber = pageNum
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
        displayResults2(items);
        console.log(response.data.data)
        var maxPage = response.data.data.totalPages
        if (parseInt(pageNum) == parseInt(maxPage)) { 
            hideButton(nextButton)
        } else {
            showButton(nextButton)
        }

        if (pageNum == 1) {
            console.log(pageNum)
            hideButton(prevButton)
        } else {
            showButton(prevButton)
        }
        updatePageInfo(pageNum, parseInt(maxPage))
    } catch (error) {
        // Handle error
        console.error('Error fetching data:', error);
        displayError('Failed to fetch books. Please try again.');
    }

}

function displayResults2(items) {

    const tableBody = document.getElementById('bookListBody');
    // Clear existing table rows
    tableBody.innerHTML = '';
    items.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
                <td>${item.id}</td>
                <td>${item.title}</td>
                <td>${item.author}
                <td>${item.quantity}</td>
                <td>${item.available}</td>
                <td></td>
            `;
        tableBody.appendChild(row);
    });
}

function increasePageNum() {
    pageNum = pageNum + 1;
    filterBooks()
}

function decreasePageNum() {
    pageNum = pageNum - 1;
    filterBooks()
}


function displayError(message) {
    searchResults.innerHTML = `<p>${message}</p>`;
}


// Function to hide a button
function hideButton(button) {
    if (button) {
        button.style.display = 'none';
    }
}

// Function to show a button
function showButton(button) {
    if (button) {
        button.style.display = 'inline-block'; // or 'block' depending on your layout needs
    }
}

// Function to update the page number in the <p> element
function updatePageInfo(currentPage, totalPages) {

    var pageInfoElement = document.getElementById('page_info');
    var totalPagesElement = document.getElementById('total_pages');
    console.log(currentPage, totalPages, "hihihi")

    if (pageInfoElement && totalPagesElement) {
        pageInfoElement.textContent = `Page ${currentPage} of `;
        totalPagesElement.textContent = totalPages;
    }

}