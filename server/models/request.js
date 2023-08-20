'use strict';
const _ = require('lodash');

module.exports = function(Request) {
    Request.beforeRemote('create', function(ctx, instance, next) {
        const data = ctx.req.body;
        const userId = _.get(ctx, 'req.accessToken.userId'); 

        if (!userId) {
            const err = new Error('"You are not authenticated!');
            err.statusCode = 400; 
            return next(err);
          }
    
        if (!data.serviceId) {
          const err = new Error('"serviceId" is required.');
          err.statusCode = 400; 
          return next(err);
        }
    
        data.citizenId = userId;
    
        next();
      });
};
