import { defaultShouldDehydrateQuery, environmentManager, QueryClient } from "@tanstack/react-query";

function makeQueryClient() {
	return new QueryClient({
		defaultOptions: {
			queries: {
				// SSR-এ data আসার পরপরই client যেন আবার fetch না করে
				staleTime: 60 * 1000,
			},
			dehydrate: {
				// server-এ যে query এখনো চলছে (pending), সেটাও client-এ stream হবে
				shouldDehydrateQuery: (query) => defaultShouldDehydrateQuery(query) || query.state.status === "pending",
				// error লুকানোর কাজ Next.js নিজেই করে, তাই এখানে বন্ধ
				shouldRedactErrors: () => false,
			},
		},
	});
}

let browserQueryClient: QueryClient | undefined;

export function getQueryClient() {
	if (environmentManager.isServer()) {
		// Server: প্রতিটা request-এ নতুন client, যাতে এক user-এর data অন্য user-এর কাছে না যায়
		return makeQueryClient();
	}

	// Browser: একটাই client পুরো app-এ ব্যবহার হবে
	if (!browserQueryClient) browserQueryClient = makeQueryClient();
	return browserQueryClient;
}
