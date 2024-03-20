/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-undef */

window.onload = function () {
  var img = new Image();
  img.src = 'spinner.gif';
};

function makeRequest(url, method, callback, body) {
  var xmlhttp = new XMLHttpRequest();
  var apiUrl = 'api/' + url;

  // add loading indicator while waiting for response
  xmlhttp.onreadystatechange = function () {
    if (this.readyState == 1) {
      setTimeout(function () {
        document.getElementById('spinner-div').style.display = 'block';
      }, 0);
    } else if (this.readyState == 4) {
      document.getElementById('spinner-div').style.display = 'none';
      callback(this.responseText);
    }
  };

  xmlhttp.open(method, apiUrl, true);
  xmlhttp.setRequestHeader('Content-Type', 'application/json');
  xmlhttp.send(JSON.stringify(body));
}

function createTable(headers, entries, entryHeaderCallback, entryDetailCallback, headerImageCallback) {
  var table = document.createElement('table');
  table.classList.add('centerTable');

  // Iterate headers for table (recipe / showing X results etc)
  for (var j = 0; j < headers.length; j++) {
    var thead = document.createElement('thead');
    var th = document.createElement('th');
    th.textContent = headers[j];
    thead.appendChild(th);
    table.appendChild(thead);
  }

  // Iterate data to put in table
  for (var i = 0; i < entries.length; i++) {
    var tr = document.createElement('tr');
    var td = document.createElement('td');

    var btn = document.createElement('button');
    btn.classList.add('collapsible');
    btn.textContent = entryHeaderCallback(entries[i]);
    btn.style.whiteSpace = 'pre-line';
    if (headerImageCallback) {
      headerImageCallback(btn, entries[i]);
    }

    var contentDiv = document.createElement('div');
    contentDiv.classList.add('content');
    contentDiv.style.whiteSpace = 'pre-line';
    contentDiv.style.position = 'relative';
    contentDiv.style.backgroundColor = '#555';
    contentDiv.style.color = '#f5f5f5';

    // add the copy button to the content div element
    var copyBtn = createCopyButton(contentDiv, i);

    copyBtn.style.position = 'absolute';

    // position the copy button within the content div
    copyBtn.style.top = '0px';
    copyBtn.style.right = '0px';

    // add some details to the div element
    contentDiv.appendChild(document.createTextNode(entryDetailCallback(entries[i])));

    copyBtn.querySelector('.fa').style.fontSize = '150%';
    copyBtn.style.border = 'none';
    copyBtn.style.background = 'none';
    copyBtn.style.cursor = 'pointer';
    copyBtn.style.outline = 'none';

    contentDiv.appendChild(copyBtn);

    td.appendChild(btn);
    td.appendChild(contentDiv);

    tr.appendChild(td);

    table.appendChild(tr);
  }

  var div = document.querySelector('#rankings');

  var oldTable = div.querySelector('table');
  if (oldTable) {
    div.removeChild(oldTable);
  }
  div.appendChild(table);
  document.getElementById('rankings').scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' });

  var coll = document.getElementsByClassName('collapsible');
  var k;
  for (k = 0; k < coll.length; k++) {
    coll[k].addEventListener('click', function () {
      this.classList.toggle('active');
      var content = this.nextElementSibling;
      if (content.style.maxHeight) {
        content.style.maxHeight = null;
      } else {
        content.style.maxHeight = content.scrollHeight + 'px';
      }
    });
  }
}

function createCopyButton(contentDiv, index) {
  var copyBtn = document.createElement('button');
  copyBtn.classList.add('copy-button');
  copyBtn.id = 'copy-button-' + index;

  var icon = document.createElement('i');
  icon.classList.add('fa', 'fa-copy');
  copyBtn.appendChild(icon);
  copyBtn.style.color = '#f5f5f5';

  copyBtn.addEventListener('click', function () {
    var text = contentDiv.innerText;

    navigator.clipboard.writeText(text).then(
      function () {
        copyBtn.style.color = 'green';
      },
      function (err) {
        console.error('Async Clipboard API error:', err);
        var range = document.createRange();
        range.selectNode(contentDiv);
        window.getSelection().removeAllRanges();
        window.getSelection().addRange(range);
        var success = document.execCommand('copy');
        window.getSelection().removeAllRanges();
        if (success) {
          copyBtn.style.color = 'green';
        } else {
          copyBtn.style.color = 'red';
        }
      }
    );
  });

  return copyBtn;
}

let downloadData = {
  text: '',
  filename: '',
};
function downloadTextFile() {
  const blob = new Blob([downloadData.text], { type: 'text/plain' });

  const link = document.createElement('a');
  link.download = downloadData.filename;
  link.href = window.URL.createObjectURL(blob);

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function showMenu() {
  var x = document.getElementById('topnavId');
  if (x.className === 'topnav') {
    x.className += ' responsive';
  } else {
    x.className = 'topnav';
  }
}

// --- API CALLS ---

function goToProductionCalculator() {
  var checkedValues = [];
  var checkboxes = document.querySelectorAll('input[type="checkbox"]:checked');
  for (var checkbox of checkboxes) {
    checkedValues.push(checkbox.value);
  }

  var body = {
    level: +document.getElementById('level').value,
    nature: document.getElementById('nature').value,
    subskills: checkedValues,
    e4e: +document.getElementById('e4e').value,
    cheer: 0, // TODO: hard-coded
    extraHelpful: 0, // TODO: hard-coded
    uniqueHelperBoost: 0, // TODO: hard-coded
    helpingbonus: +document.getElementById('helpingbonus').value,
    camp: document.getElementById('camp').checked,
    erb: +document.getElementById('erb').value,
    recoveryincense: false, // TODO: hard-coded
    skillLevel: +document.getElementById('skilllevel').value,
    mainBedtime: document.getElementById('mainBedtime').value,
    mainWakeup: document.getElementById('mainWakeup').value,
    ingredientSet: document.getElementById('ingredientDropdown').getAttribute('data-combination').split('/'),
  };

  var pokemon = document.getElementById('pokemon').value;
  var url = `calculator/production/${pokemon}?pretty=true`;

  makeRequest(
    url,
    'POST',
    function (data) {
      data = JSON.parse(data);

      // draw charts
      const container = document.getElementById('chartContainer');
      container.classList.add('show');

      // add production output
      const productionHeaderDiv = document.getElementById('placeholderHeaderId');
      const productionOutputText = data.production.details;
      const productionDiv = document.getElementById('productionOutputId');
      productionDiv.innerText = productionOutputText;

      // Remove existing pokemon images
      const pokemonImages = productionHeaderDiv.getElementsByClassName('pokemon-img');
      while (pokemonImages.length > 0) {
        productionHeaderDiv.removeChild(pokemonImages[0]);
      }
      // Remove existing images
      const ingImages = productionHeaderDiv.getElementsByClassName('ingredient-img');
      while (ingImages.length > 0) {
        productionHeaderDiv.removeChild(ingImages[0]);
      }

      // Add new Pokemon image
      var img = document.createElement('img');
      img.src = `./pokemon/${data.production.pokemon.toLowerCase()}.png`;
      img.className = 'pokemon-img';
      productionHeaderDiv.appendChild(img);

      // Append ingredients
      for (const ing of data.production.ingredients) {
        var ingImg = document.createElement('img');
        ingImg.src = `./ingredient/${ing.toLowerCase()}.png`;
        ingImg.className = 'ingredient-img';
        productionHeaderDiv.appendChild(ingImg);
      }

      appendCaretIcon('placeholderHeaderId');

      // add allIngredientSets
      const allIngSetsHeaderText = data.allIngredientSets.pokemon;
      document.getElementById('allIngredientSetsHeaderId').innerText = allIngSetsHeaderText;
      const allIngredientSetsText = data.allIngredientSets.details;
      const allIngredientSetsDiv = document.getElementById('allIngredientSetsOutputId');
      allIngredientSetsDiv.innerText = allIngredientSetsText;
      appendCaretIcon('allIngredientSetsHeaderId');

      function appendCaretIcon(headerId) {
        const header = document.getElementById(headerId);
        // Remove existing caret icons
        const existingCarets = header.getElementsByClassName('fa-caret-down');
        while (existingCarets.length > 0) {
          existingCarets[0].parentNode.removeChild(existingCarets[0]);
        }
        // Append new caret icon
        header.innerHTML += ' <i class="fa fa-caret-down"></i>';
      }

      // ---- add copy buttons
      var copyBtn = createCopyButton(productionDiv, 0);
      copyBtn.style.position = 'absolute';
      copyBtn.style.right = '0px';
      copyBtn.querySelector('.fa').style.fontSize = '150%';
      copyBtn.style.border = 'none';
      copyBtn.style.background = 'none';
      copyBtn.style.cursor = 'pointer';
      copyBtn.style.outline = 'none';
      productionDiv.appendChild(copyBtn);
      var copyBtn2 = createCopyButton(allIngredientSetsDiv, 1);
      copyBtn2.style.position = 'absolute';
      copyBtn2.style.right = '0px';
      copyBtn2.querySelector('.fa').style.fontSize = '150%';
      copyBtn2.style.border = 'none';
      copyBtn2.style.background = 'none';
      copyBtn2.style.cursor = 'pointer';
      copyBtn2.style.outline = 'none';
      allIngredientSetsDiv.appendChild(copyBtn2);
      // ----

      energyChart(data.production.log);
      inventoryChart(data.production.log);
      skillChart(data.production.log);

      // add download event log content
      downloadData.text = data.production.prettyLog;
      downloadData.filename = data.production.logName;

      container.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' });
    },
    body
  );
}

function getPokemonIngredients(pokemonName) {
  var url = 'pokemon/' + pokemonName;
  makeRequest(url, 'GET', function (data) {
    var pokemonInfo = JSON.parse(data);

    // parse ingredients
    var ing0 = pokemonInfo.ingredient0.ingredient.name;
    var [ing30_1, ing30_2] = pokemonInfo.ingredient30.map((ing) => ing.ingredient.name);
    var [ing60_1, ing60_2, ing60_3] = pokemonInfo.ingredient60.map((ing) => ing.ingredient.name);

    var ingredients = [];
    ingredients.push(`${ing0}/${ing30_1}/${ing60_1}`); // AAA
    ingredients.push(`${ing0}/${ing30_2}/${ing60_1}`); // ABA
    ingredients.push(`${ing0}/${ing30_1}/${ing60_2}`); // AAB
    ingredients.push(`${ing0}/${ing30_2}/${ing60_2}`); // ABB

    if (ing60_3) {
      ingredients.push(`${ing0}/${ing30_1}/${ing60_3}`); // AAC
      ingredients.push(`${ing0}/${ing30_2}/${ing60_3}`); // ABC
    }

    populateIngredientOptions(ingredients);
  });
}

function goToOptimalRanking() {
  var checkedValues = [];
  var checkboxes = document.querySelectorAll('input[type="checkbox"]:checked');
  for (var checkbox of checkboxes) {
    checkedValues.push(checkbox.value);
  }

  var body = {
    level: +document.getElementById('level').value,
    nature: document.getElementById('nature').value,
    subskills: checkedValues,
    island: document.getElementById('island').value,
    e4e: +document.getElementById('e4e').value,
    helpingbonus: +document.getElementById('helpingbonus').value,
    camp: document.getElementById('camp').checked,
  };

  var url = 'optimal/meal/' + document.getElementById('optimalMeal').value + '?pretty=true';

  makeRequest(
    url,
    'POST',
    function (data) {
      data = JSON.parse(data);
      headers = [`Recipe: ${data.recipe}`, `${data.info}\n`];
      createTable(
        headers,
        data.teams,
        function (entry) {
          return entry.team;
        },
        function (entry) {
          return entry.details;
        }
      );
    },
    body
  );
}

function goToTierLists(createTierListF) {
  var levelVersion = document.getElementById('mode').checked;
  var potLimit = document.getElementById('potLimit').checked;
  var tierlistType = document.getElementById('tierlistType').value;

  const queryParams = `?tierlistType=${tierlistType}&limit50=${!levelVersion}&potLimit=${!potLimit}&pretty=true`;
  var url = 'tierlist' + queryParams;

  makeRequest(url, 'GET', function (data) {
    data = JSON.parse(data);
    createTierListF(data);
  });
}

function goToOptimalFlexible() {
  var body = {
    level: +document.getElementById('level').value,
    island: document.getElementById('island').value,
    e4e: +document.getElementById('e4e').value,
    helpingbonus: +document.getElementById('helpingbonus').value,
    camp: document.getElementById('camp').checked,
    maxPotSize: +document.getElementById('maxPotSize').value,
  };

  var url = 'optimal/meal/flexible?pretty=true';

  makeRequest(
    url,
    'POST',
    function (data) {
      data = JSON.parse(data);
      headers = [`Flexible cooking ranking\n`];
      createTable(
        headers,
        data,
        function (entry) {
          return `[#${entry.rank}]`;
        },
        function (entry) {
          let prettyString = '👨🏻‍🍳 Flexibility Ranking 👨🏻‍🍳\nhttps://sleepapi.net\n\n';
          prettyString += `${entry.prettyPokemonCombination}\n`;
          prettyString += `Rank: ${entry.rank}\n`;
          prettyString += `Score: ${entry.score}`;
          prettyString += entry.input;

          for (meal of entry.countedMeals) {
            prettyString += meal + '\n';
          }

          return prettyString;
        },
        function (btn, entry) {
          var img = document.createElement('img');
          img.src = `./pokemon/${entry.pokemon.toLowerCase()}.png`;
          img.className = 'img-fluid';
          img.onload = function () {
            img.style.width = img.naturalWidth * 0.3 + 'px';
            img.style.height = img.naturalHeight * 0.3 + 'px';
          };
          btn.appendChild(img);

          // append ingredients
          for (const ing of entry.ingredientList) {
            var ingImg = document.createElement('img');
            ingImg.src = `./ingredient/${ing.ingredient.name.toLowerCase()}.png`;
            ingImg.className = 'ingredient-img';
            btn.appendChild(ingImg);
          }
        }
      );
    },
    body
  );
}
