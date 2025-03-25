document.addEventListener('DOMContentLoaded', function () {
    const loginModal = document.getElementById('login-modal');
    const loginButton = document.getElementById('login-button');
    const loginError = document.getElementById('login-error');

    loginButton.addEventListener('click', function () {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        if ((username === 'Lukas' && password === '150519') || (username === 'Honza' && password === '651022')) {
            loginModal.style.display = 'none';
        } else {
            loginError.style.display = 'block';
        }
    });
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

    navItems.forEach(item => {
        item.addEventListener('click', function () {
            const target = document.getElementById(item.dataset.target);
            sections.forEach(section => {
                section.style.display = 'none';
            });
            if (target) {
                target.style.display = 'block';
            }
        });
    });
    

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
document.addEventListener('DOMContentLoaded', function () {
    // Funkce pro aktualizaci seznamu uložených poznámek v sekci "Uložené poznámky"
    function updateSavedNotesList() {
        const savedNotesList = document.getElementById('saved-notes-list');
        const savedNotes = JSON.parse(localStorage.getItem('savedNotes')) || [];
        savedNotesList.innerHTML = '';
        savedNotes.forEach((note, index) => {
            const listItem = document.createElement('li');
            listItem.innerHTML = `
                <h3 class="note-title" data-index="${index}">${note.title}</h3>
                <p class="note-content" style="display: none;">${note.content}</p>
                <button class="delete-note-button" data-index="${index}">Smazat</button>
            `;
            savedNotesList.appendChild(listItem);
        });

        // Přidání event listenerů pro zobrazení/skrytí obsahu poznámky
        const noteTitles = document.querySelectorAll('.note-title');
        noteTitles.forEach(title => {
            title.addEventListener('click', function () {
                const content = title.nextElementSibling;
                content.style.display = content.style.display === 'none' ? 'block' : 'none';
            });
        });

        // Přidání event listenerů pro tlačítka smazání
        const deleteButtons = document.querySelectorAll('.delete-note-button');
        deleteButtons.forEach(button => {
            button.addEventListener('click', function () {
                const index = button.getAttribute('data-index');
                savedNotes.splice(index, 1);
                localStorage.setItem('savedNotes', JSON.stringify(savedNotes));
                updateSavedNotesList();
            });
        });
    }

    // Uložení nové poznámky
    const saveNotesButton = document.getElementById('save-notes');
    saveNotesButton.addEventListener('click', function () {
        const noteTitle = document.getElementById('note-title-input').value;
        const noteContent = document.getElementById('notes-input').value;

        if (noteTitle && noteContent) {
            let savedNotes = JSON.parse(localStorage.getItem('savedNotes')) || [];
            savedNotes.push({ title: noteTitle, content: noteContent });
            localStorage.setItem('savedNotes', JSON.stringify(savedNotes));
            updateSavedNotesList();
            document.getElementById('note-title-input').value = ''; // Vyprázdnění vstupu pro název poznámky
            document.getElementById('notes-input').value = ''; // Vyprázdnění textového pole pro poznámky
        } else {
            alert('Prosím, vyplňte oba políčka.');
        }
    });

    // Aktualizace seznamu při načtení stránky
    updateSavedNotesList();

    // Změna velikosti písma v poznámkovém bloku
    const fontSizeInput = document.getElementById('font-size-input');
    fontSizeInput.addEventListener('input', function () {
        const notesInput = document.getElementById('notes-input');
        notesInput.style.fontSize = `${fontSizeInput.value}px`;
    });
});function previewImage(event, input) {
    const file = input.files[0];
    const reader = new FileReader();
    reader.onload = function() {
        const imgElement = input.nextElementSibling;
        imgElement.src = reader.result;
    };
    reader.readAsDataURL(file);
}

function addRow() {
    const table = document.querySelector("#profitTable tbody");
    const newRow = `
        <tr>
            <td><input type="file" accept="image/*" onchange="previewImage(event, this)"><img class="image-preview"></td>
            <td><input type="text" class="name"></td>
            <td><input type="number" class="bought" value="0"></td>
            <td><input type="number" class="invested" value="0"></td>
            <td><input type="number" class="sold" value="0"></td>
            <td class="profit">0</td>
        </tr>`;
    table.insertAdjacentHTML("beforeend", newRow);
}

function calculateTotals() {
    let totalBought = 0;
    let totalInvested = 0;
    let totalSold = 0;
    let totalProfit = 0;

    document.querySelectorAll("#profitTable tbody tr").forEach(row => {
        const bought = parseFloat(row.querySelector(".bought").value) || 0;
        const invested = parseFloat(row.querySelector(".invested").value) || 0;
        const sold = parseFloat(row.querySelector(".sold").value) || 0;

        const profit = sold - (bought + invested);
        row.querySelector(".profit").textContent = profit.toFixed(2);

        totalBought += bought;
        totalInvested += invested;
        totalSold += sold;
        totalProfit += profit;
    });

    document.getElementById("totalBought").textContent = totalBought.toFixed(2);
    document.getElementById("totalInvested").textContent = totalInvested.toFixed(2);
    document.getElementById("totalSold").textContent = totalSold.toFixed(2);
    document.getElementById("totalProfit").textContent = totalProfit.toFixed(2);
}
function loadTableData() {
    const tableData = JSON.parse(localStorage.getItem("profitTableData")) || [];
    const tableBody = document.querySelector("#profitTable tbody");

    tableBody.innerHTML = ""; // Vyprázdníme obsah tabulky

    tableData.forEach(rowData => {
        const newRow = `
            <tr>
                <td><input type="file" accept="image/*" onchange="previewImage(event, this)">
                    <img class="image-preview" src="${rowData.image}">
                </td>
                <td><input type="text" class="name" value="${rowData.name}"></td>
                <td><input type="number" class="bought" value="${rowData.bought}"></td>
                <td><input type="number" class="invested" value="${rowData.invested}"></td>
                <td><input type="number" class="sold" value="${rowData.sold}"></td>
                <td class="profit">${rowData.profit}</td>
            </tr>`;
        tableBody.insertAdjacentHTML("beforeend", newRow);
    });
}
document.querySelector("#profitTable tbody").addEventListener("input", saveTableData);
function saveTableData() {
    const tableData = [];
    document.querySelectorAll("#profitTable tbody tr").forEach(row => {
        const rowData = {
            image: row.querySelector(".image-preview").src || "", // Uloží datové URL obrázku
            name: row.querySelector(".name").value || "",
            bought: row.querySelector(".bought").value || 0,
            invested: row.querySelector(".invested").value || 0,
            sold: row.querySelector(".sold").value || 0,
            profit: row.querySelector(".profit").textContent || "0"
        };
        tableData.push(rowData);
    });

    // Uloží data do localStorage
    localStorage.setItem("profitTableData", JSON.stringify(tableData));
}
document.addEventListener('DOMContentLoaded', function () {
    loadTableData();
});

function loadTableData() {
    const tableData = JSON.parse(localStorage.getItem("profitTableData")) || [];
    const tableBody = document.querySelector("#profitTable tbody");

    tableBody.innerHTML = ""; // Vyprázdní tabulku

    tableData.forEach(rowData => {
        const newRow = `
            <tr>
                <td><input type="file" accept="image/*" onchange="previewImage(event, this)">
                    <img class="image-preview" src="${rowData.image}">
                </td>
                <td><input type="text" class="name" value="${rowData.name}"></td>
                <td><input type="number" class="bought" value="${rowData.bought}"></td>
                <td><input type="number" class="invested" value="${rowData.invested}"></td>
                <td><input type="number" class="sold" value="${rowData.sold}"></td>
                <td class="profit">${rowData.profit}</td>
            </tr>`;
        tableBody.insertAdjacentHTML("beforeend", newRow);
    });
}
