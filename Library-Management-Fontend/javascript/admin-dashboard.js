const searchInput = document.getElementById('req_book_name');
const categoryDropdown = document.getElementById('req_category');
const browseButton = document.getElementById("imageLink");

searchInput.addEventListener('input', filterReqBooks);
categoryDropdown.addEventListener('change', filterReqBooks);

var sAdmin = localStorage.getItem('role');
if (sAdmin === 'admin') {
    var subAdminCard = document.getElementById('sub_admin');
    if (subAdminCard) {
        subAdminCard.style.pointerEvents = 'none';  // Disable click events
        subAdminCard.style.opacity = '0.5';         // Reduce opacity to visually indicate disabled state
    }
}

function navigateTo(url) {
    window.location.href = url;
}

// Function to filter books based on search query and category
async function filterReqBooks() {
    const searchTerm = searchInput.value.trim().toLowerCase();
    const selectedCategory = categoryDropdown.value;

    try {
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
        if (selectedCategory != 'all') {
            params.category = selectedCategory
        }
        params.borrowStatus = "Pending";
        // Make a GET request using Axios
        const response = await axios.get(apiUrl, {
            params: params,
            // headers: headers  // Corrected property name to 'headers'
        });

        // Handle successful response
        const items = response.data.data.items // Extract the 'items' array from the response

        const tableBody = document.getElementById('req_tbody');
        // Clear existing table rows
        tableBody.innerHTML = '';
        console.log(items)
        items.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.book_id}</td>
                <td>${item.book_title}</td>
                <td>${item.borrower_name}</td>
                <td>${item.book_available}</td>
                <td>
                    <img src="../image/accept.png" alt="Accept" onclick="handleAccept(${item.request_id}, ${item.book_id})">
                    <img src="../image/delete.png" alt="Delete" onclick="handleDelete(${item.request_id})">
                </td>
            `;
            tableBody.appendChild(row);
        });

    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

function handleAccept(reqId, bookId) {

    console.log(reqId, bookId)
    const confirmation = confirm('Are you sure you want to borrow this book?');
    if (confirmation) {
        ConfirmBorrow(reqId, bookId); // Call your function here
    } else {
        alert('Borrow canceled.');
    }
}

function ConfirmBorrow(reqId, book_id) {

    axios.patch('http://localhost:3000/admin/approvedbookrequest', {
        request_id: parseInt(reqId),
        book_id: parseInt(book_id)
    })
        .then(response => {
            // Handle successful response
            console.log('Borrow Status: ', response.data); // Log the successful response data
            filterReqBooks()

        })
        .catch(error => {
            // Handle error
            console.error(error); // Log any errors to the console
            alert('Book Add Failed. Please try again.'); // Alert the user about the error
        });

}

function handleDelete(reqId) {

    axios.patch('http://localhost:3000/admin/rejectborrowreq', {
        request_id: parseInt(reqId)
    })
        .then(function (response) {
            alert("Borrow Request Rejected Successfully!")
            // Refresh admin table
            filterReqBooks()
        })
        .catch(function (error) {
            alert("Error to Execute the Command!")
        });
}

browseButton.addEventListener("click", function () {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.style.display = "none";

    // When file input changes
    fileInput.addEventListener("change", function () {
        const file = this.files[0]; // Get the selected file

        if (file) {
            const reader = new FileReader();

            // Read file as data URL
            reader.readAsDataURL(file);

            // When file reading is complete
            reader.onload = function () {
                // Set imageLinkInput value to the data URL (or file path if possible)
                imageLink.value = file.name; // Example: display file name as path
            };
        }
    });

    // Trigger click event on the file input
    document.body.appendChild(fileInput);
    fileInput.click();

    // Clean up: remove file input from the DOM
    document.body.removeChild(fileInput);
});


function handleBookAdd(event) {
    event.preventDefault();

    var title = document.getElementById('title').value;
    var category = document.getElementById('category').value;
    var author = document.getElementById('author').value;
    var quantity = document.getElementById('quantity').value;
    var available = document.getElementById('available').value;
    var summary = document.getElementById('summary').value;
    var total_page = document.getElementById('totalPage').value;
    var image_link = document.getElementById('imageLink').value;
    console.log(title, category, author, quantity, available, summary, total_page, image_link)

    axios.post('http://localhost:3000/admin/addbook', {
        title: title,
        category: category,
        author: author,
        quantity: parseInt(quantity),
        available: parseInt(available),
        summary: summary,
        total_page: parseInt(total_page),
        image_link: image_link
    })
        .then(response => {
            // Handle successful response
            console.log('Book Add Successful:', response.data); // Log the successful response data
            alert("Book added successfully!")
            document.getElementById('addBookForm').reset(); // Clear the form
        })
        .catch(error => {
            // Handle error
            console.error(error); // Log any errors to the console
            alert('Book Add Failed. Please try again.'); // Alert the user about the error
        });
}

// Load Book Request
filterReqBooks();
// Event listener for SignUp form submission
document.getElementById('addBookForm').addEventListener('submit', handleBookAdd);


