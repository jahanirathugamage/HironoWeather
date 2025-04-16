const headerTxt = document.querySelector('.header-txt');

const cityInput = document.querySelector('.city-input');
const searchBtn = document.querySelector('.search-btn');

const weatherInfoSection = document.querySelector('.weather-info');
const searchCitySection = document.querySelector('.search-city');
const notFoundSection = document.querySelector('.not-found');

const countryTxt = document.querySelector('.country-txt');
const currentDateTxt = document.querySelector('.current-date-txt')
const conditionTxt = document.querySelector('.condition-txt');
const weatherSummaryImg = document.querySelector('.weather-summary-img');
const rainValueTxt = document.querySelector('.rain-value-txt');
const windValueTxt = document.querySelector('.wind-value-txt')
const humidityValueTxt = document.querySelector('.humidity-value-txt');

const forecastItemsContainer = document.querySelector('.forecast-items-container');

let apiKey = '879c0dd1e8385d5d621ceb9a17459739';

// get the current time
function getCurrentTime() {
    headerTxt.textContent = new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    });
}

getCurrentTime();

// search results through the search icon
searchBtn.addEventListener('click', () => {
    // prevent empty search inputs 
    if(cityInput.value.trim() != ''){
        updateWeatherInfo(cityInput.value);
        cityInput.value = '';
    }
})

// search results using the enter key
cityInput.addEventListener('keydown', (event) => {
    if(event.key == 'Enter' && 
    cityInput.value.trim() != ''
    ){
        updateWeatherInfo(cityInput.value);
        cityInput.value = '';
    }
})

// get the weather results
async function getFetchData(endPoint, city) {

    // endPoint is to determine if we need the weather or forecast and the units are converted to metric 
    let apiUrl = `https://api.openweathermap.org/data/2.5/${endPoint}?q=${city}&appid=${apiKey}&units=metric`; 

    let response = await fetch(apiUrl);

    return response.json();
}

// get the current date
function getCurrentDate(){
    const currentDate = new Date();
    const options = {
        weekday: 'short',
        day: '2-digit',
        month: 'short'
    }

    return currentDate.toLocaleDateString('en-GB', options);
}

// get the weather image and icon based on the current weather's id which indicates the overall weather condition
function getWeatherImage(id){
    if( id <= 232) return `thunderstorm.png`;
    if( id <= 321) return `drizzle.png`;
    if( id <= 531) return `rain.png`;
    if( id <= 622) return `snow.png`;
    if( id <= 781) return `atmosphere.png`;
    if( id <= 800) return `clear.png`;
    else return `clouds.png`;
}

function getWeatherIcon(id){
    if( id <= 232) return `thunderstorm.svg`;
    if( id <= 321) return `drizzle.svg`;
    if( id <= 531) return `rain.svg`;
    if( id <= 622) return `snow.svg`;
    if( id <= 781) return `atmosphere.svg`;
    if( id <= 800) return `clear.svg`;
    else return `clouds.svg`;
}

// find the results of the city's weather
async function updateWeatherInfo(city) {
    let weatherData = await getFetchData('weather', city);
    let precipitationData = await getFetchData('forecast', city);

    // show the error message when the city is not found
    if(weatherData.cod != 200){ // cod = 200 indicates the city exists
        showDisplaySection(notFoundSection);
        return
    }

    // create an array consisting of weather data
    const{
        name: country,
        main: {temp, humidity},
        weather: [{id, main}],
        wind: {speed}
    } = weatherData;

    // get the probability of precipitation in [0] - next 3 hours
    let pop = precipitationData.list[0].pop;

    // match the weather data to the city
    countryTxt.textContent = country;
    currentDateTxt.textContent = getCurrentDate();
    conditionTxt.textContent = main;
    rainValueTxt.textContent = Math.round(pop * 100);
    humidityValueTxt.textContent = humidity;
    windValueTxt.textContent = speed;

    weatherSummaryImg.src = `assets/hirono/${getWeatherImage(id)}`;

    await updateForecastsInfo(city);

    // show the weather information
    showDisplaySection(weatherInfoSection);
}

// update forecast cards
async function updateForecastsInfo(city) {
    const forecastsData = await getFetchData('forecast', city);
    const timeTake = '12:00:00';
    forecastItemsContainer.innerHTML = ``;

    const filteredForecasts = [];

    for (let forecast of forecastsData.list) {
        if (forecast.dt_txt.includes(timeTake)) {
            filteredForecasts.push(forecast);
        }

        if (filteredForecasts.length === 5) break;
    }

    filteredForecasts.forEach(updateForecastItems);
}


// display a certain hidden section
function showDisplaySection(section){
    [weatherInfoSection, searchCitySection, notFoundSection]
        .forEach(section => section.style.display = 'none')

    section.style.display = 'block';
}

// update the forecast cards (normal Dates)
function updateForecastItems(weatherData){
    const {
        dt_txt: date,
        weather: [{id}],
        main: {temp}
    } = weatherData;

    // get the dates of the forecasts
    const dateTaken = new Date(date);
    const dateOption = {
        day: '2-digit',
    }
    const dateResult = dateTaken.toLocaleDateString('en-US', dateOption);

    const forecastItem = `
        <div class="forecast-item">
            <div>
                <span class="material-symbols-outlined temp-line">
                    horizontal_rule
                </span>
            </div>
            <div class="forecast-item-info">
                <h3 class="forecast-item-temp">${Math.round(temp)}°</h3>
                <h5 class="forecast-item-date regular-txt grey-txt">${dateResult}</h5>
                <img src="assets/weather/${getWeatherIcon(id)}" alt="weather" class="forecast-item-img">
            </div>
            <div>
                <span class="material-symbols-outlined temp-line">
                    horizontal_rule
                </span>
            </div>
        </div>
    `
    forecastItemsContainer.insertAdjacentHTML('beforeend', forecastItem);
}