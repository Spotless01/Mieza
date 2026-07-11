module.exports =
  (...allowedRoles) => {

    return (
      req,
      res,
      next
    ) => {

      if (
        !req.admin ||
        !req.admin.role
      ) {

        return res.status(401).json({
          message:
            "Admin authentication required"
        });

      }

      if (
        !allowedRoles.includes(
          req.admin.role
        )
      ) {

        return res.status(403).json({
          message:
            "You do not have permission to perform this action"
        });

      }

      next();

    };

  };