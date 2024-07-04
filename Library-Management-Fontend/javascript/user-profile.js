const usernameElement = document.getElementById('username');
const emailElement = document.getElementById('email');
usernameElement.textContent = `Name: ${localStorage.getItem('username')}`;
emailElement.textContent = `Email: ${localStorage.getItem('email')}`;


const searchInput = document.getElementById('searchInput');
const categoryDropdown = document.getElementById('categoryDropdown');
// Event listeners
searchInput.addEventListener('input', filterHistory);
categoryDropdown.addEventListener('change', filterHistory);
// Function to filter books based on search query and category
async function filterHistory() {
    const searchTerm = searchInput.value.trim().toLowerCase();
    const selectedCategory = categoryDropdown.value;

    try {
        // Define your API endpoint
        const apiUrl = 'http://localhost:3000/reader/history'; // Replace with your actual API endpoint URL

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

        // Make a GET request using Axios
        const response = await axios.get(apiUrl, {
            params: params,
            headers: headers  // Corrected property name to 'headers'
        });

        // Handle successful response
        const items = response.data.data // Extract the 'items' array from the response
        console.log(response.data.data)
        displayResults(items);
    } catch (error) {
        // Handle error
        console.error('Error fetching data:', error);
        alert('Failed to fetch books. Please try again.');
    }

}

function displayResults(items) {
    const tableBody = document.getElementById('tableBody');
    // Clear existing table rows
    tableBody.innerHTML = '';
    items.forEach(item => {
        var percentage = (parseFloat(item.read_page) / parseFloat(item.total_page)) * 100;
        var roundedPercentage = Math.round(percentage * 100) / 100;

        const row = document.createElement('tr');
        row.innerHTML = `
                <td>${item.book_title}</td>
                <td>
                    <div style="display: flex; align-items: center; justify-content: flex-end;">
                        <span>${roundedPercentage}%</span>
                        ${item.request_status === 'Rejected' || item.request_status === 'pending' || item.request_status === 'Returned' ? '' : `<img src="../image/arrow.png" alt="Accept" style="cursor: pointer; margin-left: 5px;" onclick="handleProgress(${item.request_id})">`}
                    </div>
                </td>
                <td style="color: ${item.request_status === 'Rejected' ? 'red' : item.request_status === 'pending' ? 'orange' : 'green'};">
                            ${item.request_status}
                            ${item.request_status === 'Approved' ? `<button onclick="returnBook(${item.request_id}, '${item.book_id}')">Return</button>` : ''}

                </td>
                <td>${item.request_status === 'pending' ? 'Not Yet' : item.request_status === 'Rejected' ? '-' : item.request_status === 'Approved' ? formatDate(item.issued_at) : ''}</td>
                <td>${formatDate(item.created_at)}</td>
            `;
        tableBody.appendChild(row);
    });
}


function handleProgress(reqId) {
    var pagesInput = prompt('How many pages did you read today?', '');
    console.log(pagesInput)
    if (pagesInput !== null) { // If user didn't cancel
        updateProgress(reqId, pagesInput);
    }
}

function updateProgress(reqId, page) {
    const headers = {
        'Content-Type': 'application/json',
        'authorization': localStorage.getItem('jwt_token'),
    };

    axios.patch('http://localhost:3000/reader/updatereadprogress', {
        request_id: parseInt(reqId),
        page_cnt: parseInt(page)
    }, {
        headers: headers  // Pass headers object here
    })
        .then(function (response) {
            alert("Progress Updated Successfully!");
            // Refresh admin table
            filterHistory();
        })
        .catch(function (error) {
            alert("Error to Execute the Command!");
        });
}

function returnBook(reqId, bookId) {
    console.log("hihihi")
    const headers = {
        'Content-Type': 'application/json',
        'authorization': localStorage.getItem('jwt_token'),
    };
    console.log(reqId, bookId);
    axios.patch('http://localhost:3000//reader/returnbook', {
        request_id: parseInt(reqId),
        book_id: parseInt(bookId)
    }, {
        headers: headers  // Pass headers object here
    })
        .then(function (response) {
            alert("Book Returned Successfully!");

            // Refresh history table
            filterHistory();
        })
        .catch(function (error) {
            alert("Error to Execute the Command!");
        });
}



function formatDate(datetime) {
    let date = new Date(datetime);
    return `${date.getFullYear()}-${('0' + (date.getMonth() + 1)).slice(-2)}-${('0' + date.getDate()).slice(-2)}`;
}