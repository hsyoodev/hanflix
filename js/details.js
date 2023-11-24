// url parameter
const params = new URL(location).searchParams;
const movieCd = params.get("movieCd");
const movieSeq = params.get("movieSeq");

// kobis api
const KOBIS_API_KEY = "ed9a848739062a6a22fb1cdc21c0d444";
const KOBIS_BASE_URL = "https://kobis.or.kr/kobisopenapi/webservice/rest";
const KOBIS_MOVIE_DETAILS_URL = `${KOBIS_BASE_URL}/movie/searchMovieInfo.json?&key=${KOBIS_API_KEY}`;

// kmdb api
const KMDB_API_KEY = "077QYNU9KT03C64KE480";
const KMDB_BASE_UTL =
  "https://api.koreafilm.or.kr/openapi-data2/wisenut/search_api/search_json2.jsp";
const KMDB_MOVIE_DETAILS_URL = `${KMDB_BASE_UTL}?collection=kmdb_new2&ServiceKey=${KMDB_API_KEY}`;

// main logic
setMovieDetails();

// movie details
async function setMovieDetails() {
  const poster = document.querySelector("#poster");
  const titlekor = document.querySelector("#title-kor");
  const titleEn = document.querySelector("#title-en");
  const releaseDate = document.querySelector("#release-date");
  const productionState = document.querySelector("#production-state");
  const type = document.querySelector("#type");
  const watchGrade = document.querySelector("#watch-grade");
  const showTime = document.querySelector("#show-time");
  const nation = document.querySelector("#nation");
  const director = document.querySelector("#director");
  const genre = document.querySelector("#genre");
  const plotText = document.querySelector("#plot-text");
  const stillCutBox = document.querySelector("#still-cut-box");
  const videoBox = document.querySelector("#video-box");

  const kobisMovieDetails = await fetchKobisMovieDetails(
    `${KOBIS_MOVIE_DETAILS_URL}&movieCd=${movieCd}`
  );
  const kmdbMovieDetails = await fetchKmdbMovieDetails(kobisMovieDetails);

  const posters = kmdbMovieDetails.posters.split("|");
  if (posters === "") {
    poster.src = "images/xbox.png";
  }
  if (posters !== "") {
    poster.src = posters[0].replace("http", "https");
  }
  poster.classList.remove("placeholder");

  titlekor.innerText = kobisMovieDetails.movieNm;
  titlekor.classList.remove("placeholder");

  titleEn.innerText = kobisMovieDetails.movieNmEn;
  titleEn.classList.remove("placeholder");

  const openDt = kobisMovieDetails.openDt;
  const year = openDt.substring(0, 4);
  const month = openDt.substring(4, 6);
  const day = openDt.substring(6, 8);
  releaseDate.innerText = `${year}-${month}-${day}`;
  releaseDate.classList.remove("placeholder");

  productionState.innerText = kobisMovieDetails.prdtStatNm;
  productionState.classList.remove("placeholder");

  type.innerText = kmdbMovieDetails.type;
  type.classList.remove("placeholder");

  watchGrade.innerText = kmdbMovieDetails.rating;
  watchGrade.classList.remove("placeholder");

  showTime.innerText = `${kobisMovieDetails.showTm}분`;
  showTime.classList.remove("placeholder");

  nation.innerText = kmdbMovieDetails.nation;
  nation.classList.remove("placeholder");

  director.innerText = kmdbMovieDetails.directors.director[0].directorNm;
  director.classList.remove("placeholder");

  genre.innerText = kmdbMovieDetails.genre;
  genre.classList.remove("placeholder");

  plotText.innerText = kmdbMovieDetails.plots.plot[0].plotText;
  plotText.classList.remove("placeholder");

  const stillCuts = kmdbMovieDetails.stlls.split("|");
  let stillCutHTML = "";
  for (const stillCut of stillCuts) {
    stillCutHTML += `<div class="col pt-3">
                        <div class="card border-0 mx-auto">
                        <img
                            src=${stillCut}
                            class="card-img-top rounded bg-secondary still-cut"
                            alt="Movie Still Cut"
                        />
                        </div>
                    </div>`;
  }
  stillCutBox.innerHTML = stillCutHTML;

  const vods = kmdbMovieDetails.vods.vod;
  let videoHTML = "";
  for (const vod of vods) {
    const vodClass = vod.vodClass;
    const vodUrl = vod.vodUrl.replace("trailerPlayPop?pFileNm=", "play/");
    if (vodClass === "" && vodUrl === "") {
      break;
    }
    videoHTML += `<div class="col pt-3">
                    <p class="overflow-hidden text-nowrap text-truncate">${vodClass}</p>
                    <video
                    src=${vodUrl}
                    controls
                    class="w-100 rounded"
                    >해당 브라우저는 video 태그를 지원하지 않습니다.</video>
                </div>`;
  }
  if (videoHTML === "") {
    videoHTML = "<p>영상 결과가 없습니다.</p>";
  }
  videoBox.innerHTML = videoHTML;
  videoBox.classList.remove("placeholder-glow");
}

// fetch
async function getJson(url) {
  const response = await fetch(url);
  const json = await response.json();
  return json;
}

async function fetchKobisMovieDetails(url) {
  const json = await getJson(url);
  return json.movieInfoResult.movieInfo;
}

async function fetchKmdbMovieDetails(kobisMovieDetails) {
  const movieName = kobisMovieDetails.movieNm;
  const releaseDate = kobisMovieDetails.openDt;
  const url = `${KMDB_MOVIE_DETAILS_URL}&title=${movieName}&releaseDts=${releaseDate}&releaseDte=${releaseDate}`;
  const json = await getJson(url);
  return json.Data[0].Result[0];
}
