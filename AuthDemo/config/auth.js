module.exports = {
    'facebookAuth' : {
        'clientID'      : process.env.FB_APP_ID, // your App ID
        'clientSecret'  : process.env.FB_APP_SECRET, // your App Secret
        'callbackURL'   : 'https://whispering-brook-14323.herokuapp.com/auth/facebook/callback'
    }
};
