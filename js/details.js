// url parameter
const params = new URL(location).searchParams;
const movieId = encodeURI(params.get('movieId'));
const movieSeq = encodeURI(params.get('movieSeq'));

// kmdb api
const KMDB_API_KEY = '077QYNU9KT03C64KE480';
const KMDB_BASE_URL =
  'https://api.koreafilm.or.kr/openapi-data2/wisenut/search_api/search_json2.jsp';
const KMDB_MOVIE_DETAILS_URL = `${KMDB_BASE_URL}?collection=kmdb_new2&ServiceKey=${KMDB_API_KEY}&movieId=${movieId}&movieSeq=${movieSeq}`;

// main logic
setMovieDetails();

async function setMovieDetails() {
  const poster = document.querySelector('#poster');
  const titlekor = document.querySelector('#title-kor');
  const titleEn = document.querySelector('#title-en');
  const releaseDate = document.querySelector('#release-date');
  const company = document.querySelector('#company');
  const type = document.querySelector('#type');
  const rating = document.querySelector('#rating');
  const showTime = document.querySelector('#show-time');
  const nation = document.querySelector('#nation');
  const director = document.querySelector('#director');
  const genre = document.querySelector('#genre');
  const plotText = document.querySelector('#plot-text');
  const stillCutBox = document.querySelector('#still-cut-box');
  const videoBox = document.querySelector('#video-box');
  const kmdbMovieDetails = await fetchKmdbMovieDetails(KMDB_MOVIE_DETAILS_URL);

  if (kmdbMovieDetails === undefined) {
    interceptor();
  }

  const kmdbMovieDetail = kmdbMovieDetails[0];

  poster.src = kmdbMovieDetail.posters[0];
  poster.classList.remove('placeholder');

  titlekor.innerText = kmdbMovieDetail.title;
  titlekor.classList.remove('placeholder');

  titleEn.innerText = kmdbMovieDetail.titleEng;
  titleEn.classList.remove('placeholder');

  releaseDate.innerText = kmdbMovieDetail.repRlsDate;
  releaseDate.classList.remove('placeholder');

  type.innerText = kmdbMovieDetail.type;
  type.classList.remove('placeholder');

  rating.innerText = kmdbMovieDetail.rating;
  rating.classList.remove('placeholder');

  showTime.innerText = kmdbMovieDetail.runtime;
  showTime.classList.remove('placeholder');

  nation.innerText = kmdbMovieDetail.nation;
  nation.classList.remove('placeholder');

  director.innerText = kmdbMovieDetail.directors.director[0].directorNm;
  director.classList.remove('placeholder');

  genre.innerText = kmdbMovieDetail.genre;
  genre.classList.remove('placeholder');

  company.innerText = kmdbMovieDetail.company;
  company.classList.remove('placeholder');

  plotText.innerText = kmdbMovieDetail.plots.plot[0].plotText;
  plotText.classList.remove('placeholder');

  const stills = kmdbMovieDetail.stlls;
  let stillCutHTML = `<p class="pt-3">스틸컷 결과가 없습니다.</p>`;
  if (stills !== null) {
    stillCutHTML = '';
    for (const still of stills) {
      stillCutHTML += `<div class="col pt-3">
                          <div class="card border-0 mx-auto">
                          <img
                              src=${still}
                              class="card-img-top rounded bg-secondary still-cut"
                              alt="Movie Still Cut"
                          />
                          </div>
                      </div>`;
    }
  }
  stillCutBox.innerHTML = stillCutHTML;

  const vods = kmdbMovieDetail.vods.vod;
  let videoHTML = `<p>영상 결과가 없습니다.</p>`;
  if (vods !== null) {
    videoHTML = '';
    for (const vod of vods) {
      const vodClass = vod.vodClass;
      const vodUrl = vod.vodUrl;
      videoHTML += `<div class="col pt-3">
                    <p class="overflow-hidden text-nowrap text-truncate">${vodClass}</p>
                    <video
                    src=${vodUrl}
                    controls
                    class="w-100 rounded video object-fit-fill"
                    >해당 브라우저는 video 태그를 지원하지 않습니다.</video>
                </div>`;
    }
  }
  videoBox.innerHTML = videoHTML;
  videoBox.classList.remove('placeholder-glow');
}

async function getJson(url) {
  const response = await fetch(url);

  let json;
  try {
    json = await response.json();
  } catch (e) {
    console.log(e);
    interceptor();
  }

  return json;
}

async function fetchKmdbMovieDetails(url) {
  const json = await getJson(url);
  const data = getDataProcessing(json);

  return data;
}

function getDataProcessing(json) {
  return json.Data[0].Result?.filter((movie) => !(movie.repRlsDate === ''))
    .sort((m1, m2) => m2.repRlsDate - m1.repRlsDate)
    .map((movie) => {
      const title = movie.title;
      movie.title = title
        .replaceAll('!HS', '')
        .replaceAll('!HE', '')
        .replace(':', ' : ')
        .trim();

      const repRlsDate = movie.repRlsDate;
      const year = repRlsDate.substring(0, 4);
      const month = repRlsDate.substring(4, 6);
      const day = repRlsDate.substring(6, 8);
      movie.repRlsDate = `${year}-${month}-${day}`;

      const posters = movie.posters.replaceAll('http', 'https').split('|');
      let firstPoster = posters[0];
      if (firstPoster === '') {
        firstPoster = 'images/xbox.png';
      }
      posters[0] = firstPoster;
      movie.posters = posters;

      const runtime = movie.runtime;
      movie.runtime = `${runtime}분`;

      let stills = movie.stlls.replaceAll('http', 'https').split('|');
      const firstStill = stills[0];
      if (firstStill === '') {
        stills = null;
      }
      movie.stlls = stills;

      let vods = movie.vods.vod;
      for (const vod of vods) {
        const vodUrl = vod.vodUrl.replace('trailerPlayPop?pFileNm=', 'play/');
        vod.vodUrl = vodUrl;
      }
      const firstVod = vods[0];
      const vodClass = firstVod.vodClass;
      const vodUrl = firstVod.vodUrl;
      if (vodClass === '' && vodUrl === '') {
        vods = null;
      }
      movie.vods.vod = vods;

      return movie;
    });
}

function interceptor() {
  alert('잘못된 접근입니다.');
  history.back();
}
