// url parameter
const params = new URL(location).searchParams;
const query = encodeURI(params.get('query'));

// kmdb api
const KMDB_API_KEY = '077QYNU9KT03C64KE480';
const KMDB_BASE_UTL =
  'https://api.koreafilm.or.kr/openapi-data2/wisenut/search_api/search_json2.jsp';
const KMDB_MOVIE_DETAILS_URL = `${KMDB_BASE_UTL}?collection=kmdb_new2&ServiceKey=${KMDB_API_KEY}&title=${query}&listCount=500`;

// main logic
setSearchResultBox();

// search result
async function setSearchResultBox() {
  const searchWord = document.querySelector('#search-word');
  const searchResultBox = document.querySelector('#search-result-box');
  const kmdbMovieDetails = await fetchKmdbMovieDetails(KMDB_MOVIE_DETAILS_URL);

  let searchResultHTML = '<p>검색결과가 없습니다.</p>';
  if (kmdbMovieDetails !== undefined) {
    searchResultHTML = '';
    for (const kmdbMovieDetail of kmdbMovieDetails) {
      if (kmdbMovieDetail !== null) {
        searchResultHTML += getSearchResultHTML(kmdbMovieDetail);
      }
    }
  }

  searchResultBox.innerHTML = searchResultHTML;
  searchWord.innerText = decodeURI(query);
  searchWord.classList.remove('placeholder');
}

function getSearchResultHTML(kmdbMovieDetail) {
  const title = kmdbMovieDetail.title;
  const movieId = kmdbMovieDetail.movieId;
  const movieSeq = kmdbMovieDetail.movieSeq;
  const repRlsDate = kmdbMovieDetail.repRlsDate;
  const poster = kmdbMovieDetail.posters[0];

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
                    ${title}
                    </dt>
                    <dd>
                    <dl class="row row-cols-auto small">
                        <dt class="col">
                        개봉일
                        </dt>
                        <dd class="col">${repRlsDate}</dd>
                    </dl>
                    </dd>
                </dl>
                </div>                      
                <a href="./details.html?movieId=${movieId}&movieSeq=${movieSeq}" class="stretched-link"></a>
            </div>
            </div>`;
}

// fetch
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

// util
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

      return movie;
    });
}

function interceptor() {
  alert('잘못된 접근입니다.');
  history.back();
}
