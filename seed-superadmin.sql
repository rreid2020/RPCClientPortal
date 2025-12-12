INSERT INTO global_roles ("userId", role) 
VALUES ('rreid2020', 'superadmin') 
ON CONFLICT ("userId") 
DO UPDATE SET role = 'superadmin';




