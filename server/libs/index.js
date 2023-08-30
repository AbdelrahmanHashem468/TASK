const asycnWrapper = (promise) => promise
  .then((data) => [undefined, data])
  .catch((error) => [error]);

  
const client = require('./redis');



module.exports = {
  asycnWrapper,
  client
};
