import { randomBytes, createHash } from "crypto";
import argon2 from "argon2";
import { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";

declare global {
	namespace Express {
		interface Request {
			auth?: {
				user: { id: number; email: string; name: string | null };
				session: { id: string };
			};
		}
	}
}

const SESSION_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
const COOKIE_NAME = "dd_session";

export function hashPassword(plain: string): Promise<string> {
	return argon2.hash(plain);
}

export function verifyPassword(hash: string, plain: string): Promise<boolean> {
	return argon2.verify(hash, plain);
}

function sha256(input: string): string {
	return createHash("sha256").update(input).digest("hex");
}

export async function createSessionToken(
	prisma: PrismaClient,
	userId: number,
	req: Request,
): Promise<string> {
	const rawToken = randomBytes(32).toString("hex");
	const tokenHash = sha256(rawToken);

	await prisma.session.create({
		data: {
			userId,
			tokenHash,
			expiresAt: new Date(Date.now() + SESSION_MAX_AGE_MS),
			userAgent: req.headers["user-agent"] ?? null,
			ipAddress: req.ip ?? null,
		},
	});

	return rawToken;
}

export function setSessionCookie(res: Response, token: string): void {
	res.cookie(COOKIE_NAME, token, {
		httpOnly: true,
		sameSite: "lax",
		path: "/api",
		maxAge: SESSION_MAX_AGE_MS,
		secure: process.env.NODE_ENV === "production",
	});
}

export function clearSessionCookie(res: Response): void {
	res.clearCookie(COOKIE_NAME, {
		httpOnly: true,
		sameSite: "lax",
		path: "/api",
		secure: process.env.NODE_ENV === "production",
	});
}

export function createAuthMiddleware(prisma: PrismaClient) {
	return async (req: Request, res: Response, next: NextFunction) => {
		const token: string | undefined = req.cookies?.[COOKIE_NAME];

		if (!token) {
			res.status(401).json({ error: "Authentication required" });
			return;
		}

		const tokenHash = sha256(token);

		const session = await prisma.session.findUnique({
			where: { tokenHash },
			include: {
				user: { select: { id: true, email: true, name: true } },
			},
		});

		if (
			!session ||
			session.expiresAt < new Date() ||
			session.revokedAt !== null
		) {
			res.status(401).json({ error: "Session expired or invalid" });
			return;
		}

		await prisma.session.update({
			where: { id: session.id },
			data: { lastUsedAt: new Date() },
		});

		req.auth = {
			user: session.user,
			session: { id: session.id },
		};

		next();
	};
}
