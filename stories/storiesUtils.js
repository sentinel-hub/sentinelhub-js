import {
  setAuthToken,
  isAuthTokenSet,
  requestAuthToken,
  setDebugEnabled,
  MimeTypes,
  ApiType,
} from '../dist/sentinelHub.esm';

// in storybooks, always display curl commands in console:
setDebugEnabled(true);

export function renderTilesList(containerEl, list) {
  list.forEach(tile => {
    const ul = document.createElement('ul');
    containerEl.appendChild(ul);
    for (let key in tile) {
      const li = document.createElement('li');
      ul.appendChild(li);
      let text;
      if (tile[key] instanceof Object) {
        text = JSON.stringify(tile[key]);
      } else {
        text = tile[key];
      }
      li.innerHTML = `${key} : ${text}`;
    }
  });
}

export async function setAuthTokenWithOAuthCredentials() {
  if (!process.env.CLIENT_ID || !process.env.CLIENT_SECRET) {
    throw new Error(
      "Please set OAuth Client's id and secret for Processing API(CLIENT_ID, CLIENT_SECRET env vars)",
    );
  }

  if (isAuthTokenSet()) {
    console.log('Auth token is already set.');
    return;
  }
  const clientId = process.env.CLIENT_ID;
  const clientSecret = process.env.CLIENT_SECRET;
  const authToken = await requestAuthToken(clientId, clientSecret);
  setAuthToken(authToken);
  console.log('Auth token retrieved and set successfully');
}

export const createFindDatesUTCStory = (layer, bbox4326, fromTime, toTime, useAuth) => {
  const wrapperEl = document.createElement('div');
  wrapperEl.innerHTML =
    `<h2>findDatesUTC using ${useAuth ? 'catalog' : 'search index'}</h2>` +
    'from: ' +
    fromTime +
    '<br />' +
    'to: ' +
    toTime;

  const containerEl = document.createElement('pre');
  wrapperEl.insertAdjacentElement('beforeend', containerEl);

  const img = document.createElement('img');
  img.width = '512';
  img.height = '512';
  wrapperEl.insertAdjacentElement('beforeend', img);

  const perform = async () => {
    if (useAuth) {
      await setAuthTokenWithOAuthCredentials();
    } else {
      setAuthToken(null);
    }
    const dates = await layer.findDatesUTC(bbox4326, fromTime, toTime);

    containerEl.innerHTML = JSON.stringify(dates, null, true);

    const resDateStartOfDay = new Date(new Date(dates[0]).setUTCHours(0, 0, 0, 0));
    const resDateEndOfDay = new Date(new Date(dates[0]).setUTCHours(23, 59, 59, 999));

    // prepare an image to show that the number makes sense:
    const getMapParams = {
      bbox: bbox4326,
      fromTime: resDateStartOfDay,
      toTime: resDateEndOfDay,
      width: 512,
      height: 512,
      format: MimeTypes.JPEG,
    };
    const imageBlob = await layer.getMap(getMapParams, ApiType.WMS);
    img.src = URL.createObjectURL(imageBlob);
  };
  perform().then(() => {});

  return wrapperEl;
};
