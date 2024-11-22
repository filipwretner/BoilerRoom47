const apiKey = "658e6403-0a2e-4101-80da-026e0e38aeb5"; // API nyckel from Guardian
let savedArticles = []; // Initiates empty array for localStorage

// Link to endpoints: https://open-platform.theguardian.com/documentation/

const searchInput = document.getElementById("searchInput");
const selectCategory = document.getElementById("selectCategory");
const searchButton = document.getElementById("searchButton");
const newsContainer = document.getElementById("newsContainer");
const errorMessage = document.getElementById("errorMessage");
const savedNewsContainer = document.getElementById("savedNewsContainer");

function fetchNews(query = "", category = "") {

    let url = `https://content.guardianapis.com/search?q=${query}&from-date=2014-01-01&api-key=${apiKey}`;

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

        const renderArticle = localStorage.getItem("savedArticles");

        if (renderArticle) {
            savedArticles = JSON.parse(renderArticle); // Adds the team saved in localStorage when the page loads
            renderSavedArticles();
        }

    })
    .catch(error => {
        console.error("Fel när nyheter skulle hämtas!", error);
        errorMessage.textContent = "Fel inträffade vid hämtning av data!";
    });
}

function displayNews(articles) {

    newsContainer.innerHTML = "";

    if (articles.length === 0) {
        newsContainer.innerHTML = "<p>Inga nyheter hittades</p>";
        return;
    }

    articles.forEach(article => {
        const articleCard = document.createElement("div");
        articleCard.classList.add("articleCard");

        articleCard.innerHTML = `
            <h2>${article.webTitle}</h2>
            <p>${article.sectionName}</p>
            <p>${article.webPublicationDate}</p>
            <a href="${article.webUrl}">LINK TO ARTICLE</a>
        `;

        const saveButton = document.createElement("button");
        saveButton.classList.add("saveButton");
        saveButton.textContent = "Spara och läs senare";
        saveButton.addEventListener("click", () => saveArticle(article));

        articleCard.appendChild(saveButton);
        newsContainer.appendChild(articleCard);
    });
}

function renderSavedArticles() {

    savedNewsContainer.innerHTML = "";

    if (savedArticles.length === 0) {
        savedNewsContainer.innerHTML = "<p>Inga nyheter hittades</p>";
        return;
    }

    savedArticles.forEach(article => {
        const articleCard = document.createElement("div");
        articleCard.classList.add("articleCard");

        articleCard.innerHTML = `
            <h2>${article.webTitle}</h2>
            <p>${article.sectionName}</p>
            <p>${article.webPublicationDate}</p>
            <a href="${article.webUrl}">LINK TO ARTICLE</a>
        `;

        const removeButton = document.createElement("button");
        removeButton.classList.add("removeButton");
        removeButton.textContent = "Läs klart? Ta bort den här artikeln";
        removeButton.addEventListener("click", () => removeArticle(article));

        articleCard.appendChild(removeButton);
        savedNewsContainer.appendChild(articleCard);
    });
}

searchButton.addEventListener("click", () => {
    const query = searchInput.value.trim();
    const category = selectCategory.value;
    fetchNews(query, category);
});


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

fetchNews();

const saved = localStorage.getItem("savedArticles");

if(saved) {
    savedArticles = JSON.parse(saved);
    renderSavedArticles();
}