document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('search-input');
    const resultsContainer = document.getElementById('results-container');
    let timeoutId;

    const performSearch = async (query) => {
        if (query.length < 3) {
            resultsContainer.innerHTML = '';
            return;
        }

        try {
            const response = await fetch(`http://localhost:3000/search?q=${query}`);
            const addresses = await response.json();
            
            resultsContainer.innerHTML = '';
            
            if (addresses.length === 0) {
                resultsContainer.innerHTML = '<p>No results found.</p>';
                return;
            }
            
            addresses.forEach(address => {
                const resultItem = document.createElement('div');
                resultItem.innerHTML = `
                    <strong>${address.number} ${address.street}</strong>
                    ${address.city}, ${address.postcode}
                    <hr>
                `;
                resultsContainer.appendChild(resultItem);
            });
        } catch (error) {
            console.error('Error fetching search results:', error);
            resultsContainer.innerHTML = '<p>Error fetching search results.</p>';
        }
    };

    searchInput.addEventListener('input', (event) => {
        clearTimeout(timeoutId);
        const query = event.target.value;
        timeoutId = setTimeout(() => performSearch(query), 300); // Debounce search
    });
});