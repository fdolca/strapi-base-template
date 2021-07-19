'use strict';
const axios = require('axios');

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/services.html#core-services)
 * to customize this service
 */

module.exports = {

  getRegistry: async (email) => {

    // Send GET to registry
    const options = {
      baseURL: strapi.config.get('server.registryUrl') + ":" + strapi.config.get('server.registryPort'),
      url: '/map/emails/' + email,
      method: 'GET'
    }

    try {
      console.debug("inizio chiamata api registry")

      const res = await axios(options)
      console.debug("fine chiamata api registry")
      if (res && res.data[0].email == email) {
        return res.data[0]
      }

    } catch (err) {
      console.error("Errore chiamata registry: " + err)
    }
    return undefined
  }
};
