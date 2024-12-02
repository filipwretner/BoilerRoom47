const guardianApiKey = "658e6403-0a2e-4101-80da-026e0e38aeb5"; // API key from Guardian
const openweatherApiKey = "d7dcd9932a82cc785d33a798d7d792e4"; // API key from Openweather

let savedArticles = []; 
let isSavedNewsVisible = false;

// Link to endpoints: https://open-platform.theguardian.com/documentation/
// openweather api call: https://api.openweathermap.org/data/2.5/weather?q={city name}&appid={API key}

const weatherContainer = document.getElementById("weatherContainer");
const searchInput = document.getElementById("searchInput");
const selectCategory = document.getElementById("selectCategory");
const searchButton = document.getElementById("searchButton");
const newsContainer = document.getElementById("newsContainer");
const errorMessage = document.getElementById("errorMessage");
const savedNewsContainer = document.getElementById("savedNewsContainer");
const toggleSavedButton = document.getElementById("toggleSavedButton");



async function fetchNews(query = "", category = "", page = 1) {

    let guardianUrl = `https://content.guardianapis.com/search?q=${query}&from-date=2014-01-01&page=${page}&page-size=6&order-by=newest&api-key=${guardianApiKey}`;
    let openweatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=linkoping&appid=${openweatherApiKey}`;

    if (category) {
        guardianUrl += `&section=${category}`; // Adds category to the URL if we have one chosen
    }

    try {
        const [guardianResponse, openweatherResponse] = await Promise.all([
           fetch(guardianUrl).then(response => {

            if (!response.ok) {

                
                switch (response.status) {

                    case 404:
                        throw new Error("404 Error: Couldn't find the any news");
                        break;

                    case 401:
                        throw new Error("401 Error: Unauthorized Access to the Guardian");
                        break;
                
                    case 500:
                        throw new Error("500 Error: Internal Server Error");
                        break;

                    case 429:
                        throw new Error("429 Error: Too many requests from the Guardian API Key");
                        break; 

                    default:
                        throw new Error(`Unexpected error: ${response.status} ${response.statusText}`);
                        break;
                }
            }  

            return response.json();
        }),
        fetch(openweatherUrl).then(response => {

            if (!response.ok) {

                switch (response.status) {
    
                    case 404:
                        throw new Error("404 Error: Couldn't find the weather for requested city");
                        break;
    
                    case 401:
                        throw new Error("401 Error: Unauthorized Access to OpenWeather");
                        break;
                    
                    case 500:
                        throw new Error("500 Error: Internal Server Error");
                        break;
    
                    case 429:
                        throw new Error("429 Error: Too many requests from the OpenWeather API key");
                        break; 
    
                    default:
                        throw new Error(`Unexpected error: ${response.status} ${response.statusText}`);
                        break;
                }
            }

            return response.json();
        })
        ]);

        displayItems(guardianResponse.response.results, openweatherResponse);
        createPages(guardianResponse.response.pages, page, query, category);

        const isArticlesSaved = localStorage.getItem("savedArticles");

        if (isArticlesSaved) {
            savedArticles = JSON.parse(isArticlesSaved);
            renderSavedArticles();
        }

    } catch (error) {
        console.error(`An error occured: ${error}`);
        errorMessage.textContent = `${error.message}`;
    }
}

searchButton.addEventListener("click", () => {
    errorMessage.textContent = "";

    const query = searchInput.value.trim();
    const category = selectCategory.value;
    fetchNews(query, category);
});

function displayItems(articles, weatherData) {

    newsContainer.innerHTML = "";

    if (articles.length === 0) {
        newsContainer.innerHTML = "<p>Couldn't find any news</p>";
        return;
    }

    weatherContainer.innerHTML = `
            <h3>City: ${weatherData.name}</h3>
            <p>Temparature: ${parseInt(weatherData.main.temp - 273.15)} ºC</p>
            <p>Currently: ${weatherData.weather[0].description}</p>
    `;

    // Creates cards for every article we fetch with the API
    articles.forEach(article => {
        const articleCard = document.createElement("div");
        articleCard.classList.add("articleCard");

        articleCard.innerHTML = `
            <h2>${article.webTitle}</h2>
            <p>Category: ${article.sectionName}</p>
            <p>Published: ${new Date(article.webPublicationDate).toLocaleDateString()}</p>
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
            <p>Published: ${new Date(article.webPublicationDate).toLocaleDateString()}</p>
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

    totalPages = 100;

    // Sets interval of 3 buttons
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
        toggleSavedButton.textContent = "Hide saved articles"; 

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