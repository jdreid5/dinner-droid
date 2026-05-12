"use client";

import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useState,
} from "react";
import type { User } from "@/app/types/recipe";
import * as api from "@/lib/api";

type AuthContextValue = {
	user: User | null;
	loading: boolean;
	login: (email: string, password: string) => Promise<void>;
	signup: (email: string, password: string, name?: string) => Promise<void>;
	logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		api
			.getMe()
			.then(({ user }) => setUser(user))
			.catch(() => setUser(null))
			.finally(() => setLoading(false));
	}, []);

	const login = useCallback(async (email: string, password: string) => {
		const { user } = await api.login(email, password);
		setUser(user);
	}, []);

	const signup = useCallback(
		async (email: string, password: string, name?: string) => {
			const { user } = await api.signup(email, password, name);
			setUser(user);
		},
		[],
	);

	const logout = useCallback(async () => {
		await api.logout();
		setUser(null);
	}, []);

	return (
		<AuthContext value={{ user, loading, login, signup, logout }}>
			{children}
		</AuthContext>
	);
}

export function useAuth(): AuthContextValue {
	const ctx = useContext(AuthContext);
	if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
	return ctx;
}
