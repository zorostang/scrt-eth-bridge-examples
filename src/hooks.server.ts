import connection from "$lib/db";

/** @type {import('@sveltejs/kit').Handle} */
export async function handle({ event, resolve }) {
    try {
        event.locals.connection = await connection;
    } catch (e) { console.error("connection error:", e); }
    const response = await resolve(event);
    return response;
}
