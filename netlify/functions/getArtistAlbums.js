import { spotifyApi, authorizeSpotify } from "./spotifyClient";

export async function handler(event) {
    try {
        const { id } = JSON.parse(event.body || "{}");

        if (!id) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: "Artist ID required" }),
            };
        }

        // Make sure Spotify is authorized
        await authorizeSpotify();

        // Fetch albums for that artist
        const result = await spotifyApi.getArtistAlbums(id, {
            limit: 20,
            include_groups: "album,single",
        });

        return {
            statusCode: 200,
            body: JSON.stringify(result.body),
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message }),
        };
    }
}
