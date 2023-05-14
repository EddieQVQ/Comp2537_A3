const PAGE_SIZE = 10;
let currentPage = 1;
let pokemons = [];
let filterList = [];

const updatePaginationDiv = (currentPage, numPages) => {
  $('#pagination').empty();

  const MaxNumPages = 5;
  let startPage = currentPage - Math.floor(MaxNumPages / 2);
  let endPage = currentPage + Math.floor(MaxNumPages / 2);

  if (startPage < 1) {
    startPage = 1;
    endPage = MaxNumPages;
  }

  if (endPage > numPages) {
    endPage = numPages;
    startPage = numPages - MaxNumPages + 1;
    if (startPage < 1) {
      startPage = 1;
    }
  }
  if (currentPage > 1) {
    $('#pagination').append(`
      <button class="btn btn-primary page ml-1 numberedButtons" value="${currentPage - 1}">Previous</button>
    `);
  }

  for (let i = startPage; i <= endPage; i++) {
    const activeClass = i === currentPage ? 'active' : '';
    $('#pagination').append(`
      <button class="btn btn-primary page ml-1 numberedButtons" value="${i}">${i}</button>
    `);
  }

  if (currentPage < numPages) {
    $('#pagination').append(`
      <button class="btn btn-primary page ml-1 numberedButtons" value="${currentPage + 1}">Next</button>
    `);
  }

  $('#pagination').addClass('text-center').css('margin-top', '35px');
};

const paginate = async (currentPage, PAGE_SIZE, pokemons) => {
  const filteredPokemons = filterList.length > 0
    ? pokemons.filter(pokemon => filterList.every(type => pokemon.type.includes(type)))
    : pokemons;

  const selected_pokemons = filteredPokemons.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  $('#pokeCards').empty();
  selected_pokemons.forEach(async (pokemon) => {
    const res = await axios.get(pokemon.url);
    $('#pokeCards').append(`
      <div class="pokeCard card" pokeName=${res.data.name}>
        <h3>${res.data.name.toUpperCase()}</h3> 
        <img src="${res.data.sprites.front_default}" alt="${res.data.name}"/>
        <button type="button" class="btn btn-primary" data-toggle="modal" data-target="#pokeModal">
          More
        </button>
      </div>  
    `);
  });
const showingCount = selected_pokemons.length;
$('#showing-info').text(`Showing ${showingCount} of ${filteredPokemons.length} Pokemons`);

};

const setup = async () => {
  $('#pokeCards').empty();
  let response = await axios.get('https://pokeapi.co/api/v2/pokemon?offset=0&limit=810');
  pokemons = response.data.results;

  pokemons.forEach(async (pokemon) => {
    let res = await axios.get(pokemon.url);
    let types = res.data.types.map((type) => type.type.name);
    pokemon.type = types;
    console.log('pokemons: ', types);
  });
  
  paginate(currentPage, PAGE_SIZE, pokemons);
  const numPages = Math.min(5, Math.ceil(pokemons.length / PAGE_SIZE));
  updatePaginationDiv(currentPage, numPages);

  const filterContainer = $('#pokemon-types');
  filterContainer.addClass('d-flex flex-wrap');

  let response2 = await axios.get('https://pokeapi.co/api/v2/type');
  types = response2.data.results.map((type) => type.name);
  types.forEach(async (type) => {
    $('#pokemon-types').append(`
      <div class="form-check">
        <input class="form-check-input type-filter" type="checkbox" id="${type}" value="${type}">
        <label class="form-check-label" for="${type}">
          ${type}
        </label>
      </div>
    `);
  });

  $('#filter-button').click(function () {
    var checkedCheckboxes = $('input:checkbox:checked.type-filter');
    checkedCheckboxes.each(function(index, element) {
      console.log($(element).val         );
    });

    filterList = checkedCheckboxes
      .map(function(index, element) {
        return $(element).val();
      })
      .get();
    console.log(filterList);

    let filteredPokemons = [];
    for (const pokemon of pokemons) {
      if (filterList.every((type) => pokemon.type.includes(type))) {
        filteredPokemons.push(pokemon);
      }
    }

    paginate(currentPage, PAGE_SIZE, filteredPokemons);
    const numPages = Math.ceil(filteredPokemons.length / PAGE_SIZE);
    updatePaginationDiv(currentPage, numPages);
  });

  $('body').on('click', '.pokeCard', async function (e) {
    const pokemonName = $(this).attr('pokeName');
    const res = await axios.get(`https://pokeapi.co/api/v2/pokemon/${pokemonName}`);
    const types = res.data.types.map((type) => type.type.name);
    $('.modal-body').html(`
      <div style="width:200px">
        <img src="${res.data.sprites.other['official-artwork'].front_default}" alt="${res.data.name}"/>
        <div>
          <h3>Abilities</h3>
          <ul>
            ${res.data.abilities.map((ability) => `<li>${ability.ability.name}</li>`).join('')}
          </ul>
        </div>
  
        <div>
          <h3>Stats</h3>
          <ul>
            ${res.data.stats.map((stat) => `<li>${stat.stat.name}: ${stat.base_stat}</li>`).join('')}
          </ul>
        </div>
      </div>
      <h3>Types</h3>
      <ul>
        ${types.map((type) => `<li>${type}</li>`).join('')}
      </ul>
    `);
    $('.modal-title').html(`
      <h2>${res.data.name.toUpperCase()}</h2>
      <h5>${res.data.id}</h5>
    `);
  });

  $('body').on('click', '.numberedButtons', async function (e) {
    currentPage = Number(e.target.value);
    paginate(currentPage, PAGE_SIZE, pokemons);
    updatePaginationDiv(currentPage, numPages);
  });
};

$(document).ready(setup);

