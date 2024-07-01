const searchInput = document.getElementById('req_book_name');
const categoryDropdown = document.getElementById('req_category');
const browseButton = document.getElementById("imageLink");

searchInput.addEventListener('input', filterReqBooks);
categoryDropdown.addEventListener('change', filterReqBooks);

function navigateTo(url) {
    window.location.href = url;
}

// Function to filter books based on search query and category
async function filterReqBooks() {
    const searchTerm = searchInput.value.trim().toLowerCase();
    const selectedCategory = categoryDropdown.value;

    try {
        const apiUrl = 'http://localhost:3000/admin/fetchbookrequest'; // Replace with your actual API endpoint URL
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error('Failed to fetch data');
        }
        const data = await response.json();

        const tableBody = document.getElementById('req_tbody');
        // Clear existing table rows
        tableBody.innerHTML = '';
        console.log(data.data)
        data.data.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.book_id}</td>
                <td>${item.book_title}</td>
                <td>${item.reader_name}</td>
                <td>${item.book_available}</td>
                <td>
                    <img src="../image/accept.png" alt="Accept" onclick="handleAccept(${item.RequestId}, ${item.book_id})">
                    <img src="../image/delete.png" alt="Delete" onclick="handleDelete(${item.RequestId})">
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


