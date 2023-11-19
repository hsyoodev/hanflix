// kobis api
const KOBIS_API_KEY = "ed9a848739062a6a22fb1cdc21c0d444";
const KOBIS_BASE_URL = "https://kobis.or.kr/kobisopenapi/webservice/rest";
const KOBIS_WEEKLY_BOXOFFICE_URL = `${KOBIS_BASE_URL}/boxoffice/searchWeeklyBoxOfficeList.json`;
const KOBIS_MOVIE_DETAILS_URL = `${KOBIS_BASE_URL}/movie/searchMovieInfo.json`;

// kmdb api
const KMDB_API_KEY = "077QYNU9KT03C64KE480";
const KMDB_BASE_UTL =
  "http://api.koreafilm.or.kr/openapi-data2/wisenut/search_api/search_json2.jsp";
const KMDB_MOVIE_DETAILS_URL = `${KMDB_BASE_UTL}?collection=kmdb_new2&ServiceKey=${KMDB_API_KEY}`;

// weekly top3
(async () => {
  const weeklyTop3Box = document.querySelector("#weekly-top3-box");
  let weeklyTop3HTML = "";
  const weeklyBoxOffices = await getWeeklyBoxOffices();
  for (let i = 0; i < 3; i++) {
    const weeklyBoxOffice = weeklyBoxOffices[i];
    const movieCd = weeklyBoxOffice.movieCd;

    const kobisMovieDetails = await getKobisMovieDetails(movieCd);
    const movieName = kobisMovieDetails.movieNm;
    const peopleName = kobisMovieDetails.actors[0].peopleNm;

    const kmdbMovieDetails = await getKmdbMovieDetails(movieName, peopleName);
    const posters = kmdbMovieDetails.posters.split("|");
    const poster = posters[0];
    const id = kmdbMovieDetails.DOCID;
    console.log(poster);
    weeklyTop3HTML += `
            <div class="carousel-item h-100 my-2 bg-dark bg-gradient ${
              i == 0 ? "active" : ""
            }">
              <img
              src="${poster}"
              class="d-block h-100 w-75 m-auto"
              alt="Movie Title"
              />
              <a href="./details.html?id=${id}" class="stretched-link"></a>
            </div>`;
  }
  weeklyTop3Box.innerHTML = weeklyTop3HTML;
})();

async function getWeeklyBoxOffices() {
  const url = `${KOBIS_WEEKLY_BOXOFFICE_URL}?key=${KOBIS_API_KEY}&targetDt=20231112&weekGb=0`;
  const json = await getJson(url);
  const weeklyBoxOfficeList = json.boxOfficeResult.weeklyBoxOfficeList;
  return weeklyBoxOfficeList;
}

async function getKobisMovieDetails(movieCd) {
  const url = `${KOBIS_MOVIE_DETAILS_URL}?&key=${KOBIS_API_KEY}&movieCd=${movieCd}`;
  const json = await getJson(url);
  const kobisMovieDetails = json.movieInfoResult.movieInfo;
  return kobisMovieDetails;
}

async function getKmdbMovieDetails(movieName, peopleName) {
  const url = `${KMDB_MOVIE_DETAILS_URL}&title=${movieName}&actor=${peopleName}`;
  const json = await getJson(url);
  const kmdbMovieDetails = json.Data[0].Result[0];
  return kmdbMovieDetails;
}

async function getJson(url) {
  const response = await fetch(url);
  const json = await response.json();
  return json;
}
