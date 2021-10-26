// onInit page
$(() => {
    url = 'https://api.themoviedb.org/3/discover/movie?api_key=6d2bf29a923eeafd87be4c92170e4a45&language=vi-VN';

    getCategory();
    getCountry();
    getSortby();
    getMovieDefault();

    currentPage = 1;

    // get value Category when select  option of Category
    $('#category').change(function(){ 
        getValueFilter();
    });

    // get value country when select  option of country
    $('#country').change(function(){ 
        getValueFilter();
    });

    // get value year when select  option of year
    $('#year').change(function(){ 
        getValueFilter();
    });

    // get value sort when select  option of sort
    $('#sort').change(function(){ 
        getValueFilter();
    });
});

async function getCategory() {
    category = await $.get('https://api.themoviedb.org/3/genre/movie/list?api_key=6d2bf29a923eeafd87be4c92170e4a45&language=vi-VN');
    
    category.genres.forEach(item => {
        $('#category').append(`<option value = "${item.id}">${item.name}</option>`);
    });
};

async function getCountry() {
    country = await $.get('https://api.themoviedb.org/3/configuration/languages?api_key=6d2bf29a923eeafd87be4c92170e4a45&language=vi-VN');
    country.forEach(item => {
        $('#country').append(`<option value = "${item.iso_639_1}">${item.english_name}</option>`);
    });
};

async function getSortby() {
    
    sort = {
        'popularity.desc' : 'Ngày cập nhật',
        'primary_release_date.desc' : 'Ngày phát hành',
        'vote_average.desc' : 'Điểm đánh giá'
    };

    keySort = Object.keys(sort);

    for (let key of keySort) {
        let valueSort = sort[key];
        $('#sort').append(`<option value = "${key}">${valueSort}</option>`);
    };
};

async function getMovieDefault() {
    movie = await $.get(`${url}&sort_by=popularity.desc&page=1`);
    movieList = Object.values(movie);
    getMovie = movieList[1].splice(0,5);

    appendMovie(getMovie);

    $('.title-movie').show();
    $('#empty-movie').hide();
    $('#pagination').hide();
};

function appendMovie(data) {
    data.forEach(item => {

        // check poster_path
        if(item.poster_path === null) {
            hidePaAndShowEmp();
            return;
        };

        $('#main-filter').append(
            `
                <div class="filter-movie">
                <img class="card-img-top" src="https://image.tmdb.org/t/p/w342${item.poster_path}">
                <div>
                    <h5 class="card-title">${item.title}</h5>
                    <h6 class="card-subtitle mb-2 text-muted">${item.original_title}</h6>
                </div>
                </div>
            `
        )
    });

    // show or hide empty movie and pagination
    $('#main-filter').find('h5:first').text() < 1 ? hidePaAndShowEmp() : showPaAndHideEmp();
};

async function filterMovie(urlFilter) {

    // check current page and call api
    if(currentPage === 1) {
        movie = await $.get(`${urlFilter}&page=1`);
    }
    else {
        movie = await $.get(`${urlFilter}&page=${currentPage}`);
    };
    
    totalPage = movie.total_pages;

    $('#main-filter').empty();
    $('#pagination').empty();

    // check total results
    if(movie.total_results === 0) {
        hidePaAndShowEmp();
        return;
    }

    getValueMovieList(movie, totalPage);
};

function getValueMovieList(movie, totalPage) {
    movieList = Object.values(movie);
    getMovie = movieList[1];

    appendPage(totalPage);
    appendMovie(getMovie);
    showOrHideNextAndPrev(totalPage);
};

// show and hide pagination/ empty movie
function hidePaAndShowEmp() {
    $('#pagination').hide();
    $('#empty-movie').show();
};

function showPaAndHideEmp() {
    $('#pagination').show();
    $('#empty-movie').hide();
};

// show and hide nex page/ prev page
function showOrHideNextAndPrev(totalPage) {
    if(totalPage === 1) {
        $('#prev-page').hide();
        $('#next-page').hide();
    }
    else if(currentPage === 1) {
        $('#prev-page').hide();
    }
    else if(currentPage === totalPage){
        $('#next-page').hide();
    };
};

// validation and get url 
function validation(sort, year, category, country) {

    urlFilter = `${url}&sort_by=${sort}&primary_release_year=${year}&with_genres=${category}&with_original_language=${country}`;
    filterMovie(urlFilter);
};

function getValueFilter() {
    category = $('#category').val();
    country = $('#country').val();
    year = $('#year').val();
    sort = $('#sort').val();

    currentPage = 1;
    validation(sort, year, category, country);
    $('.title-movie').hide();
};

function appendPage(totalPage) {
    liCon = [];

    if(currentPage < 6) {
            for (i = 1; i<= 5; i++) {
                liCon.push(`<li class="page-item"><a class="page-link" href="#" onclick="loadPage(event)">${i}</a></li>`);
            };
            $('#pagination').append(
                `
                    <nav aria-label="Page navigation example" id="pagination-left">
                        <ul class="pagination">
                            ${liCon.join('')}
                            <li class="page-item"><span class="page-link">…</span></li>
                            <li class="page-item"><a class="page-link number-page" href="#" onclick="loadPage(event)">${totalPage}</a></li>
                        </ul>
                    </nav>
                    
                    <nav aria-label="Page navigation example" id="pagination-right">
                        <a class="page-link" href="#" id="prev-page" onclick="prevPage()">Trang trước</a>
                        <a class="page-link" href="#" id="next-page" onclick="nextPage()">Trang sau</a>
                    </nav>
                `
            );

            if(currentPage === 1) {
                $('.page-link').addClass('page-default');
                $('#pagination-left').find('a:first').addClass('is-current disable-page-hover');
            }
            else {
                $('.page-link').addClass('page-default');
        
                li = $('#pagination-left').find(`li:nth-child(${currentPage})`);
                a = li.find('a:first');
                a.addClass('is-current disable-page-hover');
            };
    }
    else {
            for (i = 0; i< 5; i++) {
                liCon.push(`<li class="page-item"><a class="page-link" href="#" onclick="loadPage(event)">${currentPage + i}</a></li>`);
            };
            $('#pagination').append(
                `
                    <nav aria-label="Page navigation example" id="pagination-left">
                        <ul class="pagination">
                            <li class="page-item"><a class="page-link" href="#" onclick="loadPage(event)">1</a></li>
                            <li class="page-item"><span class="page-link">…</span></li>
                            ${liCon.join('')}
                            <li class="page-item"><span class="page-link">…</span></li>
                            <li class="page-item"><a class="page-link number-page" href="#" onclick="loadPage(event)">${totalPage}</a></li>
                        </ul>
                    </nav>
                    
                    <nav aria-label="Page navigation example" id="pagination-right">
                        <a class="page-link" href="#" id="prev-page" onclick="prevPage()">Trang trước</a>
                        <a class="page-link" href="#" id="next-page" onclick="nextPage()">Trang sau</a>
                    </nav>
                `
            );

            $('.page-link').addClass('page-default');
            li = $('#pagination-left').find(`li:nth-child(3)`);
            a = li.find('a:first');
            a.addClass('is-current disable-page-hover');
    };

    validationPage(totalPage);
};

function validationPage(totalPage) {
    if(totalPage < 6) {
        numberOfRun = 7 - totalPage;
        for(i = 0; i < numberOfRun; i++) {
            $('#pagination-left').find('li:last').remove();
        };
        return;
    }

    for(i = 2; i <= 6; i++) {
        
        li = $('#pagination-left').find(`li:nth-child(${i})`);
        value = parseInt(li.find('a:first').text());
        numberOfRun = 9 - i;

        if(value === totalPage) {
            for(j = 0; j < numberOfRun; j++) {
                $('#pagination-left').find('li:last').remove();
            }
        };
    };
};

function nextPage() {
    totalPage = $('#pagination').find('li:last').text();

    if(currentPage < totalPage) {  
        currentPage += 1;
        changePage();
    };
};

function prevPage() {
    totalPage = $('#pagination').find('li:last').text();

    if(currentPage > 1) {
        currentPage--;
        changePage();
    };
};

function changePage() {
    category = $('#category').val();
    country = $('#country').val();
    year = $('#year').val();
    sort = $('#sort').val();

    validation(sort, year, category, country);
};

function loadPage(event) {
    
    currentPage = parseInt($(event.target).text());
    changePage();
};

