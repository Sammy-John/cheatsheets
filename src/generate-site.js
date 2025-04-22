const fs = require("fs");
const path = require("path");

const cards = require("./cards.json");

const buildPath = path.join(__dirname, "..", "build");
const outputHtml = path.join(buildPath, "index.html");

if (!fs.existsSync(buildPath)) {
  fs.mkdirSync(buildPath);
}

// Group cards by topic > category
const grouped = {};
for (const card of cards) {
  const { topic, category } = card;
  if (!grouped[topic]) grouped[topic] = {};
  if (!grouped[topic][category]) grouped[topic][category] = [];
  grouped[topic][category].push(card);
}

// Sidebar generator
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
                    <input type="checkbox" class="category-toggle" data-category="${category}" checked onchange="toggleCategory('${category}', this.checked)">
                    Show All
                  </label>
                  ${cards
                    .map(
                      (card) => `
                      <label>
                        <input type="checkbox" class="card-toggle" data-id="${card.id}" checked onchange="toggleCard('${card.id}', this.checked)">
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

// Generate card markup
const generateCardHTML = (card) => `
  <div class="card" id="${card.id}" data-category="${card.category}" data-topic="${card.topic}">
    <h3>${card.title}</h3>
    <p>${card.description}</p>
    <pre><code>${card.code}</code></pre>
  </div>
`;

// Final HTML output
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
  ${generateSidebarHTML()}

  <main class="card-container">
    ${cards.map(generateCardHTML).join("\n")}
  </main>

  <script>
    function toggleCard(id, visible) {
      const el = document.getElementById(id);
      if (el) el.style.display = visible ? "block" : "none";
    }

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
  </script>
</body>
</html>
`;

fs.writeFileSync(outputHtml, html, "utf-8");
console.log("✅ Fixed sidebar and structure generated at /build/index.html");
