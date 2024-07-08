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
            params.borrowStatus = selectedCategory;
        }
        if (selectDateSearch) {
            params.borrowDate = selectDateSearch
        }

        // Make a GET request using Axios
        const response = await axios.get(apiUrl, {
            params: params,
            headers: headers  // Corrected property name to 'headers'
        });

        // Handle successful response
        const items = response.data.data.items; // Extract the 'items' array from the response
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
                <td> <button>Delete</button>
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
            <td>${item.id}</td>\
            <td>${item.title}</td>\
            <td>${item.author}</td>\
            <td>${item.quantity}</td>\
            <td>${item.available}</td>\
            <td>\
                <button onclick="deleteFunction('${item.id}')" class="custom-button">Delete</button>\
                <button onclick="editFunction('${item.id}', '${item.title}', '${item.author}','${item.category}', '${item.quantity}', '${item.available}','${item.total_page}', '${item.image_link}', '${item.summary}')" class="custom-button">Edit</button>\
            </td>`;
        tableBody.appendChild(row);
    });

}

function deleteFunction(book_id) {
    const params = {};
    params.book_id = book_id
    axios.delete(`http://localhost:3000/admin/deletebook`, {
        params: params
    })
        .then(function (response) {
            console.log('Book Deleted:', response.data);
            // Refresh admin table
            filterBooks()
        })
        .catch(function (error) {
            console.error('Error deleting book:', error);
        });
}

function editFunction(book_id, book_title, book_author, book_category, book_quantity, book_stock, book_page, book_image, book_summary) {
    // Create a modal or dialog box
    var modal = $('<div id="editModal" title="Edit Item"></div>');

    // Construct the dialog content with item details
    var content = `
    <form id="editForm">
        <p><label for="bookTitle">Book Title:</label><br>
           <input type="text" id="bookTitle" name="bookTitle" value="${book_title}" required></p>
        <p><label for="author">Author:</label><br>
           <input type="text" id="author" name="author" value="${book_author}" required></p>
        <p><label for="category">Category:</label><br>
           <div id="categoryContainer">
               <input type="text" id="category" name="category" value="${book_category}" required>
               <select id="categorySelect" style="display: none;">
                   <option value="fiction">Fiction</option>
                   <option value="nonfiction">Non-Fiction</option>
                   <option value="sci-fi">Science Fiction</option>
                   <option value="fantasy">Fantasy</option>
                   <!-- Add more options as needed -->
               </select>
           </div>
           <br><small><a href="#" id="changeCategoryLink">Change Category</a></small>
        </p>
        <p><label for="quantity">Quantity:</label><br>
           <input type="number" id="quantity" name="quantity" value="${book_quantity}" required></p>
        <p><label for="totalPage">Total Page:</label><br>
           <input type="number" id="totalPage" name="totalPage" value="${book_page}" required></p>
        <p><label for="imageLink">Image Link:</label><br>
           <input type="text" id="imageLink" name="imageLink" value="${book_image}" required></p>
        <p><label for="summary">Summary:</label><br>
           <textarea id="summary" name="summary" rows="4" required>${book_summary}</textarea></p>
    </form>`;

    modal.append(content);

    // Initialize the modal dialog
    modal.dialog({
        modal: true,
        width: 400,
        buttons: {
            Update: function () {
                // Validate form fields
                var isValid = true;

                $('#editForm input, #editForm textarea').each(function () {
                    if ($.trim($(this).val()) === '') {
                        isValid = false;
                        $(this).addClass('error');
                    } else {
                        $(this).removeClass('error');
                    }
                });

                if (!isValid) {
                    // Show error message or notification to user
                    alert('Please fill all required fields.');
                    return;
                }

                // Get updated values from the dialog inputs
                var updatedTitle = $('#bookTitle').val();
                var updatedAuthor = $('#author').val();
                var updatedCategory = $('#category').val();
                var updatedQuantity = $('#quantity').val();
                var updatedTotalPage = $('#totalPage').val();
                var updatedImageLink = $('#imageLink').val();
                var updatedSummary = $('#summary').val();
                var updatedStock = book_stock

                var temp = parseInt(book_quantity) - parseInt(updatedQuantity)
                updatedStock = parseInt(book_stock) - temp
                if (parseInt(updatedStock) < 0) {
                    alert('Invalid quantity decrease!');
                    return;
                }


                // Prepare data to send to the REST API
                var updatedItem = {
                    id: book_id,
                    title: updatedTitle,
                    author: updatedAuthor,
                    category: updatedCategory,
                    quantity: updatedQuantity,
                    available: updatedStock,
                    totalPage: updatedTotalPage,
                    imageLink: updatedImageLink,
                    summary: updatedSummary
                    // Add more fields if needed
                };

                // Call your REST API to update the item
                updateItem(updatedItem);

                // Close the dialog
                $(this).dialog('close');
            },
            Cancel: function () {
                $(this).dialog('close');
            }
        },
        close: function () {
            $(this).dialog('destroy').remove();
        }
    });

    // Toggle between manual input and dropdown list for category
    modal.on('click', '#changeCategoryLink', function (e) {
        e.preventDefault();
        $('#categoryContainer').find('input, select').toggle();
    });

    // Function to call your REST API to update the item
    function updateItem(updatedItem) {
        axios.put(`http://localhost:3000/admin/updatebook/${updatedItem.id}`, {
            title: updatedItem.title,
            author: updatedItem.author,
            category: updatedItem.category,
            quantity: parseInt(updatedItem.quantity),
            available: updatedItem.available,
            total_page: parseInt(updatedItem.totalPage),
            image_link: updatedItem.imageLink,
            summary: updatedItem.summary // Corrected field name
        })
            .then(response => {
                console.log('Update successful:', response.data);

                // Optionally handle the response or update UI
                alert('Book details updated successfully!');
            })
            .catch(error => {
                console.error('Error updating book details:', error);
                alert('Failed to update book details. Please try again.');
            });
    }

}



function increasePageNum() {
    pageNum = pageNum + 1;
    filterBooks()
}

function decreasePageNum() {
    pageNum = pageNum - 1;
    filterBooks()
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