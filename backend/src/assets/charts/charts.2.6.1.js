/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-undef */

let energyChartInstance = null;
function energyChart(log) {
  // data
  const energyLogs = log.filter((entry) => entry.type === 'energy');
  const labels = energyLogs.map((entry) => prettifyTime(entry.time));
  const data = energyLogs.map((entry) => entry.after);

  let pointRadii = new Array(energyLogs.length).fill(0);
  let pointHoverRadii = new Array(energyLogs.length).fill(0);

  pointRadii[0] = 3;
  pointRadii[pointRadii.length - 1] = 3;
  pointHoverRadii[0] = 5;
  pointHoverRadii[pointHoverRadii.length - 1] = 5;

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
            color: 'white',
            callback: function (value, index, values) {
              const { hour: currH, minute: currM } = energyLogs[index].time;
              const { hour: firstH, minute: firstM } = energyLogs[0].time;
              const hourDiff = currH < firstH ? currH + 24 - firstH : currH - firstH;

              const isDuplicate =
                index !==
                energyLogs.map((e) => e.time).findIndex(({ hour, minute }) => hour === currH && minute === currM);

              if (index === 0) {
                // always add first label
                return labels[index];
              } else if (!isDuplicate && firstM === currM && hourDiff % 3 === 0) {
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
function inventoryChart(log) {
  // Skip unwanted inventory logs and prepare data
  const inventoryLogs = log.filter(
    (entry) =>
      entry.type === 'inventory' &&
      entry.description !== 'Sneaky snack' &&
      entry.description !== 'Sneaky snack claim' &&
      entry.description !== 'Spilled ingredients'
  );

  let previousTimeMinutes = 0;
  let additionalDays = 0;
  const scatterData = inventoryLogs.map((entry, index) => {
    const [hours, minutes] = prettifyTime(entry.time).split(':').map(Number);
    const currentTimeMinutes = hours * 60 + minutes;
    if (index > 0 && currentTimeMinutes < previousTimeMinutes) {
      additionalDays += 1440;
    }
    previousTimeMinutes = currentTimeMinutes;
    return {
      x: currentTimeMinutes + additionalDays,
      y: entry.after,
      originalTime: entry.time,
    };
  });

  const X_RANGE_OFFSET = 30;
  const xAxisStart = scatterData[0].x - X_RANGE_OFFSET;
  const xAxisEnd = scatterData[scatterData.length - 1].x + X_RANGE_OFFSET;

  const max = inventoryLogs[0].max + 1;

  const ctx = document.getElementById('inventoryChart').getContext('2d');
  if (inventoryChartInstance) {
    inventoryChartInstance.destroy();
  }

  const config = {
    type: 'line',
    data: {
      datasets: [
        {
          label: 'Inventory',
          data: scatterData,
          borderWidth: 1,
          borderColor: '#f04545',
          tension: 0,
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
          type: 'linear',
          min: xAxisStart,
          max: xAxisEnd,
          afterBuildTicks: (scale) => {
            const ticks = [];
            for (let i = scale.min + X_RANGE_OFFSET; i <= scale.max; i += 180) {
              ticks.push({ value: i });
            }
            scale.ticks = ticks;
          },
          ticks: {
            callback: (value) => {
              const totalMinutes = value % 1440;
              const hours = Math.floor(totalMinutes / 60);
              const minutes = totalMinutes % 60;
              return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
            },
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
            title: function (tooltipItems) {
              const tooltipItem = tooltipItems[0];
              const dataIndex = tooltipItem.dataIndex;
              const inventoryLog = inventoryLogs[dataIndex];
              return `[${prettifyTime(inventoryLog.time)}] Inventory: ${prettifyProduce(inventoryLog.contents)}`;
            },
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
            color: 'white',
          },
        },
      },
    },
  };

  inventoryChartInstance = new Chart(ctx, config);
}

let skillChartInstance = null;
function skillChart(log) {
  const skillLogs = log.filter((entry) => entry.type === 'skill' && !entry.description.toLowerCase().includes('team'));

  // set x, y values for input data
  let previousTimeMinutes = 0;
  let additionalDays = 0;
  const scatterData = skillLogs.map((entry, index) => {
    const [hours, minutes] = prettifyTime(entry.time).split(':').map(Number);
    const currentTimeMinutes = hours * 60 + minutes;
    if (index > 0 && currentTimeMinutes < previousTimeMinutes) {
      additionalDays += 1440;
    }
    previousTimeMinutes = currentTimeMinutes;
    return {
      x: currentTimeMinutes + additionalDays,
      y: entry.skillActivation.fractionOfProc * 100,
      originalTime: entry.time,
    };
  });

  // set radius, remove last
  let pointRadii = new Array(skillLogs.length).fill(0);
  let pointHoverRadii = new Array(skillLogs.length).fill(0);

  for (let i = 0; i < skillLogs.length - 1; i++) {
    pointRadii[i] = 9;
    pointHoverRadii[i] = 11;
  }

  const X_RANGE_OFFSET = 30;
  const xAxisStart = scatterData[0].x - X_RANGE_OFFSET;
  const xAxisEnd = scatterData[scatterData.length - 1].x + X_RANGE_OFFSET;

  const Y_RANGE_OFFSET = 10;
  const max = Math.max(...scatterData.map((point) => point.y)) + Y_RANGE_OFFSET;

  const ctx = document.getElementById('skillChart').getContext('2d');
  if (skillChartInstance) {
    skillChartInstance.destroy();
  }

  const config = {
    type: 'scatter',
    data: {
      datasets: [
        {
          label: 'Skill',
          data: scatterData,
          borderWidth: 1,
          borderColor: '#f04545',
          tension: 0,
          pointRadius: pointRadii,
          pointHoverRadius: pointHoverRadii,
          pointBackgroundColor: '#f04545',
        },
      ],
    },
    options: {
      scales: {
        x: {
          type: 'linear',
          categoryPercentage: 0.1,
          barPercentage: 0.1,
          min: xAxisStart,
          max: xAxisEnd,
          afterBuildTicks: (scale) => {
            const ticks = [];
            for (let i = scale.min + X_RANGE_OFFSET; i <= scale.max; i += 180) {
              ticks.push({ value: i });
            }
            scale.ticks = ticks;
          },
          ticks: {
            callback: (value) => {
              const totalMinutes = value % 1440;
              const hours = Math.floor(totalMinutes / 60);
              const minutes = totalMinutes % 60;
              return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
            },
            color: 'white',
          },
          grid: {
            color: 'rgba(255, 255, 255, 0.1)',
          },
        },
        y: {
          categoryPercentage: 0.1,
          barPercentage: 0.1,
          beginAtZero: true,
          max,
          afterBuildTicks: (scale) => {
            const ticks = [];
            for (let i = 0; i <= scale.max - Y_RANGE_OFFSET; i += 20) {
              ticks.push({ value: i });
            }
            scale.ticks = ticks;
          },
          ticks: {
            callback: function (value) {
              return value + '%';
            },
            color: 'white',
          },
          grid: {
            color: 'rgba(255, 255, 255, 0.1)',
          },
          title: {
            display: true,
            text: 'Chance to proc',
            color: 'white',
            font: {
              size: 12,
            },
          },
        },
      },
      plugins: {
        tooltip: {
          callbacks: {
            title: function (tooltipItems) {
              const tooltipItem = tooltipItems[0];
              const dataIndex = tooltipItem.dataIndex;
              const inventoryLog = skillLogs[dataIndex];
              return prettifyTime(inventoryLog.time);
            },
            label: function (context) {
              const index = context.dataIndex;
              const skillEvent = skillLogs[index];
              return `${skillEvent.description}: ${roundDown(
                skillEvent.skillActivation.adjustedAmount,
                2
              )} (${roundDown(skillEvent.skillActivation.fractionOfProc * 100, 2)}%)`;
            },
          },
        },
        legend: {
          display: false,
          labels: {
            color: 'white',
          },
        },
      },
      responsive: true,
    },
  };

  skillChartInstance = new Chart(ctx, config);
}
