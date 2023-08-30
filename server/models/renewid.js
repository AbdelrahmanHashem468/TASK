'use strict';
const _ = require('lodash');
const Producer = require('../services/producer');


module.exports = function (RenewID) {

  RenewID.validatesInclusionOf('status', {
    in: ['pending', 'accepted', 'rejected'],
    message: 'Status must be one of: pending, accepted, rejected',
  });

  RenewID.validatesLengthOf('nationalId', { min: 14, max: 14, message: { min: 'nationa lId is not  valid', max: 'nationalId is not valid' } });

  RenewID.validateNumber = function (err) {
    if (!/^[0-9]+$/.test(this.nationalId)) {
      err();
    }
  };

  RenewID.validate('nationalId', RenewID.validateNumber, {
    message: 'National ID must be a valid number.'
  });

  RenewID.beforeRemote('create', function (ctx, instance, next) {
    const data = ctx.req.body;
    const userId = _.get(ctx, 'req.accessToken.userId');

    if (!userId) {
      const err = new Error('You are not authenticated!');
      err.statusCode = 400;
      return next(err);
    }

    data.citizenId = userId;

    next();
  });

  RenewID.updateStatus = function (id, status, callback) {
    RenewID.findById(id, async function (err, renewid) {
      if (err) return callback(err);
      if (!renewid) {
        const error = new Error('RenewID not found');
        error.statusCode = 404;
        return callback(error);
      }
      if (renewid.status !== 'pending') {
        const error = new Error('Canot update this RenewID');
        error.statusCode = 401;
        return callback(error);
      }


      renewid.status = status;
      renewid.save(async function (err, updatedRenewID) {
        if (err) return callback(err);

        const Citizen = RenewID.app.models.Citizen;
        const citizen = await Citizen.findById(renewid.citizenId)
        if (citizen) {
          try {
            const producer = await Producer.getInstance();
             await producer.publishMessage('mail', {
              email: citizen.email,
              status: renewid.status
            });
          } catch (error) {
            // // return callback(error);
          }

        }

        callback(null, updatedRenewID);
      });



    });
  };

  RenewID.remoteMethod('updateStatus', {
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

  RenewID.updateData = async function (id, ctx) {
    try {
      // console.log(ctx);
      const userId = _.get(ctx, 'req.accessToken.userId');
      const renewid = await RenewID.findById(id);
      console.log(userId);
      console.log(renewid.citizenId);

      if (userId.toString() !== renewid.citizenId.toString()) {
        const err = new Error('You are not authorized to update this request!');
        err.statusCode = 401; // Use 401 for unauthorized access
        throw err;
      }
      const data = ctx.req.body;


      if (renewid.status !== 'rejected') {
        const err = new Error('You cannot update this request!');
        err.statusCode = 400; // Use 400 for bad request
        throw err;
      }

      if (data.status) {
        const err = new Error('You cannot update the request status!');
        err.statusCode = 400; // Use 400 for bad request
        throw err;
      }

      const updatedRenewID = await renewid.updateAttributes({
        name: data.name,
        nationalId: data.nationalId,
        status: 'pending'
      });

      return { message: 'Data updated successfully', updatedRenewID };
    } catch (err) {
      throw err; // This will be caught by LoopBack and handled appropriately

    }
  };

  RenewID.remoteMethod('updateData', {
    http: {
      path: '/:id/updateData',
      verb: 'patch',
    },
    accepts: [
      { arg: 'id', type: 'string', required: true },
      { arg: 'ctx', type: 'object', http: { source: 'context' } }
    ],
    returns: { arg: 'data', type: 'object', root: true },
  });
};




