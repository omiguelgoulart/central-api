import "express-serve-static-core";

declare module "express-serve-static-core" {
  interface Request {
    userLogadoId?: string;
    userLogadoNome?: string;
  }
}

export {};