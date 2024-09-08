import axios from 'axios';

export class GhostAdmin {
    private static apiUrl = `${process.env.GHOST_ADMIN_URL}/ghost/api/v3/admin/posts/`;

    public static async publishPost(summary: string): Promise<string> {
        const headers = {
            Authorization: `Bearer ${process.env.GHOST_ADMIN_API_KEY}`
        };
        const body = {
            posts: [{
                title: 'Transcribed Blog Post',
                html: summary
            }]
        };

        const response = await axios.post(this.apiUrl, body, { headers });
        return response.data.posts[0].url;
    }
}
