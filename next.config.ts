import type { NextConfig } from "next";

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    runtime: 'edge', // opcional para funciones edge
  }
}

export default nextConfig;
