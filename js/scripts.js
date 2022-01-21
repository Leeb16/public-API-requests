/* Project 5 - Public API Requests
    Author: Lee Bryan */

const gallery = document.getElementById ('gallery');
const cards = document.querySelectorAll('.card');
const search = document.querySelector ('.search-container');
let userArray;
let searched = false;
let searchResults;
let selectedUser;
let modalContainer;
let modalInfoContainer;
let modalButtonContainer;
let clickIndex;
let prevButton;
let nextButton;

// Adds the search form

const searchForm = `
    <form action="#" method="get">
        <input type="search" id="search-input" class="search-input" placeholder="Search...">
        <input type="submit" value="&#x1F50D;" id="search-submit" class="search-submit">
    </form>`;

search.insertAdjacentHTML('beforeend', searchForm);


//Fetch request that checks the response, parses the data to the json format and displays the error message and code if needed

async function fetchData (url) {
    return fetch (url)
        .then (checkStatus)
        .then (response => response.json())
        .catch (error => console.log ('Looks like there was a problem: ',error));
};

//Fetchs 12 random users from Great Britain

fetchData ('https://randomuser.me/api/?nat=gb&results=12')
    .then (data => {
        userArray = data.results;
        generateCards (userArray);
        initialiseModal();
        prevButton = document.querySelector('#modal-prev');
        nextButton = document.querySelector('#modal-next');
        modalButtonContainer = document.querySelector('.modal-btn-container');

// Adds the search functionality to create new users that match the search data

        search.addEventListener ('submit', (e) => {
            e.preventDefault();
            const searchValue = e.target[0].value.toLowerCase()
            if (searchValue === '') {
            removeCards();
            generateCards(userArray);
            searched = false;
            } else {
                searched = true;
                searchResults = [];
                userArray.forEach(match => {
                    const searchName = `${match.name.first} ${match.name.last}`;
                    const lowerCase = searchName.toLowerCase();
                    if (lowerCase.includes(searchValue)) {
                        searchResults.push(match);
                    }
                });
                removeCards();
                generateCards(searchResults);
            }
        });
    
        gallery.addEventListener('click', (e) => {
            if(e.target.className.includes('card')) {
                if(searched) {
                    selectedUser = clickedUser (e, searchResults);
                } else {
                    selectedUser = clickedUser (e, userArray);
                }
                createModal(selectedUser);
                modalInfoContainer = document.querySelector('.modal-info-container');
                modalContainer.style.display = 'block';
                toggleButtons();
            }
        })
// Adds modal interactivity

// Removes the modal window if the X button is clicked

modalContainer.addEventListener('click', (e) => {
    if (e.target.className === 'modal-close-btn' || e.target.textContent === 'X') {
        modalContainer.style.display = 'none';
        modalInfoContainer = document.querySelector('.modal-info-container')
        modalInfoContainer.remove();
    } 
    
// Gets previous user if the previous button is clicked
    
    else if (e.target.id === 'modal-prev') {  
        if (clickIndex > 0) {
            if (searched) {
                toggleUser (previousUser, searchResults);
            } else { 
                toggleUser (previousUser, userArray);
             }
        }
        toggleButtons();

// Gets next user if next button is clicked and its not the last user card

    } else if (e.target.id === 'modal-next') {
        if (searched ? (clickIndex < searchResults.length - 1) : (clickIndex < userArray.length - 1)){
            if (searched) {
                toggleUser(nextUser,searchResults);
            } else {
                toggleUser(nextUser, userArray);
            }
        } else { 
            nextButton.style.display = 'none';
        }
        toggleButtons();
        }
    });
    
});


//-----HELPER FUNCTIONS-----

//Resolves or rejects the promise

function checkStatus (response) {
    if (response.ok) {
        return Promise.resolve(response);
    } else {
        return Promise.reject (new Error (response.statusText));
    }
}

// Creates the user cards displayed in the gallery

function generateCards (dataArray) {
    let index = 0;
    dataArray.forEach(user => {
    const cardHTML = `
    <div  id = ${index} class="card">
        <div class="card-img-container">
            <img class="card-img" src="${user.picture.large}" alt="profile picture">
        </div>
        <div class="card-info-container">
            <h3 id="name" class="card-name cap">${user.name.first} ${user.name.last}</h3>
            <p class="card-text">${user.email}</p>
            <p class="card-text cap">${user.location.state}</p>
        </div>
    </div>`;
    gallery.insertAdjacentHTML('beforeend', cardHTML);
    index ++;
    })
}

// Removes the user cards from the gallery

function removeCards() {
    const cards = document.querySelectorAll('.card');
    cards.forEach (card => card.remove())
}

// Determines which user in the array way clicked

function clickedUser (e, dataArray){
    let selected = e.target;

    while (selected.className != 'card'){
        selected = selected.parentElement;
    }
    clickIndex = selected.id;
    const selectedUser = dataArray[clickIndex];
    return selectedUser;
}

// Determines the previous user

function previousUser(dataArray) {
    clickIndex = parseInt (clickIndex) -1;
    selectedUser = dataArray[clickIndex];
    return selectedUser;
}

// Determines the next user

function nextUser (dataArray) {
    clickIndex = parseInt(clickIndex) +1;
    selectedUser = dataArray[clickIndex];
    return selectedUser;
}

//Toggles the user by creating new modal

function toggleUser (callback, dataArray) {
    modalInfoContainer = document.querySelector('.modal-info-container');
    modalInfoContainer.remove();
    selectedUser = callback (dataArray);
    createModal (selectedUser);
}

// Initialises the modal HTML and hides the element

function initialiseModal() {
    const initialiseModalHTML = `
    <div class="modal-container">
        <div class="modal">
            <button type="button" id="modal-close-btn" class="modal-close-btn"><strong>X</strong></button>
        </div> 
        <div class="modal-btn-container">
            <button type="button" id="modal-prev" class="modal-prev btn">Prev</button>
            <button type="button" id="modal-next" class="modal-next btn">Next</button>
        </div>
    </div>`;
    gallery.insertAdjacentHTML('beforeend',initialiseModalHTML);
    modalContainer = document.querySelector('.modal-container');
    modalContainer.style.display = 'none';
}

// Creates the new modal HTML using the selectedUser's data object

function createModal (selectedUser) {
    let cellNumber = formatCellNumber (selectedUser.cell);
    let birthday = formatBirthday (selectedUser.dob.date);
    const modalHTML = `
        <div class="modal-info-container">
            <img class="modal-img" src='${selectedUser.picture.large}' alt="profile picture">
            <h3 id="name" class="modal-name cap">${selectedUser.name.first} ${selectedUser.name.last}</h3>
            <p class="modal-text">${selectedUser.email}</p>
            <p class="modal-text cap">${selectedUser.location.city}</p>
            <hr>
            <p class="modal-text">${cellNumber}</p>
            <p class="modal-text">${selectedUser.location.street.number} ${selectedUser.location.street.name}, ${selectedUser.location.city},</p>
            <p class="modal-text">${selectedUser.location.state}, ${selectedUser.location.postcode}</p>
            <p class="modal-text">DOB: ${birthday}</p>
    </div>`;
    const modal = document.querySelector('.modal');
    modal.insertAdjacentHTML('beforeend',modalHTML);
}

// Formats the user's cell number

function formatCellNumber(cellNumber) {
    cellNumber = cellNumber.replace (/[^\d]+/g, '')
        .replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
    return cellNumber;
    }

// Formats the user's date of birth

function formatBirthday(birthday) {
    birthday = birthday.replace(/(\d{4})-(\d{2})-(\d{2}).+/, '$2/$3/$1');
    return birthday;
}

// Determines which toggle buttons should be visible

function toggleButtons () {
    modalButtonContainer.style.visibility = 'visible';
    if (clickIndex > 0 && 
        (searched ? (clickIndex < searchResults.length - 1) : (clickIndex < userArray.length - 1))) {
            prevButton.style.display = 'block';
            nextButton.style.display = 'block';
        } else if (clickIndex > 0) {
            prevButton.style.display = 'block';
            nextButton.style.display = 'none';
        } else if ((searched ? (clickIndex < searchResults.length - 1) : (clickIndex < userArray.length - 1))) {
            prevButton.style.display = 'none';
            nextButton.style.display = 'block';
        } else {
            modalButtonContainer.style.visibility = 'hidden';
        }
}
