/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-undef */

let comparisonChartInstance = null;
function comparisonChart(
  specialty,
  userSetup,
  neutralSetup,
  optimalIngredientSetup,
  optimalBerrySetup,
  optimalSkillSetup
) {
  const ctx = document.getElementById('comparisonChart').getContext('2d');
  if (comparisonChartInstance) {
    comparisonChartInstance.destroy();
  }

  datasets = [];
  datasets.push(
    ...formatData(
      {
        berries: {
          amount: neutralSetup.berries[0].amount,
          percentage: calculatePercentageOfOptimal(
            neutralSetup.berries[0].amount,
            optimalIngredientSetup.berries[0].amount,
            optimalBerrySetup.berries[0].amount,
            optimalSkillSetup.berries[0].amount
          ),
          berry: {
            name: neutralSetup.berries[0].berry.name
          }
        },
        skills: {
          amount: neutralSetup.skills,
          percentage: calculatePercentageOfOptimal(
            neutralSetup.skills,
            optimalIngredientSetup.skills,
            optimalBerrySetup.skills,
            optimalSkillSetup.skills
          )
        },
        ingredients: neutralSetup.ingredients.map(({ amount, ingredient }, i) => ({
          ingredient,
          amount,
          percentageOfSame: calculatePercentageOfOptimal(
            amount,
            optimalIngredientSetup.ingredients[i].amount,
            optimalBerrySetup.ingredients[i].amount,
            optimalSkillSetup.ingredients[i].amount
          ),
          percentageOfTotal: calculatePercentageOfOptimal(
            amount,
            optimalIngredientSetup.ingredients.reduce((sum, cur) => sum + cur.amount, 0),
            optimalBerrySetup.ingredients.reduce((sum, cur) => sum + cur.amount, 0),
            optimalSkillSetup.ingredients.reduce((sum, cur) => sum + cur.amount, 0)
          )
        }))
      },
      'neutral',
      specialty
    )
  );
  datasets.push(
    ...formatData(
      {
        berries: {
          amount: userSetup.berries[0].amount,
          percentage: calculatePercentageOfOptimal(
            userSetup.berries[0].amount,
            optimalBerrySetup.berries[0].amount,
            optimalIngredientSetup.berries[0].amount,
            optimalSkillSetup.berries[0].amount
          ),
          berry: {
            name: userSetup.berries[0].berry.name
          }
        },
        skills: {
          amount: userSetup.skills,
          percentage: calculatePercentageOfOptimal(
            userSetup.skills,
            optimalBerrySetup.skills,
            optimalIngredientSetup.skills,
            optimalSkillSetup.skills
          )
        },
        ingredients: userSetup.ingredients.map(({ amount, ingredient }, i) => ({
          ingredient,
          amount,
          percentageOfSame: calculatePercentageOfOptimal(
            amount,
            optimalIngredientSetup.ingredients[i].amount,
            optimalBerrySetup.ingredients[i].amount,
            optimalSkillSetup.ingredients[i].amount
          ),
          percentageOfTotal: calculatePercentageOfOptimal(
            amount,
            optimalIngredientSetup.ingredients.reduce((sum, cur) => sum + cur.amount, 0),
            optimalBerrySetup.ingredients.reduce((sum, cur) => sum + cur.amount, 0),
            optimalSkillSetup.ingredients.reduce((sum, cur) => sum + cur.amount, 0)
          )
        }))
      },
      'user',
      specialty
    )
  );

  let optimalForSpecialty = optimalBerrySetup;
  if (specialty === 'ingredient') {
    optimalForSpecialty = optimalIngredientSetup;
  } else if (specialty === 'skill') {
    optimalForSpecialty = optimalSkillSetup;
  }
  datasets.push(
    ...formatData(
      {
        berries: {
          amount: optimalForSpecialty.berries[0].amount,
          percentage: calculatePercentageOfOptimal(
            optimalForSpecialty.berries[0].amount,
            optimalBerrySetup.berries[0].amount,
            optimalIngredientSetup.berries[0].amount,
            optimalSkillSetup.berries[0].amount
          ),
          berry: {
            name: optimalForSpecialty.berries[0].berry.name
          }
        },
        skills: {
          amount: optimalForSpecialty.skills,
          percentage: calculatePercentageOfOptimal(
            optimalForSpecialty.skills,
            optimalBerrySetup.skills,
            optimalIngredientSetup.skills,
            optimalSkillSetup.skills
          )
        },
        ingredients: optimalForSpecialty.ingredients.map(({ amount, ingredient }, i) => ({
          ingredient,
          amount,
          percentageOfSame: calculatePercentageOfOptimal(
            amount,
            optimalIngredientSetup.ingredients[i].amount,
            optimalBerrySetup.ingredients[i].amount,
            optimalSkillSetup.ingredients[i].amount
          ),
          percentageOfTotal: calculatePercentageOfOptimal(
            amount,
            optimalIngredientSetup.ingredients.reduce((sum, cur) => sum + cur.amount, 0),
            optimalBerrySetup.ingredients.reduce((sum, cur) => sum + cur.amount, 0),
            optimalSkillSetup.ingredients.reduce((sum, cur) => sum + cur.amount, 0)
          )
        }))
      },
      'optimal',
      specialty
    )
  );

  const labels = ['Ingredients', 'Berries', 'Skills'];
  const data = {
    labels,
    datasets
  };

  const config = {
    type: 'bar',
    data: data,
    options: {
      layout: {
        padding: {
          top: window.innerWidth <= '1000' ? 18 : 30,
          bottom: 0
        }
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            title: function (context) {
              const firstItem = context[0];
              if (!firstItem) {
                return '';
              }
              const dataset = firstItem.chart.data.datasets[firstItem.datasetIndex];
              const index = firstItem.dataIndex;

              // Check if customLabels exists and has an entry for this index, use it for the title
              if (dataset.customLabels && dataset.customLabels[index]) {
                const { setupType, specialty } = dataset.customLabels[index];

                return setupType === 'optimal'
                  ? `Optimal ${specialty}-focused setup`
                  : `${setupType === 'user' ? 'Your setup' : 'Neutral setup (no nature/subskills)'}`;
              }
              return 'Missing tooltip, contact developers';
            },
            label: function (context) {
              const dataset = context.dataset;
              const index = context.dataIndex;
              if (dataset.customLabels && dataset.customLabels[index]) {
                const { item, amount, percentage } = dataset.customLabels[index];
                return `${item}: ${roundDown(amount, 1)} (${percentage}% of max)`;
              }
              return 'Missing tooltip, contact developers';
            }
          }
        }
      },
      responsive: true,
      interaction: {
        intersect: false
      },
      scales: {
        x: {
          stacked: true,
          grid: {
            color: 'rgba(255, 255, 255, 0.1)'
          },
          ticks: {
            color: 'white',
            padding: -1
          }
        },
        y: {
          stacked: true,
          grid: {
            color: 'rgba(255, 255, 255, 0.1)'
          },
          ticks: {
            callback: function (value) {
              return value + '%';
            },
            color: 'white'
          }
        }
      }
    },
    plugins: [
      {
        id: 'stackLabels', // TODO: needed?
        beforeDatasetsDraw: (chart) => {
          const ctx = chart.ctx;
          ctx.textAlign = 'center';

          const nrOfIngs = chart.data.datasets.length / 3;

          chart.data.datasets.forEach((dataset, i) => {
            const meta = chart.getDatasetMeta(i);
            if (meta.hidden) return;

            meta.data.forEach((bar, index) => {
              if ((i + 1) % nrOfIngs !== 0 && index === 0) {
                return;
              }

              const stackName = dataset.stack;
              let labelLines = [];
              let fontSize = `${bar.width > 30 ? 14 : 6.5}px`;
              let textColor = '#bbb';

              switch (stackName) {
                case 'neutral':
                  labelLines = ['Neutral'];
                  break;
                case 'user':
                  labelLines = ['You'];
                  fontSize = `${bar.width > 30 ? 20 : 11}px`;
                  textColor = 'white';
                  break;
                case 'optimal':
                  labelLines = [`${specialty[0].toUpperCase()}${specialty.slice(1)}`, `setup`];
                  break;
                default:
                  labelLines = [''];
              }

              ctx.font = `${fontSize} Arial`;
              ctx.fillStyle = textColor;

              const lineHeight = parseInt(fontSize, 10);
              const totalHeight = lineHeight * labelLines.length;
              let yPos = bar.base - bar.height - 5 - totalHeight + lineHeight;

              labelLines.forEach((line) => {
                ctx.fillText(line, bar.x, yPos);
                yPos += lineHeight;
              });
            });
          });
        }
      }
    ]
  };

  comparisonChartInstance = new Chart(ctx, config);
}

/**
 * @param rawData Expect data in this format:
 * {
     ingredients: [
      { ingredient: { name: string }, amount: number },
     ],
     berries: {
      amount: number,
      berry: {
        name: string
      }
     },
     skills: number
   }
  * @param setupType One of neutral, user or optimal
 */
function formatData(rawData, setupType, specialty) {
  const expectedSetupTypes = ['neutral', 'user', 'optimal'];
  if (!expectedSetupTypes.includes(setupType)) {
    throw new Error(`Unexpected setup type [${setupType}], expected one of: ${expectedSetupTypes.join(', ')}`);
  }

  const arr = [];
  arr.push({
    data: [rawData.ingredients[0].percentageOfTotal, rawData.berries.percentage, rawData.skills.percentage],
    backgroundColor: [
      `#fec34f${setupType === 'user' ? 'ff' : '50'}`,
      `#23da6c${setupType === 'user' ? 'ff' : '50'}`,
      `#49a2ff${setupType === 'user' ? 'ff' : '50'}`
    ],
    borderWidth: 1,
    stack: setupType,
    customLabels: [
      {
        specialty,
        group: 'Ingredients',
        setupType,
        item: rawData.ingredients[0].ingredient.name,
        amount: rawData.ingredients[0].amount,
        percentage: rawData.ingredients[0].percentageOfSame
      },
      {
        specialty,
        group: 'Berries',
        setupType,
        item: rawData.berries.berry.name,
        amount: rawData.berries.amount,
        percentage: rawData.berries.percentage
      },
      {
        specialty,
        group: 'Skills',
        setupType,
        item: 'Skill value', // TODO: should probably also do skill procs, also skill value should probably take in unit like % or strength
        amount: rawData.skills.amount,
        percentage: rawData.skills.percentage
      }
    ]
  });

  if (rawData.ingredients.length > 1) {
    for (const ing of rawData.ingredients.slice(1)) {
      arr.push({
        data: [ing.percentageOfTotal],
        backgroundColor: `#fec34f${setupType === 'user' ? 'ff' : '50'}`,
        borderWidth: 1,
        stack: setupType,
        customLabels: [
          {
            specialty,
            group: 'Ingredients',
            setupType,
            item: ing.ingredient.name,
            amount: ing.amount,
            percentage: ing.percentageOfSame
          }
        ]
      });
    }
  }
  return arr;
}

function calculatePercentageOfOptimal(current, optimalBerry, optimalIng, optimalSkill) {
  return Math.round((current / Math.max(optimalBerry, optimalIng, optimalSkill)) * 100);
}
