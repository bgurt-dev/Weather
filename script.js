

const LATITUDE = 50.4501;
const LONGITUDE = 30.5234;


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
    } catch (error) {
        console.warn("Сервер погоды временно недоступен. Загружаем демо-данные...", error);
        
        loadDemoData();
    }
}


function loadDemoData() {
    const demoData = {
        current_weather: {
            temperature: 18,
            weathercode: 3,
            windspeed: 12
        },
        daily: {
            time: [], // Сейчас заполним массив на 7 дней вперед автоматически
            temperature_2m_max:,
            temperature_2m_min:,
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
                data.current_weather.windspeed
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
            • Швидкість вітру: <strong>${wind} км/год</strong>
        </div>
    `;
}


fetchWeather();
