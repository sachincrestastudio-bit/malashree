import { requireDriverAccess } from '@/actions/delivery/auth';

/**
 * Server-Sent Events (SSE) Endpoint for Delivery Real-Time Updates.
 * Allows drivers to receive new assignments instantly without polling.
 */
export async function GET(req: Request) {
  try {
    const { driverId } = await requireDriverAccess();

    let controller: ReadableStreamDefaultController;
    const stream = new ReadableStream({
      start(c) {
        controller = c;
      },
      cancel() {
        // Cleanup on disconnect
      },
    });

    const sendEvent = (data: any) => {
      if (controller) {
        controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify(data)}\n\n`));
      }
    };

    sendEvent({ type: 'CONNECTED', driverId });

    // Mock ping every 30s to keep connection alive
    const interval = setInterval(() => {
      sendEvent({ type: 'PING' });
    }, 30000);

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
