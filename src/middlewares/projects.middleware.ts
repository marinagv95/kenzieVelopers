import { NextFunction, Request, Response } from "express";
import { QueryConfig, QueryResult } from "pg";
import { client } from "../database";
import { IProject, ITechnologie } from "../interfaces/projects.interfaces";

const ensureTechnologieExists = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  let name: string = req.body.name;

  if (req.method === "DELETE") {
    name = req.params.name;
  }

  const queryString: string = `
    SELECT * FROM
        technologies
    WHERE 
        "name" = $1;
    `;

  const queryConfig: QueryConfig = {
    text: queryString,
    values: [name],
  };

  const queryResult: QueryResult<ITechnologie> = await client.query(
    queryConfig
  );

  if (queryResult.rowCount === 0) {
    return res.status(400).json({
      message: "Technology not supported.",
      options: [
        "JavaScript",
        "Python",
        "React",
        "Express.js",
        "HTML",
        "CSS",
        "Django",
        "PostgreSQL",
        "MongoDB",
      ],
    });
  }

  res.locals.technology = queryResult.rows[0];

  return next();
};

const ensureProjectExists = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  let id: number = parseInt(req.params.id);
  if (req.route.path === "/projects" && req.method === "POST") {
    id = req.body.projectId;
  }

  const queryString: string = `
        SELECT * FROM
            projects
        WHERE
            "id" = $1;
    `;

  const queryConfig: QueryConfig = {
    text: queryString,
    values: [id],
  };

  const queryResult: QueryResult<IProject> = await client.query(queryConfig);

  if (queryResult.rowCount === 0) {
    return res.status(404).json({
      message: "Project not found.",
    });
  }

  res.locals.project = queryResult.rows[0];

  return next();
};

const ensureProjectTecExists = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  const projectId: number = parseInt(req.params.id);
  const tecnologyId: number = parseInt(res.locals.technology.id);

  const queryString: string = `
    SELECT * FROM
        projects_technologies
    WHERE 
        "projectId" = $1 AND
        "technologyId" = $2;
    `;

  const queryConfig: QueryConfig = {
    text: queryString,
    values: [projectId, tecnologyId],
  };

  const queryResult: QueryResult<ITechnologie> = await client.query(
    queryConfig
  );

  if (queryResult.rowCount > 0) {
    return res.status(400).json({
      message: "Technology not related to the project.",
    });
  }

  return next();
};

export { ensureProjectExists, ensureTechnologieExists, ensureProjectTecExists };
