import { requireKitchenAccess } from '@/actions/kitchen/auth';

/**
 * Server-Sent Events (SSE) Endpoint for Kitchen Real-Time Updates.
 * This connects kitchen clients to live order updates without polling.
 */
export async function GET(req: Request) {
  try {
    const user = await requireKitchenAccess();

    let controller: ReadableStreamDefaultController;
    const stream = new ReadableStream({
      start(c) {
        controller = c;
      },
      cancel() {
        // Cleanup if needed when client disconnects
      },
    });

    // In a real application, you would attach `controller.enqueue` to an EventEmitter 
    // or Redis PubSub channel specific to `user.kitchenId`.
    // For this prototype, we'll send an initial heartbeat to establish connection.

    const sendEvent = (data: any) => {
      if (controller) {
        controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify(data)}\n\n`));
      }
    };

    sendEvent({ type: 'CONNECTED', kitchenId: user.kitchenId });

    // Mock ping every 30s to keep connection alive
    const interval = setInterval(() => {
      sendEvent({ type: 'PING' });
    }, 30000);

    // This simulates how a real system would push an event:
    // global.eventEmitter.on(`kitchen_${user.kitchenId}`, (event) => sendEvent(event));

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    return new Response('Unauthorized', { status: 401 });
  }
}
