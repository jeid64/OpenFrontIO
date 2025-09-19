import { GameEnv } from "./Config";
import { DevServerConfig } from "./DevConfig";

export class EnvoyProxyServerConfig extends DevServerConfig {
  jwtAudience(): string {
    return "localhost:9001";
  }

  domain(): string {
    return "localhost:9001";
  }

  subdomain(): string {
    return "";
  }

  env(): GameEnv {
    return GameEnv.Dev; // Use Dev environment but with proxy settings
  }
}
