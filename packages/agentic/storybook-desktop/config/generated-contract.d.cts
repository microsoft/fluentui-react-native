import type { PlatformPath } from 'node:path';

export const credentialsVersion: 1;
export const driverManifestVersion: 3;
export const handoffVersion: 1;
export function parseCredentials(value: unknown): unknown;
export function parseDriverManifest(value: unknown): unknown;
export function parseHandoff(value: unknown): unknown;
export function generatedPathIdentity(value: string, paths?: PlatformPath): string;
export function sameGeneratedPath(left: string, right: string, paths?: PlatformPath): boolean;
