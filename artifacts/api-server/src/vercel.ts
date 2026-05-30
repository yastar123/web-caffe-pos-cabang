import express from "express";
import app from "./app";

declare global {
  var __express: typeof express | undefined;
}

// Preserve import for Vercel detection
globalThis.__express = express;

export const config = {
  api: {
    bodyParser: false,
  },
};

export default app;
