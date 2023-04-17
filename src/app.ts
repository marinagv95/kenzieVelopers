import express, { Application } from "express";
import "dotenv/config";
import {
  updateDeveloperInfo,
  createDeveloper,
  createDeveloperInfo,
  deleteDeveloper,
  getDeveloperById,
  getDevelopers,
  updateDevelopers,
  CheckInformationExists,
} from "./logics/developers.logic";
import { startDatabase } from "./database";
import {
  emailUsed,
  ensureDeveloperIDExists,
  ensureDevelopersExists,
  validateOs,
} from "./middlewares/developers.middleware";
import {
  createProject,
  getProjectsByDeveloperId,
  updateProjects,
  deleteProject,
  deleteTechnologie,
  createProjectsTechnologies,
} from "./logics/projects.logic";
import {
  ensureTechnologieExists,
  ensureProjectExists,
} from "./middlewares/projects.middleware";

const app: Application = express();
app.use(express.json());

app.post("/developers", emailUsed, createDeveloper);
app.post(
  "/developers/:id/infos",
  ensureDevelopersExists,
  CheckInformationExists,
  validateOs,
  createDeveloperInfo
);
app.get("/developers", getDevelopers);
app.get("/developers/:id", ensureDevelopersExists, getDeveloperById);
app.patch(
  "/developers/:id",
  ensureDevelopersExists,
  emailUsed,
  updateDevelopers
);
app.patch("/developers/:id/infos", ensureDevelopersExists, updateDeveloperInfo);
app.delete("/developers/:id", ensureDevelopersExists, deleteDeveloper);

app.post("/projects", ensureDevelopersExists, createProject);
app.get("/projects/:id", ensureProjectExists, getProjectsByDeveloperId);
app.patch(
  "/projects/:id",
  ensureProjectExists,
  ensureDeveloperIDExists,
  updateProjects
);
app.delete("/projects/:id", ensureProjectExists, deleteProject);

app.post(
  "/projects/:id/technologies",
  ensureProjectExists,
  ensureTechnologieExists,
  createProjectsTechnologies
);
app.delete(
  "/projects/:id/technologies/:name",
  ensureProjectExists,
  ensureTechnologieExists,
  deleteTechnologie
);

export default app;
