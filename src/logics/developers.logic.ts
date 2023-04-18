import { NextFunction, Request, Response, query } from "express";
import {
  IDeveloperRequest,
  IDeveloperInfoRequest,
  IDevelopers,
  IDeveloperInfo,
} from "../interfaces/developers.interfaces";
import format from "pg-format";
import { QueryConfig, QueryResult } from "pg";
import { client } from "../database";

const createDeveloper = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const developerData: IDeveloperRequest = req.body;

  const queryString: string = format(
    `
            INSERT INTO
                developers(%I)
            VALUES
                (%L)
            RETURNING *;
        `,
    Object.keys(developerData),
    Object.values(developerData)
  );

  const queryResult: QueryResult<IDevelopers> = await client.query(queryString);

  return res.status(201).json(queryResult.rows[0]);
};

const createDeveloperInfo = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const developerInfo: IDeveloperInfoRequest = req.body;
  developerInfo.developerId = parseInt(req.params.id);

  const queryString: string = format(
    `
      INSERT INTO
      developer_infos(%I)
      VALUES
        (%L)
      RETURNING *;           
    `,
    Object.keys(developerInfo),
    Object.values(developerInfo)
  );

  const queryResult: QueryResult<IDeveloperInfo> = await client.query(
    queryString
  );
  return res.status(201).json(queryResult.rows[0]);
};

const CheckInformationExists = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  const id = parseInt(req.params.id);

  const queryString: string = `
        SELECT
            *
        FROM
            developer_infos
        WHERE
            "id" = $1
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
      message: "Developer infos already exists.",
    });
  }

  return next();
};

const getDevelopers = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const queryString: string = `  
  SELECT
    dev."id" "developerId",
    dev."name",
    dev."email",
    si."developerSince",
    si."preferredOS"
FROM
    developers dev 
LEFT JOIN
    developer_infos si ON dev."id" = si."developerId";  
  `;

  const queryResult: QueryResult<IDevelopers> = await client.query(queryString);
  return res.json(queryResult.rows);
};

const getDeveloperById = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const id: number = parseInt(req.params.id);
  const queryString: string = `
  SELECT
  dev."id" "developerId",
  dev."name" as "developerName",
  dev."email" as "developerEmail",
  di."developerSince" as "developerInfoDeveloperSince",
  di."preferredOS" as "developerInfoPreferredOS"
FROM
  developers dev 
LEFT JOIN
  developer_infos di ON dev."id" = di."developerId"
WHERE
  dev."id" = $1;
`;
  const queryConfig: QueryConfig = {
    text: queryString,
    values: [id],
  };

  const queryResult: QueryResult<IDevelopers> = await client.query(queryConfig);

  return res.json(queryResult.rows[0]);
};

const updateDeveloperInfo = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const id: number = parseInt(req.params.id);
  const developerInfoData: Partial<IDeveloperInfoRequest> = req.body;

  if (developerInfoData.developerId) {
    delete developerInfoData.developerId;
  }

  const queryString: string = format(
    `
  UPDATE 
    developer_infos
SET(%I) = ROW(%L)
WHERE
    "developerId" = $1
    RETURNING *;  
  `,
    Object.keys(developerInfoData),
    Object.values(developerInfoData)
  );

  const queryConfig: QueryConfig = {
    text: queryString,
    values: [id],
  };

  const queryResult: QueryResult<IDeveloperInfo> = await client.query(
    queryConfig
  );

  return res.json(queryResult.rows[0]);
};

const deleteDeveloper = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const id: number = parseInt(req.params.id);

  const queryStringDevelopers: string = `
    DELETE FROM 
      developers
    WHERE 
      id = $1
  `;
  const queryConfigDevelopers: QueryConfig = {
    text: queryStringDevelopers,
    values: [id],
  };
  await client.query(queryConfigDevelopers);

  return res.status(204).send();
};

const updateDevelopers = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const id: number = parseInt(req.params.id);
  const developerInfoData: Partial<IDeveloperInfoRequest> = req.body;

  if (developerInfoData.developerId) {
    delete developerInfoData.developerId;
  }

  const queryString: string = format(
    `
  UPDATE 
    developers
SET(%I) = ROW(%L)
WHERE
    "id" = $1
    RETURNING *;  
  `,
    Object.keys(developerInfoData),
    Object.values(developerInfoData)
  );

  const queryConfig: QueryConfig = {
    text: queryString,
    values: [id],
  };

  const queryResult: QueryResult<IDeveloperInfo> = await client.query(
    queryConfig
  );

  return res.json(queryResult.rows[0]);
};

export {
  createDeveloper,
  createDeveloperInfo,
  getDevelopers,
  getDeveloperById,
  updateDeveloperInfo,
  deleteDeveloper,
  CheckInformationExists,
  updateDevelopers,
};
