# Social VR

A WebVR Twitter feed built on [WebVR Boilerplate][boilerplate].

VR frontend uses [THREE.js][three] and node backend uses [Express][express] and [passport-twitter][passport] for OAuth.

Designed for use on Google Cardboard.

[three]: http://threejs.org/
[boilerplate]: https://github.com/borismus/webvr-boilerplate
[express]: https://expressjs.com/
[passport]: https://github.com/jaredhanson/passport-twitter

## Development

You will need to sign up and create a new app in the [Twitter Developer Portal][twitter].

In the application settings, set the `Callback URL` to `http://localhost:8000/auth/twitter/callback` for development.

Application will require Read and Write access. Set this in the `Permissions` tab.

Then generate Consumer Key and Secret and copy them into an `env.js` in the root directory:
```
module.exports = {
    CONSUMER_KEY: 'keyFromTwitterDev',
    CONSUMER_SECRET: 'secretFromTwitterDev'
};
```

Once the Twitter Application has been set up, the app is ready to run locally:

Run `npm install` and then `npm start`. Application will be hosted on `localhost:8000`

[twitter]: https://dev.twitter.com


