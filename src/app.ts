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
import { ensureTechnologieExists } from "./middlewares/projects.middleware";

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
app.get("/projects/:id", ensureDevelopersExists, getProjectsByDeveloperId);
app.patch(
  "/projects/:id",
  ensureDevelopersExists,
  ensureDeveloperIDExists,
  updateProjects
);
app.delete("/projects/:id", ensureDevelopersExists, deleteProject);

app.post(
  "/projects/:id/technologies",
  ensureDevelopersExists,
  createProjectsTechnologies
);
app.delete("/projects/:id/technologies/:name", deleteTechnologie);

// app.listen(3000, async () => {
//   await startDatabase();
//   const host = "localhost";
//   const port = 3000;
//   console.log(`Server running at http://${host}:${port}/`);
// });

export default app;
