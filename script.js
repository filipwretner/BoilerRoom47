const apiKey = "568f5405a68c48f4abe802adc355b282"; // API nyckel från newsapi.org

// GET https://newsapi.org/v2/everything?q=(SÖKTERM)&apiKey=${apiKey}
// Lägg till &-tecken efter sökterm för att lägga till fler parametrar
// Exempel, lägger till tidspan: https://newsapi.org/v2/everything?q=(SÖKTERM)&from=2024-11-21&apiKey=${apiKey}
// Visar artiklar för vårt sökord från det datum vi skriver in
// Sorteringsexempel: Lägger till att vi sorterar efter popularitet: https://newsapi.org/v2/everything?q=(SÖKTERM)&from=2024-11-21&sortBy=popularity&apiKey=${apiKey}

// Länk till alla endpoints: https://newsapi.org/docs/endpoints/everything

const searchInput = document.getElementById("searchInput");
const selectCategory = document.getElementById("selectCategory");
const searchButton = document.getElementById("searchButton");
const newsContainer = document.getElementById("newsContainer");
const errorMessage = document.getElementById("errorMessage");

// We want a function that fetches articles from the API

// We want a function that adds HTML elements to display the articles

// Event listener for search button