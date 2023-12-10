// date
const today = new Date();
const yesterday = new Date();
const oneWeekAgo = new Date();
yesterday.setDate(today.getDate() - 1);
oneWeekAgo.setDate(today.getDate() - 7);
const joinYesterDay = getYearMonthDay(yesterday).join('');
const joinOneWeekAgo = getYearMonthDay(oneWeekAgo).join('');
const [year, ,] = getYearMonthDay(today);
const dayOfWeeks = ['일', '월', '화', '수', '목', '금', '토'];

// kobis api
const KOBIS_API_KEY = 'ed9a848739062a6a22fb1cdc21c0d444';
const KOBIS_BASE_URL = 'https://kobis.or.kr/kobisopenapi/webservice/rest';
const KOBIS_WEEKLY_BOXOFFICE_URL = `${KOBIS_BASE_URL}/boxoffice/searchWeeklyBoxOfficeList.json?key=${KOBIS_API_KEY}&targetDt=${joinOneWeekAgo}&weekGb=0&itemPerPage=3`;
const KOBIS_DAILY_BOXOFFICE_URL = `${KOBIS_BASE_URL}/boxoffice/searchDailyBoxOfficeList.json?key=${KOBIS_API_KEY}&targetDt=${joinYesterDay}&itemPerPage=5`;
const KOBIS_MOVIE_LIST_URL = `${KOBIS_BASE_URL}/movie/searchMovieList.json?&key=${KOBIS_API_KEY}&itemPerPage=100&openStartDt=${year}&openEndDt=${
  year + 1
}`;

// kmdb api
const KMDB_API_KEY = '077QYNU9KT03C64KE480';
const KMDB_BASE_UTL =
  'https://api.koreafilm.or.kr/openapi-data2/wisenut/search_api/search_json2.jsp';
const KMDB_MOVIE_DETAILS_URL = `${KMDB_BASE_UTL}?collection=kmdb_new2&ServiceKey=${KMDB_API_KEY}&sort=prodYear,1`;

// main logic
setWeeklyBoxOffice();
setDailyBoxOffice();
setNowPlaying();
setUpComing();

// weekly box office
async function setWeeklyBoxOffice() {
  const weeklyBoxOfficeBox = document.querySelector('#weekly-box-office-box');
  const kobisWeeklyBoxOffices = await fetchKobisWeeklyBoxOffices(
    KOBIS_WEEKLY_BOXOFFICE_URL
  );

  let weeklyBoxOfficeHTML = '';
  for (const kobisWeeklyBoxOffice of kobisWeeklyBoxOffices) {
    const movieNm = kobisWeeklyBoxOffice.movieNm;
    const releaseDte = kobisWeeklyBoxOffice.releaseDte;
    const prdtYear = kobisWeeklyBoxOffice.openDt.split('-')[0];
    const kmdbMovieDetails = await fetchKmdbMovieDetails(
      `${KMDB_MOVIE_DETAILS_URL}&title=${movieNm}&createDte=${prdtYear}&releaseDte=${releaseDte}&releaseDts=${releaseDte}`
    );

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
  const movieId = kmdbMovieDetails.movieId;
  const movieSeq = kmdbMovieDetails.movieSeq;
  const poster = kmdbMovieDetails.posters[0];

  const dayOfWeek = today.getDay();
  const numDay = dayOfWeek == 0 ? 7 : dayOfWeek;
  const lastMonday = new Date(today - (numDay + 7 - 1) * 24 * 60 * 60 * 1000);
  const lastSunday = new Date(today - numDay * 24 * 60 * 60 * 1000);

  const [startYear, startMonth, startDay] = getYearMonthDay(lastMonday);
  const [endYear, endMonth, endDay] = getYearMonthDay(lastSunday);
  const startDayOfWeek = getDayOfWeek(lastMonday.getDay());
  const endDayOfWeek = getDayOfWeek(lastSunday.getDay());

  return `<div class="carousel-item h-100 my-2 ${isActive ? 'active' : ''}">
              <img
              src="${poster}"
              class="d-block h-75 m-auto position-relative"
              alt="Movie Poster"
              />
            <div class="carousel-caption">
              <p class="h2 fw-bold">주간 박스오피스 TOP ${rank}</p>
              <p class="small">${startYear}년 ${startMonth}월 ${startDay}일 (${startDayOfWeek}) ~ ${endYear}년 ${endMonth}월 ${endDay}일 (${endDayOfWeek}) 기준</p>
            </div>
            <a href="./details.html?movieId=${movieId}&movieSeq=${movieSeq}" class="stretched-link"></a>
          </div>`;
}

// daily
async function setDailyBoxOffice() {
  const dailyBoxOfficeBox = document.querySelector('#daily-box-office-box');
  const dailyBoxOfficeTargetDate = document.querySelector(
    '#daily-box-office-target-date'
  );
  const kobisDailyBoxOffices = await fetchKobisDailyBoxOffices(
    KOBIS_DAILY_BOXOFFICE_URL
  );
  const [year, month, day] = getYearMonthDay(yesterday);
  const dayOfWeek = getDayOfWeek(yesterday.getDay());

  let dailyBoxOfficeHTML = '';
  for (const kobisDailyBoxOffice of kobisDailyBoxOffices) {
    const movieNm = kobisDailyBoxOffice.movieNm;
    const releaseDte = kobisDailyBoxOffice.releaseDte;
    const prdtYear = kobisDailyBoxOffice.openDt.split('-')[0];
    const kmdbMovieDetails = await fetchKmdbMovieDetails(
      `${KMDB_MOVIE_DETAILS_URL}&title=${movieNm}&createDte=${prdtYear}&releaseDte=${releaseDte}&releaseDts=${releaseDte}`
    );

    dailyBoxOfficeHTML += getDailyBoxOfficeHTML(
      kobisDailyBoxOffice,
      kmdbMovieDetails
    );
  }

  dailyBoxOfficeBox.innerHTML = dailyBoxOfficeHTML;
  dailyBoxOfficeBox.classList.remove('placeholder-glow');
  dailyBoxOfficeTargetDate.innerText = `${year}년 ${month}월 ${day}일 (${dayOfWeek}) 기준`;
  dailyBoxOfficeTargetDate.classList.remove('placeholder');
}

function getDailyBoxOfficeHTML(kobisDailyBoxOffice, kmdbMovieDetails) {
  const movieNm = kobisDailyBoxOffice.movieNm;
  const openDt = kobisDailyBoxOffice.openDt;
  const movieId = kmdbMovieDetails.movieId;
  const movieSeq = kmdbMovieDetails.movieSeq;
  const rank = kobisDailyBoxOffice.rank;
  const poster = kmdbMovieDetails.posters[0];

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
                    ${movieNm}
                  </dt>
                  <dd>
                    <dl class="row row-cols-auto small">
                      <dt class="col">
                        개봉일
                      </dt>
                      <dd class="col">${openDt}</dd>
                    </dl>
                  </dd>
                </dl>
              </div>                      
              <a href="./details.html?movieId=${movieId}&movieSeq=${movieSeq}" class="stretched-link"></a>
            </div>
          </div>`;
}

// now playing
async function setNowPlaying() {
  const nowPlayingBox = document.querySelector('#now-playing-box');
  const nowPlayingTargetDate = document.querySelector(
    '#now-playing-target-date'
  );
  const kobisNowPlayings = await fetchKobisNowPlayings(KOBIS_MOVIE_LIST_URL);
  const [year, month, day] = getYearMonthDay(today);
  const dayOfWeek = getDayOfWeek(today.getDay());

  let nowPlayingHTML = '';
  for (const kobisNowPlaying of kobisNowPlayings) {
    const movieNm = kobisNowPlaying.movieNm;
    const releaseDte = kobisNowPlaying.releaseDte;
    const kmdbMovieDetails = await fetchKmdbMovieDetails(
      `${KMDB_MOVIE_DETAILS_URL}&title=${movieNm}&releaseDte=${releaseDte}`
    );

    nowPlayingHTML += getNowPlayingHTML(kobisNowPlaying, kmdbMovieDetails);
  }

  nowPlayingBox.innerHTML = nowPlayingHTML;
  nowPlayingTargetDate.innerText = `${year}년 ${month}월 ${day}일 (${dayOfWeek}) 기준`;
  nowPlayingTargetDate.classList.remove('placeholder');
}

function getNowPlayingHTML(kobisNowPlaying, kmdbMovieDetails) {
  const movieNm = kobisNowPlaying.movieNm;
  const movieId = kmdbMovieDetails.movieId;
  const movieSeq = kmdbMovieDetails.movieSeq;
  const openDt = kobisNowPlaying.openDt;
  const poster = kmdbMovieDetails.posters[0];

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
                    ${movieNm}
                  </dt>
                  <dd>
                    <dl class="row row-cols-auto small">
                      <dt class="col">
                        개봉일
                      </dt>
                      <dd class="col">${openDt}</dd>
                    </dl>
                  </dd>
                </dl>
              </div>
              <a href="./details.html?movieId=${movieId}&movieSeq=${movieSeq}" class="stretched-link"></a>
            </div>
          </div>`;
}

// upcoming
async function setUpComing() {
  const upcomingBox = document.querySelector('#upcoming-box');
  const upcomingTargetYear = document.querySelector('#upcoming-target-year');
  const kobisUpcomings = await fetchKobisUpcomings(KOBIS_MOVIE_LIST_URL);

  let upcomingHTML = '';
  for (const kobisUpcoming of kobisUpcomings) {
    const movieNm = kobisUpcoming.movieNm;
    const releaseDte = kobisUpcoming.releaseDte;
    const prdtYear = kobisUpcoming.prdtYear;
    const kmdbMovieDetails = await fetchKmdbMovieDetails(
      `${KMDB_MOVIE_DETAILS_URL}&title=${movieNm}&createDte=${prdtYear}&releaseDte=${releaseDte}`
    );

    upcomingHTML += getUpcomingHTML(kobisUpcoming, kmdbMovieDetails);
  }

  upcomingBox.innerHTML = upcomingHTML;
  upcomingTargetYear.innerText = `${year}년 ~ ${year + 1}년 기준`;
  upcomingTargetYear.classList.remove('placeholder');
}

function getUpcomingHTML(kobisUpcoming, kmdbMovieDetails) {
  const movieNm = kobisUpcoming.movieNm;
  const movieId = kmdbMovieDetails.movieId;
  const movieSeq = kmdbMovieDetails.movieSeq;
  const openDt = kobisUpcoming.openDt;
  const poster = kmdbMovieDetails.posters[0];

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
                    ${movieNm}
                  </dt>
                  <dd>
                    <dl class="row row-cols-auto small">
                      <dt class="col">
                        개봉일
                      </dt>
                      <dd class="col">${openDt}</dd>
                    </dl>
                  </dd>
                </dl>
              </div>                      
              <a href="./details.html?&movieId=${movieId}&movieSeq=${movieSeq}" class="stretched-link"></a>
            </div>
          </div>`;
}

// fetch
async function getJson(url) {
  const response = await fetch(url);
  const json = await response.json();

  return json;
}

async function fetchKobisDailyBoxOffices(url) {
  const json = await getJson(url);
  const data = json.boxOfficeResult.dailyBoxOfficeList.map((movie) => {
    const [year, month, day] = movie.openDt.split('-');
    movie.releaseDte = `${year}${month}${day}`;

    return movie;
  });

  return data;
}

async function fetchKobisWeeklyBoxOffices(url) {
  const json = await getJson(url);
  const data = json.boxOfficeResult.weeklyBoxOfficeList.map((movie) => {
    const [year, month, day] = movie.openDt.split('-');
    movie.releaseDte = `${year}${month}${day}`;

    return movie;
  });

  return data;
}

async function fetchKobisNowPlayings(url) {
  const json = await getJson(url);
  const data = json.movieListResult.movieList
    .filter(
      (movie) =>
        movie.prdtStatNm === '개봉' &&
        !(
          movie.repNationNm === '일본' ||
          movie.repGenreNm === '성인물(에로)' ||
          movie.genreAlt.includes('성인물(에로)')
        )
    )
    .sort((m1, m2) => m2.openDt - m1.openDt)
    .slice(0, 5)
    .map((movie) => {
      const openDt = movie.openDt;
      movie.releaseDte = openDt;
      const year = openDt.substring(0, 4);
      const month = openDt.substring(4, 6);
      const day = openDt.substring(6, 8);
      movie.openDt = `${year}-${month}-${day}`;

      return movie;
    });

  return data;
}

async function fetchKobisUpcomings(url) {
  const json = await getJson(url);
  const data = json.movieListResult.movieList
    .filter(
      (movie) =>
        movie.prdtStatNm === '개봉예정' &&
        !(movie.repNationNm === '일본' || movie.repGenreNm === '성인물(에로)')
    )
    .sort((m1, m2) => m2.openDt - m1.openDt)
    .slice(0, 5)
    .map((movie) => {
      const openDt = movie.openDt;
      movie.releaseDte = openDt;
      const year = openDt.substring(0, 4);
      const month = openDt.substring(4, 6);
      const day = openDt.substring(6, 8);
      movie.openDt = `${year}-${month}-${day}`;

      return movie;
    });

  return data;
}

async function fetchKmdbMovieDetails(url) {
  const json = await getJson(url);
  const data = json.Data[0].Result.map((movie) => {
    const posters = movie.posters.replaceAll('http', 'https').split('|');
    let firstPoster = posters[0];
    if (firstPoster === '') {
      firstPoster = 'images/xbox.png';
    }
    posters[0] = firstPoster;
    movie.posters = posters;

    return movie;
  });

  return data[0];
}

// util
function getYearMonthDay(date) {
  const year = date.getFullYear();
  let month = date.getMonth() + 1;
  let day = date.getDate();
  if (month < 10) {
    month = '0' + month;
  }
  if (day < 10) {
    day = '0' + day;
  }
  return [year, month, day];
}

function getDayOfWeek(day) {
  return dayOfWeeks[day];
}
