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

(async () => {
  const weeklyTop3Box = document.querySelector("#weekly-top3-box");
  const dailyChartBox = document.querySelector("#daily-chart-box");

  let weeklyTop3HTML = "";
  let dailyChartHTML = "";

  const weeklyBoxOffices = await getWeeklyBoxOffices();
  for (let i = 0; i < 5; i++) {
    const weeklyBoxOffice = weeklyBoxOffices[i];
    const rank = weeklyBoxOffice.rank;
    const movieCd = weeklyBoxOffice.movieCd;

    const kobisMovieDetails = await getKobisMovieDetails(movieCd);
    const movieName = kobisMovieDetails.movieNm;
    const peopleName = kobisMovieDetails.actors[0].peopleNm;
    const year = kobisMovieDetails.openDt.slice(0, 4);
    const month = kobisMovieDetails.openDt.slice(4, 6);
    const day = kobisMovieDetails.openDt.slice(6, 8);
    const releaseDate = `${year}-${month}-${day}`;

    const kmdbMovieDetails = await getKmdbMovieDetails(movieName, peopleName);
    const posters = kmdbMovieDetails.posters.split("|");
    const poster = posters[0];
    const id = kmdbMovieDetails.DOCID;

    if (i < 3) {
      const isActive = i == 0;
      weeklyTop3HTML += getWeeklyTop3HTML(isActive, poster, rank, id);
    }
    dailyChartHTML += getDailyChartHTML(poster, movieName, releaseDate, id);
  }
  weeklyTop3Box.innerHTML = weeklyTop3HTML;
  dailyChartBox.innerHTML = dailyChartHTML;
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

function getDailyChartHTML(poster, movieName, releaseDate, id) {
  const dailyChartHTML = `<div class="col pt-3">
                            <div class="card border-0 align-items-center">
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
                              <a href="./details.html?id=${id}" class="stretched-link"></a>
                            </div>
                          </div>`;
  return dailyChartHTML;
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
