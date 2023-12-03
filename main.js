/// <reference path="jquery-3.7.0.js"/>

"use strict";

$(async () => {
    // Get all the coins
    let allCoins = await getAllCoins();

    // Array that contains our checked values.
    let arrayOfChecked = [];

    // Define interval so we can use it later.
    let interval;

    // Define chart
    let chart;

    // Get the modal so i can work with it.
    const myModal = new bootstrap.Modal(document.getElementById('myModal'));

    // handleHome so that all coins show at the load of the page.
    handleHome(allCoins);

    // every time the search box value changes it will change the home page coins
    let searchBox = document.getElementById('searchBox');
    searchBox.addEventListener('change', () => {
        if (searchBox.value === '')
            // Show all the coins
            for (let i = 0; i < allCoins.length; i++) {
                let card = $(`#card-${i}`);
                card.show();
            }

    });

    $('a.nav-link').click(function () {
        // Pill UI:
        $('a.nav-link').removeClass('active');
        $(this).addClass('active');

        //Display Correct Section
        let sectionId = $(this).attr('data-section');
        $('section').hide();
        $('#' + sectionId).show();
    });

    // Display more info when its clicked
    $('#coinsContainer').on('click', '.more-info', async function () {
        let coinIndex = Number($(this).attr('id').substring(7));
        await handleMoreInfo(allCoins[coinIndex].id, coinIndex);
    })

    // When user clicks on home link it clears the interval of the graph
    $('#homeLink').click(async () => {
        clearInterval(interval);
    });

    // When user clicks reports link it draws the graph
    $('#reportsLink').click(async () => {
        drawGraph();
    });

    // Disable the reports link so the user cant use it while there is no toggle.
    $('#reportsLink').attr('disable', true);

    // Get the an array of checkboxes by the class
    let checkBox = document.getElementsByClassName('form-check-input');

    // run on all the check boxes to add a change event to them
    for (const item of checkBox) {
        item.addEventListener('change', (event) => {
            // Get the index of the checkBox
            let index = event.target.id.substring(12);
            // check if the box is checked to know if to add it to our arrayOfChecked for later use.
            if (event.target.checked) {
                addToCheck({... allCoins[index], index});
                
            }
            else removeFromCheck(index);
            // Checks if there are boxes checked enable graph
            if (arrayOfChecked.length > 0) {
                $('#reportsLink').removeClass('disabled');
            }
            // Checks if there are no boxes checked disable the graph.
            if (arrayOfChecked.length === 0) {
                $('#reportsLink').addClass('disabled');
            }
            // Checks if there are more than 5 boxes we go inside the modal.
            if (arrayOfChecked.length > 5) {
                showCoinWindow();
            }
        });
    }

    // add a click event to the save changes button inside the modal and hide it.
    let saveModalButton = document.getElementById('saveModalButton');
    saveModalButton.addEventListener('click', () => {
        saveModalChanges();
    });

    // add a click event to the close modal button to revert changes.
    let closeModalButton = document.getElementById('closeModalButton');
    closeModalButton.addEventListener('click', () => {
        closeModal();
    });

    // add a click event to the close modal button to revert changes.
    let xModalButton = document.getElementById('xModalButton');
    xModalButton.addEventListener('click', () => {
        closeModal();
    });

    // Get the ids of the search button and box
    let searchBtn = document.getElementById('searchBtn');

    // Add a click event to the search button.
    searchBtn.addEventListener('click', () => {

        // Hide all of the coins and show only the chosen ones
        for (let i = 0; i < allCoins.length; i++) {
            let card = $(`#card-${i}`);
            if (allCoins[i].symbol.includes(searchBox.value) || allCoins[i].name.includes(searchBox.value))
                card.show();
            else
                card.hide();
        }
    });

    // Add an item to the array of checked cards
    function addToCheck(item) {
        arrayOfChecked.push(item);
    }

    // Remove an item from the array of checked cards
    function removeFromCheck(index) {
        arrayOfChecked = arrayOfChecked.filter(c => c.index !== index);
    }

    // Function to display all the coins
    function handleHome(coins) {
        displayCoins(coins);
    }

    // Display all the coins we have
    function displayCoins(coins) {

        // make the html for the coins to display
        let html = '';
        for (let i = 0; i < coins.length; i++) {
            html += `
                <div id="card-${i}" class="card" style="width: 18rem; overflow:auto;">
                <div class="card-body">
                <div class="header-container">
                <h5 class="card-title">${coins[i].symbol}</h5>
                <div class="form-check form-switch" id="checkBox-container">
                <input class="form-check-input" type="checkbox" role="switch" id="switchCheck_${i}">
                </div>
                </div>
                <p class="card-text">${coins[i].name}</p>
                <p>
                    <button id="button_${i}" class="btn btn-outline-info more-info" data-bs-toggle="collapse" data-bs-target="#collapse_${i}" aria-expanded="false" aria-controls="collapse_${i}">
                        More Info
                    </button>
                </p>
                    <div style="min-height: 120px;">
                        <div class="collapse collapse-horizontal" id="collapse_${i}">
                            <div id="show_moreInfo_${i}" class="card card-body" style="width: 150px;">
                            <div class="progress">
                            <div class="progress-bar" id="myProgressBar"></div>
                        </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            `;
        }
        $('#coinsContainer').html(html);
    }
    // Function to update the progress bar based on the API
    function updateProgressBar(progress) {
        const progressBar = document.getElementById("myProgressBar");
        progressBar.style.width = progress + "%";
      }
      

      // Function that handles the More Info button
    async function handleMoreInfo(coinId, index) {

        // Get a single coin by the id we want
        let coin = await getSingleCoin(coinId);

        // Update the progress bar after we get the api
        updateProgressBar(100);

        // Get all of the information we want to show
        try {
            let imageSource = coin.image.thumb;
            let usd = coin.market_data.current_price.usd;
            let eur = coin.market_data.current_price.eur;
            let ils = coin.market_data.current_price.ils;
    
            // Check if the prices are undefined if they are then change them to 0.
            if (usd === undefined) {
                usd = 0;
            }
            if (eur === undefined) {
                eur = 0;
            }
            if (ils === undefined) {
                ils = 0;
            }
    
            // take the HTML we want to show in the box of moreInfo.
            let moreInfo = `
                <img src="${imageSource}"> <br>
                USD ${usd}$ <br>
                EUR ${eur}€ <br>
                ILS ${ils}₪
            `;
    
            // Add the info to the collapse.
            $(`#collapse_${index}`).children().html(moreInfo);
        }
        catch(err) {
            $(`#collapse_${index}`).children().html('No info found.');
        }
    }

    // Function that shows the modal window.
    function showCoinWindow() {
        // get the modal elements
        let modalId = document.getElementById('modalId');

        // create an html for each card inside the modal.
        let html = ``;
        for (let i = 0; i < arrayOfChecked.length; i++) {
            html += `
            <div class="card" style="width: 100%; height: 7rem; overflow:auto;">
                <div class="card-body">
                    <div class="header-container">
                        <h5 class="card-title">${arrayOfChecked[i].symbol}</h5>
                            <div class="form-check form-switch" id="checkBox-container">
                                <input class="form-check-input" type="checkbox" role="switch" 
                                data-index="${arrayOfChecked[i].index}" id="switchCheck_modal_${i}" checked>
                            </div>
                    </div>
                </div>
            </div>
            `;
        }

        // put the html we want inside the modal and show the modal.
        modalId.innerHTML = html;
        myModal.show();
    }

    // This function gets all the checked boxes in 1 array.
    function getModalCheckedBoxes() {
        // create an array
        let arr = [];

        // Create a for loop that checks what box is checked and put it inside the array
        for (let i = 0; i < 6; i++) {
            let checkBox = document.getElementById(`switchCheck_modal_${i}`);
            if (checkBox.checked) {
                arr.push(checkBox);
            }
        }
        return arr;
    }

    // Function that saves all the changes we did in the modal to the home page.
    function saveModalChanges() {
        // Get the id of the error box 
        let modalAlertContainer = document.getElementById('modalAlertContainer');
        // Get the array of the checked boxes.
        let checkBoxArray = getModalCheckedBoxes();

        if (checkBoxArray.length === 6) {
            modalAlertContainer.innerHTML = 'Please make sure you select only 5 coins.';
            return;
        }
        // Loop that removes the on toggle from the home page as well after we save changes in the modal window.
        for (let i = 0; i < 6; i++) {
            let checkBox = document.getElementById(`switchCheck_modal_${i}`);
            if (!checkBox.checked) {
                let checkBoxIndex = checkBox.dataset.index;
                document.getElementById(`switchCheck_${checkBoxIndex}`).checked = false;
                removeFromCheck(checkBoxIndex);
            }
        }
        // Hides the modal because we finished the changes. 
        myModal.hide();
    }

    // Make a function that when you press the close button it reverts the last toggle change you did.
    function closeModal() {
        let {index} = arrayOfChecked[arrayOfChecked.length - 1];
        let checkBox = document.getElementById('switchCheck_' + index);
        checkBox.checked = false;
        removeFromCheck(index);
    }

    // Function that updates the graph
    async function updateGraph(chart) {

        let arrayOfNoPriceCoins = []

        // Get the coin real time price and push it into an array. if the coin doesn't have a price put it in a different array.

        let coinsInUSD = await getCoinActivePrice(arrayOfChecked.map(c => c.symbol));
        if(coinsInUSD.Response === 'Error') {
            for(let i = 0; i < arrayOfChecked.length; i++) {
                arrayOfNoPriceCoins.push(arrayOfChecked[i].symbol);
            }
            return arrayOfNoPriceCoins;
        }

        let arrOfSymbols = arrayOfChecked.map((c) => {
            return c.symbol.toUpperCase();
        });
        
        let arrOfKeys = Object.keys(coinsInUSD);

        // Get the symbols we don't have a price for inside an array.
        for(let i = 0; i < arrOfSymbols.length; i++) {
            for(let j = 0; j < arrOfKeys.length; j++) {
                if(!arrOfKeys.includes(arrOfSymbols[i])) {
                    arrayOfNoPriceCoins.push(arrOfSymbols[i]);
                    break;
                }
            }
        }
        const timeValue = new Date().getTime(); // Get the current time as the Y value
        // go on all the keys so we can draw them on the graph
        arrOfKeys.forEach(x => {
            // const timeValue = new Date().getTime(); // Get the current time as the Y value
            let dataset = chart.data.datasets.find(d => d.label === x);
            console.log(dataset);

            
            // Define 3 different numbers for our lines to have each time
            let ran1 = Math.floor(Math.random() * 255 + 1);
            let ran2 = Math.floor(Math.random() * 255 + 1);
            let ran3 = Math.floor(Math.random() * 255 + 1);

            // check that we actually have a dataset if not the create a new one
            if(!dataset) {
             dataset = {
                label: `${x}`,
                data: [{x: timeValue, y: coinsInUSD[x].USD}],
                backgroundColor: `rgba(${ran1}, ${ran2}, ${ran3}, 1)`,
                borderColor: `rgba(${ran1}, ${ran2}, ${ran3}, 1)`,
                borderWidth: 1,
                fill: false,
            };

            chart.data.datasets.push(dataset);
        }
        else {
            dataset.data.push({x: timeValue, y: coinsInUSD[x].USD});
        }
        });
        // update the chart and return the no-coins array so we can use it in drawGraph and alert the user incase we need.
        chart.update();

        return arrayOfNoPriceCoins;
    }

    // draw the actual graph we need and write an alert incase we have a bugged coin
    async function drawGraph() {

                // Get the ids that we need
                let alertBoxInfo = document.getElementById('alertDivInfo');
                const ctx = document.getElementById('myChart').getContext('2d');

                // make sure there is no chart before starting a new one
                if(chart) {
                    chart.destroy();
                }


                // Create the graph it self using the data from the array we have.
                chart = new Chart(ctx, {
                    type: 'line',
                    data: {
                        datasets: [],
                    },
                    options: {
                        responsive: true,
                        scales: {
                            x: {
                                ticks: {callback:value => {
                                    let date = new Date(value)
                                    return `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
                                } },
                                type: 'linear',

                                display: true,
                                title: {
                                    display: true,
                                    text: 'Time',
                                },
                            },
                            y: {
                                type: 'linear',
                                display: true,
                                title: {
                                    display: true,
                                    text: 'USD',
                                },
                }
                
                        }
                    }
                });
        

                // Update the graph once so the user sees it instantly
                let arrayOfNoPriceCoins = await updateGraph(chart);

                // Interval to update the chart every
                interval = setInterval(() => {
                    updateGraph(chart);
                }, 2500);

        // Create the alert message the user will see when a coin doesn't have a price.
        let html = 'We are very sorry but the coins';
         if(arrayOfNoPriceCoins.length !== 0) {
            for(let i = 0; i < arrayOfNoPriceCoins.length; i++) {
                html +=  ', ' + arrayOfNoPriceCoins[i];
            }
            html += '. dont have a real time exchange rate. the graph you will be shown is without those specific coins.';
            alertBoxInfo.innerHTML = html;
            $('#closeTheAlert').show();
        }
        else {
            $('#closeTheAlert').hide();
        }
    }

    async function getSingleCoin(coinId) {
        let coin = await getJson('https://api.coingecko.com/api/v3/coins/' + coinId);
        return coin;
    }

    // Get the live price of the coin
    async function getCoinActivePrice(arrayOfSymbol) {
        try {
            // Get a string of all the symbols so we can get the price of them
            let string = arrayOfSymbol.join(',');
            let currentPrice = await getJson(`https://min-api.cryptocompare.com/data/pricemulti?fsyms=${string}&tsyms=USD`);
            return currentPrice;
        }
        catch(err) {
            console.log(err.message);
        }
    }

    async function getAllCoins() {
        let coins = await getJson('https://api.coingecko.com/api/v3/coins/list');
        coins = coins.filter(c => c.symbol.length <= 3);

        return coins;
    }

    async function getJson(url) {
        let response = await fetch(url)
        let data = await response.json();
        return data;
    }
});


// Function to create the background spans for the animation
function backgroundBalls() {
    // Get the container div
    let backgroundContainer = document.getElementById('backgroundContainer');

    //Create 30 balls with random duration and delay 
    let html = '';
    for (let i = 0; i < 30; i++) {
        let duration = Math.floor(Math.random() * 20 + 10);
        let delay = Math.floor(Math.random() * 7 + 1);
        let bitCoinOrEthereum = Math.random();
        if (bitCoinOrEthereum >= 0.5)
            html += `
                <span class="bitCoin" style="--ad:${duration}s; --del:${delay}s"></span>
            `;
        else
            html += `
                <span class="ethereum" style="--ad:${duration}s; --del:${delay}s"></span>
            `;
    }
    backgroundContainer.innerHTML = html;
}
