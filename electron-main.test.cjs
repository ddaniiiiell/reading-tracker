const assert = require('node:assert/strict');
const Module = require('node:module');
const path = require('node:path');
const test = require('node:test');

test('configures a secure window and a direct-image download bridge', async () => {
  const originalLoad = Module._load;
  const originalFetch = global.fetch;
  const handlers = new Map();
  const appEvents = new Map();
  const windows = [];
  const loadedUrls = [];
  const http = {
    createServer: () => ({
      once: () => {},
      listen: (_port, _host, callback) => callback(),
      removeListener: () => {},
      unref: () => {},
      address: () => ({ port: 43123 }),
      close: () => {}
    })
  };
  let permissionRequestHandler;
  let permissionCheckHandler;

  class MockBrowserWindow {
    constructor(options) {
      this.options = options;
      windows.push(this);
    }

    once(event, callback) {
      if (event === 'ready-to-show') callback();
    }

    show() {}

    loadURL(url) {
      loadedUrls.push(url);
    }

    static getAllWindows() {
      return windows;
    }
  }

  const electron = {
    app: {
      whenReady: () => ({ then: callback => Promise.resolve(callback()) }),
      on: (event, callback) => appEvents.set(event, callback),
      quit: () => {}
    },
    BrowserWindow: MockBrowserWindow,
    ipcMain: { handle: (channel, callback) => handlers.set(channel, callback) },
    shell: { openExternal: () => {} },
    session: {
      defaultSession: {
        setPermissionRequestHandler: callback => { permissionRequestHandler = callback; },
        setPermissionCheckHandler: callback => { permissionCheckHandler = callback; }
      }
    }
  };

  global.fetch = async url => {
    if (String(url).includes('asurascans.com/comics/')) {
      return {
        ok: true,
        url: String(url),
        text: async () => '<img src="https://cdn.asurascans.com/asura-images/chapters/example/42/001.webp"><img src="https://cdn.asurascans.com/asura-images/chapters-restored/example/42/002.webp">'
      };
    }

    return {
      ok: true,
      headers: { get: name => (name === 'content-type' ? 'image/webp' : '3') },
      arrayBuffer: async () => new Uint8Array([1, 2, 3]).buffer
    };
  };

  Module._load = function mockElectron(request, parent, isMain) {
    if (request === 'electron') return electron;
    if (request === 'node:http') return http;
    return originalLoad.call(this, request, parent, isMain);
  };

  try {
    delete require.cache[require.resolve('./electron-main.js')];
    require('./electron-main.js');
    await new Promise(resolve => setImmediate(resolve));

    assert.equal(windows.length, 1);
    assert.equal(windows[0].options.minWidth, 640);
    assert.equal(windows[0].options.minHeight, 600);
    assert.deepEqual(windows[0].options.webPreferences, {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      preload: path.join(__dirname, 'electron-preload.js')
    });
    assert.equal(loadedUrls[0], 'http://localhost:43123/');

    let permissionGranted = true;
    permissionRequestHandler(null, 'notifications', value => { permissionGranted = value; });
    assert.equal(permissionGranted, false);
    assert.equal(permissionCheckHandler(), false);

    const fetchImage = handlers.get('offline:fetch-image');
    assert.ok(fetchImage);
    assert.deepEqual(await fetchImage({}, 'https://images.example/page.webp'), {
      data: 'AQID',
      type: 'image/webp'
    });
    await assert.rejects(fetchImage({}, 'file:///private/image.webp'), /Only HTTP and HTTPS/);
    const resolveAsuraChapter = handlers.get('offline:resolve-asura-chapter');
    assert.ok(resolveAsuraChapter);
    assert.deepEqual(await resolveAsuraChapter({}, 'https://asurascans.com/comics/example/chapter/42'), {
      chapterUrl: 'https://asurascans.com/comics/example/chapter/42',
      pages: [
        'https://cdn.asurascans.com/asura-images/chapters/example/42/001.webp',
        'https://cdn.asurascans.com/asura-images/chapters-restored/example/42/002.webp'
      ]
    });
    await assert.rejects(resolveAsuraChapter({}, 'https://example.com/comics/example/chapter/42'), /AsuraScans chapter URL/);
    assert.ok(appEvents.has('web-contents-created'));

    let windowOpenHandler;
    appEvents.get('web-contents-created')(null, {
      setWindowOpenHandler: handler => { windowOpenHandler = handler; }
    });
    assert.equal(windowOpenHandler({ url: 'https://example.com' }).action, 'deny');
    assert.equal(windowOpenHandler({ url: 'about:blank' }).action, 'allow');
    const authPopup = windowOpenHandler({ url: 'https://reading-tracker-f8816.firebaseapp.com/__/auth/handler?apiKey=test' });
    assert.equal(authPopup.action, 'allow');
    assert.deepEqual(authPopup.overrideBrowserWindowOptions.webPreferences, {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      preload: path.join(__dirname, 'electron-preload.js')
    });
  } finally {
    Module._load = originalLoad;
    global.fetch = originalFetch;
    delete require.cache[require.resolve('./electron-main.js')];
  }
});
