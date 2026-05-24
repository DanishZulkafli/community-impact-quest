const STORAGE_KEY = "communityImpactQuestActions";

const challenges = [
  {
    title: "Teach someone one useful digital skill",
    category: "Education",
    points: 25
  },
  {
    title: "Help someone improve their resume or profile",
    category: "Career Support",
    points: 25
  },
  {
    title: "Clean a small public area or reduce waste today",
    category: "Environment",
    points: 25
  },
  {
    title: "Donate useful items to someone who needs them",
    category: "Donation",
    points: 50
  },
  {
    title: "Help a friend or family member solve a tech issue",
    category: "Technology Help",
    points: 25
  },
  {
    title: "Share a helpful educational resource online",
    category: "Education",
    points: 10
  },
  {
    title: "Check in on someone who may need emotional support",
    category: "Health & Wellness",
    points: 25
  }
];

function getActions() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
}

function saveActions(actions) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(actions));
}

function addAction() {
  const title = document.getElementById("actionTitle").value.trim();
  const category = document.getElementById("category").value;
  const points = Number(document.getElementById("impactLevel").value);
  const notes = document.getElementById("notes").value.trim();

  if (!title) {
    alert("Please enter an action title.");
    return;
  }

  const actions = getActions();

  const newAction = {
    id: Date.now(),
    title,
    category,
    points,
    notes,
    date: new Date().toISOString()
  };

  actions.unshift(newAction);
  saveActions(actions);

  document.getElementById("actionTitle").value = "";
  document.getElementById("notes").value = "";

  renderApp();
}

function deleteAction(id) {
  const actions = getActions().filter(action => action.id !== id);
  saveActions(actions);
  renderApp();
}

function getTotalPoints(actions) {
  return actions.reduce((sum, action) => sum + action.points, 0);
}

function getBadge(points) {
  if (points >= 1000) return "Community Legend";
  if (points >= 500) return "Impact Champion";
  if (points >= 250) return "Kindness Hero";
  if (points >= 100) return "Community Helper";
  if (points >= 50) return "Good Starter";
  return "Starter";
}

function getNextBadgeTarget(points) {
  if (points < 50) return 50;
  if (points < 100) return 100;
  if (points < 250) return 250;
  if (points < 500) return 500;
  if (points < 1000) return 1000;
  return 1000;
}

function calculateStreak(actions) {
  if (actions.length === 0) return 0;

  const dates = [...new Set(actions.map(action => {
    return new Date(action.date).toDateString();
  }))];

  let streak = 0;
  const today = new Date();

  for (let i = 0; i < 365; i++) {
    const checkDate = new Date(today);
    checkDate.setDate(today.getDate() - i);

    if (dates.includes(checkDate.toDateString())) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

function renderDashboard(actions) {
  const totalPoints = getTotalPoints(actions);
  const totalActions = actions.length;
  const streak = calculateStreak(actions);
  const badge = getBadge(totalPoints);

  document.getElementById("totalPoints").textContent = totalPoints;
  document.getElementById("totalActions").textContent = totalActions;
  document.getElementById("currentStreak").textContent = `${streak} Days`;
  document.getElementById("currentBadge").textContent = badge;

  const nextTarget = getNextBadgeTarget(totalPoints);
  const progress = Math.min(100, Math.round((totalPoints / nextTarget) * 100));

  document.getElementById("progressText").textContent = `${progress}%`;
  document.getElementById("progressBar").style.width = `${progress}%`;
}

function renderCategoryBreakdown(actions) {
  const box = document.getElementById("categoryBreakdown");

  if (actions.length === 0) {
    box.innerHTML = `<div class="empty">No category data yet.</div>`;
    return;
  }

  const categoryTotals = {};

  actions.forEach(action => {
    categoryTotals[action.category] = (categoryTotals[action.category] || 0) + action.points;
  });

  const maxPoints = Math.max(...Object.values(categoryTotals));

  box.innerHTML = Object.entries(categoryTotals)
    .map(([category, points]) => {
      const percentage = Math.round((points / maxPoints) * 100);

      return `
        <div class="breakdown-item">
          <div class="breakdown-top">
            <span>${category}</span>
            <span>${points} pts</span>
          </div>
          <div class="breakdown-bg">
            <div class="breakdown-fill" style="width: ${percentage}%"></div>
          </div>
        </div>
      `;
    })
    .join("");
}

function renderRecommendation(actions) {
  const recommendation = document.getElementById("recommendation");

  if (actions.length === 0) {
    recommendation.textContent = "Add your first action to receive a recommendation.";
    return;
  }

  const totalPoints = getTotalPoints(actions);
  const categoryTotals = {};

  actions.forEach(action => {
    categoryTotals[action.category] = (categoryTotals[action.category] || 0) + action.points;
  });

  const strongestCategory = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0][0];

  let message = `You are currently strongest in ${strongestCategory}. `;

  if (totalPoints < 50) {
    message += "Try completing small daily actions to build consistency.";
  } else if (totalPoints < 150) {
    message += "You are building good momentum. Try helping in a new category to create wider community impact.";
  } else if (totalPoints < 500) {
    message += "Your impact is growing. Consider inviting friends or creating a small community challenge.";
  } else {
    message += "Excellent contribution. You can turn this into a real community campaign or volunteer movement.";
  }

  recommendation.textContent = message;
}

function renderHistory(actions) {
  const list = document.getElementById("historyList");

  if (actions.length === 0) {
    list.innerHTML = `<div class="empty">No impact actions recorded yet.</div>`;
    return;
  }

  list.innerHTML = actions
    .map(action => {
      const date = new Date(action.date).toLocaleString();

      return `
        <div class="history-item">
          <strong>${action.title}</strong>
          <p class="history-meta">${action.category} | ${action.points} points | ${date}</p>
          <p>${action.notes || "No notes added."}</p>
          <button class="danger" onclick="deleteAction(${action.id})">Delete</button>
        </div>
      `;
    })
    .join("");
}

function generateChallenge() {
  const randomChallenge = challenges[Math.floor(Math.random() * challenges.length)];
  const box = document.getElementById("challengeBox");

  box.classList.remove("hidden");
  box.innerHTML = `
    <strong>Today's Challenge:</strong>
    <p>${randomChallenge.title}</p>
    <p>Category: ${randomChallenge.category}</p>
    <p>Suggested Points: ${randomChallenge.points}</p>
  `;
}

function exportCSV() {
  const actions = getActions();

  if (actions.length === 0) {
    alert("No data to export.");
    return;
  }

  const headers = ["Title", "Category", "Points", "Notes", "Date"];
  const rows = actions.map(action => [
    action.title,
    action.category,
    action.points,
    action.notes,
    new Date(action.date).toLocaleString()
  ]);

  const csvContent = [headers, ...rows]
    .map(row => row.map(value => `"${String(value).replaceAll('"', '""')}"`).join(","))
    .join("\n");

  const blob = new Blob([csvContent], { type: "text/csv" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = "community-impact-actions.csv";
  link.click();

  URL.revokeObjectURL(url);
}

function resetData() {
  const confirmed = confirm("Are you sure you want to reset all data?");

  if (!confirmed) return;

  localStorage.removeItem(STORAGE_KEY);
  renderApp();
}

function renderApp() {
  const actions = getActions();

  renderDashboard(actions);
  renderCategoryBreakdown(actions);
  renderRecommendation(actions);
  renderHistory(actions);
}

renderApp();
