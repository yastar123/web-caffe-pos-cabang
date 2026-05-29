import express from "express";
import app from "./app";
// Preserve import for Vercel detection
globalThis.__express = express;
export default app;
