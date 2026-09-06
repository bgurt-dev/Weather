
const LATITUDE = 50.4501;
const LONGITUDE = 30.5234;


const dayNames = ['Нд', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];


function getWeatherMeta(code) {
    if ([0].includes(code)) return { icon: '☀️', desc: 'Ясно' };
    if ([1, 2, 3].includes(code)) return { icon: '⛅', desc: 'Мінлива хмарність' };
    if ([45, 48].includes(code)) return { icon: '🌫️', desc: 'Туман' };
    if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return { icon: '🌧️', desc: 'Дощ' };
    if ([71, 73, 75, 77, 85, 86].includes(code)) return { icon: '❄️', desc: 'Сніг' };
    if ([95, 96, 99].includes(code)) return { icon: '⚡', desc: 'Гроза' };
    return { icon: '☁️', desc: 'Хмарно' };
}

async function fetchWeather() {
    try {
        // Запрос к бесплатному API Open-Meteo (Текущая погода + прогноз на 7 дней)
        const url = `https://open-meteo.com{LATITUDE}&longitude=${LONGITUDE}&current_weather=true&daily=weathercode,temperature_2m_max,temperature_2m_min&timezone=auto`;
        const response = await fetch(url);
        const data = await response.json();
        
        renderWeather(data);
    } catch (error) {
        document.getElementById('today-details').innerHTML = '<div class="loading">Помилка завантаження даних...</div>';
        console.error("Ошибка получения погоды:", error);
    }
}

function renderWeather(data) {
    const weekGrid = document.getElementById('week-grid');
    const todayDetails = document.getElementById('today-details');
    
    
    weekGrid.innerHTML = '';
    
    
    const dailyData = data.daily;
    
    
    dailyData.time.forEach((dateStr, index) => {
        const date = new Date(dateStr);
        const dayName = dayNames[date.getDay()];
        const maxTemp = Math.round(dailyData.temperature_2m_max[index]);
        const weatherMeta = getWeatherMeta(dailyData.weathercode[index]);
        
        const dayCard = document.createElement('div');
        dayCard.className = `day-card ${index === 0 ? 'active' : ''}`;
        dayCard.innerHTML = `
            <span>${dayName}.</span>
            <span class="day-temp">${weatherMeta.icon} ${maxTemp}°C</span>
        `;
        
        
        dayCard.addEventListener('click', () => {
            document.querySelectorAll('.day-card').forEach(card => card.classList.remove('active'));
            dayCard.classList.add('active');
            
            showDetailedWeather(
                dayName, 
                maxTemp, 
                Math.round(dailyData.temperature_2m_min[index]), 
                weatherMeta,
                data.current_weather.windspeed // Просто для примера берем общую скорость ветра
            );
        });
        
        weekGrid.appendChild(dayCard);
    });

    
    const initialMeta = getWeatherMeta(data.current_weather.weathercode);
    showDetailedWeather(
        dayNames[new Date().getDay()], 
        Math.round(data.current_weather.temperature), 
        Math.round(dailyData.temperature_2m_min[0]), 
        initialMeta,
        data.current_weather.windspeed
    );
}

function showDetailedWeather(day, maxTemp, minTemp, meta, wind) {
    const todayDetails = document.getElementById('today-details');
    todayDetails.innerHTML = `
        <div class="today-main">
            <div class="today-icon">${meta.icon}</div>
            <div class="today-temp">${maxTemp}°C</div>
        </div>
        <div class="today-desc">${meta.desc}</div>
        <div class="today-info">
            • День тижня: <strong>${day}</strong><br>
            • Мінімальна температура: <strong>${minTemp}°C</strong><br>
            • Швидкість вітру: <strong>${wind} км/год</strong>
        </div>
    `;
}


fetchWeather();
