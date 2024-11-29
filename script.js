const guardianApiKey = "658e6403-0a2e-4101-80da-026e0e38aeb5"; // API key from Guardian
const nytimesApiKey = "aepTcnmDxmTEQsLgo78WwAXSjr8Z5Fd4";

let savedArticles = []; 
let isSavedNewsVisible = false;

// Link to endpoints: https://open-platform.theguardian.com/documentation/

const searchInput = document.getElementById("searchInput");
const selectCategory = document.getElementById("selectCategory");
const searchButton = document.getElementById("searchButton");
const newsContainer = document.getElementById("newsContainer");
const errorMessage = document.getElementById("errorMessage");
const savedNewsContainer = document.getElementById("savedNewsContainer");
const toggleSavedButton = document.getElementById("toggleSavedButton");

async function fetchNews(query = "", category = "", page = 1) {

    const guardianUrl = `https://content.guardianapis.com/search?q=${query}&from-date=2014-01-01&page=${page}&page-size=6&order-by=newest&api-key=${guardianApiKey}`;
    const nytimesUrl = `https://api.nytimes.com/svc/search/v2/articlesearch.json?q=${query}&page=${page - 1}&api-key=${nytimesApiKey}`;

    try {
        const [guardianResponse, nytimesResponse] = await Promise.all([
            fetch(guardianUrl).then(response => {

                if (!response.ok) {

                    switch (response.status) {
        
                        case 404:
                            throw new Error("404 Error, couldnt find anything");
                            break;
        
                        case 401:
                            throw new Error("401 Error, unauthorized access");
                            break;
                        
                        case 500:
                            throw new Error("500 Error, server");
                            break;
        
                        case 429: 
                            throw new Error("429 Error, too many requests from Guardian");
        
                        default:
                            throw new Error(`Unexpected error: ${response.status} ${response.statusText}`);
                            break;
                    }
                }

                return response.json();
            }),
            fetch(nytimesUrl).then(response => {

                if (!response.ok) {

                    switch (response.status) {
        
                        case 404:
                            throw new Error("404 Error, couldnt find anything");
                            break;
        
                        case 401:
                            throw new Error("401 Error, unauthorized access");
                            break;
                        
                        case 500:
                            throw new Error("500 Error, server");
                            break;
        
                        case 429: 
                            throw new Error("429 Error, too many requests from NY Times");
        
                        default:
                            throw new Error(`Unexpected error: ${response.status} ${response.statusText}`);
                            break;
                    }
                }

                return response.json();
            }),
        ]);

        const guardianArticles = guardianResponse.response.results.map(article => ({
            title: article.webTitle,
            category: article.sectionName,
            date: article.webPublicationDate,
            url: article.webUrl,
            source: "Guardian"
        }));

        const nytimesArticles = nytimesResponse.response.results ? nytimesResponse.response.results.map(article => ({
            title: article.headline.name,
            category: article.section_name || "Unknown",
            date: article.pub_date,
            url: article.web_url,
            source: "Ny Times"
        })) : [];

        const allArticles = [...guardianArticles, ...nytimesArticles];

        const guardianPages = guardianResponse.response.pages;
        const nytimesTotalHits = nytimesResponse.response.meta.hits;
        const nytimesPages = Math.ceil(nytimesTotalHits / 10);

        const totalPages = Math.min(guardianPages, nytimesPages);

        displayNews(allArticles);
        createPages(totalPages, page, query, category);

        const isArticlesSaved = localStorage.getItem("savedArticles");

        if (isArticlesSaved) {
            savedArticles = JSON.parse(isArticlesSaved);
            renderSavedArticles();
        }

    } catch (error) {

        console.error(`An error occured when fetching news: ${error}`);

        switch (true) {

            case error.message.includes("404"):
                errorMessage.textContent = "404 Error, couldn't find any news.";
                break;
            
            case error.message.includes("401"):
                errorMessage.textContent = "401 error, unauthorized access";
                break;

            case error.message.includes("500"):
                errorMessage.textContent = "500 error, server";
                break;

            case error.message.includes("429"):
                errorMessage.textContent = "429 error, too many request"
            
            default:
                errorMessage.textContent = `Unexpected error: ${error}`;
        }
    }
}

searchButton.addEventListener("click", () => {
    errorMessage.textContent = "";

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
            <h2>${article.title}</h2>
            <p>Category: ${article.category}</p>
            <p>Published: ${new Date(article.date).toLocaleDateString()}</p>
            <p>Source: ${article.source}</p>
            <a href="${article.url}">Read article</a>
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
            <h2>${article.title}</h2>
            <p>Category: ${article.category}</p>
            <p>Published: ${new Date(article.date).toLocaleDateString()}</p>
            <p>Source: ${article.source}</p>
            <a href="${article.url}">Read article</a>
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

    // Vi vill visa 3 knappar
    const startPage = Math.max(1, currentPage - 1); 
    const endPage = Math.min(totalPages, startPage + 2); 

    if (startPage > 1) {

        // Creates button that directs to first page
        const firstPageButton = document.createElement("button");
        firstPageButton.textContent = "1";
        firstPageButton.addEventListener("click", () => fetchNews(query, category, 1));
        pageContainer.appendChild(firstPageButton);

        // Adds dots if we select a page bigger than 4
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
        pageButton.addEventListener("click", () => fetchNews(query, category, i));
        pageContainer.appendChild(pageButton);
    }

    // Creates button that directs to last available page, but only if we select different page than the last
    if (endPage < totalPages) {

        // Creates dots when apprpiate
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
    errorMessage.textContent = "";

    if (!savedArticles.some(saved => saved.url === article.url)) {
        savedArticles.push(article);
        renderSavedArticles();
        saveToLocalStorage();
    } else {
        errorMessage.textContent = "You can't save the same article twice.";
    }

}

function removeArticle(article) {
    errorMessage.textContent = "";

    savedArticles = savedArticles.filter(saved => saved.url !== article.url);

    renderSavedArticles();
    saveToLocalStorage();
}

toggleSavedButton.addEventListener("click", () => {
    errorMessage.textContent = "";

    isSavedNewsVisible = !isSavedNewsVisible; 
    if (isSavedNewsVisible) {
        savedNewsContainer.style.display = "grid"; 
        savedNewsContainer.classList.add("active");
        toggleSavedButton.textContent = "Dölj sparade artiklar"; 

    } else {
        savedNewsContainer.style.display = "none"; 
        toggleSavedButton.textContent = "Show saved articles"; 
    }   
});

function saveToLocalStorage () {
    localStorage.setItem("savedArticles", JSON.stringify(savedArticles));
}

// Initial page load
fetchNews();