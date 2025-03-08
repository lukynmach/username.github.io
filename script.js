document.addEventListener('DOMContentLoaded', function () {
    const sections = document.querySelectorAll('.content-section');
    const navItems = document.querySelectorAll('.nav-item');

    // Nastavení aktuálního data jako text tlačítka
    const calendarButton = document.getElementById('show-calendar-button');
    const today = new Date().toLocaleDateString('cs-CZ');
    calendarButton.textContent = today;

    // Přidání klikacího eventu pro zobrazení kalendáře
    calendarButton.addEventListener('click', function () {
        const calendarContainer = document.getElementById('calendar-container');
        calendarContainer.style.display = calendarContainer.style.display === 'block' ? 'none' : 'block';
    });

    // Zobrazení nebo skrytí sekcí při kliknutí na položky navigace
    navItems.forEach(item => {
        item.addEventListener('click', function () {
            const target = document.getElementById(item.dataset.target);
            sections.forEach(section => {
                if (section === target && section.style.display === 'block') {
                    section.style.display = 'none';
                } else {
                    section.style.display = 'none';
                    if (section === target) {
                        section.style.display = 'block';
                    }
                }
            });

            if (item.dataset.target === 'map' && !window.mapInitialized) {
                setTimeout(initMap, 100); // Počkáme 100 ms před inicializací mapy
                window.mapInitialized = true;
            }

            if (item.dataset.target === 'graph' && !window.chartInitialized) {
                initGraph();
                window.chartInitialized = true;
            }
        });
    });

    // Inicializace kalendáře
    $('#calendar').fullCalendar({
        locale: 'cs',
        selectable: true,
        select: function (start) {
            const dateStr = start.format('YYYY-MM-DD');
            $('#calendar-notes').val(localStorage.getItem(dateStr) || '');
            $('#save-calendar-notes').off('click').on('click', function () {
                localStorage.setItem(dateStr, $('#calendar-notes').val());
                updateSavedNotesList();
            });
        }
    });

    // Funkce pro aktualizaci seznamu uložených poznámek
    function updateSavedNotesList() {
        const savedNotesList = $('#saved-notes-list');
        savedNotesList.empty();
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            const value = localStorage.getItem(key);
            savedNotesList.append(`<li>${key}: ${value}</li>`);
        }
    }

    // Inicializace mapy
    function initMap() {
        const map = L.map('mapid').setView([50.0755, 14.4378], 13);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        map.invalidateSize(); // Přizpůsobení velikosti mapy okénku
    }

    // Inicializace grafu
    function initGraph() {
        const ctx = document.getElementById('chartCanvas').getContext('2d');
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Leden', 'Únor', 'Březen', 'Duben', 'Květen', 'Červen', 'Červenec', 'Srpen', 'Září', 'Říjen', 'Listopad', 'Prosinec'],
                datasets: [{
                    label: 'Historická data',
                    data: [10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120],
                    borderColor: 'rgba(75, 192, 192, 1)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    fill: true,
                }]
            },
            options: {
                responsive: true,
                scales: {
                    x: {
                        beginAtZero: true,
                    },
                    y: {
                        beginAtZero: true,
                    }
                }
            }
        });
    }

    // Funkce pro výpočet ceny za m²
    async function calculatePricePerSquareMeter(kod) {
        return (Math.random() * 1000).toFixed(2);
    }

    // Funkce pro výpočet ceny domu
    async function calculateHousePrice(kod) {
        return (Math.random() * 1000000).toFixed(2);
    }

    // Vyhledávání prodejní ceny
    document.getElementById('search-price').addEventListener('click', async function () {
        const cityInput = document.getElementById('city-input').value;
        const resultsContainer = document.getElementById('price-results');

        if (cityInput) {
            try {
                const response = await fetch(`https://api.apify.com/v2/users/me/usage/monthly?token=apify_api_U8fMKp3lQuPyQ6G11o7DsHrqdqGpEe3qhiar`);
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();

                if (data && data.data) {
                    resultsContainer.innerHTML = `<p>Ceny pozemků a domů v ${cityInput}:</p>`;
                    resultsContainer.innerHTML += `
                        <table>
                            <thead>
                                <tr>
                                    <th>Obec</th>
                                    <th>Kód obce</th>
                                    <th>Cena za m² (CZK)</th>
                                    <th>Cena domu (CZK)</th>
                                </tr>
                            </thead>
                            <tbody>
                    `;
                    for (const item of data.data) {
                        const cenaZaM2 = await calculatePricePerSquareMeter(item.kod);
                        const cenaDomu = await calculateHousePrice(item.kod);
                        resultsContainer.innerHTML += `
                            <tr>
                                <td>${item.nazev}</td>
                                <td>${item.kod}</td>
                                <td>${cenaZaM2}</td>
                                <td>${cenaDomu}</td>
                            </tr>
                        `;
                    }
                    resultsContainer.innerHTML += `
                            </tbody>
                        </table>
                    `;
                } else {
                    resultsContainer.innerHTML = `<p>Žádné výsledky pro město: ${cityInput}.</p>`;
                }
            } catch (error) {
                console.error(error);
                resultsContainer.innerHTML = '<p>Chyba při získávání dat.</p>';
            }
        } else {
            resultsContainer.innerHTML = '<p>Zadejte platné město/obec.</p>';
        }
    });

    // Vyhledávání katastru
    document.getElementById('search-katastr').addEventListener('click', function () {
        const katastrInput = document.getElementById('katastr-input').value;
        const resultsContainer = document.getElementById('katastr-results');
        if (katastrInput) {
            resultsContainer.innerHTML = `<p>Výsledky pro katastrální číslo: ${katastrInput}</p>`;
        } else {
            resultsContainer.innerHTML = '<p>Zadejte platné katastrální číslo.</p>';
        }
    });

    // Uložení poznámek
    document.getElementById('save-notes').addEventListener('click', function () {
        const noteTitle = document.getElementById('note-title-input').value;
        const noteContent = document.getElementById('notes-input').value;
        
        if (noteTitle && noteContent) {
            localStorage.setItem(noteTitle, noteContent);
            updateSavedNotesList();
            document.getElementById('note-title-input').value = ''; // Vyprázdnění vstupu pro název poznámky
            document.getElementById('notes-input').value = ''; // Vyprázdnění textového pole pro poznámky
        }
    });

    // Načtení uložených poznámek při načtení stránky
    updateSavedNotesList(); // Aktualizace seznamu uložených poznámek
});
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/service-worker.js').then((registration) => {
        console.log('ServiceWorker registration successful with scope: ', registration.scope);
      }, (error) => {
        console.log('ServiceWorker registration failed: ', error);
      });
    });
  }
  document.addEventListener('DOMContentLoaded', function () {
    // Funkce pro aktualizaci seznamu uložených dražeb v sekci "Naše dražby"
    function updateSavedAuctionsList() {
        const savedAuctionsList = document.getElementById('saved-auctions-list');
        const savedAuctions = JSON.parse(localStorage.getItem('savedAuctions')) || [];
        savedAuctionsList.innerHTML = '';
        savedAuctions.forEach((auction, index) => {
            const listItem = document.createElement('li');
            listItem.innerHTML = `
                <a href="${auction.url}" target="_blank" class="auction-title">${auction.title}</a>
                <button class="delete-auction-button" data-index="${index}">Smazat</button>
            `;
            savedAuctionsList.appendChild(listItem);
        });

        // Přidání event listenerů pro tlačítka smazání
        const deleteButtons = document.querySelectorAll('.delete-auction-button');
        deleteButtons.forEach(button => {
            button.addEventListener('click', function () {
                const index = button.getAttribute('data-index');
                savedAuctions.splice(index, 1);
                localStorage.setItem('savedAuctions', JSON.stringify(savedAuctions));
                updateSavedAuctionsList();
            });
        });
    }

    // Uložení nové dražby
    const saveAuctionButton = document.getElementById('save-auction-button');
    saveAuctionButton.addEventListener('click', function () {
        const auctionTitle = document.getElementById('auction-title-input').value;
        const auctionUrl = document.getElementById('auction-url-input').value;

        if (auctionTitle && auctionUrl) {
            let savedAuctions = JSON.parse(localStorage.getItem('savedAuctions')) || [];
            savedAuctions.push({ title: auctionTitle, url: auctionUrl });
            localStorage.setItem('savedAuctions', JSON.stringify(savedAuctions));
            updateSavedAuctionsList();
            document.getElementById('auction-title-input').value = ''; // Vyprázdnění vstupu pro název dražby
            document.getElementById('auction-url-input').value = ''; // Vyprázdnění vstupu pro odkaz na dražbu
        } else {
            alert('Prosím, vyplňte oba políčka.');
        }
    });

    // Aktualizace seznamu při načtení stránky
    updateSavedAuctionsList();
});
