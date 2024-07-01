document.addEventListener('DOMContentLoaded', () => {
    fetchDataForTable1();
    fetchDataForTable2();
});

async function fetchDataForTable1() {
    try {
        const response = await fetch('http://localhost:3000/admin/fetchuser');
        if (!response.ok) {
            throw new Error('Failed to fetch data');
        }
        const data = await response.json();
        console.log(data.data)
        populateTable1(data.data);
    } catch (error) {
        console.error('Error fetching data for Table 1:', error);
        alert('Failed to fetch data for Table 1');
    }
}

async function fetchDataForTable2() {
    try {
        const response = await fetch('http://localhost:3000/admin/unapproveduser');
        if (!response.ok) {
            throw new Error('Failed to fetch data');
        }
        const data = await response.json();

        populateTable2(data.data);
    } catch (error) {
        console.error('Error fetching data for Table 2:', error);
        alert('Failed to fetch data for Table 2');
    }
}

function populateTable1(data) {
    const table1Body = document.getElementById('table1Body');
    table1Body.innerHTML = '';

    data.forEach(user => {
        const row = `
            <tr>
                <td>${user.Id}</td>
                <td>${user.name}</td>
                <td>${user.email}</td>
            </tr>
        `;
        table1Body.innerHTML += row;
    });
}

function populateTable2(data) {
    const table2Body = document.getElementById('table2Body');
    table2Body.innerHTML = '';

    data.forEach(user => {
        const row = `
            <tr>
                <td>${user.Id}</td>
                <td>${user.name}</td>
                <td>${user.email}</td>
                <td>
                    <img src="../image/accept.png" alt="Accept" onclick="handleAccept('${user.email}')">
                    <img src="../image/delete.png" alt="Delete" onclick="handleDelete()">
                </td>
            </tr>
        `;
        table2Body.innerHTML += row;
    });
}


function handleAccept(email) {
    if (confirm("Do you want to accept this user?")) {

        const apiUrl = 'http://localhost:3000/admin/acceptapproval'; // Replace with your actual API endpoint URL

        // Prepare headers
        const headers = {
            'Content-Type': 'application/json',
            'authorization': "hello",
        };

        axios.post(apiUrl, {
            email: email,
            header: headers
        })
            .then(response => {

                alert('User Approval Successful!'); // Alert the user
                console.log(response)
                fetchDataForTable1()
            })
            .catch(error => {
                // Handle error
                console.error('Error:', error); // Log any errors to the console
                alert('User Approved Failed.'); // Alert the user about the error
            });

    } else {

    }
}

