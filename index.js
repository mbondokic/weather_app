let inputCity = document.querySelector("[name='city']");
let searchBtn = document.querySelector("[name='search']");
let homeBtn = document.querySelector("[name='home']");
let currentDiv = document.querySelector(".current");
let dailyDiv = document.querySelector(".daily");
let bgImgDiv = document.querySelector(".bg-image-holder");
let modalTitle = document.querySelector(".modal-city");
let homeCityInfo = document.querySelector(".home-city-info");
let searchInfo = document.querySelector(".search-info");
let modalHomeIcon = document.querySelector(".modal-home-icon");
let modalSearchIcon = document.querySelector(".modal-search-icon");
let formInput = document.querySelector("#form");

let cityInfo = {};

let apiKey = "64654d84436ab047338ce3efba0ddfb6";

// Check localstorage for home city
window.addEventListener("load", () => {
  if (localStorage.homeCity) {
    cityInfo = JSON.parse(localStorage.homeCity);
    let url = `https://api.openweathermap.org/data/2.5/onecall?lat=${cityInfo.lat}&lon=${cityInfo.lon}&units=metric&appid=${apiKey}`;
    sendRequest(url, displayWeatherData);
  }
});

searchBtn.addEventListener("click", getCoordinates);
formInput.addEventListener("keypress", (e) => {
  if (e.keyCode === 13) {
    e.preventDefault();
    getCoordinates();
  }
});
homeBtn.addEventListener("click", saveHomeCity);

function saveHomeCity() {
  if (inputCity.value !== "") {
    localStorage.homeCity = JSON.stringify(cityInfo);
    modalTitle.innerText = `${cityInfo.name}`;
    homeCityInfo.innerText = "Home city saved.";
    modalHomeIcon.src = "img/accept.png";
  } else {
    localStorage.homeCity = "";
    homeCityInfo.innerText = "Please search for the city first.";
    modalHomeIcon.src = "img/minus.png";
  }

  if (localStorage.homeCity !== "") {
    modalTitle.innerText = "";
  }
}

function getCoordinates() {
  let url = `http://api.openweathermap.org/geo/1.0/direct?q=${inputCity.value}&appid=${apiKey}`;

  if (inputCity.value !== "" && inputCity.value !== "0") {
    sendRequest(url, getWeatherData);
  } else {
    modalTitle.innerText = "";
    searchInfo.innerText = "Enter city name";
    modalSearchIcon.src = "img/minus.png";
  }
}

function getWeatherData(cityData) {
  cityInfo = {
    country: cityData[0].country,
    lat: cityData[0].lat,
    lon: cityData[0].lon,
    name: cityData[0].name
  };

  let url = `https://api.openweathermap.org/data/2.5/onecall?lat=${cityInfo.lat}&lon=${cityInfo.lon}&units=metric&appid=${apiKey}`;
  sendRequest(url, displayWeatherData);
}

async function sendRequest(url, callbackFunction) {
  let response = await fetch(url);
  if (response.status >= 200 && response.status <= 299) {
    let jsonResponse = await response.json();
    callbackFunction(jsonResponse);
  } else {
    // Handle errors
    if (response.status === 400) {
      searchInfo.innerText = "Enter city name";
      modalSearchIcon.src = "img/minus.png";
    }
  }
}

function displayWeatherData(weatherData) { 
  let current = weatherData.current;
  let daily = weatherData.daily;
  let currentIcon = current.weather[0].icon;

  let text = ``;
  text += `
        <div class="left">
          <p>${cityInfo.name}, ${cityInfo.country}</p>
          <p>${date()}</p>
          <p>${current.weather[0].description}</p>
          <p class="timeP"></p>
        </div>
        <div class="center">
          <img src="http://openweathermap.org/img/wn/${currentIcon}@2x.png" alt="Weather icon" >
          <p class="temperature">${Math.floor(current.temp)}&deg;C</p>
        </div>
        <div class="right">
          <p>
            <span class="d-none d-md-inline me-1">
              <img src="img/feel.png" alt="Fills like icon">
            </span>
            Feels like: ${Math.floor(current.feels_like)} &deg;C
          </p>
          <p>
            <span class="d-none d-md-inline me-1">
              <img src="img/pressure.png" alt="Pressure icon">
            </span>
            Pressure: ${current.pressure} mb
          </p>
          <p>
            <span class="d-none d-md-inline me-1">
              <img src="img/humidity.png" alt="Humidity icon">
            </span>
            Humidity: ${current.humidity} %
          </p>
          <p>
            <span class="d-none d-md-inline me-1">
              <img src="img/wind.png" alt="Wind icon">
            </span>
            Wind speed: ${current.wind_speed} km/h
          </p>
        </div>
      `;
  currentDiv.innerHTML = text.trim();

  text = ``;
  // 7 days forecast info
  weeklyForecast(daily);

  // Change background
  changeBackground(current, currentIcon);
 
  // Time
  let timeP = document.querySelector(".timeP");
  getLocalTime(timeP, weatherData);  
}

function getLocalTime(timeP, weatherData) {
  setTimeout(function () {
    let options = {
      timeZone: `${weatherData.timezone}`,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hourCycle: 'h23'
    },
    formatter = new Intl.DateTimeFormat([], options);
    let date = formatter.format(new Date())
    timeP.innerText = date;
    getLocalTime(timeP, weatherData);
  }, 1000);
}

function weeklyForecast(daily) {
  let text = ``;
  daily.forEach((day) => {
    let dayIcon = day.weather[0].icon;
    text += `<div class="col-3 col-lg-1 text-center">`;
    text += `<p class="mb-0"><strong>${dayName(day.dt)}</strong></p>`;
    text += `<img src="http://openweathermap.org/img/wn/${dayIcon}@2x.png" alt="Weather icon" >`;
    text += `<p class="m-0">Min: ${Math.floor(day.temp.min)} &deg;C</p>`;
    text += `<p class="mb-5">Max: ${Math.floor(day.temp.max)} &deg;C</p>`;
    text += `</div>`;
  });
  dailyDiv.innerHTML = text.trim();
}

// Time formatting
function timeFormat(num) {
  return num.toString().padStart(2, '0');
}

function changeBackground(current, currentIcon) {
  // Get sunset time
  let sunset = new Date(current.sunset * 1000);
  let sunsetHours = sunset.getHours();
  let sunsetMinutes = sunset.getMinutes();
  let sunsetTime = `${timeFormat(sunsetHours)}:${timeFormat(sunsetMinutes)}`;
  let splitS = sunsetTime.split(':');
  let ssTotalSeconds = parseInt(splitS[0] * 3600 + splitS[1] * 60, 10);
  
  // Get current time
  let time = new Date(current.dt * 1000);
  let currentHours = time.getHours();
  let currentMinutes = time.getMinutes();
  let currentTime = `${timeFormat(currentHours)}:${timeFormat(currentMinutes)}`;
  let splitC = currentTime.split(':');
  let cTotalSeconds = parseInt(splitC[0] * 3600 + splitC[1] * 60, 10);

  let folderName = "";
  (ssTotalSeconds < cTotalSeconds) ? folderName = "night" : folderName = "day";

  let bg = ``;
  bg += `<img src="img/${folderName}/${currentIcon}.jpg" alt="Background image">`;
  bgImgDiv.innerHTML = bg.trim();
}

function dayName(unixTimestamp) {
  let date = new Date(unixTimestamp * 1000);
  
  let daysFull = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday"
  ];
  return daysFull[date.getDay()];
}

function date() {
  let today = new Date();

  let options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  };

  let now = today.toLocaleString("en-US", options);
  return now;
}
