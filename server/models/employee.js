'use strict';

module.exports = function(Employee) {

    Employee.observe('after save', function(ctx, next) {
        if (ctx.instance && ctx.isNewInstance) {
          const Role = Employee.app.models.Role;
      
          Role.findOne({ where: { name: 'EmployeeRole' } }, function(err, role) {
            if (err) return next(err);
            if (role) {
              const RoleMapping = Employee.app.models.RoleMapping;
              const newRoleMapping = {
                principalType: RoleMapping.USER,
                principalId: ctx.instance.id,
                roleId: role.id,
              };
              
              RoleMapping.create(newRoleMapping, function(err) {
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
