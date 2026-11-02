/*global document */
(async function () {
  if (!window.location.href.includes('parseplatform.org')) {
    return;
  }
  const sdk = window.location.href.split('parseplatform.org/')[1].split('/')[0];
  if (sdk !== 'Parse-SDK-JS' && sdk !== 'parse-server') {
    return;
  }
  const location = window.location.href.split('api/');
  if (location.length === 1 || !location[1]) {
    return;
  }
  const apiVersion = location[1].split('/')[0];
  const { url } = await fetch(
    `https://unpkg.com/browse/parse${
      sdk === 'parse-server' ? '-server' : ''
    }/package.json`
  );
  const latest = url.split('@')[1].split('/')[0];
  if (apiVersion !== latest) {
    const main = document.getElementById('main');
    const alertDiv = document.createElement('div');
    alertDiv.style.width = '100%';
    alertDiv.style.paddingTop = '20px';
    alertDiv.style.textAlign = 'center';
    alertDiv.style.color = 'red';
    alertDiv.innerHTML = 'This version of the SDK is outdated.';
    const link = document.createElement('a');
    link.style.marginLeft = '10px';
    link.setAttribute('href', window.location.href.split(apiVersion)[0]);
    link.innerHTML = `Go to ${latest}`;
    alertDiv.appendChild(link);
    main.insertBefore(alertDiv, main.firstChild);
  }
})();
