# reading-tracker

## Cloud sync setup

The app works with browser `localStorage` by default. To sync across browsers and devices, create a Firebase project with Firestore and Google sign-in, then fill in `firebase-config.js` with your Firebase web app values.

Use these Firestore rules:

```js
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/tracker/manhwas {
      allow read, write: if request.auth != null
        && request.auth.uid == userId;
    }
  }
}
```

When `firebase-config.js` has real Firebase values, the header shows a Google sign-in button. In the Firebase console, enable **Google** under Authentication > Sign-in method and keep both `localhost` and `reading-tracker-f8816.firebaseapp.com` in Authentication > Settings > Authorized domains. The Electron app serves its local UI through a loopback-only `localhost` address so Google sign-in can return safely to the desktop app. On sign-in, local-only titles are merged into Firestore; for the same title, the later read date or higher chapter wins. Downloaded files remain device-local and are not synced. After that, Firestore becomes the shared source of truth.

Firebase web config is safe to ship with a browser app. Keep the Firestore rules above in place because those rules protect the tracker data.

## Tier lists and sharing

Open **Tier Lists** to rank titles from your reading library in S, A, B, C, D, or F. Titles marked **Plan to Read** stay out of the ranking pool until you start reading them. You can drag titles between tiers or use the menu on each title, search the unranked pool, and make multiple named lists.

The board, shared page, and PNG export use cover shaped title cards. Titles wrap at a readable size, and unusually long titles make their cards taller instead of being cut off. The PNG export places up to seven cards across each tier so a large collection stays manageable when zoomed.

Tier lists save separately from reading progress in this browser. When signed in, they also sync as a separate field in your existing private Firestore tracker document; no new Firestore rules are needed. New reading titles appear in the unranked pool. Deleting a manhwa removes it from every tier list and records its ID locally and in Firestore, so the repository snapshot or another synced device does not restore it. Deleting a tier list does not delete any manhwa.

Choose **Copy Share Link** for a static web page your friends can open without an account. Each ranked title links to its saved reading URL when one exists; these may point to a particular chapter. The list name, ranked titles, and those URLs are encoded in the link itself. No Firestore access is given to viewers, and the link contains no notes or reading progress. Later edits or deletions do not change a link already copied. When run locally or in the desktop app, the button uses the GitHub Pages site, so publish the new `share.html`, `share.js`, and `tier-share-codec.js` files before sending links.

Choose **Share Image** to use your device's share menu when available, or download a PNG otherwise. **Download PNG** always saves the image. PNG images do not have clickable links.

## Offline reading

Each manhwa card has a **Download Offline** action. Use it to add chapter image files or PDFs from your device, then read them later with **Read Offline** even without the source site.

You can also paste one direct image URL per line in the offline manager. These are processed through the app's download queue, then saved to IndexedDB. Browser security rules mean this only works when the image host allows cross-origin downloads. The app cannot reliably scrape arbitrary manga chapter pages from reader sites without a desktop companion service.

Offline files are stored locally in the browser with IndexedDB. The tracker remembers which manhwas have offline copies, but the actual image/PDF files stay on the device where you saved them.

## Desktop app

The Electron shell keeps the same tracker interface and local offline library, but its direct-image queue downloads through the desktop process. That avoids browser CORS restrictions for direct image files. It deliberately accepts only `http` and `https` image responses, rejects non-images, limits each image to 50 MB, and does not expose Node.js APIs to the page.

Install the desktop dependency once:

```sh
npm install
```

Then launch it either way:

```sh
npm start
```

Or, in Finder, double-click **Luxe Manhwa Tracker.app** in this project folder. It opens the tracker as a normal macOS app, without a Terminal window. The launcher uses the Electron runtime installed by `npm install`, so keep the project folder and its `node_modules` folder together. If you prefer launching from Terminal but want to close it immediately afterward, use:

```sh
npm run start:detached
```

If your npm setup asks you to approve install scripts, approve Electron's post-install script so it can download its official desktop runtime.

Chapter downloads require a connector for that particular source site; a reader-page URL cannot be downloaded directly.

The desktop app detects the source from each manhwa's saved chapter link and only enables a compatible site connector. It currently includes an AsuraScans connector for public URLs in the format `https://asurascans.com/comics/<series>/chapter/<chapter>`. When a supported, working link is saved, choose an inclusive start and end chapter, then select **Queue Chapters**. Unsupported or broken sources remain unavailable until a connector is added. The connector extracts public chapter-page image URLs and sends them through the normal offline queue. It does not handle logins, premium chapters, or bypass site protections.

Offline copies from an Asura range keep their chapter number, so the reader's previous and next controls move between downloaded chapters. The reader also includes zoom controls and blackout mode. Image downloads pause for 750 ms between requests, while chapter lookups use a gentler 2-second pause. The queue automatically retries rate limits, timeouts, and server errors up to three times using increasing delays. A failed chapter lookup no longer stops the rest of a selected range, and a range skips chapters that are already downloaded or queued. The queue and saved list are grouped by chapter; a failed chapter can be deleted to remove its partial download before retrying. Use **Delete Download** in the offline manager to remove all saved chapters for that manhwa from this device without deleting the tracker entry.

## Updating The Repository Snapshot

To publish the tracker currently saved in a browser, open that tracker in the browser or desktop app, open its DevTools console, and run:

```js
(() => {
  const data = localStorage.getItem('luxe_manhwa_tracker_data_v6');
  if (!data) throw new Error('No tracker data was found for this app origin.');
  const link = document.createElement('a');
  link.href = URL.createObjectURL(new Blob([data], { type: 'application/json' }));
  link.download = 'reading-tracker-data.json';
  link.click();
  setTimeout(() => URL.revokeObjectURL(link.href), 0);
})();
```

Import the downloaded file into the tracked repository snapshot:

```sh
npm run import:tracker -- ~/Downloads/reading-tracker-data.json
git add data/manhwas.json
```

The app merges this snapshot with local browser data when it starts. Local-only titles are added, newer progress wins for matching IDs, and offline downloads remain on the device.

## Development Note

Before making or pushing changes, check `git status` and make sure app changes are intentional.
