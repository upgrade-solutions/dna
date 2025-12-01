import { neogma } from "./db.ts";

export interface Context {
  neogma: typeof neogma;
}

export const createContext = async (): Promise<Context> => {
  return {
    neogma,
  };
};
