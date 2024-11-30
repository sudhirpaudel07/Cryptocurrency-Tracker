document.addEventListener('DOMContentLoaded', () => {
    const API_URL = 'https://api.coingecko.com/api/v3/coins/markets';
    const params = '?vs_currency=usd&order=market_cap_desc&per_page=10&page=1&sparkline=false';
    const cryptoContainer = document.getElementById('crypto-container');
    const comparisonContainer = document.getElementById('comparison-container');
    const show24hrChange = document.getElementById('show-24hr-change');
    const showMarketCap = document.getElementById('show-market-cap');

    // Fetching cryptocurrencies data from API
    const fetchCryptocurrencies = async () => {
        try {
            const response = await fetch(`${API_URL}${params}`);
            const data = await response.json();
            displayCryptocurrencies(data);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    // Displaying cryptocurrencies in the dashboard
    const displayCryptocurrencies = (cryptos) => {
        cryptoContainer.innerHTML = '';
        cryptos.forEach(crypto => {
            const cryptoDiv = document.createElement('div');
            cryptoDiv.classList.add('crypto');
            const priceChangeClass = crypto.price_change_percentage_24h >= 0 ? 'positive' : 'negative';
            cryptoDiv.innerHTML = `
                <img src="${crypto.image}" alt="${crypto.name} icon" class="crypto-icon">
                <h3>${crypto.name} (${crypto.symbol.toUpperCase()})</h3>
                <p>Current Price: $${crypto.current_price}</p>
                ${show24hrChange.checked ? `<p class="${priceChangeClass}">24hr Change: ${crypto.price_change_percentage_24h.toFixed(2)}%</p>` : ''}
                ${showMarketCap.checked ? `<p>Market Cap: $${crypto.market_cap}</p>` : ''}
                <button class="compare-btn" data-id="${crypto.id}" data-name="${crypto.name}" data-price="${crypto.current_price}" data-image="${crypto.image}">Compare</button>
            `;
            cryptoContainer.appendChild(cryptoDiv);
        });

        // Adding event listeners to the newly created buttons
        const compareButtons = document.querySelectorAll('.compare-btn');
        compareButtons.forEach(button => {
            button.addEventListener('click', (event) => {
                const { id, name, price, image } = event.target.dataset;
                addToComparison(id, name, parseFloat(price), image);
            });
        });
    };

    // Adding cryptocurrency to the comparison list
    const addToComparison = (id, name, price, image) => {
        const existingComparison = document.getElementById(`compare-${id}`);
        if (existingComparison) {
            alert(`${name} is already in the comparison list.`);
            return;
        }

        if (comparisonContainer.childElementCount < 5) {
            const comparisonDiv = document.createElement('div');
            comparisonDiv.classList.add('comparison');
            comparisonDiv.id = `compare-${id}`;
            comparisonDiv.innerHTML = `
                <img src="${image}" alt="${name} icon" class="crypto-icon">
                <h3>${name}</h3>
                <p>Price: $${price.toFixed(2)}</p>
                <button class="remove-btn" data-id="${id}">Remove</button>
            `;
            comparisonContainer.appendChild(comparisonDiv);

            // Adding event listener to the remove button
            comparisonDiv.querySelector('.remove-btn').addEventListener('click', (event) => {
                const { id } = event.target.dataset;
                removeFromComparison(id);
            });

            // Saving to localStorage
            saveToLocalStorage(id, name, price, image);
        } else {
            alert('You can only compare up to 5 cryptocurrencies.');
        }
    };

    // Removing cryptocurrency from the comparison list
    const removeFromComparison = (id) => {
        const comparisonDiv = document.getElementById(`compare-${id}`);
        if (comparisonDiv) {
            comparisonContainer.removeChild(comparisonDiv);
            removeFromLocalStorage(id);
        }
    };

    // Savin comparison to localStorage
    const saveToLocalStorage = (id, name, price, image) => {
        const comparisons = JSON.parse(localStorage.getItem('comparisons')) || [];
        // Adding the new comparison if it doesn't already exist
        if (!comparisons.some(crypto => crypto.id === id)) {
            comparisons.push({ id, name, price, image });
            localStorage.setItem('comparisons', JSON.stringify(comparisons));
        }
    };

    // Removing comparison from localStorage
    const removeFromLocalStorage = (id) => {
        let comparisons = JSON.parse(localStorage.getItem('comparisons')) || [];
        // Remove the cryptocurrency from the comparisons list
        comparisons = comparisons.filter(crypto => crypto.id !== id);
        localStorage.setItem('comparisons', JSON.stringify(comparisons));
    };

    // Loading saved comparisons from localStorage
    const loadFromLocalStorage = () => {
        const comparisons = JSON.parse(localStorage.getItem('comparisons')) || [];
        comparisons.forEach(crypto => {
            addToComparison(crypto.id, crypto.name, crypto.price, crypto.image);
        });
    };

    // Event listeners for preferences (checkboxes)
    show24hrChange.addEventListener('change', fetchCryptocurrencies);
    showMarketCap.addEventListener('change', fetchCryptocurrencies);

    // Fetching data and load saved comparisons when the page loads
    fetchCryptocurrencies();
    loadFromLocalStorage();

    // Fetching the cryptocurrencies data every 60 seconds
    setInterval(fetchCryptocurrencies, 60000);
});
