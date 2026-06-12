const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const profileContainer = document.getElementById("profileContainer");
const repoContainer = document.getElementById("repoContainer");
const loader = document.getElementById("loader");
const errorMessage = document.getElementById("errorMessage");
const themeToggle = document.getElementById("themeToggle");
const historyContainer = document.getElementById("historyContainer");

const MAX_HISTORY = 5;

async function fetchGitHubProfile(username) {
  try {
    showLoader();
    hideError();

    const userResponse = await fetch(
      `https://api.github.com/users/${username}`
    );

    if (!userResponse.ok) {
      throw new Error("User not found");
    }

    const userData = await userResponse.json();

    const repoResponse = await fetch(
      `https://api.github.com/users/${username}/repos?sort=updated&per_page=6`
    );

    const repos = await repoResponse.json();

    displayProfile(userData);
    displayRepos(repos);

    saveSearch(username);
  } catch (error) {
    showError(error.message);
  } finally {
    hideLoader();
  }
}

function displayProfile(user) {
  profileContainer.innerHTML = `
    <div class="profile-card">
      <div class="profile-avatar">
        <img src="${user.avatar_url}" alt="${user.login}">
      </div>

      <div class="profile-info">
        <h2>${user.name || "No Name"}</h2>

        <p>@${user.login}</p>

        <p>${user.bio || "No Bio Available"}</p>

        <div class="stats">
          <div class="stat">
            <h3>${user.followers}</h3>
            <p>Followers</p>
          </div>

          <div class="stat">
            <h3>${user.following}</h3>
            <p>Following</p>
          </div>

          <div class="stat">
            <h3>${user.public_repos}</h3>
            <p>Repositories</p>
          </div>

          <div class="stat">
            <h3>${user.public_gists}</h3>
            <p>Gists</p>
          </div>
        </div>

        <p><strong>Location:</strong> ${user.location || "N/A"}</p>

        <p><strong>Company:</strong> ${user.company || "N/A"}</p>

        <p><strong>Joined:</strong> ${new Date(
          user.created_at
        ).toDateString()}</p>

        <a class="profile-link"
           href="${user.html_url}"
           target="_blank">
           View Profile
        </a>

        <button class="copy-btn"
                onclick="copyProfileUrl('${user.html_url}')">
                Copy Profile URL
        </button>
      </div>
    </div>
  `;
}

function displayRepos(repos) {
  repoContainer.innerHTML = "";

  repos.forEach((repo) => {
    repoContainer.innerHTML += `
      <div class="repo-card">
        <h3>${repo.name}</h3>

        <p>
          ${
            repo.description
              ? repo.description
              : "No description available"
          }
        </p>

        <div class="repo-meta">
          <span>⭐ ${repo.stargazers_count}</span>
          <span>${repo.language || "Unknown"}</span>
        </div>

        <div class="repo-meta">
          <span>🍴 ${repo.forks_count}</span>
          <span>
            ${new Date(repo.updated_at).toLocaleDateString()}
          </span>
        </div>

        <br>

        <a href="${repo.html_url}" target="_blank">
          View Repository →
        </a>
      </div>
    `;
  });
}

searchBtn.addEventListener("click", () => {
  const username = searchInput.value.trim();

  if (!username) {
    showError("Please enter a username");
    return;
  }

  fetchGitHubProfile(username);
});

searchInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    searchBtn.click();
  }
});

function copyProfileUrl(url) {
  navigator.clipboard.writeText(url);
  alert("Profile URL copied!");
}

window.copyProfileUrl = copyProfileUrl;

function showLoader() {
  loader.classList.remove("hidden");
}

function hideLoader() {
  loader.classList.add("hidden");
}

function showError(message) {
  errorMessage.textContent = message;
  errorMessage.classList.remove("hidden");

  profileContainer.innerHTML = "";
  repoContainer.innerHTML = "";
}

function hideError() {
  errorMessage.classList.add("hidden");
}

themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("light");

  const isLight =
    document.body.classList.contains("light");

  localStorage.setItem(
    "theme",
    isLight ? "light" : "dark"
  );

  themeToggle.textContent = isLight ? "☀️" : "🌙";
});

function loadTheme() {
  const savedTheme = localStorage.getItem("theme");

  if (savedTheme === "light") {
    document.body.classList.add("light");
    themeToggle.textContent = "☀️";
  }
}

loadTheme();

function saveSearch(username) {
  let history =
    JSON.parse(localStorage.getItem("githubHistory")) || [];

  history = history.filter(
    (item) =>
      item.toLowerCase() !== username.toLowerCase()
  );

  history.unshift(username);

  history = history.slice(0, MAX_HISTORY);

  localStorage.setItem(
    "githubHistory",
    JSON.stringify(history)
  );

  renderHistory();
}

function renderHistory() {
  const history =
    JSON.parse(localStorage.getItem("githubHistory")) || [];

  historyContainer.innerHTML = "";
}