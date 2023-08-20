
module.exports = function (app) {
   // Import the Role model
const Role = app.models.Role;
const RoleMapping = app.models.RoleMapping; 
const citizenRole = 'CitizenRole';

Role.findOne({ where: { name: citizenRole } }, function(err, existingRole) {
  if (err) {
    throw err;
  }

  if (existingRole) {
    // The role already exists, no need to create it again
    console.log(`Role '${citizenRole}' already exists`);
  } else {
    // Create the role if it doesn't exist
    Role.create({ name: citizenRole }, function(err, newRole) {
      if (err) {
        throw err;
      }
      
      console.log(`Role '${citizenRole}' created successfully`);
    });
  }
});
  

};

