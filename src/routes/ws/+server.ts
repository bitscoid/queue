import type { RequestHandler } from './$types';

// File ini berfungsi untuk menunjukkan bahwa WebSocket tersedia di path ini
// Namun implementasi WebSocket sebenarnya diintegrasikan melalui hooks.server.ts
// karena SvelteKit tidak mendukung WebSocket upgrade secara langsung di route handler
export const GET: RequestHandler = async () => {
	const response = new Response(
		JSON.stringify({
			message: 'WebSocket endpoint is available at this path',
			endpoint: '/ws',
			connection_info: 'Connect using WebSocket protocol (ws:// or wss://)',
			status: 'active'
		}),
		{ 
			headers: { 
				'Content-Type': 'application/json'
			},
			status: 200
		}
	);
	
	// Tambahkan header yang menunjukkan bahwa WebSocket upgrade tersedia di path ini
	response.headers.set('Upgrade', 'websocket');
	response.headers.set('Connection', 'Upgrade');
	
	return response;
};