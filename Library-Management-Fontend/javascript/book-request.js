document.addEventListener('DOMContentLoaded', async function () {
    try {
        const apiUrl = 'http://localhost:3000/admin/fetchbookrequest'; // Replace with your actual API endpoint URL
        const response = await fetch(apiUrl);
        const data = await response.json();
        const container = document.getElementById('requests-container');

        // Loop through each request item and create a card for each
        data.data.forEach(item => {
            const card = document.createElement('div');
            card.classList.add('card');

            // Card header (optional)
            const header = document.createElement('div');
            header.classList.add('card-header');
            header.textContent = `Title: ${item.book_title} - Book Id: ${item.book_id}`;

            // Card content
            const content = document.createElement('div');
            content.classList.add('card-content');
            content.innerHTML = `
            <p>Reader: ${item.reader_name} (ID: ${item.reader_id})</p>
            <p>Status: ${item.request_status}</p>
            <p>Available":${item.book_available}</p>
            <p>Time: ${new Date(item.issued_at).toLocaleString()}</p>
            `;

            // Buttons section
            const buttons = document.createElement('div');
            buttons.classList.add('card-buttons');

            const acceptBtn = document.createElement('button');
            acceptBtn.classList.add('accept-btn');
            acceptBtn.textContent = 'Accept';
            acceptBtn.addEventListener('click', () => handleAccept(item.request_id, item.book_id));

            const rejectBtn = document.createElement('button');
            rejectBtn.classList.add('reject-btn');
            rejectBtn.textContent = 'Reject';
            rejectBtn.addEventListener('click', () => handleReject(item.request_id));

            buttons.appendChild(acceptBtn);
            buttons.appendChild(rejectBtn);

            // Append all parts to the card
            card.appendChild(header); // Append header if you want
            card.appendChild(content);
            card.appendChild(buttons);

            // Append card to the container
            container.appendChild(card);
        });

    } catch (error) {
        console.error('Error fetching data:', error);
        alert('Failed to fetch book requests. Please try again.');
    }
});

function handleAccept(request_id, book_id) {

    axios.post('http://localhost:3000/approvedbookrequest', {
        request_id: parseInt(request_id),
        book_id: parseInt(book_id)
    })
        .then(response => {
            // Handle successful response
            console.log(response.data); // Log the successful response data
            alert('Updated successful!'); // Alert the user         
            window.location.href = 'book-request.html';
        })
        .catch(error => {
            // Handle error
            console.error('Error:', error); // Log any errors to the console
            alert('Update failed. Please try again.'); // Alert the user about the error
        });
}

function handleReject(requestId) {
    console.log(`Rejecting request with ID ${requestId}`);
    // Add your logic to handle the reject action (e.g., update request status)
}
