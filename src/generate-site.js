const fs = require("fs");
const path = require("path");

const cards = require("./cards.json");

const buildPath = path.join(__dirname, "..", "build");
const outputHtml = path.join(buildPath, "index.html");

if (!fs.existsSync(buildPath)) {
  fs.mkdirSync(buildPath);
}

const grouped = {};
for (const card of cards) {
  const { topic, category } = card;
  if (!grouped[topic]) grouped[topic] = {};
  if (!grouped[topic][category]) grouped[topic][category] = [];
  grouped[topic][category].push(card);
}

const generateSidebarHTML = () => `
  <aside class="sidebar">
    <h2>Topics</h2>
    ${Object.entries(grouped)
      .map(
        ([topic, categories]) => `
        <div class="topic-section">
          <h3>${topic}</h3>
          ${Object.entries(categories)
            .map(
              ([category, cards]) => `
              <details open class="category-block">
                <summary>${category}</summary>
                <div class="card-filters">
                  <label>
                    <input type="checkbox" class="category-toggle" data-category="${category}" onchange="toggleCategory('${category}', this.checked)">
                    Show All
                  </label>
                  ${cards
                    .map(
                      (card) => `
                      <label>
                        <input type="checkbox" class="card-toggle" data-id="${card.id}" onchange="toggleCard('${card.id}', this.checked)">
                        ${card.title}
                      </label>
                    `
                    )
                    .join("")}
                </div>
              </details>
            `
            )
            .join("")}
        </div>
      `
      )
      .join("")}
  </aside>
`;

const generateCardHTML = (card) => `
  <div class="card" id="${card.id}" data-category="${card.category}" data-topic="${card.topic}" style="transform: translate(0px, 0px);">
    <h3>${card.title}</h3>
    <p>${card.description}</p>
    <pre><code>${card.code}</code></pre>
  </div>
`;

const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>C# Cheatsheet</title>
  <link rel="stylesheet" href="styles.css" />
</head>
<body>
  <button class="toggle-sidebar" onclick="document.querySelector('.sidebar').classList.toggle('open')">☰ Filters</button>
  ${generateSidebarHTML()}
  <main class="card-container">
    ${cards.map(generateCardHTML).join("\n")}
  </main>

  <script>
    const cardPositions = {};
    
    function toggleCard(id, visible) {
      const el = document.getElementById(id);
      if (el) {
        el.style.display = visible ? "block" : "none";
        if (visible) applyCardPosition(el);
      }
    }

    document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.card').forEach(card => {
    card.style.display = 'none';
  });
});


    function toggleCategory(category, visible) {
      const checkboxes = document.querySelectorAll('.card-toggle[data-id]');
      checkboxes.forEach(cb => {
        const card = document.getElementById(cb.dataset.id);
        if (card && card.dataset.category === category) {
          cb.checked = visible;
          toggleCard(cb.dataset.id, visible);
        }
      });
    }

    function applyCardPosition(card) {
      const pos = cardPositions[card.id];
      if (pos) {
        card.style.transform = \`translate(\${pos.x}px, \${pos.y}px)\`;
      } else {
        card.style.transform = "translate(0px, 0px)";
      }
    }
document.addEventListener('DOMContentLoaded', () => {
  const gridSize = 30; // Adjust grid snapping size here
  const cards = document.querySelectorAll('.card');
  const cardPositions = {};
  let activeCard = null;
  let offsetX = 0, offsetY = 0, isDragging = false;

  function snapToGrid(value) {
    return Math.round(value / gridSize) * gridSize;
  }

  cards.forEach(card => {
    card.addEventListener('mousedown', (e) => {
      if (window.innerWidth <= 768) return; // Fully disable drag on mobile
      isDragging = true;
      activeCard = card;
      const pos = cardPositions[card.id] || { x: 0, y: 0 };
      offsetX = e.clientX - pos.x;
      offsetY = e.clientY - pos.y;
      activeCard.style.zIndex = 1000;
    });
  });

  document.addEventListener('mousemove', (e) => {
    if (!isDragging || !activeCard) return;
    let x = e.clientX - offsetX;
    let y = e.clientY - offsetY;
    x = snapToGrid(x);
    y = snapToGrid(y);
    activeCard.style.transform = 'translate(' + x + 'px, ' + y + 'px)';
    cardPositions[activeCard.id] = { x, y };
  });

  document.addEventListener('mouseup', () => {
    if (activeCard) {
      activeCard.style.zIndex = "";
    }
    isDragging = false;
    activeCard = null;
  });
});


  </script>
</body>
</html>
`;

fs.writeFileSync(outputHtml, html, "utf-8");
console.log("✅ Cheatsheet generated with free drag-and-drop positioning (session memory only).");
