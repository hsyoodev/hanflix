// date
const today = new Date();
const yesterday = new Date();
const oneWeekAgo = new Date();
oneWeekAgo.setDate(today.getDate() - 7);
yesterday.setDate(today.getDate() - 1);
const joinYesterDay = getYearMonthDay(yesterday).join("");
const joinOneWeekAgo = getYearMonthDay(oneWeekAgo).join("");
const [year, ,] = getYearMonthDay(today);
const dayOfWeeks = ["일", "월", "화", "수", "목", "금", "토"];

// kobis api
const KOBIS_API_KEY = "f5eef3421c602c6cb7ea224104795888";
const KOBIS_BASE_URL = "https://kobis.or.kr/kobisopenapi/webservice/rest";
const KOBIS_WEEKLY_BOXOFFICE_URL = `${KOBIS_BASE_URL}/boxoffice/searchWeeklyBoxOfficeList.json?key=${KOBIS_API_KEY}&targetDt=${joinOneWeekAgo}&weekGb=0&itemPerPage=3`;
const KOBIS_DAILY_BOXOFFICE_URL = `${KOBIS_BASE_URL}/boxoffice/searchDailyBoxOfficeList.json?key=${KOBIS_API_KEY}&targetDt=${joinYesterDay}&itemPerPage=5`;
const KOBIS_MOVIE_DETAILS_URL = `${KOBIS_BASE_URL}/movie/searchMovieInfo.json?&key=${KOBIS_API_KEY}`;
const KOBIS_MOVIE_LIST_URL = `${KOBIS_BASE_URL}/movie/searchMovieList.json?&key=${KOBIS_API_KEY}&itemPerPage=100&openStartDt=${year}&openEndDt=${
  year + 1
}`;

// kmdb api
const KMDB_API_KEY = "077QYNU9KT03C64KE480";
const KMDB_BASE_UTL =
  "https://api.koreafilm.or.kr/openapi-data2/wisenut/search_api/search_json2.jsp";
const KMDB_MOVIE_DETAILS_URL = `${KMDB_BASE_UTL}?collection=kmdb_new2&ServiceKey=${KMDB_API_KEY}`;

// main logic
setWeeklyBoxOffice();
setDailyBoxOffice();
setNowPlaying();
setUpComing();

// weekly box office
async function setWeeklyBoxOffice() {
  const weeklyBoxOfficeBox = document.querySelector("#weekly-box-office-box");
  const kobisWeeklyBoxOffices = await fetchKobisWeeklyBoxOffices();

  let weeklyBoxOfficeHTML = "";
  for (const kobisWeeklyBoxOffice of kobisWeeklyBoxOffices) {
    const movieCd = kobisWeeklyBoxOffice.movieCd;
    const kobisMovieDetails = await fetchKobisMovieDetails(
      `${KOBIS_MOVIE_DETAILS_URL}&movieCd=${movieCd}`
    );
    const kmdbMovieDetails = await fetchKmdbMovieDetails(kobisMovieDetails);
    weeklyBoxOfficeHTML += getWeeklyBoxOfficeHTML(
      kobisWeeklyBoxOffice,
      kmdbMovieDetails,
      movieCd
    );
  }

  weeklyBoxOfficeBox.innerHTML = weeklyBoxOfficeHTML;
}

function getWeeklyBoxOfficeHTML(
  kobisWeeklyBoxOffice,
  kmdbMovieDetails,
  movieCd
) {
  const rank = kobisWeeklyBoxOffice.rank;
  const isActive = rank == 1;
  const posters = kmdbMovieDetails.posters.split("|");
  const poster = posters[0].replace("http", "https");
  const movieSeq = kmdbMovieDetails.movieSeq;

  const start = (oneWeekAgo.getDate() % 7) + 1;
  const end = (7 - oneWeekAgo.getDay()) % 7;
  const startDate = new Date();
  const endDate = new Date();
  startDate.setDate(oneWeekAgo.getDate() - start);
  endDate.setDate(oneWeekAgo.getDate() + end);
  const [startYear, startMonth, startDay] = getYearMonthDay(startDate);
  const startDayOfWeek = getDayOfWeek(startDate.getDay());
  const [endYear, endMonth, endDay] = getYearMonthDay(endDate);
  const endDayOfWeek = getDayOfWeek(endDate.getDay());
  return `<div class="carousel-item h-100 my-2 ${isActive ? "active" : ""}">
              <img
              src="${poster}"
              class="d-block h-75 m-auto position-relative"
              alt="Movie Poster"
              />
            <div class="carousel-caption">
              <p class="h2 fw-bold">주간 박스오피스 TOP ${rank}</p>
              <p class="small">${startYear}년 ${startMonth}월 ${startDay}일 (${startDayOfWeek}) ~ ${endYear}년 ${endMonth}월 ${endDay}일 (${endDayOfWeek}) 기준</p>
            </div>
            <a href="./details.html?movieCd=${movieCd}&movieSeq=${movieSeq}" class="stretched-link"></a>
          </div>`;
}

// daily
async function setDailyBoxOffice() {
  const dailyBoxOfficeBox = document.querySelector("#daily-box-office-box");
  const dailyBoxOfficeTargetDate = document.querySelector(
    "#daily-box-office-target-date"
  );
  const kobisDailyBoxOffices = await fetchKobisDailyBoxOffices();

  let dailyBoxOfficeHTML = "";
  for (const kobisDailyBoxOffice of kobisDailyBoxOffices) {
    const movieCd = kobisDailyBoxOffice.movieCd;
    const kobisMovieDetails = await fetchKobisMovieDetails(
      `${KOBIS_MOVIE_DETAILS_URL}&movieCd=${movieCd}`
    );
    const kmdbMovieDetails = await fetchKmdbMovieDetails(kobisMovieDetails);
    dailyBoxOfficeHTML += getDailyBoxOfficeHTML(
      kobisDailyBoxOffice,
      kmdbMovieDetails,
      movieCd
    );
  }

  dailyBoxOfficeBox.innerHTML = dailyBoxOfficeHTML;
  const [year, month, date] = getYearMonthDay(yesterday);
  const day = yesterday.getDay();
  const dayOfWeek = getDayOfWeek(day);
  dailyBoxOfficeTargetDate.innerText = `${year}년 ${month}월 ${date}일 (${dayOfWeek}) 기준`;
  dailyBoxOfficeTargetDate.classList.remove("placeholder");
}

function getDailyBoxOfficeHTML(kobisDailyBoxOffice, kmdbMovieDetails, movieCd) {
  const movieName = kobisDailyBoxOffice.movieNm;
  const posters = kmdbMovieDetails.posters.split("|");
  const poster = posters[0].replace("http", "https");
  const releaseDate = kobisDailyBoxOffice.openDt;
  const movieSeq = kmdbMovieDetails.movieSeq;
  const rank = kobisDailyBoxOffice.rank;
  return `<div class="col pt-3">
            <div class="card border-0 mx-auto">
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
              <a href="./details.html?movieCd=${movieCd}&movieSeq=${movieSeq}" class="stretched-link"></a>
            </div>
          </div>`;
}

// now playing
async function setNowPlaying() {
  const nowPlayingBox = document.querySelector("#now-playing-box");
  const nowPlayingTargetDate = document.querySelector(
    "#now-playing-target-date"
  );
  const kobisMovies = await fetchKobisMovies("개봉");
  let nowPlayingHTML = "";
  for (const kobisMovie of kobisMovies) {
    const movieCd = kobisMovie.movieCd;
    const kobisMovieDetails = await fetchKobisMovieDetails(
      `${KOBIS_MOVIE_DETAILS_URL}&movieCd=${movieCd}`
    );
    const kmdbMovieDetails = await fetchKmdbMovieDetails(kobisMovieDetails);
    nowPlayingHTML += getNowPlayingHTML(kobisMovie, kmdbMovieDetails, movieCd);
  }
  nowPlayingBox.innerHTML = nowPlayingHTML;
  const [year, month, date] = getYearMonthDay(today);
  const day = today.getDay();
  const dayOfWeek = getDayOfWeek(day);
  nowPlayingTargetDate.innerText = `${year}년 ${month}월 ${date}일 (${dayOfWeek}) 기준`;
  nowPlayingTargetDate.classList.remove("placeholder");
}

function getNowPlayingHTML(kobisMovie, kmdbMovieDetails, movieCd) {
  const movieName = kobisMovie.movieNm;
  const posters = kmdbMovieDetails.posters.split("|");
  const poster = posters[0].replace("http", "https");
  const openDt = kobisMovie.openDt;
  const year = openDt.slice(0, 4);
  const month = openDt.slice(4, 6);
  const day = openDt.slice(6, 8);
  const releaseDate = `${year}-${month}-${day}`;
  const movieSeq = kmdbMovieDetails.movieSeq;
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

// upcoming
async function setUpComing() {
  const upcomingBox = document.querySelector("#upcoming-box");
  const upcomingTargetYear = document.querySelector("#upcoming-target-year");
  const kobisMovies = await fetchKobisMovies("개봉예정");
  let upcomingHTML = "";
  for (const kobisMovie of kobisMovies) {
    const movieCd = kobisMovie.movieCd;
    const kobisMovieDetails = await fetchKobisMovieDetails(
      `${KOBIS_MOVIE_DETAILS_URL}&movieCd=${movieCd}`
    );
    const kmdbMovieDetails = await fetchKmdbMovieDetails(kobisMovieDetails);
    upcomingHTML += getUpcomingHTML(kobisMovie, kmdbMovieDetails, movieCd);
  }
  upcomingBox.innerHTML = upcomingHTML;
  upcomingTargetYear.innerText = `${year}년 ~ ${year + 1}년 기준`;
  upcomingTargetYear.classList.remove("placeholder");
}

function getUpcomingHTML(kobisMovie, kmdbMovieDetails, movieCd) {
  const movieName = kobisMovie.movieNm;
  const posters = kmdbMovieDetails.posters.split("|");
  const poster = posters[0].replace("http", "https");
  const openDt = kobisMovie.openDt;
  const year = openDt.slice(0, 4);
  const month = openDt.slice(4, 6);
  const day = openDt.slice(6, 8);
  const releaseDate = `${year}-${month}-${day}`;
  const movieSeq = kmdbMovieDetails.movieSeq;
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

async function fetchKobisDailyBoxOffices() {
  const url = KOBIS_DAILY_BOXOFFICE_URL;
  const json = await getJson(url);
  return json.boxOfficeResult.dailyBoxOfficeList;
}

async function fetchKobisWeeklyBoxOffices() {
  const url = KOBIS_WEEKLY_BOXOFFICE_URL;
  const json = await getJson(url);
  return json.boxOfficeResult.weeklyBoxOfficeList;
}

async function fetchKobisMovieDetails(url) {
  const json = await getJson(url);
  return json.movieInfoResult.movieInfo;
}

async function fetchKmdbMovieDetails(kobisMovieDetails) {
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

async function fetchKobisMovies(prdtStatNm) {
  const url = KOBIS_MOVIE_LIST_URL;
  const json = await getJson(url);

  return json.movieListResult.movieList
    .filter(
      (movie) =>
        movie.prdtStatNm === prdtStatNm && movie.genreAlt !== "성인물(에로)"
    )
    .sort((m1, m2) => m2.openDt - m1.openDt)
    .slice(0, 5);
}

// date
function getYearMonthDay(date) {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return [year, month, day];
}

function getDayOfWeek(day) {
  return dayOfWeeks[day];
}
