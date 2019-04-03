const addForm = document.querySelector(".add-form");

addForm.addEventListener("submit", e => handleSubmit(e));
document.addEventListener("scroll", e => checkForNewContent());

let inputTitle;
let startIndex = 0;
let resultsDiv;

function handleSubmit(e) {
  e.preventDefault();
  inputTitle = document.querySelector(".input-title").value;
  // validate input
  if (!validateInput(inputTitle)) return;
  fetchBooks(inputTitle, true, startIndex);
}

function fetchBooks(input, deleteResults, index) {
  fetch(
    `https://www.googleapis.com/books/v1/volumes?q=+intitle:${input}&startIndex=${index}`
  )
    .then(res => res.json())
    .then(data => {
      resultsDiv = document.querySelector(".results");
      // create cards with content
      const frag = createCards(data.items);
      // Delete previous search results if form submitted
      if (deleteResults) {
        deletePrevResults();
      }
      // Append to the DOM new results
      resultsDiv.appendChild(frag);
    })
    .catch(error => console.log(error));
}

function deletePrevResults() {
  while (resultsDiv.firstChild) {
    resultsDiv.removeChild(resultsDiv.firstChild);
  }
  return;
}

function createCards(books) {
  const fragment = document.createDocumentFragment();

  books.map(book => {
    // Check if image link exists
    let bookImage;
    if (!book.volumeInfo.imageLinks) {
      bookImage = "";
    } else {
      bookImage = book.volumeInfo.imageLinks.thumbnail;
    }
    // Check if description exists
    let bookDesc;
    if (!book.volumeInfo.description) {
      bookDesc = "There is no description provided for this book";
    } else {
      bookDesc =
        book.volumeInfo.description
          .split(" ")
          .slice(0, 18)
          .join(" ") + "...";
    }

    // Create card with content
    const card = document.createElement("div");
    card.classList += "card";
    card.innerHTML = `
    <div class="card-image">
      <img src="${bookImage}" alt="No Image">
      <span class="card-title">${book.volumeInfo.title}</span>
    </div>
    <div class="card-content">
      <p>${bookDesc}</p>
    </div>
    `;
    // Append card to the fragment
    fragment.append(card);
  });
  return fragment;
}

function validateInput(input) {
  const errorDiv = document.querySelector(".error");
  if (!input) {
    errorDiv.textContent = "Title is required";
    return false;
  }
  return true;
}

function checkForNewContent() {
  // Select last div(card)
  const lastDiv = document.querySelector(".results > div:last-child");
  // Position of last div(card)
  const lastDivOffset = lastDiv.offsetTop + lastDiv.clientHeight;
  const pageOffset = window.pageYOffset + window.innerHeight;

  if (pageOffset > lastDivOffset) {
    // If no title return
    if (!inputTitle) return;
    // Create div to prevent multiple requests
    const div = document.createElement("div");
    resultsDiv.appendChild(div);
    // Increse next request index start
    startIndex += 10;
    // Fetch boooks without deleting previous
    fetchBooks(inputTitle, false, startIndex);
  }
}
