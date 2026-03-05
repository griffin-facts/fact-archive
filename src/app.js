fetch("pastmarketdata.csv")
  .then((response) => response.text())
  .then((csv) => {
    const rows = csv.trim().split("\n");
    rows.shift(); // remove header

    const container = document.getElementById("marketsContainer");

    rows.forEach((row) => {
      if (!row.trim()) return;

      const cols = row.split(",").map((col) => col.trim());

      const dateRaw = cols[0];
      const title = cols[1];
      const option1 = cols[2];
      const option2 = cols[3];
      const vote1 = Number(cols[4]);
      const trade1 = Number(cols[5]);
      const volume = Number(cols[6]);
      const voters = Number(cols[7]);
      const marketLink = cols[8] || "#";
      const assetsLink = cols[9] || "#";

      if (isNaN(vote1) || isNaN(trade1)) return;

      const vote2 = 100 - vote1;
      const trade2 = 100 - trade1;

      // -----------------------------------
      // CATEGORY LOGIC
      // -----------------------------------

      const voteWinner = vote1 > 50 ? 1 : 2;
      const tradeWinner = trade1 > 50 ? 1 : 2;

      const divergence = Math.abs(vote1 - trade1);
      const strongConviction = trade1 >= 80 || trade2 >= 80;

      let badgeHTML = "";

      // PRIORITY ORDER
      if (voteWinner !== tradeWinner) {
        badgeHTML = `<div class="category-badge upset">UPSET</div>`;
      } else if (divergence >= 25) {
        badgeHTML = `<div class="category-badge divergence">DIVERGENCE</div>`;
      } else if (strongConviction) {
        badgeHTML = `<div class="category-badge conviction">CONVICTION</div>`;
      } else {
        badgeHTML = `<div class="category-badge consensus">CONSENSUS</div>`;
      }

      const formattedDate = formatDate(dateRaw);

      const card = document.createElement("div");
      card.className = "market-card";

      card.innerHTML = `
      <div class="market-header-wrapper">
        <div class="market-date-top">
          ${formattedDate}
        </div>
    
        <div class="market-header">
          <div class="market-title">
            ${title}
          </div>
          ${badgeHTML}
        </div>
      </div>
    
      <div class="market-content">
    
        <div class="option-blocks">
          <div class="option-card option1-card">
            <div class="option-name">${option1}</div>
          </div>
    
          <div class="option-card option2-card">
            <div class="option-name">${option2}</div>
          </div>
        </div>
    
        <div class="bar-section emphasized">
          <div class="bar-label">
            Voting
            <span class="bar-percent">${vote1}% / ${vote2}%</span>
          </div>
          <div class="split-bar">
            <div class="option1-bar" style="width:${vote1}%"></div>
            <div class="option2-bar" style="width:${vote2}%"></div>
          </div>
        </div>
    
        <div class="bar-section emphasized">
          <div class="bar-label">
            Trading
            <span class="bar-percent">${trade1}% / ${trade2}%</span>
          </div>
          <div class="split-bar">
            <div class="option1-bar" style="width:${trade1}%"></div>
            <div class="option2-bar" style="width:${trade2}%"></div>
          </div>
        </div>
    
        <div class="market-meta">
          <span>${formatVolume(volume)}</span>
          <span>${voters} Voters</span>
        </div>
    
        <div class="market-footer">
          <a href="${marketLink}" target="_blank" class="get-assets-link">
            Get Assets >
          </a>
        </div>
    
      </div>
    `;
      container.appendChild(card);

      const headerWrapper = card.querySelector(".market-header-wrapper");
      const content = card.querySelector(".market-content");

      headerWrapper.addEventListener("click", () => {
        card.classList.toggle("expanded");
      });
    });
  });

function formatDate(dateString) {
  const [month, day, yearShort] = dateString.split("/");
  const year = Number(yearShort) + 2000;

  const date = new Date(year, month - 1, day);

  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatVolume(num) {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M Volume";
  }
  if (num >= 1000) {
    return Math.round(num / 1000) + "K Volume";
  }
  return num + " Volume";
}
