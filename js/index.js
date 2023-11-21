const today = new Date();
const yesterday = new Date();
yesterday.setDate(today.getDate() - 1);
const year = yesterday.getFullYear();
const month = yesterday.getMonth() + 1;
const date = yesterday.getDate();
const day = yesterday.getDay();
const dayOfWeeks = ["일", "월", "화", "수", "목", "금"];

// kobis api
const KOBIS_API_KEY = "ed9a848739062a6a22fb1cdc21c0d444";
const KOBIS_BASE_URL = "https://kobis.or.kr/kobisopenapi/webservice/rest";
const KOBIS_WEEKLY_BOXOFFICE_URL = `${KOBIS_BASE_URL}/boxoffice/searchWeeklyBoxOfficeList.json?key=${KOBIS_API_KEY}&targetDt=20231112&weekGb=0&itemPerPage=3`;
const KOBIS_DAILY_BOXOFFICE_URL = `${KOBIS_BASE_URL}/boxoffice/searchDailyBoxOfficeList.json?key=${KOBIS_API_KEY}&targetDt=${year}${month}${date}&itemPerPage=5`;
const KOBIS_MOVIE_DETAILS_URL = `${KOBIS_BASE_URL}/movie/searchMovieInfo.json?&key=${KOBIS_API_KEY}`;

// kmdb api
const KMDB_API_KEY = "077QYNU9KT03C64KE480";
const KMDB_BASE_UTL =
  "https://api.koreafilm.or.kr/openapi-data2/wisenut/search_api/search_json2.jsp";
const KMDB_MOVIE_DETAILS_URL = `${KMDB_BASE_UTL}?collection=kmdb_new2&ServiceKey=${KMDB_API_KEY}`;

// main logic
setWeeklyBoxOffice();
// setDailyBoxOffice();

// weekly box office
async function setWeeklyBoxOffice() {
  const weeklyBoxOfficeBox = document.querySelector("#weekly-box-office-box");
  const kobisWeeklyBoxOffices = await getKobisWeeklyBoxOffices();

  let weeklyBoxOfficeHTML = "";
  for (const kobisWeeklyBoxOffice of kobisWeeklyBoxOffices) {
    const movieCd = kobisWeeklyBoxOffice.movieCd;
    const kobisMovieDetails = await getKobisMovieDetails(
      `${KOBIS_MOVIE_DETAILS_URL}&movieCd=${movieCd}`
    );
    const kmdbMovieDetails = await getKmdbMovieDetails(kobisMovieDetails);
    weeklyBoxOfficeHTML += getWeeklyBoxOfficeHTML(
      kobisWeeklyBoxOffice,
      kmdbMovieDetails
    );
  }

  weeklyBoxOfficeBox.innerHTML = weeklyBoxOfficeHTML;
}

function getWeeklyBoxOfficeHTML(kobisWeeklyBoxOffice, kmdbMovieDetails) {
  const rank = kobisWeeklyBoxOffice.rank;
  const isActive = rank == 1;
  const posters = kmdbMovieDetails.posters.split("|");
  const poster = posters[0].replace("http", "https");
  const id = kmdbMovieDetails.DOCID;
  return `<div class="carousel-item h-100 my-2 ${isActive ? "active" : ""}">
            <img
            src="${poster}"
            class="d-block h-75 m-auto"
            alt="Movie Poster"
            />
            <div class="carousel-caption">
              <h2 class="fw-bold pb-3">주간 박스오피스 TOP ${rank}</h2>
            </div>
            <a href="./details.html?id=${id}" class="stretched-link"></a>
          </div>`;
}

// daily
async function setDailyBoxOffice() {
  const dailyBoxOfficeBox = document.querySelector("#daily-box-office-box");
  const dailyBoxOfficeTargetDate = document.querySelector(
    "#daily-box-office-target-date"
  );

  const kobisDailyBoxOffices = await getKobisDailyBoxOffices();
  let dailyBoxOfficeHTML = "";
  for (const dailyBoxOffice of kobisDailyBoxOffices) {
    const kobisMovieDetails = await getKobisMovieDetails(dailyBoxOffice);
    const kmdbMovieDetails = await getKmdbMovieDetails(kobisMovieDetails);
    dailyBoxOfficeHTML += getDailyBoxOfficeHTML(
      dailyBoxOffice,
      kobisMovieDetails,
      kmdbMovieDetails
    );
  }

  dailyBoxOfficeBox.innerHTML = dailyBoxOfficeHTML;
  dailyBoxOfficeTargetDate.innerText = `${year}년 ${month}월 ${date}일 (${dayOfWeeks[day]}) 기준`;
  dailyBoxOfficeTargetDate.classList.remove("placeholder");
}

function getDailyBoxOfficeHTML(
  dailyBoxOffice,
  kobisMovieDetails,
  kmdbMovieDetails
) {
  const movieName = kobisMovieDetails.movieNm;
  const posters = kmdbMovieDetails.posters.split("|");
  const poster = posters[0].replace("http", "https");
  const releaseDate = dailyBoxOffice.openDt;
  const id = kmdbMovieDetails.DOCID;
  const rank = dailyBoxOffice.rank;
  return `<div class="col pt-3">
            <div class="card border-0">
              <img
                src="${poster}"
                class="card-img-top rounded bg-secondary card-poster"
                alt="Movie Poster"
              ><p class="h1 position-absolute top-0 end-0 fw-bold bg-dark text-white">${rank}</p></img>
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
              <a href="./details.html?id=${id}" class="stretched-link"></a>
            </div>
          </div>`;
}

// fetch
async function getJson(url) {
  const response = await fetch(url);
  const json = await response.json();
  return json;
}

async function getKobisDailyBoxOffices() {
  const url = KOBIS_DAILY_BOXOFFICE_URL;
  const json = await getJson(url);
  return json.boxOfficeResult.dailyBoxOfficeList;
}

async function getKobisWeeklyBoxOffices() {
  const url = KOBIS_WEEKLY_BOXOFFICE_URL;
  const json = await getJson(url);
  return json.boxOfficeResult.weeklyBoxOfficeList;
}

async function getKobisMovieDetails(url) {
  const json = await getJson(url);
  return json.movieInfoResult.movieInfo;
}

async function getKmdbMovieDetails(kobisMovieDetails) {
  const movieName = kobisMovieDetails.movieNm;
  const actors = kobisMovieDetails.actors;
  let peopleName = "";
  if (actors.length != 0) {
    peopleName = actors[0].peopleNm;
  }
  const url = `${KMDB_MOVIE_DETAILS_URL}&title=${movieName}&actor=${peopleName}`;
  const json = await getJson(url);
  return json.Data[0].Result[0];
}
