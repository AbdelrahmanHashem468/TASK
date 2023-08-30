'use strict';

module.exports = function (Citizen) {

  Citizen.validatesLengthOf('nationalId', { min: 14, max: 14, message: { min: 'national Id is not  valid', max: 'nationalId is not valid' } });

  Citizen.validateNumber = function (err) {
    if (!/^[0-9]+$/.test(this.nationalId)) {
      err();
    }
  };
  

  Citizen.validate('nationalId', Citizen.validateNumber, {
    message: 'National ID must be a valid number.'
  });

  Citizen.observe('after save', function (ctx, next) {
    if (ctx.instance && ctx.isNewInstance) {
      const Role = Citizen.app.models.Role;

      Role.findOne({ where: { name: 'CitizenRole' } }, function (err, role) {
        if (err) return next(err);
        if (role) {
          const RoleMapping = Citizen.app.models.RoleMapping;
          const newRoleMapping = {
            principalType: RoleMapping.USER,
            principalId: ctx.instance.id,
            roleId: role.id,
          };

          RoleMapping.create(newRoleMapping, function (err) {
            if (err) return next(err);

            next();
          });
        } else {
          const error = new Error('Role "CitizenRole" not found.');
          next(error);
        }
      });
    } else {
      next();
    }
  });


  Citizen.getRequests = function (options, callback) {
    const userId = options && options.accessToken && options.accessToken.userId;

    if (!userId) {
      const error = new Error('User is not authenticated');
      error.statusCode = 401;
      return callback(error);
    }

    Citizen.app.models.RenewID.find({ where: { citizenId: userId } }, function (err, requests) {
      if (err) return callback(err);
      callback(null, requests);
    });
  };


  Citizen.remoteMethod('getRequests', {
    description: 'Get all requests belonging to the authenticated citizen',
    http: { verb: 'get', path: '/requests' },
    returns: { arg: 'requests', type: 'array', root: true },
  });
};

