const today = new Date();
const yesterday = new Date();
const dayOfWeeks = ["일", "월", "화", "수", "목", "금"];
yesterday.setDate(today.getDate() - 1);

const year = yesterday.getFullYear();
let month = yesterday.getMonth() + 1;
if (month < 10) {
  month = "0" + month;
}
let date = yesterday.getDate();
if (date < 10) {
  date = "0" + date;
}
const day = yesterday.getDay();

// kobis api
const KOBIS_API_KEY = "f5eef3421c602c6cb7ea224104795888";
const KOBIS_BASE_URL = "https://kobis.or.kr/kobisopenapi/webservice/rest";
const KOBIS_WEEKLY_BOXOFFICE_URL = `${KOBIS_BASE_URL}/boxoffice/searchWeeklyBoxOfficeList.json`;
const KOBIS_DAILY_BOXOFFICE_URL = `${KOBIS_BASE_URL}/boxoffice/searchDailyBoxOfficeList.json?key=${KOBIS_API_KEY}&targetDt=${year}${month}${date}&itemPerPage=5`;
const KOBIS_MOVIE_DETAILS_URL = `${KOBIS_BASE_URL}/movie/searchMovieInfo.json?&key=${KOBIS_API_KEY}`;

// kmdb api
const KMDB_API_KEY = "077QYNU9KT03C64KE480";
const KMDB_BASE_UTL =
  "https://api.koreafilm.or.kr/openapi-data2/wisenut/search_api/search_json2.jsp";
const KMDB_MOVIE_DETAILS_URL = `${KMDB_BASE_UTL}?collection=kmdb_new2&ServiceKey=${KMDB_API_KEY}`;

// setWeeklyTop3();
setDailyBoxOffice();

async function setDailyBoxOffice() {
  const dailyBoxOfficeContainer = document.querySelector(
    "#daily-box-office-container"
  );
  const dailyBoxOfficeTargetDate = document.querySelector(
    "#daily-box-office-target-date"
  );
  dailyBoxOfficeTargetDate.innerText = `${year}년 ${month}월 ${date}일 (${dayOfWeeks[day]}) 기준`;
  const dailyBoxOffices = await getKobisDailyBoxOffices();

  let dailyBoxOfficeHTML = "";
  for (const dailyBoxOffice of dailyBoxOffices) {
    const kobisMovieDetails = await getKobisMovieDetails(dailyBoxOffice);
    const kmdbMovieDetails = await getKmdbMovieDetails(kobisMovieDetails);
    dailyBoxOfficeHTML += getDailyBoxOfficeHTML(
      dailyBoxOffice,
      kobisMovieDetails,
      kmdbMovieDetails
    );
  }
  dailyBoxOfficeContainer.innerHTML = dailyBoxOfficeHTML;
}

async function getKobisDailyBoxOffices() {
  const url = KOBIS_DAILY_BOXOFFICE_URL;
  const json = await getJson(url);
  const dailyBoxOffices = json.boxOfficeResult.dailyBoxOfficeList;
  return dailyBoxOffices;
}

async function getKobisWeeklyBoxOffices() {
  const url = `${KOBIS_WEEKLY_BOXOFFICE_URL}?key=${KOBIS_API_KEY}&targetDt=20231112&weekGb=0`;
  const json = await getJson(url);
  const weeklyBoxOfficeList = json.boxOfficeResult.weeklyBoxOfficeList;
  return weeklyBoxOfficeList;
}

async function getKobisMovieDetails(dailyBoxOffice) {
  const movieCd = dailyBoxOffice.movieCd;
  const url = `${KOBIS_MOVIE_DETAILS_URL}&movieCd=${movieCd}`;
  const json = await getJson(url);
  const kobisMovieDetails = json.movieInfoResult.movieInfo;
  return kobisMovieDetails;
}

async function getKmdbMovieDetails(kobisMovieDetails) {
  const movieName = kobisMovieDetails.movieNm;
  let peopleName = "";
  const actors = kobisMovieDetails.actors;
  if (actors.length != 0) {
    peopleName = actors[0].peopleNm;
  }
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

async function setWeeklyTop3() {
  const weeklyTop3Box = document.querySelector("#weekly-top3-box");
  const weeklyBoxOffices = await getKobisWeeklyBoxOffices();

  let weeklyTop3HTML = "";
  for (let i = 0; i < 3; i++) {
    const weeklyBoxOffice = weeklyBoxOffices[i];
    const rank = weeklyBoxOffice.rank;
    const movieCd = weeklyBoxOffice.movieCd;

    const kobisMovieDetails = await getKobisMovieDetails(movieCd);
    const movieName = kobisMovieDetails.movieNm;
    const peopleName = kobisMovieDetails.actors[0].peopleNm;

    const kmdbMovieDetails = await getKmdbMovieDetails(movieName, peopleName);
    const posters = kmdbMovieDetails.posters.split("|");
    const poster = posters[0].replace("http", "https");
    const id = kmdbMovieDetails.DOCID;

    const isActive = i == 0;
    weeklyTop3HTML += getWeeklyTop3HTML(isActive, poster, rank, id);
  }

  weeklyTop3Box.innerHTML = weeklyTop3HTML;
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

function getWeeklyTop3HTML(isActive, poster, rank, id) {
  const weeklyTop3HTML = `
                        <div class="carousel-item h-100 my-2 ${
                          isActive ? "active" : ""
                        }">
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
  return weeklyTop3HTML;
}
