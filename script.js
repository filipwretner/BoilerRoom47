const apiKey = "658e6403-0a2e-4101-80da-026e0e38aeb5"; // API nyckel från Guardian

// GET https://content.guardianapis.com/${category}/${keyword}?api-key=${apiKey}
// Tags = sökord
// Sections = kategori

// Länk till alla endpoints: https://open-platform.theguardian.com/documentation/

const searchInput = document.getElementById("searchInput");
const selectCategory = document.getElementById("selectCategory");
const searchButton = document.getElementById("searchButton");
const newsContainer = document.getElementById("newsContainer");
const errorMessage = document.getElementById("errorMessage");

function fetchNews(){

    fetch(`https://content.guardianapis.com/search?q=debate&tag=politics/politics&from-date=2014-01-01&api-key=${apiKey}`)
    .then(response => {

        if(!response.ok) {
            throw new Error (`HTTP Error! Status: ${response.status}`);
        }
        return response.json();

    })
    .then(data => {
        displayNews(data.response.results);
    })
    .catch(error => {
        console.error("Error när nyheter skulle hämtas!", error);
        errorMessage.textContent = "Fel inträffade!";
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

        newsContainer.appendChild(articleCard);
    });
}

searchButton.addEventListener("click", () => {
    const query = searchInput.value.trim();
    const category = selectCategory.value;
    fetchNews(query, category);
});

fetchNews();