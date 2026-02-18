"use client";
import { createContext, useContext, useState } from "react";

type Portion = { portions: number; setPortions: (n: number) => void };
const PortionContext = createContext<Portion | null>(null);

export function PortionProvider({ children }: { children: React.ReactNode }) {
	const [portions, setPortions] = useState(2);

	return (
		<PortionContext.Provider value={{ portions, setPortions}}>
			{children}
		</PortionContext.Provider>
	);
}

export function usePortions() {
	const ctx = useContext(PortionContext);
	if (!ctx) {
		throw new Error("usePortions must be used within a PortionProvider");
	}
	return ctx;
}