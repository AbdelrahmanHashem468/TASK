'use strict';
const _ = require('lodash');

module.exports = function (Request) {
  Request.beforeRemote('create', function (ctx, instance, next) {
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

  Request.updateStatus = function (id, status, callback) {
    Request.findById(id, function (err, request) {
      if (err) return callback(err);
      if (!request) {
        const error = new Error('Request not found');
        error.statusCode = 404;
        return callback(error);
      }

      if(request.status!=='pending')
      {
        const error = new Error('Canot update this request');
        error.statusCode = 401;
        return callback(error);
      }


      request.status = status;
      request.save(function (err, updatedRequest) {
        if (err) return callback(err);
        callback(null, updatedRequest);
      });

      // send notification 

    });
  };

  Request.remoteMethod('updateStatus', {
    http: {
      path: '/:id/updateStatus',
      verb: 'patch',
    },
    accepts: [
      { arg: 'id', type: 'string', required: true },
      { arg: 'status', type: 'string', required: true },
    ],
    returns: { arg: 'data', type: 'object', root: true },
  });
};
