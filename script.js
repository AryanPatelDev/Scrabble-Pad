// Register service worker for offline functionality
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('service-worker.js')
            .then(function(registration) {
                console.log('ServiceWorker registration successful with scope: ', registration.scope);
            }, function(err) {
                console.log('ServiceWorker registration failed: ', err);
            });
    });
}

// Dark Mode Toggle
const settings = JSON.parse(localStorage.getItem('settings') || '{}');
if (settings.theme === 'dark') {
    document.body.classList.add('dark-mode');
    document.getElementById('darkModeToggle').textContent = 'Switch to Light Mode';
} else {
    document.getElementById('darkModeToggle').textContent = 'Switch to Dark Mode';
}

function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    const isDarkMode = document.body.classList.contains('dark-mode');
    settings.theme = isDarkMode ? 'dark' : 'light';
    localStorage.setItem('settings', JSON.stringify(settings));

    // Update button text and colors based on the mode
    document.getElementById('darkModeToggle').textContent = isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode';

    // Apply styles for light mode explicitly
    if (!isDarkMode) {
        document.body.style.backgroundColor = 'white';
        document.body.style.color = 'black';
        document.getElementById('scrabble-pad').style.backgroundColor = 'white';
        document.getElementById('scrabble-pad').style.color = 'black';
        document.getElementById('heading').style.backgroundColor = 'white';
        document.getElementById('heading').style.color = 'black';
    } else {
        document.body.style.backgroundColor = '';
        document.body.style.color = '';
        document.getElementById('scrabble-pad').style.backgroundColor = '';
        document.getElementById('scrabble-pad').style.color = '';
        document.getElementById('heading').style.backgroundColor = '';
        document.getElementById('heading').style.color = '';
    }
}

// Toggle settings menu and close it on outside click
document.getElementById('settingsToggle').addEventListener('click', function(event) {
    const menu = document.getElementById('settingsMenu');
    menu.classList.toggle('hidden');
    menu.classList.toggle('active');
    event.stopPropagation(); // Prevent the click from closing the menu immediately
});

document.addEventListener('click', function(event) {
    const menu = document.getElementById('settingsMenu');
    const toggleButton = document.getElementById('settingsToggle');
    const textarea = document.getElementById('scrabble-pad');
    const headingArea = document.getElementById('heading');

    if (!menu.contains(event.target) && !toggleButton.contains(event.target)) {
        menu.classList.add('hidden');
        menu.classList.remove('active');
        // Set focus to the textarea if the click was outside the settings menu
        if (event.target === textarea || event.target === headingArea) {
            event.target.focus();
        }
    }
});

// Update Dark Mode Toggle Button
document.getElementById('darkModeToggle').addEventListener('click', toggleDarkMode);

// Save text and heading to Local Storage
const textArea = document.getElementById('scrabble-pad');
const headingArea = document.getElementById('heading');

textArea.value = localStorage.getItem('text') || '';
headingArea.textContent = localStorage.getItem('heading') || 'HEADING HERE...';

textArea.addEventListener('input', () => {
    localStorage.setItem('text', textArea.value);
});

headingArea.addEventListener('input', () => {
    localStorage.setItem('heading', headingArea.textContent);
});

// Placeholder behavior for heading
headingArea.addEventListener('click', () => {
    if (headingArea.textContent === 'HEADING HERE...') {
        headingArea.textContent = ''; // Clear placeholder on click
    }
});

headingArea.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && headingArea.textContent.trim() === '') {
        e.preventDefault();
        headingArea.textContent = ''; // Prevent adding empty lines
    }
});

// Function to format date and time for heading
function getFormattedDateTimeForHeading() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

// Function to get formatted date and time for filename
function getFormattedDateTimeForFilename() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');

    return `${year}${month}${day}_${hours}${minutes}`;
}

// Set heading content if empty or placeholder
function setHeadingWithDateTime() {
    const headingElement = document.getElementById('heading');
    const headingContent = headingElement.textContent.trim();
    if (headingContent === '' || headingContent === 'HEADING HERE...') {
        headingElement.textContent = getFormattedDateTimeForHeading();
    }
}

// Call this function on page load or when necessary
setHeadingWithDateTime();

// Export Text and Heading as File
document.getElementById('export-btn').addEventListener('click', function() {
    const text = document.getElementById('scrabble-pad').value;
    let heading = document.getElementById('heading').textContent.trim();

    // Ensure placeholder is not copied for export
    if (heading === '' || heading === 'HEADING HERE...') {
        heading = ''; // Clear placeholder from export
    }

    // Default filename with date and time
    const defaultFilename = heading ? heading : `scrabble-pad_${getFormattedDateTimeForFilename()}`;
    const filename = prompt("Enter the filename to Export it:", defaultFilename + '.txt');

    if (filename) {
        // Include date and time in heading if it's empty
        const exportHeading = heading ? heading : getFormattedDateTimeForHeading();
        const content = `##${exportHeading}##\n${text}`;
        const blob = new Blob([content], { type: 'text/plain' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.click();
    }
});

// Import Text and Heading from File
document.getElementById('import-btn').addEventListener('click', function() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.txt';
    input.addEventListener('change', function(event) {
        const file = event.target.files[0];
        const reader = new FileReader();
        reader.onload = function(e) {
            const content = e.target.result.split('\n');
            let heading = '';
            let text = '';

            // Check if the first line contains the heading format ##HEADING##
            if (content[0].startsWith('##') && content[0].endsWith('##')) {
                heading = content[0].replace(/##/g, '').trim();
                text = content.slice(1).join('\n'); // Remaining content goes to the text area
            } else {
                text = content.join('\n'); // If no heading format, treat all content as text
            }

            // Set heading and text area content
            document.getElementById('heading').textContent = heading || 'HEADING HERE...';
            document.getElementById('scrabble-pad').value = text;

            // Save imported data to localStorage
            localStorage.setItem('heading', heading);
            localStorage.setItem('text', text);
        };
        reader.readAsText(file);
    });
    input.click();
});

// Placeholder handling for initial load
if (!headingArea.textContent.trim()) {
    headingArea.textContent = 'HEADING HERE...';
}

// Clear Text functionality
document.getElementById('clearTextBtn').addEventListener('click', function() {
    // Clear heading and textarea content
    document.getElementById('heading').textContent = 'HEADING HERE...';
    document.getElementById('scrabble-pad').value = '';

    // Clear localStorage
    localStorage.removeItem('text');
    localStorage.removeItem('heading');
});
