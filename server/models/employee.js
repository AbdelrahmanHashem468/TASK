'use strict';

module.exports = function (Employee) {

  Employee.validatesLengthOf('nationalId', { min: 14, max: 14, message: { min: 'nationa lId is not  valid', max: 'nationalId is not valid' } });

  Employee.validateNumber = function (err) {
    if (!/^[0-9]+$/.test(this.nationalId)) {
      err();
    }
  };

  Employee.validate('nationalId', Employee.validateNumber, {
    message: 'National ID must be a valid number.'
  });

  Employee.observe('after save', function (ctx, next) {
    if (ctx.instance && ctx.isNewInstance) {
      const Role = Employee.app.models.Role;

      Role.findOne({ where: { name: 'EmployeeRole' } }, function (err, role) {
        if (err) return next(err);
        if (role) {
          const RoleMapping = Employee.app.models.RoleMapping;
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
          const error = new Error('Role "EmployeeRole" not found.');
          next(error);
        }
      });
    } else {
      next();
    }
  });
};
