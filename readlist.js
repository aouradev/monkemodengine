const fs = require('fs');

// Read the JSON file
fs.readFile('list.json', 'utf8', (err, data) => {
    if (err) {
        console.error('Error reading the file:', err);
        return;
    }

    // Parse the JSON data
    const jsonData = JSON.parse(data);

    // Function to log the names from the JSON data
    function logNames(data) {
        for (const key in data) {
            if (data.hasOwnProperty(key)) {
                console.log(data[key].name);
            }
        }
    }
    
    // Call the function with the parsed data
    logNames(jsonData);
});
