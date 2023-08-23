'use strict';
const _ = require('lodash');
const Producer = require('../services/producer');

module.exports = function (Request) {
  Request.validatesInclusionOf('status', {
    in: ['pending', 'accepted', 'rejected'],
    message: 'Status must be one of: pending, accepted, rejected',
  });

  Request.validatesLengthOf('nationalId', {min: 14, max:14,message: {min: 'nationa lId is not  valid',max: 'nationalId is not valid'}});

  Request.validateNumber = function (err) {
    if (!/^[0-9]+$/.test(this.nationalId)) {
      err();
    }
  };
  
  Request.validate('nationalId', Request.validateNumber, {
    message: 'National ID must be a valid number.'
  });

  Request.beforeRemote('create', function (ctx, instance, next) {
    const data = ctx.req.body;
    const userId = _.get(ctx, 'req.accessToken.userId');

    if (!userId) {
      const err = new Error('You are not authenticated!');
      err.statusCode = 400;
      return next(err);
    }

    if (!data.serviceId) {
      const err = new Error('serviceId is required.');
      err.statusCode = 400;
      return next(err);
    }

    data.citizenId = userId;

    next();
  });

  Request.updateStatus = function (id, status, callback) {
    Request.findById(id, async function (err, request) {
      if (err) return callback(err);
      if (!request) {
        const error = new Error('Request not found');
        error.statusCode = 404;
        return callback(error);
      }

      // if(request.status!=='pending')
      // {
      //   const error = new Error('Canot update this request');
      //   error.statusCode = 401;
      //   return callback(error);
      // }


      request.status = status;
      request.save(async function (err, updatedRequest) {
        if (err) return callback(err);

        const Citizen = Request.app.models.Citizen;
        const citizen = await Citizen.findById(request.citizenId)
        if (citizen) {
          // send notification 
          const producer = new Producer();
          producer.publishMessage('mail', {
            email: citizen.email,
            status: request.status
          });
        }

        callback(null, updatedRequest);
      });



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
