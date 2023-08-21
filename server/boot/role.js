
module.exports = function (app) {

  const Role = app.models.Role;
  const citizenRole = 'CitizenRole';
  const employeeRole = 'EmployeeRole';

  Role.findOne({ where: { name: citizenRole } }, function (err, existingRole) {
    if (err) {
      throw err;
    }
    if (existingRole) {

      console.log(`Role '${citizenRole}' already exists`);
    } else {

      Role.create({ name: citizenRole }, function (err, newRole) {
        if (err) {
          throw err;
        }
        console.log(`Role '${citizenRole}' created successfully`);
      });
    }
  });

  Role.findOne({ where: { name: employeeRole } }, function (err, existingRole) {
    if (err) {
      throw err;
    }
    if (existingRole) {

      console.log(`Role '${employeeRole}' already exists`);
    } else {

      Role.create({ name: employeeRole }, function (err, newRole) {
        if (err) {
          throw err;
        }
        console.log(`Role '${employeeRole}' created successfully`);
      });
    }
  });
  // const RoleMapping = app.models.RoleMapping; // Replace 'app' with your LoopBack application object.
  // RoleMapping.find({ where: { principalId: '64e20b3751d1cf521841d9d3' } }, function(err, roleMappings) {
  //   if (err) throw err;
  
  //   console.log(roleMappings);
  // });
};

