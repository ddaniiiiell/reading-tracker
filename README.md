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

When `firebase-config.js` has real Firebase values, the header shows a Google sign-in button. The first signed-in browser uploads its local tracker if the Firestore document is empty; after that, Firestore becomes the shared source of truth.

Firebase web config is safe to ship with a browser app. Keep the Firestore rules above in place because those rules protect the tracker data.

## Development note

Before making or pushing changes, check `git status` and make sure app changes are intentional. Local recovery files such as `data/manhwas.json` are ignored so they do not get published.
