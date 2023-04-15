interface IDevelopers {
  id: number;
  name: string;
  email: string;
}

type IDeveloperRequest = Omit<IDevelopers, "id">;

interface IDeveloperInfo {
  id: number;
  developerSince: Date;
  preferredOS: "Windows" | "Linux" | "MacOS";
  developerId?: number;
}

type IDeveloperInfoRequest = Omit<IDeveloperInfo, "id">;

export {
  IDevelopers,
  IDeveloperRequest,
  IDeveloperInfo,
  IDeveloperInfoRequest,
};
