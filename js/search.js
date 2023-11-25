// url parameter
const params = new URL(location).searchParams;
const query = params.get("query");

// kobis api
const KOBIS_API_KEY = "f5eef3421c602c6cb7ea224104795888";
const KOBIS_BASE_URL = "https://kobis.or.kr/kobisopenapi/webservice/rest";
const KOBIS_MOVIE_DETAILS_URL = `${KOBIS_BASE_URL}/movie/searchMovieInfo.json?&key=${KOBIS_API_KEY}`;

// kmdb api
const KMDB_API_KEY = "077QYNU9KT03C64KE480";
const KMDB_BASE_UTL =
  "https://api.koreafilm.or.kr/openapi-data2/wisenut/search_api/search_json2.jsp";
const KOBIS_MOVIE_LIST_URL = `${KOBIS_BASE_URL}/movie/searchMovieList.json?&key=${KOBIS_API_KEY}&itemPerPage=100&movieNm=${query}`;
const KMDB_MOVIE_DETAILS_URL = `${KMDB_BASE_UTL}?collection=kmdb_new2&ServiceKey=${KMDB_API_KEY}`;

// main logic
setSearchResultBox();

// search result
async function setSearchResultBox() {
  const searchWord = document.querySelector("#search-word");
  const searchResultBox = document.querySelector("#search-result-box");
  const kobisMovies = await fetchKobisMovies();

  let searchResultHTML = "";
  if (query !== "") {
    for (const kobisMovie of kobisMovies) {
      const kmdbMovieDetails = await fetchKmdbMovieDetails(kobisMovie);
      if (kmdbMovieDetails !== null) {
        searchResultHTML += getSearchResultHTML(kobisMovie, kmdbMovieDetails);
      }
    }
  }
  if (searchResultHTML === "") {
    searchResultHTML = "<p>검색결과가 없습니다.</p>";
  }

  searchResultBox.innerHTML = searchResultHTML;
  searchWord.innerText = query;
  searchWord.classList.remove("placeholder");
}

function getSearchResultHTML(kobisMovie, kmdbMovieDetails) {
  const movieCd = kobisMovie.movieCd;
  const movieName = kobisMovie.movieNm;
  const movieSeq = kmdbMovieDetails.movieSeq;

  let releaseDate = "-";
  const openDt = kobisMovie.openDt;
  if (openDt !== "") {
    const year = openDt.substring(0, 4);
    const month = openDt.substring(4, 6);
    const day = openDt.substring(6, 8);
    releaseDate = `${year}-${month}-${day}`;
  }

  const posters = kmdbMovieDetails.posters.split("|");
  let poster = "/images/xbox.png";
  if (posters[0] !== "") {
    poster = posters[0].replace("http", "https");
  }

  return `<div class="col pt-3">
            <div class="card border-0 mx-auto">
                <img
                src="${poster}"
                class="card-img-top rounded bg-secondary card-poster"
                alt="Movie Poster"
                />
                <div class="card-body">
                <dl>
                    <dt
                    class="card-title overflow-hidden text-nowrap text-truncate"
                    >
                    ${movieName}
                    </dt>
                    <dd>
                    <dl class="row row-cols-auto small">
                        <dt class="col">
                        개봉일
                        </dt>
                        <dd class="col">${releaseDate}</dd>
                    </dl>
                    </dd>
                </dl>
                </div>                      
                <a href="./details.html?movieCd=${movieCd}&movieSeq=${movieSeq}" class="stretched-link"></a>
            </div>
            </div>`;
}

// fetch
async function getJson(url) {
  const response = await fetch(url);
  const json = await response.json();

  return json;
}

async function fetchKmdbMovieDetails(kobisMovie) {
  const movieName = kobisMovie.movieNm;
  const directors = kobisMovie.directors;
  let peopleName = "";
  if (directors.length !== 0) {
    peopleName = directors[0].peopleNm;
  }
  if (peopleName === "") {
    return null;
  }
  const url = `${KMDB_MOVIE_DETAILS_URL}&title=${movieName}&director=${peopleName}`;
  const json = await getJson(url);
  const result = json.Data[0].Result;
  if (result === undefined) {
    return null;
  }
  return result[0];
}

async function fetchKobisMovies() {
  const url = KOBIS_MOVIE_LIST_URL;
  const json = await getJson(url);

  return json.movieListResult.movieList
    .filter(
      (movie) =>
        !movie.movieNm.includes("[") &&
        !movie.genreAlt.includes("성인물(에로)") &&
        !(
          movie.genreAlt.includes("멜로/로맨스") && movie.repNationNm === "일본"
        )
    )
    .sort((m1, m2) => m2.openDt - m1.openDt);
}
