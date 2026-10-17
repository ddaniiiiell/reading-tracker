const { app, BrowserWindow, ipcMain, shell, session } = require('electron');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');

const MAX_IMAGE_BYTES = 50 * 1024 * 1024;
const DOWNLOAD_TIMEOUT_MS = 60_000;
const ASURA_HOSTS = new Set(['asurascans.com', 'www.asurascans.com']);
const ASURA_CHAPTER_IMAGE_HOST = 'cdn.asurascans.com';
const FIREBASE_AUTH_HOST = 'reading-tracker-f8816.firebaseapp.com';
const LOCAL_APP_PORT = 43123;
const LOCAL_APP_CONTENT_TYPES = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp'
};
let localAppServer;
let localAppUrl;

function isHttpUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch {
    return false;
  }
}

function isFirebaseAuthPopup(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:'
      && url.hostname === FIREBASE_AUTH_HOST
      && url.pathname.startsWith('/__/auth/');
  } catch {
    return false;
  }
}

function isFirebaseAuthPopupStart(value) {
  return value === 'about:blank' || isFirebaseAuthPopup(value);
}

function getLocalAppFilePath(requestUrl) {
  try {
    const url = new URL(requestUrl, 'http://localhost');
    const pathname = decodeURIComponent(url.pathname);
    const relativePath = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '');
    const filePath = path.resolve(__dirname, relativePath);
    return filePath.startsWith(`${__dirname}${path.sep}`) ? filePath : null;
  } catch {
    return null;
  }
}

function serveLocalApp(request, response) {
  if (!request.url || !['GET', 'HEAD'].includes(request.method || '')) {
    response.writeHead(405).end();
    return;
  }

  const filePath = getLocalAppFilePath(request.url);
  if (!filePath) {
    response.writeHead(404).end();
    return;
  }

  fs.stat(filePath, (error, stats) => {
    if (error || !stats.isFile()) {
      response.writeHead(404).end();
      return;
    }

    const contentType = LOCAL_APP_CONTENT_TYPES[path.extname(filePath).toLowerCase()] || 'application/octet-stream';
    response.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff'
    });

    if (request.method === 'HEAD') {
      response.end();
      return;
    }

    fs.createReadStream(filePath)
      .on('error', () => response.destroy())
      .pipe(response);
  });
}

function startLocalAppServer() {
  if (localAppUrl) return Promise.resolve(localAppUrl);

  return new Promise((resolve, reject) => {
    const server = http.createServer(serveLocalApp);
    server.once('error', reject);
    server.listen(LOCAL_APP_PORT, 'localhost', () => {
      server.removeListener('error', reject);
      server.unref();
      localAppServer = server;
      localAppUrl = `http://localhost:${LOCAL_APP_PORT}`;
      resolve(localAppUrl);
    });
  });
}

function stopLocalAppServer() {
  if (!localAppServer) return;
  localAppServer.close();
  localAppServer = undefined;
  localAppUrl = undefined;
}

function parseAsuraChapterUrl(value) {
  let url;
  try {
    url = new URL(value);
  } catch {
    throw new Error('Paste a valid AsuraScans chapter URL.');
  }

  if (!ASURA_HOSTS.has(url.hostname) || !/^\/comics\/[^/]+\/chapter\/[^/]+\/?$/i.test(url.pathname)) {
    throw new Error('Paste a public AsuraScans chapter URL from asurascans.com/comics/.');
  }

  return url;
}

async function resolveAsuraChapter(value) {
  const chapterUrl = parseAsuraChapterUrl(value);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), DOWNLOAD_TIMEOUT_MS);

  try {
    const response = await fetch(chapterUrl, {
      headers: {
        Accept: 'text/html,application/xhtml+xml',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/134.0 Safari/537.36'
      },
      redirect: 'follow',
      signal: controller.signal
    });

    if (!response.ok) {
      throw new Error(`AsuraScans returned HTTP ${response.status}.`);
    }

    const html = await response.text();
    const pages = [];
    const seen = new Set();
    const imagePattern = /<img\b[^>]*\bsrc=["'](https:\/\/cdn\.asurascans\.com\/asura-images\/(?:chapters|chapters-restored)\/[^"']+)["']/gi;
    let match;

    while ((match = imagePattern.exec(html)) !== null) {
      const imageUrl = match[1].replace(/&amp;/g, '&');
      const parsedImageUrl = new URL(imageUrl);
      if (parsedImageUrl.hostname === ASURA_CHAPTER_IMAGE_HOST && !seen.has(parsedImageUrl.href)) {
        seen.add(parsedImageUrl.href);
        pages.push(parsedImageUrl.href);
      }
    }

    if (!pages.length) {
      throw new Error('No public chapter images were found. The page format may have changed or this chapter may not be available.');
    }

    return { chapterUrl: response.url, pages };
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('AsuraScans chapter lookup timed out.');
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchImage(url) {
  if (!isHttpUrl(url)) {
    throw new Error('Only HTTP and HTTPS image URLs can be downloaded.');
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), DOWNLOAD_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      headers: {
        Accept: 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/134.0 Safari/537.36'
      },
      redirect: 'follow',
      signal: controller.signal
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const type = response.headers.get('content-type')?.split(';')[0].trim().toLowerCase() || '';
    if (!type.startsWith('image/')) {
      throw new Error('URL did not return an image.');
    }

    const contentLength = Number(response.headers.get('content-length'));
    if (Number.isFinite(contentLength) && contentLength > MAX_IMAGE_BYTES) {
      throw new Error('Image is larger than the 50 MB safety limit.');
    }

    const bytes = Buffer.from(await response.arrayBuffer());
    if (bytes.length > MAX_IMAGE_BYTES) {
      throw new Error('Image is larger than the 50 MB safety limit.');
    }

    return { data: bytes.toString('base64'), type };
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Image download timed out.');
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

function createWindow() {
  const window = new BrowserWindow({
    width: 1320,
    height: 860,
    // Allows macOS Split View on 13-inch and smaller displays. The layout
    // switches to its single-column, compact presentation below 760px.
    minWidth: 640,
    minHeight: 600,
    show: false,
    title: 'Luxe Manhwa Tracker',
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      preload: path.join(__dirname, 'electron-preload.js')
    }
  });

  window.once('ready-to-show', () => window.show());
  window.loadURL(`${localAppUrl}/`);
}

app.whenReady().then(async () => {
  session.defaultSession.setPermissionRequestHandler((_webContents, _permission, callback) => callback(false));
  session.defaultSession.setPermissionCheckHandler(() => false);

  ipcMain.handle('offline:fetch-image', (_event, url) => fetchImage(url));
  ipcMain.handle('offline:resolve-asura-chapter', (_event, url) => resolveAsuraChapter(url));

  app.on('web-contents-created', (_event, contents) => {
    contents.setWindowOpenHandler(({ url }) => {
      if (isFirebaseAuthPopupStart(url)) {
        return {
          action: 'allow',
          overrideBrowserWindowOptions: {
            width: 500,
            height: 650,
            webPreferences: {
              contextIsolation: true,
              nodeIntegration: false,
              sandbox: true,
              preload: path.join(__dirname, 'electron-preload.js')
            }
          }
        };
      }

      if (isHttpUrl(url)) shell.openExternal(url);
      return { action: 'deny' };
    });
  });

  try {
    await startLocalAppServer();
    createWindow();
  } catch (error) {
    console.error('Could not start the local app server.', error);
    app.quit();
    return;
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('before-quit', stopLocalAppServer);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
