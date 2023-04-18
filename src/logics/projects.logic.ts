import { Request, Response } from "express";
import { IProject, IProjectRequest } from "../interfaces/projects.interfaces";
import format from "pg-format";
import { QueryConfig, QueryResult } from "pg";
import { client } from "../database";

const createProject = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const projectDate: IProjectRequest = req.body;

  const queryString: string = format(
    `
    INSERT INTO  
        projects (%I)
    VALUES
        (%L)
    RETURNING *;  
        `,
    Object.keys(projectDate),
    Object.values(projectDate)
  );

  const queryResult: QueryResult<IProject> = await client.query(queryString);

  return res.status(201).json(queryResult.rows[0]);
};

const getProjectsByDeveloperId = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const id: number = parseInt(req.params.id);
  const queryString: string = `
  SELECT
            pro."id" AS "projectId",
            pro."name" AS "projectName",
            pro."description" AS "projectDescription",
            pro."estimatedTime" AS "projectEstimatedTime",
            pro."repository" AS "projectRepository",
            pro."startDate" AS"projectStartDate",
            pro."endDate" AS "projectEndDate",
            pro."developerId" AS "projectDeveloperId",
            projt."technologyId",
            projt."projectId",
            tec."name"
FROM
            projects pro
            LEFT JOIN projects_technologies projt ON pro."id" = projt."projectId"
            LEFT JOIN technologies tec ON projt."technologyId" = tec."id"
WHERE
    pro."id" = $1;
    
  `;
  const queryConfig: QueryConfig = {
    text: queryString,
    values: [id],
  };

  const queryResult: QueryResult<IProject> = await client.query(queryConfig);

  return res.status(200).json(queryResult.rows);
};

const updateProjects = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const id: number = parseInt(req.params.id);
  const projectData: Partial<IProject> = req.body;

  if (projectData.id) {
    delete projectData.id;
  }

  const queryString: string = format(
    `
  UPDATE 
    projects
SET(%I) = ROW(%L)
WHERE
    "id" = $1
    RETURNING *;  
  `,
    Object.keys(projectData),
    Object.values(projectData)
  );

  const queryConfig: QueryConfig = {
    text: queryString,
    values: [id],
  };

  const queryResult: QueryResult<IProject> = await client.query(queryConfig);

  return res.status(200).json(queryResult.rows[0]);
};

const deleteProject = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const id: number = parseInt(req.params.id);

  const queryString: string = `
        DELETE FROM 
            projects
        WHERE 
        "id" = $1
    `;

  const queryConfig: QueryConfig = {
    text: queryString,
    values: [id],
  };
  await client.query(queryConfig);
  return res.status(204).send();
};

const createProjectsTechnologies = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const tecData: { name: string } = req.body;
  const projectId: number = parseInt(req.params.id);

  const technologyQuery = `
    SELECT
      technologies."id" as "technologyId",
      technologies."name" as "technologyName",
      projects."id" as "projectId",
      projects."name" as "projectName",
      projects."description" as "projectDescription",
      projects."estimatedTime" as "projectEstimatedTime",
      projects."repository" as "projectRepository",
      projects."startDate" as "projectStartDate",
      projects."endDate" as "projectEndDate"
    FROM
      technologies
      LEFT JOIN projects_technologies ON technologies.id = projects_technologies."technologyId"
      LEFT JOIN projects ON projects.id = projects_technologies."projectId"
    WHERE
      technologies.name = $1 AND projects.id = $2

  `;

  const technologyValues = [tecData.name, projectId];

  const { rows } = await client.query(technologyQuery, technologyValues);
  const technologiesCount = await client.query(
    technologyQuery,
    technologyValues
  );

  if (technologiesCount.rowCount > 0) {
    return res.status(409).json({ message: "technologies already exists" });
  }

  if (rows.length > 0) {
    return res.status(200).json(rows[0]);
  }

  const insertQuery = `
      WITH inserted_tec AS (
        INSERT INTO technologies (name)
        VALUES ($1)
        RETURNING *
      )
      INSERT INTO projects_technologies ("addedIn", "technologyId", "projectId")
      VALUES ($2, (SELECT id FROM inserted_tec), $3)
      RETURNING *;
    `;

  const addedIn = new Date();

  const insertValues = [tecData.name, addedIn, projectId];

  const insertResult = await client.query(insertQuery, insertValues);

  const queryStringSelect: string = `
  SELECT
  technologies."id" as "technologyId",
  technologies."name" as "technologyName",
  projects."id" as "projectId",
  projects."name" as "projectName",
  projects."description" as "projectDescription",
  projects."estimatedTime" as "projectEstimatedTime",
  projects."repository" as "projectRepository",
  projects."startDate" as "projectStartDate",
  projects."endDate" as "projectEndDate"
FROM
  technologies
  LEFT JOIN projects_technologies ON technologies.id = projects_technologies."technologyId"
  LEFT JOIN projects ON projects.id = projects_technologies."projectId"
WHERE
  technologies.name = $1 AND projects.id = $2

`;

  const queryConfigSelect: QueryConfig = {
    text: queryStringSelect,
    values: [tecData.name, projectId],
  };

  const queryResultSelect: QueryResult = await client.query(queryConfigSelect);

  return res.status(201).json(queryResultSelect.rows[0]);
};

const deleteTechnologie = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { id: projectId, name: technologyName } = req.params;

  const queryString: string = `
  DELETE FROM
    technologies
  USING 
    projects_technologies
    LEFT JOIN projects ON projects.id = projects_technologies."projectId"
  WHERE 
    "projectId" = $1 
    AND technologies.id = projects_technologies."technologyId" 
    AND technologies.name = $2
`;

  const queryConfig: QueryConfig = {
    text: queryString,
    values: [projectId, technologyName],
  };

  await client.query(queryConfig);

  return res.status(204).send();
};

export {
  createProject,
  getProjectsByDeveloperId,
  updateProjects,
  deleteProject,
  createProjectsTechnologies,
  deleteTechnologie,
};
