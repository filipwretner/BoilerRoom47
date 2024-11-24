const apiKey = "658e6403-0a2e-4101-80da-026e0e38aeb5"; // API nyckel from Guardian
let savedArticles = []; // Initiates empty array for localStorage

// Link to endpoints: https://open-platform.theguardian.com/documentation/

const searchInput = document.getElementById("searchInput");
const selectCategory = document.getElementById("selectCategory");
const searchButton = document.getElementById("searchButton");
const newsContainer = document.getElementById("newsContainer");
const errorMessage = document.getElementById("errorMessage");
const savedNewsContainer = document.getElementById("savedNewsContainer");

function fetchNews(query = "", category = "", page = 1) {

    let url = `https://content.guardianapis.com/search?q=${query}&from-date=2014-01-01&page=${page}&page-size=6&order-by=newest&api-key=${apiKey}`;

    if (category) {
        url += `&section=${category}`; // Adds category to the URL if we have one chosen
    }

    fetch(url)
    .then(response => {

        if(!response.ok) {
            throw new Error (`HTTP Error! Status: ${response.status}`);
        }
        return response.json();

    })
    .then(data => {
        displayNews(data.response.results);
        createPages(data.response.pages, page, query, category);

        // Only render local storage if we have any articles stored
        const saved = localStorage.getItem("savedArticles");

        if (saved) {
            savedArticles = JSON.parse(saved); 
            renderSavedArticles();
        }

    })
    .catch(error => {
        console.error("An error occured when fetchind data!", error);
        errorMessage.textContent = "An error occured when fetching data!";
    });
}

searchButton.addEventListener("click", () => {
    const query = searchInput.value.trim();
    const category = selectCategory.value;
    fetchNews(query, category);
});

function displayNews(articles) {

    newsContainer.innerHTML = "";

    if (articles.length === 0) {
        newsContainer.innerHTML = "<p>Couldn't find any news</p>";
        return;
    }

    // Creates cards for every article we fetch with the API
    articles.forEach(article => {
        const articleCard = document.createElement("div");
        articleCard.classList.add("articleCard");

        articleCard.innerHTML = `
            <h2>${article.webTitle}</h2>
            <p>Category: ${article.sectionName}</p>
            <p>Published: ${article.webPublicationDate}</p>
            <a href="${article.webUrl}">Read article</a>
        `;

        const saveButton = document.createElement("button");
        saveButton.classList.add("saveButton");
        saveButton.textContent = "Save and read later";
        saveButton.addEventListener("click", () => saveArticle(article));

        articleCard.appendChild(saveButton);
        newsContainer.appendChild(articleCard);
    });
}

function renderSavedArticles() {

    savedNewsContainer.innerHTML = "";

    if (savedArticles.length === 0) {
        savedNewsContainer.innerHTML = "<p>You don't have any news saved.</p>";
        return;
    }

    // Creates cards for every article stored in localStorage
    savedArticles.forEach(article => {
        const articleCard = document.createElement("div");
        articleCard.classList.add("articleCard");

        articleCard.innerHTML = `
            <h2>${article.webTitle}</h2>
            <p>Category: ${article.sectionName}</p>
            <p>Published: ${article.webPublicationDate}</p>
            <a href="${article.webUrl}">Read article</a>
        `;

        const removeButton = document.createElement("button");
        removeButton.classList.add("removeButton");
        removeButton.textContent = "Done reading? Remove this article";
        removeButton.addEventListener("click", () => removeArticle(article));

        articleCard.appendChild(removeButton);
        savedNewsContainer.appendChild(articleCard);
    });
}

function createPages(totalPages, currentPage, query, category) {

    let pageContainer = document.getElementById("pageContainer");

    if (!pageContainer) { // Makes sure we render a new container 
        pageContainer = document.createElement("div");
        pageContainer.setAttribute("id", "pageContainer");
        newsContainer.parentNode.appendChild(pageContainer);
    } else {
        pageContainer.innerHTML = "";
    }

    totalPages = Math.min(totalPages, 100); // Sets max number of pages to 100

    const maxVisiblePages = 3; 
    const startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2)); // Sets the start page in relation to current page
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1); // Sets end page in relation to the max amount of pages

    if (startPage > 1) {

        // Makes sure we have a button that always directs to the first page
        const firstPageButton = document.createElement("button");
        firstPageButton.textContent = "1";
        firstPageButton.addEventListener("click", () => fetchNews(query, category, 1));
        pageContainer.appendChild(firstPageButton);

        // Adds dots between the first button if there's a gap to the start page, if startPage is 1 or 2 there's no dots
        if (startPage > 2) {
            const dots = document.createElement("span");
            dots.textContent = "...";
            pageContainer.appendChild(dots);
        }
    }

    // Creates buttons between our start and end page
    for (let i = startPage; i <= endPage; i++) {

        const pageButton = document.createElement("button");
        pageButton.classList.add("pageButton");
        pageButton.textContent = i;

        if (i === currentPage) {
            pageButton.classList.add("active");
        }

        pageButton.addEventListener("click", () => {
            fetchNews(query, category, i);
        });

        pageContainer.appendChild(pageButton);
    }

    // Creates button that directs to last available page, but only if we select different page than the last
    if (endPage < totalPages) {

        // Creates some dots between endPage button and last button
        if (endPage < totalPages - 1) {
            const dots = document.createElement("span");
            dots.textContent = "...";
            pageContainer.appendChild(dots);
        }

        const lastPageButton = document.createElement("button");
        lastPageButton.textContent = totalPages;
        lastPageButton.addEventListener("click", () => fetchNews(query, category, totalPages));
        pageContainer.appendChild(lastPageButton);
    }
}

function saveArticle(article) {

    if (!savedArticles.some(saved => saved.webUrl === article.webUrl)) {
        savedArticles.push(article);
        renderSavedArticles();
        saveToLocalStorage();
    }

}

function removeArticle(article) {

    savedArticles = savedArticles.filter(saved => saved.webUrl !== article.webUrl);

    renderSavedArticles();
    saveToLocalStorage();
}

function saveToLocalStorage () {
    localStorage.setItem("savedArticles", JSON.stringify(savedArticles));
}

// Initial page load
fetchNews();