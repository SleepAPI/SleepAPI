/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-undef */

window.onload = function () {
  var img = new Image();
  img.src = 'spinner.gif';
};

function getQueryParams() {
  var result = '?';
  var checkboxes = document.querySelectorAll('input[type=checkbox]');
  checkboxes.forEach(function (checkbox) {
    result += checkbox.name + '=' + checkbox.checked + '&';
  });

  var e4e = document.getElementById('e4e');
  if (e4e) {
    result += 'e4e=' + +document.getElementById('e4e').value + '&';
  }
  var helpingbonus = document.getElementById('helpingbonus');
  if (helpingbonus) {
    result += 'helpingbonus=' + +document.getElementById('helpingbonus').value + '&';
  }
  var nature = document.getElementById('nature');
  if (nature) {
    result += 'nature=' + document.getElementById('nature').value + '&';
  }
  var subskills = document.getElementById('subskills');
  if (subskills) {
    result += 'subskills=' + document.getElementById('subskills').value + '&';
  }

  result += 'pretty=true&';

  result = result.slice(0, -1);
  return result;
}

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

  copyBtn.addEventListener('click', function () {
    var text = contentDiv.textContent;

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
    helpingbonus: +document.getElementById('helpingbonus').value,
    camp: document.getElementById('camp').checked,
  };

  var pokemon = document.getElementById('pokemon').value;
  var url = `calculator/production/${pokemon}?pretty=true`;

  makeRequest(
    url,
    'POST',
    function (data) {
      data = JSON.parse(data);
      createTable(
        [`Production for: ${pokemon}`],
        data.combinations,
        function (entry) {
          return entry.pokemon;
        },
        function (entry) {
          return entry.details;
        }
      );
    },
    body
  );
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
    optimalSetSolutionLimit: document.getElementById('solutionLimit').checked ? undefined : 5000,
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
          let prettyString = '👨🏻‍🍳 Sleep API - Flexibility Ranking 👨🏻‍🍳\n\n';
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

function goToMealRanking() {
  var island = document.getElementById('island').value;
  var queryParams = `?pretty=true&island=${island}`;
  var url = 'meal/' + document.getElementById('meal').value + queryParams;

  makeRequest(url, 'GET', function (data) {
    data = JSON.parse(data);
    createTable(
      [`Recipe: ${data.recipe}`],
      data.combinations,
      function (entry) {
        return entry;
      },
      function () {
        return 'No details for this ranking yet';
      }
    );
  });
}

function goToFlexibleRanking() {
  var queryParams = getQueryParams();
  var url = 'ranking/meal/flexible' + queryParams;

  makeRequest(url, 'GET', function (data) {
    data = JSON.parse(data);
    createTable(
      ['Ranking'],
      data,
      function (entry) {
        return entry;
      },
      function () {
        return 'No details for this ranking yet';
      }
    );
  });
}

function goToFocusedRanking() {
  var queryParams = getQueryParams();
  var url = 'ranking/meal/focused' + queryParams;

  makeRequest(url, 'GET', function (data) {
    data = JSON.parse(data);
    createTable(
      ['Ranking'],
      data,
      function (entry) {
        return entry;
      },
      function () {
        return 'No details for this ranking yet';
      }
    );
  });
}

function showMenu() {
  var x = document.getElementById('topnavId');
  if (x.className === 'topnav') {
    x.className += ' responsive';
  } else {
    x.className = 'topnav';
  }
}
