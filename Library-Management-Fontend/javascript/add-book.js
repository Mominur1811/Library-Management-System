document.addEventListener("DOMContentLoaded", function () {
    const imageLinkInput = document.getElementById("imageLink");
    const browseButton = document.getElementById("browseButton");

    browseButton.addEventListener("click", function () {
        // Create a file input element
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
                    imageLinkInput.value = file.name; // Example: display file name as path
                };
            }
        });

        // Trigger click event on the file input
        document.body.appendChild(fileInput);
        fileInput.click();

        // Clean up: remove file input from the DOM
        document.body.removeChild(fileInput);
    });
});


function handleBookAdd(event){
    event.preventDefault();

    var title = document.getElementById('title').value;
    var category = document.getElementById('category').value;
    var author = document.getElementById('author').value;
    var quantity = document.getElementById('quantity').value;
    var available = document.getElementById('available').value;
    var summary = document.getElementById('summary').value;
    var total_page = document.getElementById('totalPage').value;
    var image_link = document.getElementById('imageLink').value;
}

// Event listener for SignUp form submission
document.getElementById('Signup-form').addEventListener('submit', handleBookAdd);