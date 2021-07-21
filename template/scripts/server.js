const GoogleStrategy = require('passport-google-oauth2');

module.exports = ({ env }) => ({
  host: env('STRAPI_HOST', 'localhost'),
  port: env.int('STRAPI_PORT', 1337),
  url: env('STRAPI_URL', 'localhost'),
  registryUrl: env('REGISTRY_URL', 'localhost'),
  registryPort: env.int('REGISTRY_PORT', 9000),
  admin: {
    url: '/admin',
    auth: {
      secret: env('ADMIN_JWT_SECRET', '4d4da8202c60eb5a0b1a184c91315ab6'),
      providers: [
        {
          uid: 'google',
          displayName: 'Google',
          icon: 'https://cdn2.iconfinder.com/data/icons/social-icons-33/128/Google-512.png',
          createStrategy: strapi =>
            new GoogleStrategy(
              {
                clientID: env('GOOGLE_CLIENT_ID'),
                clientSecret: env('GOOGLE_CLIENT_SECRET'),
                scope: [
                  'https://www.googleapis.com/auth/userinfo.email',
                  'https://www.googleapis.com/auth/userinfo.profile',
                ],
                callbackURL: strapi.admin.services.passport.getStrategyCallbackURL('google'),
              },
              (request, accessToken, refreshToken, profile, done) => {
                done(null, {
                  email: profile.email,
                  firstname: profile.given_name,
                  lastname: profile.family_name,
                });
              }
            ),
        },
      ],
      events: {
        async onConnectionSuccess(e) {
          console.debug("User connected!")
          const { user, provider } = e;

          console.log(
            `A new user (${user.id}) has been logged using ${provider}`
          );

          const registryUser = await strapi.services.registry.getRegistry(user.email)
          console.debug("regUser = " + JSON.stringify(registryUser))

          const publ = await strapi.services.publinfo.find({ slug: registryUser.publication.props.slug })
          console.debug("publ = " + JSON.stringify(publ))
          try {
            if (registryUser && publ) {
              // Update admin panel user
              strapi.admin.services.user.updateById(user.id, {
                username: user.username,
                email: user.email,
                roles: [registryUser.role.props.id]
              }
              )
            }
          } catch (err) {
            console.error(err)
          }
        },

        onSSOAutoRegistration(e) {
          const { user, provider } = e;

          console.log(
            `A new user (${user.id}) has been automatically registered using ${provider}`
          );
        },
      },
    },
  },
});
