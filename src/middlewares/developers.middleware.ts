import { Request, Response, NextFunction, query } from "express";
import { QueryConfig, QueryResult } from "pg";
import {
  IDeveloperInfo,
  IDevelopers,
} from "../interfaces/developers.interfaces";
import { client } from "../database";

const ensureDevelopersExists = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  let id: number = parseInt(req.params.id);

  if (req.route.path === "/projects" && req.method === "POST") {
    id = req.body.developerId;
  }

  const queryString: string = `
        SELECT
            *
        FROM
            developers
        WHERE
            id = $1   
   `;

  const queryConfig: QueryConfig = {
    text: queryString,
    values: [id],
  };
  const queryResult: QueryResult<IDevelopers> = await client.query(queryConfig);

  if (queryResult.rowCount === 0) {
    return res.status(409).json({
      message: "developers not found",
    });
  }

  res.locals.developers = queryResult.rows[0];
  return next();
};

const ensureDeveloperIDExists = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  let developerId: number = parseInt(req.body.developerId);

  const queryString: string = `
        SELECT
            *
        FROM
            developers
        WHERE
            id = $1   
   `;

  const queryConfig: QueryConfig = {
    text: queryString,
    values: [developerId],
  };
  const queryResult: QueryResult<IDevelopers> = await client.query(queryConfig);

  if (queryResult.rowCount === 0) {
    return res.status(404).json({
      message: "developer not found",
    });
  }

  res.locals.developers = queryResult.rows[0];
  return next();
};

const emailUsed = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  const email: string = req.body.email;

  const queryString: string = `
        SELECT
            *
        FROM
            developers
        WHERE
            email = $1   
   `;

  const queryConfig: QueryConfig = {
    text: queryString,
    values: [email],
  };
  const queryResult: QueryResult<IDevelopers> = await client.query(queryConfig);
  if (queryResult.rowCount > 0) {
    return res.status(409).json({
      message: "Email already exists",
    });
  }

  res.locals.developers = queryResult.rows[0];
  return next();
};

const validateOs = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  const validOS = ["Windows", "Linux", "MacOS"];
  const preferedOS: string = req.body.preferredOS;

  if (!validOS.includes(preferedOS)) {
    return res
      .status(400)
      .json({ message: "Invalid OS option.", options: validOS });
  }

  return next();
};

const developerInfoExists = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  const id: number = parseInt(req.params.id);

  const queryString: string = `
    SELECT *
    FROM developers
    WHERE id = $1   
  `;

  const queryConfig: QueryConfig = {
    text: queryString,
    values: [id],
  };

  const queryResult: QueryResult<IDeveloperInfo> = await client.query(
    queryConfig
  );

  if (queryResult.rowCount > 0) {
    return res.status(409).json({
      message: "Developer info already exists.",
    });
  }

  return next();
};

export {
  ensureDevelopersExists,
  emailUsed,
  validateOs,
  developerInfoExists,
  ensureDeveloperIDExists,
};
