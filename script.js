// ====================================
// Global Variables for Charts and Funds
// ====================================
let sipChart, lumpsumChart, loanChart, overviewChart;
let allFunds = []; // Global store for mutual fund data

// ====================================
// Helper Functions
// ====================================
function parseDate(str) {
  if (/^\d{2}-\d{2}-\d{4}$/.test(str)) {
    str = convertAPIDate(str);
  }
  const d = new Date(str);
  if (isNaN(d.getTime())) console.error("Invalid date string:", str);
  return d;
}
function formatDate(date) {
  if (!date || isNaN(date.getTime())) return "";
  return date.toISOString().split("T")[0];
}
function convertAPIDate(apiDateStr) {
  if (!apiDateStr || typeof apiDateStr !== "string") return "";
  const parts = apiDateStr.split("-");
  if (parts.length !== 3) return "";
  return `${parts[2]}-${parts[1]}-${parts[0]}`;
}
function normalizeData(data) {
  if (Array.isArray(data)) return data;
  if (typeof data === "object" && data !== null && data.data && Array.isArray(data.data)) {
    return data.data;
  }
  throw new Error("Invalid data structure received from API");
}
function getNAVForDate(navData, dateStr) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) dateStr = convertAPIDate(dateStr);
  let exact = navData.find(entry => entry.date === dateStr);
  if (exact && !isNaN(parseFloat(exact.nav))) return parseFloat(exact.nav);
  let filtered = navData.filter(entry => entry.date < dateStr && entry.date !== "");
  if (filtered.length > 0) return parseFloat(filtered[filtered.length - 1].nav);
  return parseFloat(navData[0].nav);
}
function formatIndianCurrency(num) {
  let x = Number(num).toFixed(2);
  let parts = x.split(".");
  let lastThree = parts[0].slice(-3);
  let otherNumbers = parts[0].slice(0, -3);
  if (otherNumbers !== "") {
    lastThree = "," + lastThree;
  }
  let formatted = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree;
  return "₹" + formatted + "." + parts[1];
}

// ====================================
// Chart Update Functions
// ====================================
function updateSIPChart(labels, investedData, portfolioData) {
  const ctx = document.getElementById("sipChart").getContext("2d");
  if (sipChart) sipChart.destroy();

  // Create gradients for datasets
  const gradientInvested = ctx.createLinearGradient(0, 0, 0, 400);
  gradientInvested.addColorStop(0, "rgba(0,119,204,0.4)");
  gradientInvested.addColorStop(1, "rgba(0,119,204,0.1)");

  const gradientPortfolio = ctx.createLinearGradient(0, 0, 0, 400);
  gradientPortfolio.addColorStop(0, "rgba(255,102,0,0.4)");
  gradientPortfolio.addColorStop(1, "rgba(255,102,0,0.1)");

  // Compute suggested y-axis scale from the combined datasets
  const allValues = investedData.concat(portfolioData);
  const minVal = Math.min(...allValues);
  const maxVal = Math.max(...allValues);
  const range = maxVal - minVal;
  
  sipChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Total Invested (₹)",
          data: investedData,
          borderColor: "#0077CC",
          backgroundColor: gradientInvested,
          fill: true,
          tension: 0.2,
          pointRadius: 3
        },
        {
          label: "Portfolio Value (₹)",
          data: portfolioData,
          borderColor: "#FF6600",
          backgroundColor: gradientPortfolio,
          fill: true,
          tension: 0.2,
          pointRadius: 3
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: "index", intersect: false },
      scales: {
        x: { 
          ticks: { color: "#555", font: { family: "Montserrat", weight: "500" } },
          grid: { color: "rgba(200,200,200,0.2)" }
        },
        y: { 
          ticks: {
            color: "#555",
            font: { family: "Montserrat", weight: "500" },
            maxTicksLimit: 6
          },
          suggestedMin: minVal * 0.95,
          suggestedMax: maxVal * 1.05,
          grid: { color: "rgba(200,200,200,0.2)" }
        }
      },
      plugins: {
        legend: { labels: { color: "#333", font: { family: "Montserrat" } } },
        tooltip: { enabled: true, backgroundColor: "rgba(0,0,0,0.7)", titleFont: { family: "Montserrat" } }
      },
      animation: { duration: 1000 }
    }
  });
  document.getElementById("sipChart").style.display = "block";
}

function updateLumpsumChart(labels, portfolioData) {
  const ctx = document.getElementById("lumpsumChart").getContext("2d");
  if (lumpsumChart) lumpsumChart.destroy();

  const gradient = ctx.createLinearGradient(0, 0, 0, 400);
  gradient.addColorStop(0, "rgba(255,102,0,0.4)");
  gradient.addColorStop(1, "rgba(255,102,0,0.1)");

  // Compute suggested y-axis scale from portfolio data
  const minVal = Math.min(...portfolioData);
  const maxVal = Math.max(...portfolioData);
  const range = maxVal - minVal;
  
  lumpsumChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Portfolio Value (₹)",
          data: portfolioData,
          borderColor: "#FF6600",
          backgroundColor: gradient,
          fill: true,
          tension: 0.2,
          pointRadius: 3
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: "index", intersect: false },
      scales: {
        x: { 
          ticks: { color: "#555", font: { family: "Montserrat", weight: "500" } },
          grid: { color: "rgba(200,200,200,0.2)" }
        },
        y: { 
          ticks: {
            color: "#555",
            font: { family: "Montserrat", weight: "500" },
            maxTicksLimit: 6
          },
          suggestedMin: minVal * 0.95,
          suggestedMax: maxVal * 1.05,
          grid: { color: "rgba(200,200,200,0.2)" }
        }
      },
      plugins: {
        legend: { labels: { color: "#333", font: { family: "Montserrat" } } },
        tooltip: { enabled: true, backgroundColor: "rgba(0,0,0,0.7)" }
      },
      animation: { duration: 1000 }
    }
  });
  document.getElementById("lumpsumChart").style.display = "block";
}

function updateLoanChart(labels, dataPoints) {
  const ctx = document.getElementById("loanChart").getContext("2d");
  if (loanChart) loanChart.destroy();

  const gradient = ctx.createLinearGradient(0, 0, 0, 400);
  gradient.addColorStop(0, "rgba(0,119,204,0.4)");
  gradient.addColorStop(1, "rgba(0,119,204,0.1)");

  loanChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [
        {
          label: "EMI Variation",
          data: dataPoints,
          borderColor: "#0077CC",
          backgroundColor: gradient,
          fill: true,
          tension: 0.2,
          pointRadius: 3
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: "index", intersect: false },
      scales: {
        x: {
          ticks: { color: "#555", font: { family: "Montserrat", weight: "500" } },
          grid: { color: "rgba(200,200,200,0.2)" }
        },
        y: {
          ticks: { color: "#555", font: { family: "Montserrat", weight: "500" } },
          grid: { color: "rgba(200,200,200,0.2)" }
        }
      },
      plugins: {
        legend: { labels: { color: "#333", font: { family: "Montserrat" } } },
        tooltip: { enabled: true, backgroundColor: "rgba(0,0,0,0.7)" }
      },
      animation: { duration: 1000 }
    }
  });
  document.getElementById("loanChart").style.display = "block";
}

function updateSWPPieChart(totalWithdrawals, finalPortfolio) {
  const ctx = document.getElementById("swpPieChart").getContext("2d");
  if (window.swpPieChart && typeof window.swpPieChart.destroy === "function") {
    window.swpPieChart.destroy();
  }
  window.swpPieChart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: ["Total Withdrawals", "Current Investment"],
      datasets: [{
        data: [totalWithdrawals, finalPortfolio],
        backgroundColor: ["#FF6600", "#0077CC"],
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: "70%",
      plugins: {
        legend: { position: "bottom", labels: { color: "#333", font: { family: "Montserrat", size: 14 } } },
        tooltip: { enabled: true, backgroundColor: "rgba(0,0,0,0.7)", bodyFont: { family: "Montserrat" } }
      },
      animation: { duration: 1000 }
    }
  });
  document.getElementById("swpPieChart").style.display = "block";
}

function updateOverviewChart(labels, dataPoints) {
  const ctx = document.getElementById("overviewChart").getContext("2d");
  if (overviewChart) overviewChart.destroy();

  // Convert dataPoints to numbers and use green/red bars based on performance
  const numericPoints = dataPoints.map(x => parseFloat(x));
  const barColors = numericPoints.map(val => (val >= 0 ? "#28a745" : "#dc3545"));

  overviewChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [{
        label: "Performance (%)",
        data: numericPoints,
        backgroundColor: barColors,
        minBarLength: 10, // Ensure even very small values show a minimum bar height
        borderRadius: 5,
        barThickness: 'flex'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          ticks: { color: "#555", font: { family: "Montserrat", weight: "500" } },
          grid: { color: "rgba(200,200,200,0.2)" }
        },
        x: {
          ticks: { color: "#555", font: { family: "Montserrat", weight: "500" } },
          grid: { display: false }
        }
      },
      plugins: {
        legend: { display: false },
        tooltip: { enabled: true, backgroundColor: "rgba(0,0,0,0.7)", bodyFont: { family: "Montserrat" } }
      },
      animation: { duration: 1000 }
    }
  });
}

// ====================================
// Fund Selector Functions for Multiple Sections
// ====================================
function filterFundListForSection(query, selectedHouse, dataListElem) {
  dataListElem.innerHTML = "";
  const filtered = allFunds.filter(fund => {
    const matchesQuery = fund.schemeName.toLowerCase().includes(query.toLowerCase());
    const matchesHouse = selectedHouse === "All" || fund.fundHouse.toLowerCase().includes(selectedHouse.toLowerCase());
    return matchesQuery && matchesHouse;
  });
  const limited = filtered.slice(0, 10);
  limited.forEach(fund => {
    const option = document.createElement("option");
    option.value = fund.schemeName;
    option.setAttribute("data-id", fund.schemeCode);
    dataListElem.appendChild(option);
  });
}

function getSelectedFundIdFromSection(fundNameInputId, datalistId) {
  const input = document.getElementById(fundNameInputId);
  const datalist = document.getElementById(datalistId);
  const options = datalist.options;
  for (let i = 0; i < options.length; i++) {
    if (options[i].value.trim().toLowerCase() === input.value.trim().toLowerCase()) {
      return options[i].getAttribute("data-id");
    }
  }
  return null;
}

function updateFundHouseSelects(uniqueHouses) {
  // List of additional fund houses to be included
  const additionalHouses = ["Motilal Oswal", "Quant", "HSBC", "Canera Robeco", "Parag Parekh", "PGIM", "Samco", "Sundaram", "Mirae Asset", "JM", "ITI", "Invesco"];
  
  // Merge with the already unique houses and ensure uniqueness
  uniqueHouses = uniqueHouses.concat(additionalHouses);
  uniqueHouses = Array.from(new Set(uniqueHouses)).sort();
  
  const selectIds = ["overviewFundHouseSelect", "sipFundHouseSelect", "swpFundHouseSelect", "lumpsumFundHouseSelect"];
  selectIds.forEach(id => {
    const selectElem = document.getElementById(id);
    if (selectElem) {
      selectElem.innerHTML = '<option value="All">All</option>';
      uniqueHouses.forEach(house => {
        const option = document.createElement("option");
        option.value = house;
        option.textContent = house;
        selectElem.appendChild(option);
      });
    }
  });
}

function setupFundSelector(fundNameInputId, fundHouseSelectId, datalistId) {
  const inputElem = document.getElementById(fundNameInputId);
  const selectElem = document.getElementById(fundHouseSelectId);
  const dataListElem = document.getElementById(datalistId);
  inputElem.addEventListener("input", function() {
    filterFundListForSection(this.value, selectElem.value, dataListElem);
  });
  selectElem.addEventListener("change", function() {
    filterFundListForSection(inputElem.value, this.value, dataListElem);
  });
}

// ====================================
// Mutual Fund Data Fetching
// ====================================
function populateFundList() {
  fetch("https://api.mfapi.in/mf")
    .then(response => response.json())
    .then(data => {
      allFunds = data
        .map(fund => {
          const meta = fund.meta;
          const schemeName = (meta && meta.scheme_name) || fund.schemeName || "";
          const schemeCode = (meta && meta.scheme_code) ? meta.scheme_code.toString() : (fund.schemeCode ? fund.schemeCode.toString() : "");
          // Use the meta.fund_house field (if available) exactly as provided
          const fundHouse = (meta && meta.fund_house) || extractFundHouse(schemeName);
          const schemeCategory = (meta && meta.scheme_category) || "N/A";
          return { schemeName, schemeCode, fundHouse, schemeCategory };
        })
        .filter(fund => fund.schemeName && fund.schemeCode);
      const uniqueHouses = getUniqueFundHouses(data);
      updateFundHouseSelects(uniqueHouses);
      // Initialize datalists for all selectors
      filterFundListForSection("", "All", document.getElementById("overviewFundList"));
      filterFundListForSection("", "All", document.getElementById("sipFundList"));
      filterFundListForSection("", "All", document.getElementById("swpFundList"));
      filterFundListForSection("", "All", document.getElementById("lumpsumFundList"));
    })
    .catch(err => console.error("Error populating fund list:", err));
}

function extractFundHouse(schemeName) {
  if (!schemeName) return "Other";
  const commonFundHouses = [
    "HDFC", "ICICI", "SBI", "Axis", "Kotak", "Aditya Birla",
    "Nippon", "UTI", "DSP", "IDFC", "Tata", "L&T", "Motilal Oswal", 
    "Quant", "HSBC", "Canera Robeco", "Parag Parekh", "PGIM", "Samco", 
    "Sundaram", "Mirae Asset", "JM", "ITI", "Invesco"
  ];
  for (let house of commonFundHouses) {
    if (schemeName.includes(house)) {
      return house;
    }
  }
  return "Other";
}

function getUniqueFundHouses(data) {
  const houses = data.map(fund => {
    const schemeName = fund.schemeName || (fund.meta && fund.meta.scheme_name) || "";
    return (fund.meta && fund.meta.fund_house) ? fund.meta.fund_house : extractFundHouse(schemeName);
  }).filter(house => house && house.trim() !== "");
  return Array.from(new Set(houses)).sort();
}

// ====================================
// Historical NAV Data Fetching
// ====================================
function fetchHistoricalData(fundId) {
  const cacheKey = `historicalData_${fundId}`;
  const today = new Date().toISOString().split("T")[0];
  let cached = localStorage.getItem(cacheKey);
  if (cached) {
    try {
      // Decompress the cached string
      let decompressed = LZString.decompressFromUTF16(cached);
      const cachedObj = JSON.parse(decompressed);
      if (cachedObj.lastUpdated === today) return Promise.resolve(cachedObj.data);
    } catch (e) {
      console.error("Error decompressing cached data for fund", fundId, e);
      localStorage.removeItem(cacheKey);
    }
  }
  const apiUrl = `https://api.mfapi.in/mf/${fundId}`;
  console.log("Fetching historical data from:", apiUrl);
  return fetch(apiUrl)
    .then(response => response.json())
    .then(data => {
      let normalized = normalizeData(data);
      // Reduce dataset to only store required fields (date and nav)
      normalized = normalized.map(entry => ({
        date: convertAPIDate(entry.date),
        nav: entry.nav
      }));
      normalized = normalized.filter(entry => !isNaN(parseDate(entry.date).getTime()));
      normalized.sort((a, b) => parseDate(a.date) - parseDate(b.date));
      try {
        const cacheObj = { lastUpdated: today, data: normalized };
        // Compress the data before caching
        const compressed = LZString.compressToUTF16(JSON.stringify(cacheObj));
        localStorage.setItem(cacheKey, compressed);
      } catch (e) {
        console.error("Error storing historical data for fund", fundId, e);
      }
      return normalized;
    });
}

// ====================================
// Overview Section Fund Selection and Performance
// ====================================
document.getElementById("overviewFundNameInput").addEventListener("change", function() {
  const fundId = getSelectedFundIdFromSection("overviewFundNameInput", "overviewFundList");
  if (fundId) {
    Promise.all([fetchHistoricalData(fundId), fetchMutualFundDetails(fundId)])
      .then(([navData, details]) => {
         const today = new Date();
         const currentNav = getNAVForDate(navData, formatDate(today));
         
         // Define date objects for required periods
         const oneWeekAgo = new Date(today); oneWeekAgo.setDate(today.getDate() - 7);
         const oneMonthAgo = new Date(today); oneMonthAgo.setMonth(today.getMonth() - 1);
         const threeMonthsAgo = new Date(today); threeMonthsAgo.setMonth(today.getMonth() - 3);
         const sixMonthsAgo = new Date(today); sixMonthsAgo.setMonth(today.getMonth() - 6);
         const oneYearAgo = new Date(today); oneYearAgo.setFullYear(today.getFullYear() - 1);
         const threeYearsAgo = new Date(today); threeYearsAgo.setFullYear(today.getFullYear() - 3);
         const fiveYearsAgo = new Date(today); fiveYearsAgo.setFullYear(today.getFullYear() - 5);
         
         // Get NAV for each period
         const nav1w = getNAVForDate(navData, formatDate(oneWeekAgo));
         const nav1m = getNAVForDate(navData, formatDate(oneMonthAgo));
         const nav3m = getNAVForDate(navData, formatDate(threeMonthsAgo));
         const nav6m = getNAVForDate(navData, formatDate(sixMonthsAgo));
         const nav1y = getNAVForDate(navData, formatDate(oneYearAgo));
         const nav3y = getNAVForDate(navData, formatDate(threeYearsAgo));
         const nav5y = getNAVForDate(navData, formatDate(fiveYearsAgo));
         
         // Calculate performance percentages for each period
         const perf1w = ((currentNav - nav1w) / nav1w * 100).toFixed(2);
         const perf1m = ((currentNav - nav1m) / nav1m * 100).toFixed(2);
         const perf3m = ((currentNav - nav3m) / nav3m * 100).toFixed(2);
         const perf6m = ((currentNav - nav6m) / nav6m * 100).toFixed(2);
         const perf1y = ((currentNav - nav1y) / nav1y * 100).toFixed(2);
         const perf3y = ((currentNav - nav3y) / nav3y * 100).toFixed(2);
         const perf5y = ((currentNav - nav5y) / nav5y * 100).toFixed(2);
         
         // Update the Overview chart with all selected time periods
         updateOverviewChart(
           ["1W", "1M", "3M", "6M", "1Y", "3Y", "5Y"],
           [perf1w, perf1m, perf3m, perf6m, perf1y, perf3y, perf5y]
         );
         
         // Retrieve scheme_category from the detailed meta data
         const schemeCategory = (details.meta && details.meta.scheme_category) ? details.meta.scheme_category : "N/A";
         
         // Get Fund House and Scheme Name from the already-populated allFunds list
         const fundData = allFunds.find(fund => fund.schemeCode === fundId);
         document.getElementById("overviewInfo").innerHTML =
           `<h3>Mutual Fund Info</h3>
            <p><strong>Fund House:</strong> ${fundData ? fundData.fundHouse : "N/A"}</p>
            <p><strong>Scheme Name:</strong> ${fundData ? fundData.schemeName : "N/A"}</p>
            <p><strong>Scheme Category:</strong> ${schemeCategory}</p>
            <p><strong>Current NAV:</strong> ${formatIndianCurrency(currentNav)}</p>`;
      })
      .catch(err => {
         console.error("Error fetching mutual fund details:", err);
      });
  }
});

// ====================================
// SIP Calculator
// ====================================
document.getElementById("calcSIP").addEventListener("click", function () {
  const fundId = getSelectedFundIdFromSection("sipFundNameInput", "sipFundList");
  if (!fundId) { alert("Please select a valid mutual fund from the SIP section."); return; }
  const startDate = document.getElementById("startDate").value;
  const endDate = document.getElementById("endDate").value;
  const sipAmount = parseFloat(document.getElementById("sipAmount").value);
  const sipType = document.getElementById("sipType").value;
  const stepUpPercent = sipType === "stepup" ? parseFloat(document.getElementById("stepUpPercent").value) || 0 : 0;
  fetchHistoricalData(fundId)
    .then(navData => {
      let totalInvested = 0, totalUnits = 0;
      let startD = parseDate(startDate), endD = parseDate(endDate);
      let currentD = new Date(startD);
      const dates = [], investedArr = [], portfolioArr = [];
      while (currentD <= endD) {
        let currentSipAmount = sipAmount;
        if (sipType === 'stepup') {
          const yearsPassed = currentD.getFullYear() - startD.getFullYear();
          currentSipAmount = sipAmount * Math.pow(1 + (stepUpPercent / 100), yearsPassed);
        }
        const dateStr = formatDate(currentD);
        const navValue = getNAVForDate(navData, dateStr);
        if (!isNaN(navValue)) {
          const units = currentSipAmount / navValue;
          totalUnits += units;
          totalInvested += currentSipAmount;
          dates.push(dateStr);
          investedArr.push(totalInvested.toFixed(2));
          portfolioArr.push((totalUnits * navValue).toFixed(2));
        }
        currentD.setMonth(currentD.getMonth() + 1);
      }
      const endNAV = getNAVForDate(navData, formatDate(endD));
      const finalValue = totalUnits * endNAV;
      const totalYears = (endD - startD) / (365.25 * 24 * 3600 * 1000);
      const CAGR = Math.pow(finalValue / totalInvested, 1 / totalYears) - 1;
      const returnPct = ((finalValue - totalInvested) / totalInvested) * 100;
      updateSIPChart(dates, investedArr, portfolioArr);
      document.getElementById("sipResult").innerHTML =
        `<h3>SIP Calculation Results:</h3>
         <p>Total Invested: ${formatIndianCurrency(totalInvested.toFixed(2))}</p>
         <p>Final Value: ${formatIndianCurrency(finalValue.toFixed(2))}</p>
         <p>CAGR: ${(CAGR * 100).toFixed(2)}%</p>
         <p>Return (%): ${returnPct.toFixed(2)}%</p>`;
    })
    .catch(err => {
      console.error("Error fetching historical NAV data:", err);
      document.getElementById("sipResult").innerHTML = `<p>Error fetching data. Please try again.</p>`;
    });
});
document.getElementById("sipType").addEventListener("change", function() {
  document.getElementById("stepUpContainer").style.display = this.value === "stepup" ? "block" : "none";
});

// ====================================
// SWP Calculator
// ====================================
document.getElementById("calcSWP").addEventListener("click", function () {
  const fundId = getSelectedFundIdFromSection("swpFundNameInput", "swpFundList");
  if (!fundId) {
    alert("Please select a valid mutual fund for SWP calculations.");
    return;
  }
  const swpStartDate = document.getElementById("swpStartDate").value;
  const swpEndDate = document.getElementById("swpEndDate").value;
  const initialPortfolio = parseFloat(document.getElementById("initialPortfolio").value);
  const withdrawal = parseFloat(document.getElementById("withdrawalAmount").value);
  fetchHistoricalData(fundId)
    .then(navData => {
      let portfolio = initialPortfolio;
      const startDate = parseDate(swpStartDate);
      const endDate = parseDate(swpEndDate);
      let previousNAV = getNAVForDate(navData, formatDate(startDate));
      let currentDate = new Date(startDate);
      let monthCount = 0;
      while (currentDate < endDate) {
        currentDate.setMonth(currentDate.getMonth() + 1);
        monthCount++;
        const currentNAV = getNAVForDate(navData, formatDate(currentDate));
        portfolio = portfolio * (currentNAV / previousNAV) - withdrawal;
        previousNAV = currentNAV;
      }
      const totalReturn = portfolio - initialPortfolio;
      const returnPct = (totalReturn / initialPortfolio) * 100;
      const years = (endDate - startDate) / (365.25 * 24 * 3600 * 1000);
      const CAGR = Math.pow(portfolio / initialPortfolio, 1 / years) - 1;
      document.getElementById("swpResult").innerHTML =
        `<h3>SWP Calculation Results:</h3>
         <p>Current Investment Value: ${formatIndianCurrency(portfolio.toFixed(2))}</p>
         <p>Total Withdrawn: ${formatIndianCurrency((withdrawal * monthCount).toFixed(2))}</p>
         <p>Total Return: ${formatIndianCurrency(totalReturn.toFixed(2))}</p>
         <p>CAGR: ${(CAGR * 100).toFixed(2)}%</p>
         <p>Return (%): ${returnPct.toFixed(2)}%</p>`;
      updateSWPPieChart((withdrawal * monthCount).toFixed(2), portfolio.toFixed(2));
    })
    .catch(err => {
      console.error("Error fetching historical NAV data for SWP:", err);
      document.getElementById("swpResult").innerHTML = `<p>Error fetching data. Please try again.</p>`;
    });
});

// ====================================
// Lumpsum Calculator
// ====================================
document.getElementById("calcLumpsum").addEventListener("click", function () {
  const fundId = getSelectedFundIdFromSection("lumpsumFundNameInput", "lumpsumFundList");
  if (!fundId) {
    alert("Please select a valid mutual fund for Lumpsum calculations.");
    return;
  }
  const startDate = document.getElementById("lumpsumStartDate").value;
  const endDate = document.getElementById("lumpsumEndDate").value;
  const lumpsumAmount = parseFloat(document.getElementById("lumpsumAmount").value);
  fetchHistoricalData(fundId)
    .then(navData => {
      const startD = parseDate(startDate);
      const endD = parseDate(endDate);
      const startNAV = getNAVForDate(navData, formatDate(startD));
      const endNAV = getNAVForDate(navData, formatDate(endD));
      const finalValue = lumpsumAmount * (endNAV / startNAV);
      const totalYears = (endD - startD) / (365.25 * 24 * 3600 * 1000);
      const CAGR = Math.pow(finalValue / lumpsumAmount, 1 / totalYears) - 1;
      const returnPct = ((finalValue - lumpsumAmount) / lumpsumAmount) * 100;
      document.getElementById("lumpsumResult").innerHTML =
        `<h3>Lumpsum Calculation Results:</h3>
         <p>Final Value: ${formatIndianCurrency(finalValue.toFixed(2))}</p>
         <p>CAGR: ${(CAGR * 100).toFixed(2)}%</p>
         <p>Return (%): ${returnPct.toFixed(2)}%</p>`;
      // Update chart for lumpsum performance over time
      let dates = [];
      let portfolioArr = [];
      let currentDate = new Date(startD);
      const units = lumpsumAmount / startNAV;
      while (currentDate <= endD) {
        let dateStr = formatDate(currentDate);
        dates.push(dateStr);
        portfolioArr.push((units * getNAVForDate(navData, dateStr)).toFixed(2));
        currentDate.setMonth(currentDate.getMonth() + 1);
      }
      updateLumpsumChart(dates, portfolioArr);
    })
    .catch(err => {
      console.error("Error fetching historical NAV data for Lumpsum:", err);
      document.getElementById("lumpsumResult").innerHTML = `<p>Error fetching data. Please try again.</p>`;
    });
});

// ====================================
// Goal Based Planner Calculator
// ====================================
document.getElementById("calcGoal").addEventListener("click", function () {
  const targetAmount = parseFloat(document.getElementById("targetAmount").value);
  // Expected annual return as a decimal (e.g., 8% becomes 0.08)
  const goalReturn = parseFloat(document.getElementById("goalReturn").value) / 100;
  let resultHTML = "<h3>Goal Based Planner Results:</h3>";
  // We only support two modes now: "investment" and "time"
  const selectedOption = document.querySelector(".goal-option-btn.active").getAttribute("data-option");

  if (selectedOption === "investment") {
    // ------------------------------
    // Investment Mode: Required Investment Calculation using a combination
    // ------------------------------
    // The investor plans a mix of both a lumpsum and a monthly SIP.
    // Expected HTML inputs: 
    //    "goalYears"       -> Time period (years)
    //    "requiredLumpsum" -> Desired one-time lumpsum investment (enter 0 if none)
    //    "requiredSIP"     -> Desired monthly SIP investment (enter 0 if none)
    const years = parseFloat(document.getElementById("goalYears").value);
    const lumpsumInput = parseFloat(document.getElementById("requiredLumpsum").value) || 0;
    const sipInput = parseFloat(document.getElementById("requiredSIP").value) || 0;

    // Future value of the lumpsum part:
    const lumpsumFuture = lumpsumInput * Math.pow(1 + goalReturn, years);
    
    // Future value of the SIP part using the annuity-due formula:
    // r is the monthly rate; n is total number of months.
    const n = years * 12;
    const r = goalReturn / 12;
    const sipFactor = r === 0 ? n : ((Math.pow(1 + r, n) - 1) / r) * (1 + r);
    const sipFuture = sipInput * sipFactor;

    const totalFutureValue = lumpsumFuture + sipFuture;

    if (totalFutureValue >= targetAmount) {
      resultHTML += `<p>The combination of a lumpsum investment of <strong>${formatIndianCurrency(lumpsumInput.toFixed(2))}</strong> and a monthly SIP of <strong>${formatIndianCurrency(sipInput.toFixed(2))}</strong> will grow to <strong>${formatIndianCurrency(totalFutureValue.toFixed(2))}</strong> in ${years} years, meeting your target of ${formatIndianCurrency(targetAmount.toFixed(2))}.</p>`;
    } else {
      const shortfall = targetAmount - totalFutureValue;
      resultHTML += `<p>Your planned combination results in a future value of <strong>${formatIndianCurrency(totalFutureValue.toFixed(2))}</strong> over ${years} years, which is short of your target by <strong>${formatIndianCurrency(shortfall.toFixed(2))}</strong>.<br>Please consider increasing either your lumpsum, your SIP, or both.</p>`;
    }
  } else if (selectedOption === "time") {
    // ------------------------------
    // Time Mode: Calculate Time Required for a Given Combination
    // ------------------------------
    // Expected HTML inputs:
    //    "existingLumpsum" -> Current one-time lumpsum investment
    //    "existingSIP"     -> Current monthly SIP investment
    const lumpsumGiven = parseFloat(document.getElementById("existingLumpsum").value) || 0;
    const sipGiven = parseFloat(document.getElementById("existingSIP").value) || 0;
    let t = 0; // Time in years
    const r = goalReturn / 12; // monthly rate

    while (t < 100) {
      const lumpsumFuture = lumpsumGiven * Math.pow(1 + goalReturn, t);
      const nMonths = Math.floor(t * 12);
      const sipFuture = sipGiven * (r === 0 ? nMonths : ((Math.pow(1 + r, nMonths) - 1) / r) * (1 + r));
      if (lumpsumFuture + sipFuture >= targetAmount) break;
      t += 0.01; // Increment time (approximately every 3.65 days)
    }

    if (t >= 100) {
      resultHTML += `<p>With your current investments, the target amount cannot be reached within 100 years.</p>`;
    } else {
      resultHTML += `<p>Your current combination will reach your target in approximately <strong>${t.toFixed(2)}</strong> years.</p>`;
    }
  }
  document.getElementById("goalResult").innerHTML = resultHTML;
});

document.addEventListener("DOMContentLoaded", function() {
  const goalButtons = document.querySelectorAll(".goal-option-btn");
  goalButtons.forEach(btn => {
    btn.addEventListener("click", function() {
      goalButtons.forEach(b => b.classList.remove("active"));
      this.classList.add("active");
      const option = this.getAttribute("data-option");
      if (option === "investment") {
        document.getElementById("investmentInputs").style.display = "block";
        document.getElementById("timeInputs").style.display = "none";
      } else if (option === "time") {
        document.getElementById("investmentInputs").style.display = "none";
        document.getElementById("timeInputs").style.display = "block";
      }
    });
  });

  // Setup fund selectors for each section with mutual fund selection
  setupFundSelector("overviewFundNameInput", "overviewFundHouseSelect", "overviewFundList");
  setupFundSelector("sipFundNameInput", "sipFundHouseSelect", "sipFundList");
  setupFundSelector("swpFundNameInput", "swpFundHouseSelect", "swpFundList");
  setupFundSelector("lumpsumFundNameInput", "lumpsumFundHouseSelect", "lumpsumFundList");

  populateFundList();
});

// ====================================
// Retirement Planner Calculator
// ====================================
function calculateRetirementCorpus(currentSavings, monthlyContribution, years, stepUp, annualReturn, inflationRate) {
  const n = years * 12;
  const r = annualReturn / 100 / 12;
  let corpusFromSavings = currentSavings * Math.pow(1 + r, n);
  let corpusFromContributions = 0;
  for (let m = 0; m < n; m++) {
    let yearsPassed = Math.floor(m / 12);
    let contribution = monthlyContribution * Math.pow(1 + (stepUp / 100), yearsPassed);
    corpusFromContributions += contribution * Math.pow(1 + r, n - m);
  }
  let totalCorpus = corpusFromSavings + corpusFromContributions;
  if (inflationRate) {
    totalCorpus = totalCorpus / Math.pow(1 + (inflationRate / 100) / 12, n);
  }
  return totalCorpus;
}
document.getElementById("calcRetirement").addEventListener("click", function() {
  const currentAge = parseFloat(document.getElementById("currentAge").value);
  const retirementAge = parseFloat(document.getElementById("retirementAge").value);
  const currentSavings = parseFloat(document.getElementById("currentSavingsRet").value);
  const monthlyContribution = parseFloat(document.getElementById("monthlyContributionRet").value);
  const stepUp = parseFloat(document.getElementById("retStepUp").value) || 0;
  const annualReturn = parseFloat(document.getElementById("retAnnualReturn").value);
  const inflationRate = parseFloat(document.getElementById("retInflationRate").value) || 0;
  const years = retirementAge - currentAge;
  const corpus = calculateRetirementCorpus(currentSavings, monthlyContribution, years, stepUp, annualReturn, inflationRate);
  document.getElementById("retirementResult").innerHTML =
    `<h3>Retirement Planner Results:</h3>
     <p>Estimated Corpus at Retirement: ${formatIndianCurrency(corpus.toFixed(2))}</p>`;
});

// ====================================
// Children Education Planner Calculator
// ====================================
function calculateEducationPlanner(childAge, eduAge, currentCost, inflationRate, monthlyContribution, stepUp, annualReturn, currentSavings) {
  const years = eduAge - childAge;
  const futureCost = currentCost * Math.pow(1 + inflationRate / 100, years);
  const n = years * 12;
  const r = annualReturn / 100 / 12;
  let futureSavings = currentSavings * Math.pow(1 + r, n);
  let futureContributions = 0;
  for (let m = 0; m < n; m++) {
    let yearsPassed = Math.floor(m / 12);
    let contribution = monthlyContribution * Math.pow(1 + (stepUp / 100), yearsPassed);
    futureContributions += contribution * Math.pow(1 + r, n - m);
  }
  const totalCorpus = futureSavings + futureContributions;
  return { futureCost, totalCorpus, gap: Math.max(0, futureCost - totalCorpus) };
}
document.getElementById("calcEducation").addEventListener("click", function() {
  const childAge = parseFloat(document.getElementById("childAge").value);
  const eduAge = parseFloat(document.getElementById("eduAge").value);
  const currentCost = parseFloat(document.getElementById("currentCostEdu").value);
  const inflationRate = parseFloat(document.getElementById("eduInflationRate").value) || 0;
  const monthlyContribution = parseFloat(document.getElementById("monthlyContributionEdu").value);
  const stepUp = parseFloat(document.getElementById("eduStepUp").value) || 0;
  const annualReturn = parseFloat(document.getElementById("eduAnnualReturn").value);
  const currentSavings = parseFloat(document.getElementById("currentSavingsEdu").value);
  const { futureCost, totalCorpus, gap } = calculateEducationPlanner(childAge, eduAge, currentCost, inflationRate, monthlyContribution, stepUp, annualReturn, currentSavings);
  document.getElementById("educationResult").innerHTML =
    `<h3>Children Education Planner Results:</h3>
     <p>Estimated Cost at Education Age: ${formatIndianCurrency(futureCost.toFixed(2))}</p>
     <p>Future Value of Savings & Contributions: ${formatIndianCurrency(totalCorpus.toFixed(2))}</p>
     <p>Additional Corpus Needed: ${formatIndianCurrency(gap.toFixed(2))}</p>`;
});

// ====================================
// Loan Calculator
// ====================================
function calculateLoanEMI(loanAmount, annualInterestRate, tenureYears) {
  const r = annualInterestRate / 100 / 12;
  const n = tenureYears * 12;
  const EMI = loanAmount * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1);
  const totalPayment = EMI * n;
  const totalInterest = totalPayment - loanAmount;
  return { EMI, totalInterest, totalPayment };
}
function simulateLoanEMI(loanAmount, annualInterestRate, tenureYears) {
  const dataPoints = [];
  const labels = [];
  for (let rate = annualInterestRate - 2; rate <= annualInterestRate + 2; rate += 0.5) {
    const r = rate / 100 / 12;
    const n = tenureYears * 12;
    const EMI = loanAmount * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1);
    labels.push(rate.toFixed(1) + "%");
    dataPoints.push(EMI.toFixed(2));
  }
  updateLoanChart(labels, dataPoints);
}
document.querySelectorAll('.loan-mode-btn').forEach(button => {
  button.addEventListener("click", function() {
    document.querySelectorAll('.loan-mode-btn').forEach(btn => btn.classList.remove("active"));
    this.classList.add("active");
    const mode = this.getAttribute("data-mode");
    if (mode === "emi") {
      document.getElementById("loanAmountGroup").style.display = "block";
      document.getElementById("loanInterestGroup").style.display = "block";
      document.getElementById("loanTenureGroup").style.display = "block";
      document.getElementById("loanEMIGroup").style.display = "none";
    } else if (mode === "tenure") {
      document.getElementById("loanAmountGroup").style.display = "block";
      document.getElementById("loanInterestGroup").style.display = "block";
      document.getElementById("loanTenureGroup").style.display = "none";
      document.getElementById("loanEMIGroup").style.display = "block";
    } else if (mode === "rate") {
      document.getElementById("loanAmountGroup").style.display = "block";
      document.getElementById("loanInterestGroup").style.display = "none";
      document.getElementById("loanTenureGroup").style.display = "block";
      document.getElementById("loanEMIGroup").style.display = "block";
    }
  });
});
document.getElementById("calcLoan").addEventListener("click", function() {
  const activeLoanButton = document.querySelector('.loan-mode-btn.active');
  if (!activeLoanButton) {
    alert("Please select a loan mode.");
    return;
  }
  const loanMode = activeLoanButton.getAttribute("data-mode");
  const loanAmount = parseFloat(document.getElementById("loanAmount").value);
  if (loanAmount <= 0) {
      alert("Please enter a valid loan amount.");
      return;
  }
  if (loanMode === "emi") {
    const loanInterest = parseFloat(document.getElementById("loanInterest").value);
    const loanTenure = parseFloat(document.getElementById("loanTenure").value);
    if (loanInterest <= 0 || loanTenure <= 0) {
         alert("Please enter valid interest rate and tenure.");
         return;
    }
    const result = calculateLoanEMI(loanAmount, loanInterest, loanTenure);
    document.getElementById("loanResult").innerHTML =
      `<h3>Loan Calculator Results (EMI Mode):</h3>
       <p>Monthly EMI: ${formatIndianCurrency(result.EMI.toFixed(2))}</p>
       <p>Total Interest Payable: ${formatIndianCurrency(result.totalInterest.toFixed(2))}</p>
       <p>Total Payment: ${formatIndianCurrency(result.totalPayment.toFixed(2))}</p>`;
    simulateLoanEMI(loanAmount, loanInterest, loanTenure);
    document.getElementById("loanChart").style.display = "block";
  } else if (loanMode === "tenure") {
    // Tenure Mode: Given desired EMI, solve for number of months (n)
    const loanInterest = parseFloat(document.getElementById("loanInterest").value);
    const desiredEMI = parseFloat(document.getElementById("loanEMI").value);
    if (loanInterest <= 0 || desiredEMI <= 0) {
      alert("Please enter valid interest rate and desired EMI.");
      return;
    }
    const r = loanInterest / 100 / 12;
    const K = desiredEMI / (loanAmount * r);
    if (K <= 1) {
        document.getElementById("loanResult").innerHTML = `<h3>Loan Calculator Results (Tenure Mode):</h3><p>Desired EMI is too low to cover the interest.</p>`;
        document.getElementById("loanChart").style.display = "none";
        return;
    }
    const n = Math.log(K/(K-1)) / Math.log(1+r);
    const years = n / 12;
    const totalPayment = desiredEMI * n;
    const totalInterest = totalPayment - loanAmount;
    document.getElementById("loanResult").innerHTML =
      `<h3>Loan Calculator Results (Tenure Mode):</h3>
       <p>Calculated Tenure: ${years.toFixed(2)} years (${Math.round(n)} months)</p>
       <p>Total Interest Payable: ${formatIndianCurrency(totalInterest.toFixed(2))}</p>
       <p>Total Payment: ${formatIndianCurrency(totalPayment.toFixed(2))}</p>`;
    document.getElementById("loanChart").style.display = "none";
  } else if (loanMode === "rate") {
    // Rate Mode: Given tenure and desired EMI, solve for the interest rate using bisection.
    const loanTenure = parseFloat(document.getElementById("loanTenure").value);
    const desiredEMI = parseFloat(document.getElementById("loanEMI").value);
    if (loanTenure <= 0 || desiredEMI <= 0) {
      alert("Please enter valid tenure and desired EMI.");
      return;
    }
    const n = loanTenure * 12;
    let low = 0.000001, high = 1, mid = 0;
    for (let i = 0; i < 50; i++){
      mid = (low + high) / 2;
      const calcEMI = loanAmount * mid * Math.pow(1+mid, n) / (Math.pow(1+mid, n) - 1);
      if (calcEMI > desiredEMI){
         high = mid;
      } else {
         low = mid;
      }
    }
    const monthlyRate = mid;
    const annualRate = monthlyRate * 12 * 100;
    const totalPayment = desiredEMI * n;
    const totalInterest = totalPayment - loanAmount;
    document.getElementById("loanResult").innerHTML =
      `<h3>Loan Calculator Results (Rate Mode):</h3>
       <p>Calculated Annual Interest Rate: ${annualRate.toFixed(2)}%</p>
       <p>Total Interest Payable: ${formatIndianCurrency(totalInterest.toFixed(2))}</p>
       <p>Total Payment: ${formatIndianCurrency(totalPayment.toFixed(2))}</p>`;
    document.getElementById("loanChart").style.display = "none";
  }
});

// ====================================
// Sidebar Navigation
// ====================================
document.addEventListener("DOMContentLoaded", function() {
  // Setup sidebar navigation
  const menuItems = document.querySelectorAll("#sidebar ul li");
  menuItems.forEach(item => {
    item.addEventListener("click", function() {
      menuItems.forEach(i => i.classList.remove("active"));
      this.classList.add("active");
      const target = this.getAttribute("data-target");
      document.querySelectorAll(".page-section").forEach(section => {
        section.classList.remove("active");
      });
      document.getElementById(target).classList.add("active");
    });
  });
  // Set default active section
  document.querySelector('#sidebar ul li[data-target="overviewSection"]').click();

  // Populate global fund list from mfapi
  populateFundList();
});

// ------------------------------------
// NEW FUNCTION: Fetch Mutual Fund Details (for meta info)
// ------------------------------------
function fetchMutualFundDetails(fundId) {
  const apiUrl = `https://api.mfapi.in/mf/${fundId}`;
  return fetch(apiUrl)
    .then(response => response.json());
}
