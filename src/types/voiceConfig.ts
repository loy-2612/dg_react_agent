export interface IConfigData {
  auth: string;
  voice: string;
  greeting: string;
  language: string;
  thinkModel: string;
  listenModel: string;
  instructions: string;
  thinkProvider: string;
  provider: {
    baseUrl: string;
    token: string;
  };
}

export class ConfigData implements IConfigData {
  auth: string = "";
  voice: string = "";
  greeting: string = "";
  language: string = "";
  thinkModel: string = "";
  listenModel: string = "";
  instructions: string = "";
  thinkProvider: string = "";
  provider: { baseUrl: string; token: string } = { baseUrl: "", token: "" };
}
