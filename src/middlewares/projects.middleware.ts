import { NextFunction, Request, Response } from "express";
import { QueryConfig, QueryResult } from "pg";
import { client } from "../database";
import { ITechnologie } from "../interfaces/projects.interfaces";

const ensureTechnologieExists = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  let technologyId: number = req.body.technologyId;

  if (req.route.path === "/projects/:id/technologies/:technologyId") {
    technologyId = parseInt(req.params.technologyId);
  }

  const queryString: string = `
        SELECT
            *
        FROM
            technologies
        WHERE
            id = $1;
    `;

  const queryConfig: QueryConfig = {
    text: queryString,
    values: [technologyId],
  };

  const queryResult: QueryResult<ITechnologie> = await client.query(
    queryConfig
  );

  if (queryResult.rowCount === 0) {
    return res.status(404).json({
      message: "Technologie not found",
    });
  }
  return next();
};

export { ensureTechnologieExists };
