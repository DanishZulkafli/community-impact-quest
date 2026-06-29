const STORAGE_KEY = "communityImpactQuestProActions";

const challenges = [
  {
    title: "Teach someone one useful digital skill",
    category: "Education",
    difficulty: "Easy",
    points: 25,
    people: 1,
    hours: 0.5,
    steps: [
      "Choose one useful digital skill.",
      "Explain it in simple steps.",
      "Let the person try it once."
    ]
  },
  {
    title: "Help someone improve their resume or LinkedIn profile",
    category: "Career Support",
    difficulty: "Medium",
    points: 40,
    people: 1,
    hours: 1,
    steps: [
      "Review the resume or profile.",
      "Suggest better wording for 3 sections.",
      "Give one improvement checklist."
    ]
  },
  {
    title: "Clean a small public area or shared space",
    category: "Environment",
    difficulty: "Medium",
    points: 50,
    people: 3,
    hours: 1,
    steps: [
      "Choose a small area.",
      "Collect visible waste safely.",
      "Encourage others to keep the area clean."
    ]
  },
  {
    title: "Donate useful items to someone who needs them",
    category: "Donation",
    difficulty: "Medium",
    points: 55,
    people: 2,
    hours: 1,
    steps: [
      "Identify clean and useful items.",
      "Prepare them properly.",
      "Pass them to a person or organization."
    ]
  },
  {
    title: "Help a friend or family member solve a tech issue",
    category: "Technology Help",
    difficulty: "Easy",
    points: 25,
    people: 1,
    hours: 0.5,
    steps: [
      "Understand the tech issue.",
      "Guide them through the solution.",
      "Teach them how to avoid the issue again."
    ]
  },
  {
    title: "Share a helpful educational resource online",
    category: "Knowledge Sharing",
    difficulty: "Easy",
    points: 20,
    people: 5,
    hours: 0.3,
    steps: [
      "Choose a helpful learning resource.",
      "Write a short explanation.",
      "Share it with people who may benefit."
    ]
  },
  {
    title: "Check in on someone who may need emotional support",
    category: "Health & Wellness",
    difficulty: "Easy",
    points: 25,
    people: 1,
    hours: 0.3,
    steps: [
      "Send a kind message.",
      "Listen without judging.",
      "Offer one small support action."
    ]
  },
  {
    title: "Create a simple poster for a small community activity",
    category: "Design Help",
    difficulty: "Medium",
    points: 45,
    people: 3,
    hours: 1,
    steps: [
      "Collect activity details.",
      "Design a simple poster.",
      "Share the final artwork."
    ]
  },
  {
    title: "Mentor a beginner developer for one short session",
    category: "Technology Help",
    difficulty: "Hard",
    points: 80,
    people: 1,
    hours: 2,
    steps: [
      "Ask about their learning goal.",
      "Explain one core topic.",
      "Give one small practice task."
    ]
  }
];

const badgeLevels = [
  { name: "Starter", points: 0 },
  { name: "Good Starter", points: 50 },
  { name: "Community Helper", points: 100 },
  { name: "Kindness Hero", points: 250 },
  { name: "Impact Champion", points: 500 },
  { name: "Community Legend", points: 1000 }
];

let activeChallenge = null;

function getActions() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
}

function saveActions(actions) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(actions));
}

function escapeHTML(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function scrollToForm() {
  document.getElementById("actionForm").scrollIntoView({ behavior: "smooth" });
}

function addAction() {
  const title = document.getElementById("actionTitle").value.trim();
  const category = document.getElementById("category").value;
  const points = Number(document.getElementById("impactLevel").value);
  const difficulty = document.getElementById("difficulty").value;
  const people = Number(document.getElementById("people").value) || 0;
  const hours = Number(document.getElementById("hours").value) || 0;
  const actionDate = document.getElementById("actionDate").value || new Date().toISOString().slice(0, 10);
  const notes = document.getElementById("notes").value.trim();

  if (!title) {
    alert("Please enter an action title.");
    return;
  }

  const actions = getActions();

  actions.unshift({
    id: Date.now(),
    title,
    category,
    points,
    difficulty,
    people,
    hours,
    notes,
    date: new Date(actionDate).toISOString()
  });

  saveActions(actions);
  clearForm();
  renderApp();
}

function clearForm() {
  document.getElementById("actionTitle").value = "";
  document.getElementById("people").value = 1;
  document.getElementById("hours").value = 0.5;
  document.getElementById("notes").value = "";
}

function deleteAction(id) {
  const confirmed = confirm("Delete this action?");
  if (!confirmed) return;

  const actions = getActions().filter(action => action.id !== id);
  saveActions(actions);
  renderApp();
}

function completeActiveChallenge() {
  if (!activeChallenge) return;

  const actions = getActions();

  actions.unshift({
    id: Date.now(),
    title: activeChallenge.title,
    category: activeChallenge.category,
    points: activeChallenge.points,
    difficulty: activeChallenge.difficulty,
    people: activeChallenge.people,
    hours: activeChallenge.hours,
    notes: "Completed from generated challenge.",
    date: new Date().toISOString()
  });

  saveActions(actions);
  activeChallenge = null;

  document.getElementById("challengeBox").innerHTML = `
    <h3>Challenge completed</h3>
    <p>Great job. Generate another challenge to continue your impact journey.</p>
    <button onclick="generateChallenge()">Generate Another Challenge</button>
  `;

  renderApp();
}

function getTotalPoints(actions) {
  return actions.reduce((sum, action) => sum + Number(action.points || 0), 0);
}

function getTotalPeople(actions) {
  return actions.reduce((sum, action) => sum + Number(action.people || 0), 0);
}

function getTotalHours(actions) {
  return actions.reduce((sum, action) => sum + Number(action.hours || 0), 0);
}

function getBadge(points) {
  return [...badgeLevels].reverse().find(badge => points >= badge.points)?.name || "Starter";
}

function getNextBadge(points) {
  return badgeLevels.find(badge => badge.points > points) || badgeLevels[badgeLevels.length - 1];
}

function calculateStreak(actions) {
  if (actions.length === 0) return 0;

  const dates = new Set(
    actions.map(action => new Date(action.date).toDateString())
  );

  let streak = 0;
  const today = new Date();

  for (let i = 0; i < 365; i++) {
    const checkDate = new Date(today);
    checkDate.setDate(today.getDate() - i);

    if (dates.has(checkDate.toDateString())) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

function getWeeklyActions(actions) {
  const now = new Date();

  return actions.filter(action => {
    const actionDate = new Date(action.date);
    return now - actionDate <= 7 * 24 * 60 * 60 * 1000;
  });
}

function getCategoryStats(actions) {
  const stats = {};

  actions.forEach(action => {
    stats[action.category] = (stats[action.category] || 0) + Number(action.points || 0);
  });

  return Object.entries(stats).sort((a, b) => b[1] - a[1]);
}

function getDifficultyStats(actions) {
  const stats = {};

  actions.forEach(action => {
    stats[action.difficulty] = (stats[action.difficulty] || 0) + 1;
  });

  return Object.entries(stats).sort((a, b) => b[1] - a[1]);
}

function calculateImpactScore(actions) {
  if (actions.length === 0) return 0;

  const points = getTotalPoints(actions);
  const people = getTotalPeople(actions);
  const hours = getTotalHours(actions);
  const categories = new Set(actions.map(action => action.category)).size;
  const weekly = getWeeklyActions(actions).length;

  let score = 0;

  score += Math.min(35, points / 10);
  score += Math.min(20, people * 2);
  score += Math.min(15, hours * 3);
  score += Math.min(15, categories * 4);
  score += Math.min(15, weekly * 5);

  return Math.round(Math.min(100, score));
}

function renderDashboard(actions) {
  const points = getTotalPoints(actions);
  const people = getTotalPeople(actions);
  const hours = getTotalHours(actions);
  const streak = calculateStreak(actions);
  const weekly = getWeeklyActions(actions).length;
  const categories = new Set(actions.map(action => action.category)).size;
  const impactScore = calculateImpactScore(actions);
  const badge = getBadge(points);
  const nextBadge = getNextBadge(points);
  const progress = nextBadge.points === 0 ? 100 : Math.min(100, Math.round((points / nextBadge.points) * 100));

  document.getElementById("totalPoints").textContent = points;
  document.getElementById("totalActions").textContent = actions.length;
  document.getElementById("peopleImpacted").textContent = people;
  document.getElementById("hoursContributed").textContent = `${hours.toFixed(1)}h`;
  document.getElementById("currentStreak").textContent = `${streak} Days`;
  document.getElementById("weeklyActions").textContent = weekly;
  document.getElementById("categoryCount").textContent = categories;
  document.getElementById("impactScore").textContent = `${impactScore}%`;

  document.getElementById("currentBadgeHero").textContent = badge;
  document.getElementById("totalPointsHero").textContent = points;
  document.getElementById("badgeProgressHero").style.width = `${progress}%`;
  document.getElementById("nextBadgeHero").textContent = `Next Badge: ${nextBadge.name}`;

  document.getElementById("progressText").textContent = `${progress}%`;
  document.getElementById("progressBar").style.width = `${progress}%`;
}

function renderBreakdown(containerId, stats, suffix) {
  const box = document.getElementById(containerId);

  if (stats.length === 0) {
    box.innerHTML = `<div class="empty">No data yet.</div>`;
    return;
  }

  const maxValue = Math.max(...stats.map(item => item[1]));

  box.innerHTML = stats.map(([label, value]) => {
    const percentage = Math.round((value / maxValue) * 100);

    return `
      <div class="breakdown-item">
        <div class="breakdown-top">
          <span>${escapeHTML(label)}</span>
          <span>${value} ${suffix}</span>
        </div>
        <div class="breakdown-bg">
          <div class="breakdown-fill" style="width: ${percentage}%"></div>
        </div>
      </div>
    `;
  }).join("");
}

function renderRecommendation(actions) {
  const box = document.getElementById("recommendationText");

  if (actions.length === 0) {
    box.textContent = "Add your first action to receive a personalized recommendation.";
    return;
  }

  const totalPoints = getTotalPoints(actions);
  const categories = getCategoryStats(actions);
  const strongestCategory = categories[0]?.[0] || "Community Support";
  const weekly = getWeeklyActions(actions).length;
  const people = getTotalPeople(actions);

  if (weekly === 0) {
    box.textContent = "You have past actions, but no action recorded this week. Try one small action today to rebuild momentum.";
    return;
  }

  if (totalPoints < 50) {
    box.textContent = "You are starting well. Try completing 3 small actions this week to build consistency.";
    return;
  }

  if (categories.length < 3) {
    box.textContent = `You are strongest in ${strongestCategory}. Try helping in another category to create wider impact.`;
    return;
  }

  if (people >= 10) {
    box.textContent = "Your actions are reaching many people. Consider turning this into a portfolio case study or small community campaign.";
    return;
  }

  box.textContent = "Your impact journey is growing. Keep recording actions, reflections, and outcomes to show meaningful contribution.";
}

function renderBadges(actions) {
  const box = document.getElementById("badgesList");
  const points = getTotalPoints(actions);
  const people = getTotalPeople(actions);
  const categories = new Set(actions.map(action => action.category)).size;
  const weekly = getWeeklyActions(actions).length;
  const streak = calculateStreak(actions);

  const badges = [];

  if (actions.length >= 1) badges.push("First Action");
  if (actions.length >= 5) badges.push("Consistent Helper");
  if (points >= 100) badges.push("100 Impact Points");
  if (points >= 250) badges.push("Impact Builder");
  if (categories >= 3) badges.push("Multi-Category Contributor");
  if (people >= 10) badges.push("People Helper");
  if (weekly >= 3) badges.push("Weekly Hero");
  if (streak >= 3) badges.push("Streak Builder");

  if (badges.length === 0) {
    box.innerHTML = `<p class="empty-text">No badges unlocked yet.</p>`;
    return;
  }

  box.innerHTML = `
    <div class="badge-list">
      ${badges.map(badge => `<span class="unlock-badge">🏅 ${escapeHTML(badge)}</span>`).join("")}
    </div>
  `;
}

function renderImpactSummary(actions) {
  const box = document.getElementById("impactSummary");

  if (actions.length === 0) {
    box.textContent = "Add actions to generate your portfolio-ready community impact summary.";
    return;
  }

  const points = getTotalPoints(actions);
  const people = getTotalPeople(actions);
  const hours = getTotalHours(actions);
  const categories = [...new Set(actions.map(action => action.category))];
  const strongest = getCategoryStats(actions)[0]?.[0] || "Community Support";

  box.textContent = `I completed ${actions.length} community impact action${actions.length > 1 ? "s" : ""}, contributed ${hours.toFixed(1)} hours, supported around ${people} people, and earned ${points} impact points across ${categories.length} category/categories. My strongest contribution area is ${strongest}.`;
}

function renderWeeklyTrend(actions) {
  const box = document.getElementById("weeklyTrend");

  if (actions.length === 0) {
    box.innerHTML = `<p class="empty-text">No weekly trend yet.</p>`;
    return;
  }

  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const stats = days.map(day => ({ day, points: 0 }));

  actions.forEach(action => {
    const index = new Date(action.date).getDay();
    stats[index].points += Number(action.points || 0);
  });

  const max = Math.max(...stats.map(item => item.points), 1);

  box.innerHTML = stats.map(item => {
    const height = Math.max(8, Math.round((item.points / max) * 120));

    return `
      <div class="trend-bar" title="${item.day}: ${item.points} points" style="height: ${height}px">
        <span>${item.day}</span>
      </div>
    `;
  }).join("");
}

function renderHistory(actions) {
  const list = document.getElementById("historyList");
  const search = document.getElementById("searchInput").value.toLowerCase();
  const category = document.getElementById("filterCategory").value;
  const difficulty = document.getElementById("filterDifficulty").value;

  let filtered = actions;

  if (category !== "All Categories") {
    filtered = filtered.filter(action => action.category === category);
  }

  if (difficulty !== "All Difficulty") {
    filtered = filtered.filter(action => action.difficulty === difficulty);
  }

  if (search) {
    filtered = filtered.filter(action => {
      const combined = `${action.title} ${action.category} ${action.difficulty} ${action.notes}`.toLowerCase();
      return combined.includes(search);
    });
  }

  if (filtered.length === 0) {
    list.innerHTML = `<div class="empty">No impact actions found.</div>`;
    return;
  }

  list.innerHTML = filtered.map(action => {
    const date = new Date(action.date).toLocaleDateString();

    return `
      <article class="history-item">
        <span class="pill">${escapeHTML(action.category)}</span>
        <span class="pill orange">${escapeHTML(action.difficulty)}</span>

        <h3>${escapeHTML(action.title)}</h3>

        <div class="history-meta">
          <span class="pill green">${action.points} pts</span>
          <span class="pill">${action.people || 0} people</span>
          <span class="pill">${action.hours || 0}h</span>
          <span class="pill">${date}</span>
        </div>

        <p>${escapeHTML(action.notes || "No notes added.")}</p>

        <button class="danger" onclick="deleteAction(${action.id})">Delete</button>
      </article>
    `;
  }).join("");
}

function generateChallenge() {
  const category = document.getElementById("challengeCategory").value;
  const difficulty = document.getElementById("challengeDifficulty").value;

  let filtered = challenges.filter(challenge => {
    const categoryMatch = category === "Any" || challenge.category === category;
    const difficultyMatch = difficulty === "Any" || challenge.difficulty === difficulty;

    return categoryMatch && difficultyMatch;
  });

  if (filtered.length === 0) {
    filtered = challenges;
  }

  activeChallenge = filtered[Math.floor(Math.random() * filtered.length)];

  document.getElementById("challengeBox").innerHTML = `
    <span class="pill">${escapeHTML(activeChallenge.category)}</span>
    <span class="pill orange">${escapeHTML(activeChallenge.difficulty)}</span>

    <h3>${escapeHTML(activeChallenge.title)}</h3>

    <div class="challenge-meta">
      <span class="pill green">${activeChallenge.points} pts</span>
      <span class="pill">${activeChallenge.people} people</span>
      <span class="pill">${activeChallenge.hours}h</span>
    </div>

    <strong>Suggested Steps</strong>
    <ol>
      ${activeChallenge.steps.map(step => `<li>${escapeHTML(step)}</li>`).join("")}
    </ol>

    <button onclick="completeActiveChallenge()">Mark Challenge Completed</button>
    <button class="secondary" onclick="generateChallenge()">Generate Another Challenge</button>
  `;
}

function updateFilters(actions) {
  const categoryFilter = document.getElementById("filterCategory");
  const currentValue = categoryFilter.value;
  const categories = ["All Categories", ...new Set(actions.map(action => action.category))];

  categoryFilter.innerHTML = categories.map(category => `<option>${escapeHTML(category)}</option>`).join("");

  if (categories.includes(currentValue)) {
    categoryFilter.value = currentValue;
  }
}

function exportCSV() {
  const actions = getActions();

  if (actions.length === 0) {
    alert("No data to export.");
    return;
  }

  const headers = [
    "Title",
    "Category",
    "Points",
    "Difficulty",
    "People Impacted",
    "Hours",
    "Notes",
    "Date"
  ];

  const rows = actions.map(action => [
    action.title,
    action.category,
    action.points,
    action.difficulty,
    action.people,
    action.hours,
    action.notes,
    new Date(action.date).toLocaleString()
  ]);

  const csv = [headers, ...rows]
    .map(row => row.map(value => `"${String(value).replaceAll('"', '""')}"`).join(","))
    .join("\n");

  downloadFile(csv, "community-impact-actions.csv", "text/csv");
}

function exportJSON() {
  const actions = getActions();

  if (actions.length === 0) {
    alert("No data to export.");
    return;
  }

  downloadFile(
    JSON.stringify(actions, null, 2),
    "community-impact-actions.json",
    "application/json"
  );
}

function downloadFile(content, filename, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  link.click();

  URL.revokeObjectURL(url);
}

function copySummary() {
  const text = document.getElementById("impactSummary").textContent;

  navigator.clipboard.writeText(text)
    .then(() => alert("Impact summary copied."))
    .catch(() => alert("Unable to copy. Please copy manually."));
}

function printReport() {
  window.print();
}

function loadDemoData() {
  const now = Date.now();

  const demoActions = [
    {
      id: now + 1,
      title: "Taught a friend how to use GitHub",
      category: "Technology Help",
      points: 25,
      difficulty: "Easy",
      people: 1,
      hours: 0.5,
      notes: "Helped them understand repositories, commits, and GitHub Pages.",
      date: new Date(now).toISOString()
    },
    {
      id: now + 2,
      title: "Created a poster for a small community event",
      category: "Design Help",
      points: 45,
      difficulty: "Medium",
      people: 3,
      hours: 1,
      notes: "Designed a clean event poster and shared it with the organizer.",
      date: new Date(now - 86400000).toISOString()
    },
    {
      id: now + 3,
      title: "Checked in on someone who needed support",
      category: "Health & Wellness",
      points: 25,
      difficulty: "Easy",
      people: 1,
      hours: 0.3,
      notes: "Sent a supportive message and listened to their concerns.",
      date: new Date(now - 172800000).toISOString()
    },
    {
      id: now + 4,
      title: "Shared a useful learning resource",
      category: "Knowledge Sharing",
      points: 20,
      difficulty: "Easy",
      people: 5,
      hours: 0.3,
      notes: "Shared a beginner-friendly resource about portfolio building.",
      date: new Date(now - 259200000).toISOString()
    }
  ];

  saveActions(demoActions);
  renderApp();
}

function resetData() {
  const confirmed = confirm("Are you sure you want to reset all data?");
  if (!confirmed) return;

  localStorage.removeItem(STORAGE_KEY);
  activeChallenge = null;
  renderApp();

  document.getElementById("challengeBox").innerHTML = `
    <h3>No active challenge yet</h3>
    <p>Generate a challenge to receive a meaningful social-good action idea.</p>
    <button onclick="generateChallenge()">Generate Challenge</button>
  `;
}

function renderApp() {
  const actions = getActions();

  updateFilters(actions);
  renderDashboard(actions);
  renderBreakdown("categoryBreakdown", getCategoryStats(actions), "pts");
  renderBreakdown("difficultyBreakdown", getDifficultyStats(actions), "actions");
  renderRecommendation(actions);
  renderBadges(actions);
  renderImpactSummary(actions);
  renderWeeklyTrend(actions);
  renderHistory(actions);
}

document.getElementById("actionDate").value = new Date().toISOString().slice(0, 10);
renderApp();
