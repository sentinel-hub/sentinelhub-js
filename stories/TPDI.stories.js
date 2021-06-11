import { setAuthTokenWithOAuthCredentials } from './storiesUtils';

import {
  AirbusConstellation,
  CRS_EPSG4326,
  BBox,
  TPDProvider,
  TPDICollections,
  TPDI,
} from '../dist/sentinelHub.esm';

export default {
  title: 'TPDI',
};

const renderListOfItems = (containerEl, items) =>
  items.forEach(item => {
    const ul = document.createElement('ul');
    containerEl.appendChild(ul);
    for (let key in item) {
      const li = document.createElement('li');
      ul.appendChild(li);
      let text;
      if (item[key] instanceof Object) {
        text = JSON.stringify(item[key]);
      } else {
        text = item[key];
      }
      li.innerHTML = `${key} : ${text}`;
    }
  });

const defaultSearchParams = {
  fromTime: new Date(2017, 1 - 1, 1, 0, 0, 0, 0),
  toTime: new Date(2018, 6 - 1, 31, 23, 59, 59, 999),
  bbox: new BBox(CRS_EPSG4326, -97.370012, 32.733646, -97.361003, 32.744187),
};

export const GetQuotas = () => {
  if (!process.env.CLIENT_ID || !process.env.CLIENT_SECRET) {
    return "<div>Please set OAuth Client's id and secret for TPDI API (CLIENT_ID, CLIENT_SECRET env vars)</div>";
  }
  const containerEl = document.createElement('pre');

  const wrapperEl = document.createElement('div');
  wrapperEl.innerHTML = '<h2>Get TPDI quotas</h2>';
  wrapperEl.insertAdjacentElement('beforeend', containerEl);

  const perform = async () => {
    await setAuthTokenWithOAuthCredentials();

    const quotas = await TPDI.getQuotas();
    renderListOfItems(containerEl, quotas);
  };
  perform().then(() => {});

  return wrapperEl;
};

export const SearchAirbusSpot = () => {
  if (!process.env.CLIENT_ID || !process.env.CLIENT_SECRET) {
    return "<div>Please set OAuth Client's id and secret for TPDI API (CLIENT_ID, CLIENT_SECRET env vars)</div>";
  }
  const containerEl = document.createElement('pre');

  const wrapperEl = document.createElement('div');
  wrapperEl.innerHTML = '<h2>Search Airbus SPOT</h2>';
  wrapperEl.insertAdjacentElement('beforeend', containerEl);

  const perform = async () => {
    await setAuthTokenWithOAuthCredentials();

    defaultSearchParams.constellation = AirbusConstellation.SPOT;
    const { features, links } = await TPDI.search(TPDProvider.AIRBUS, defaultSearchParams, {}, 5);
    renderListOfItems(containerEl, features);
    const nextPage = document.createElement('div');
    nextPage.innerHTML = '<p>next page</p>';
    containerEl.appendChild(nextPage);
    const response = await TPDI.search(TPDProvider.AIRBUS, defaultSearchParams, {}, 5, links.nextToken);
    renderListOfItems(containerEl, response.features);
  };
  perform().then(() => {});

  return wrapperEl;
};

export const SearchAirbusPleiades = () => {
  if (!process.env.CLIENT_ID || !process.env.CLIENT_SECRET) {
    return "<div>Please set OAuth Client's id and secret for TPDI API (CLIENT_ID, CLIENT_SECRET env vars)</div>";
  }
  const containerEl = document.createElement('pre');

  const wrapperEl = document.createElement('div');
  wrapperEl.innerHTML = '<h2>Search Airbus Pleiades</h2>';
  wrapperEl.insertAdjacentElement('beforeend', containerEl);

  const perform = async () => {
    await setAuthTokenWithOAuthCredentials();
    defaultSearchParams.constellation = AirbusConstellation.PHR;
    const { features, links } = await TPDI.search(TPDProvider.AIRBUS, defaultSearchParams, {}, 5);
    renderListOfItems(containerEl, features);
    const nextPage = document.createElement('div');
    nextPage.innerHTML = '<p>next page</p>';
    containerEl.appendChild(nextPage);
    const response = await TPDI.search(TPDProvider.AIRBUS, defaultSearchParams, {}, 5, links.nextToken);
    renderListOfItems(containerEl, response.features);
  };
  perform().then(() => {});

  return wrapperEl;
};

export const SearchMAXAR = () => {
  if (!process.env.CLIENT_ID || !process.env.CLIENT_SECRET) {
    return "<div>Please set OAuth Client's id and secret for TPDI API (CLIENT_ID, CLIENT_SECRET env vars)</div>";
  }
  const containerEl = document.createElement('pre');

  const wrapperEl = document.createElement('div');
  wrapperEl.innerHTML = '<h2>Search MAXAR</h2>';
  wrapperEl.insertAdjacentElement('beforeend', containerEl);

  const perform = async () => {
    await setAuthTokenWithOAuthCredentials();
    defaultSearchParams.constellation = AirbusConstellation.PHR;
    const { features } = await TPDI.search(TPDProvider.MAXAR, defaultSearchParams, {}, 5);
    renderListOfItems(containerEl, features);
  };
  perform().then(() => {});

  return wrapperEl;
};

export const GetThumbnails = () => {
  if (!process.env.CLIENT_ID || !process.env.CLIENT_SECRET) {
    return "<div>Please set OAuth Client's id and secret for TPDI API (CLIENT_ID, CLIENT_SECRET env vars)</div>";
  }
  const containerEl = document.createElement('pre');

  const wrapperEl = document.createElement('div');
  wrapperEl.innerHTML = '<h2>get thumbnails</h2>';
  wrapperEl.innerHTML += `<h4> ${Object.keys(TPDProvider).join('|')} </h4>`;

  wrapperEl.insertAdjacentElement('beforeend', containerEl);
  const imgs = [];
  const products = [
    { collectionId: TPDICollections.AIRBUS_SPOT, productId: '1e2d3f96-5afc-4050-8e74-98e1eb159cd1' },
    { collectionId: TPDICollections.AIRBUS_PLEIADES, productId: 'ec30b314-e423-4780-a3a9-44b03c964d96' },
    { collectionId: TPDICollections.MAXAR_WORLDVIEW, productId: '10300100638BEC00' },
  ];
  for (let i = 0; i < products.length; i++) {
    const img = document.createElement('img');
    img.width = '256';
    img.height = '256';
    imgs.push(img);
    containerEl.insertAdjacentElement('beforeend', img);
  }

  const perform = async () => {
    await setAuthTokenWithOAuthCredentials();

    for (let i = 0; i < products.length; i++) {
      const imageBlob = await TPDI.getThumbnail(products[i].collectionId, products[i].productId);
      imgs[i].src = URL.createObjectURL(imageBlob);
    }
  };
  perform().then(() => {});

  return wrapperEl;
};

export const GetOrders = () => {
  if (!process.env.CLIENT_ID || !process.env.CLIENT_SECRET) {
    return "<div>Please set OAuth Client's id and secret for TPDI API (CLIENT_ID, CLIENT_SECRET env vars)</div>";
  }
  const containerEl = document.createElement('pre');

  const wrapperEl = document.createElement('div');
  wrapperEl.innerHTML = '<h2>Get orders</h2>';
  wrapperEl.insertAdjacentElement('beforeend', containerEl);

  const perform = async () => {
    await setAuthTokenWithOAuthCredentials();

    const orderQueries = [
      {
        id: 'All',
        params: {},
      },
      {
        id: 'Status created',
        params: {
          status: 'CREATED',
        },
      },
      {
        id: 'BYOC CollectionId',
        params: {
          collectionId: 'b40a6d43-d753-4b91-8996-47c032671919',
        },
      },
    ];
    orderQueries.forEach(async query => {
      const orders = await TPDI.getOrders(query.params);
      const title = document.createElement('div');
      title.innerHTML = query.id;
      containerEl.appendChild(title);
      renderListOfItems(containerEl, orders.data);
    });
  };
  perform().then(() => {});

  return wrapperEl;
};
