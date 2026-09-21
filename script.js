

const LATITUDE = 48.4675;
const LONGITUDE = 35.0407;


const dayNames = ['Нд', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];


function getWeatherMeta(code) {
    if (code === 0) return { icon: '☀️', desc: 'Ясно' };
    if (code > 0 && code <= 3) return { icon: '⛅', desc: 'Мінлива хмарність' };
    if (code >= 45 && code <= 48) return { icon: '🌫️', desc: 'Туман' };
    if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return { icon: '🌧️', desc: 'Дощ' };
    if ((code >= 71 && code <= 77) || (code >= 85 && code <= 86)) return { icon: '❄️', desc: 'Сніг' };
    if (code >= 95) return { icon: '⚡', desc: 'Гроза' };
    return { icon: '☁️', desc: 'Хмарно' };
}

async function fetchWeather() {
    try {
        const url = 'https://open-meteo.com';
        
        const response = await fetch(url);
        
        
        const contentType = response.headers.get("content-type");
        if (!response.ok || !contentType || !contentType.includes("application/json")) {
            throw new Error('Сервер повернув не JSON');
        }
        
        const data = await response.json();
        renderWeather(data);
        console.log()
    } catch (error) {
        console.warn("Сервер погоды временно недоступен. Загружаем демо-данные...", error);
        
        loadDemoData();
    }
}


function loadDemoData() {
    const demoData = {
        current_weather: {
            temperature: 25,
            weathercode: 12,
            windspeed: 4
        },
        daily: {
            time: [],
            temperature_2m_max:{},
            temperature_2m_min:{},
            weathercode: [3, 0, 1, 51, 3, 0, 0]
        }
    };

    
    for (let i = 0; i < 7; i++) {
        const d = new Date();
        d.setDate(d.getDate() + i);
        demoData.daily.time.push(d.toISOString().split('T')[0]);
    }

    renderWeather(demoData);
}

function renderWeather(data) {
    const weekGrid = document.getElementById('week-grid');
    if (!weekGrid) return;
    
    weekGrid.innerHTML = '';
    const dailyData = data.daily;
    
    dailyData.time.forEach((dateStr, index) => {
        const date = new Date(dateStr);
        const dayName = dayNames[date.getDay()];
        const maxTemp = Math.round(dailyData.temperature_2m_max[index]);
        const minTemp = Math.round(dailyData.temperature_2m_min[index]);
        const weatherMeta = getWeatherMeta(dailyData.weathercode[index]);
        
        const dayCard = document.createElement('div');
        dayCard.className = 'day-card' + (index === 0 ? ' active' : '');
        dayCard.innerHTML = '<span>' + dayName + '.</span><span class="day-temp">' + weatherMeta.icon + ' ' + maxTemp + '°C</span>';
        
        dayCard.addEventListener('click', () => {
            document.querySelectorAll('.day-card').forEach(card => card.classList.remove('active'));
            dayCard.classList.add('active');
            
            showDetailedWeather(
                dayName, 
                maxTemp, 
                minTemp, 
                weatherMeta,
                data.current_weather ? data.current_weather.windspeed : undefined
            );
        });
        
        weekGrid.appendChild(dayCard);
    });

    const initialMeta = getWeatherMeta(dailyData.weathercode[0]);
    showDetailedWeather(
        dayNames[new Date().getDay()], 
        Math.round(dailyData.temperature_2m_max[0]), 
        Math.round(dailyData.temperature_2m_min[0]), 
        initialMeta,
        data.current_weather ? data.current_weather.windspeed : undefined
    );
}

function loadDemoData() {
    const demoData = {
        current_weather: {
            temperature: 25,
            weathercode: 12,
            windspeed: 4
        },
        daily: {
            time: [],
            temperature_2m_max: [22, 24, 20, 18, 21, 25, 23],
            temperature_2m_min: [12, 14, 10, 9, 11, 15, 13],
            weathercode: [3, 0, 1, 51, 3, 0, 0]
        }
    };

    for (let i = 0; i < 7; i++) {
        const d = new Date();
        d.setDate(d.getDate() + i);
        demoData.daily.time.push(d.toISOString().split('T')[0]);
    }

    renderWeather(demoData);
}

function showDetailedWeather(day, maxTemp, minTemp, meta, wind) {
    const todayDetails = document.getElementById('today-details');
    if (!todayDetails) return;
    
    todayDetails.innerHTML = `
        <div class="today-main">
            <div class="today-icon">${meta.icon}</div>
            <div class="today-temp">${maxTemp}°C</div>
        </div>
        <div class="today-desc">${meta.desc}</div>
        <div class="today-info">
            • День тижня: <strong>${day}</strong><br>
            • Мінімальна температура: <strong>${minTemp}°C</strong><br>
            • Максимальна температура: <strong>${maxTemp}°C</strong><br>
        </div>
    `;
}


fetchWeather();
