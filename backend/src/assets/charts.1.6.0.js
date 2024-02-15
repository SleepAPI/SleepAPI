/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-undef */

function prettifyTime(time) {
  const hourString = String(time.hour).padStart(2, '0');
  const minuteString = String(time.minute).padStart(2, '0');

  return `${hourString}:${minuteString}`;
}

function roundDown(value, decimals) {
  const factor = Math.pow(10, decimals);
  return Math.floor(value * factor) / factor;
}

let energyChartInstance = null;
function energyChart(log) {
  // data
  const energyLogs = log.filter((entry) => entry.type === 'energy');
  const labels = energyLogs.map((entry) => prettifyTime(entry.time));
  const data = energyLogs.map((entry) => entry.after);

  let pointRadii = new Array(energyLogs.length).fill(0);
  let pointHoverRadii = new Array(energyLogs.length).fill(0);

  pointRadii[0] = 3;
  pointHoverRadii[0] = 5;

  for (let i = 1; i < energyLogs.length; i++) {
    if (
      (energyLogs[i].delta >= 0 && energyLogs[i].after !== 0) ||
      (energyLogs[i].after === 0 && energyLogs[i].before > 0)
    ) {
      pointRadii[i] = 3;
      pointHoverRadii[i] = 5;
    }
  }

  const ctx = document.getElementById('energyChart').getContext('2d');
  if (energyChartInstance) {
    energyChartInstance.destroy();
  }

  const config = {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          data,
          borderWidth: 1,
          borderColor: '#f04545',
          tension: 0.1,
          pointRadius: pointRadii,
          pointHoverRadius: pointHoverRadii,
          pointBackgroundColor: '#f04545',
          fill: true,
        },
      ],
    },
    options: {
      scales: {
        x: {
          ticks: {
            maxRotation: 0,
            autoSkip: true,
            // maxTicksLimit: 8,
            color: 'white',
            callback: function (value, index, values) {
              const { hour: currH, minute: currM } = energyLogs[index].time;
              const { hour: firstH, minute: firstM } = energyLogs[0].time;
              const hourDiff = currH < firstH ? currH + 24 - firstH : currH - firstH;
              if (index === 0) {
                // always add first label
                return labels[index];
              } else if (!(currH === firstH && currM === firstM) && firstM === currM && hourDiff % 3 === 0) {
                // don't add duplicate labels
                // add label every 3 hours
                return labels[index];
              } else if (index === energyLogs.length - 1) {
                // always add last label
                return labels[index];
              }
            },
          },
          grid: {
            color: 'rgba(255, 255, 255, 0.1)',
          },
        },
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 20,
            color: 'white',
          },
          grid: {
            color: 'rgba(255, 255, 255, 0.1)',
          },
        },
      },
      plugins: {
        tooltip: {
          callbacks: {
            label: function (context) {
              const index = context.dataIndex;
              const energyLog = energyLogs[index];
              const deltaSigned = `${energyLog.delta > 0 ? '+' : ''}${energyLog.delta}%`;
              return `${energyLog.description}: ${energyLog.before} -> ${energyLog.after} (${deltaSigned})`;
            },
          },
        },
        legend: {
          display: false,
          labels: {
            color: 'white', // if we want to show legend again we want white
          },
        },
      },
    },
  };

  energyChartInstance = new Chart(ctx, config);
}

let inventoryChartInstance = null;
let inventoryTimeHour = null;
function inventoryChart(log) {
  // skip sneaky snack inventory and spilled ingredients
  const inventoryLogs = log.filter(
    (entry) => entry.type === 'inventory' && (entry.description === 'Add' || entry.description === 'Empty')
  );
  const labels = inventoryLogs.map((entry) => entry.time).map(prettifyTime);
  const data = inventoryLogs.map((entry) => entry.after);
  const max = inventoryLogs[0].max;
  inventoryTimeHour = inventoryLogs[0].time.hour;

  const ctx = document.getElementById('inventoryChart').getContext('2d');
  if (inventoryChartInstance) {
    inventoryChartInstance.destroy();
  }

  if (ctx.chart && typeof ctx.chart.destroy === 'function') {
    ctx.chart.destroy();
  }

  const config = {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Inventory',
          data,
          borderWidth: 1,
          borderColor: '#f04545',
          tension: 0.1,
          pointRadius: 3,
          pointHoverRadius: 5,
          pointBackgroundColor: '#f04545',
          fill: true,
        },
      ],
    },
    options: {
      scales: {
        x: {
          ticks: {
            maxRotation: 0,
            autoSkip: true,
            maxTicksLimit: 8,
            color: 'white',
          },
          grid: {
            color: 'rgba(255, 255, 255, 0.1)',
          },
        },
        y: {
          beginAtZero: true,
          max,
          ticks: {
            color: 'white',
          },
          grid: {
            color: 'rgba(255, 255, 255, 0.1)',
          },
        },
      },
      plugins: {
        tooltip: {
          callbacks: {
            label: function (context) {
              const index = context.dataIndex;
              const inventoryLog = inventoryLogs[index];
              const filled =
                inventoryLog.max &&
                `${inventoryLog.after}/${inventoryLog.max} (${Math.max(
                  roundDown(100 * (inventoryLog.after / inventoryLog.max), 2),
                  0
                )}%)`;
              return `${inventoryLog.description}: ${inventoryLog.before} -> ${inventoryLog.after}, filled: ${filled}`;
            },
          },
        },
        legend: {
          display: false,
          labels: {
            color: 'white', // if we want to show legend again, we want white
          },
        },
      },
    },
  };

  inventoryChartInstance = new Chart(ctx, config);
}
