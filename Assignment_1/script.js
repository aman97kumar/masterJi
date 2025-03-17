let selectedMood = '';
let currentView = 'daily';

function selectMood(mood) {
    selectedMood = mood;
    
    // Remove selected class from all buttons
    document.querySelectorAll('.mood-btn').forEach(btn => {
        btn.classList.remove('selected');
        if (btn.textContent === mood) {
            btn.classList.add('selected');
        }
    });

    // Save mood with current date
    const today = new Date().toISOString().split('T')[0];
    saveMood(today, mood);
    updateDisplay();
}

function saveMood(date, mood) {
    let moodData = JSON.parse(localStorage.getItem('moodData')) || {};
    moodData[date] = mood;
    localStorage.setItem('moodData', JSON.stringify(moodData));
}

function changeView(view) {
    currentView = view;
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    document.getElementById('moodDisplay').style.display = view === 'calendar' ? 'none' : 'block';
    document.getElementById('calendar').style.display = view === 'calendar' ? 'block' : 'none';
    
    updateDisplay();
}

function updateDisplay() {
    const moodData = JSON.parse(localStorage.getItem('moodData')) || {};
    const displayDiv = document.getElementById('moodDisplay');
    const calendarDiv = document.getElementById('calendar');
    let html = '';

    if (currentView === 'calendar') {
        renderCalendar(moodData);
        return;
    }

    switch(currentView) {
        case 'daily':
            html = getDailyView(moodData);
            break;
        case 'weekly':
            html = getWeeklyView(moodData);
            break;
        case 'monthly':
            html = getMonthlyView(moodData);
            break;
    }

    displayDiv.innerHTML = html;
}

function getDailyView(moodData) {
    let html = '<h2>Daily Mood History</h2>';
    const sortedDates = Object.keys(moodData).sort().reverse();

    sortedDates.forEach(date => {
        html += `
            <div class="mood-entry">
                <span class="mood-date">${formatDate(date)}</span>
                <span class="mood-emoji">${moodData[date]}</span>
            </div>
        `;
    });
    return html;
}

function getWeeklyView(moodData) {
    let html = '<h2>Weekly Mood Summary</h2>';
    const weeks = {};

    Object.entries(moodData).forEach(([date, mood]) => {
        const weekStart = getWeekStart(new Date(date));
        if (!weeks[weekStart]) {
            weeks[weekStart] = new Set();
        }
        weeks[weekStart].add(mood);
    });

    Object.entries(weeks).sort((a, b) => new Date(b[0]) - new Date(a[0])).forEach(([week, moods]) => {
        html += `
            <div class="mood-entry">
                <span class="mood-date">Week of ${formatDate(week)}</span>
                <span class="mood-emoji">${Array.from(moods).join(' ')}</span>
            </div>
        `;
    });
    return html;
}

function getMonthlyView(moodData) {
    let html = '<h2>Monthly Mood Summary</h2>';
    const months = {};

    Object.entries(moodData).forEach(([date, mood]) => {
        const monthKey = date.substring(0, 7);
        if (!months[monthKey]) {
            months[monthKey] = new Set();
        }
        months[monthKey].add(mood);
    });

    Object.entries(months).sort((a, b) => b[0].localeCompare(a[0])).forEach(([month, moods]) => {
        html += `
            <div class="mood-entry">
                <span class="mood-date">${formatMonthYear(month)}</span>
                <span class="mood-emoji">${Array.from(moods).join(' ')}</span>
            </div>
        `;
    });
    return html;
}

function renderCalendar(moodData) {
    const calendarDiv = document.getElementById('calendar');
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    let html = `
        <div class="calendar-header">
            <h2>${new Date(currentYear, currentMonth).toLocaleString('default', { month: 'long' })} ${currentYear}</h2>
        </div>
        <div class="calendar-grid">
            <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
    `;

    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay.getDay(); i++) {
        html += '<div class="calendar-day"></div>';
    }

    // Add cells for each day of the month
    for (let day = 1; day <= lastDay.getDate(); day++) {
        const date = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const mood = moodData[date] || '';
        html += `
            <div class="calendar-day">
                <div>${day}</div>
                <div style="font-size: 24px;">${mood}</div>
            </div>
        `;
    }

    html += '</div>';
    calendarDiv.innerHTML = html;
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function formatMonthYear(monthString) {
    return new Date(monthString + '-01').toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long'
    });
}

function getWeekStart(date) {
    const newDate = new Date(date);
    newDate.setDate(newDate.getDate() - newDate.getDay());
    return newDate.toISOString().split('T')[0];
}

// Initialize display
updateDisplay();