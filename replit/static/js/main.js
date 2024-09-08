document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('upload-form');
    const status = document.getElementById('status');
    const result = document.getElementById('result');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(form);
        
        status.textContent = 'Uploading and processing...';
        result.textContent = '';

        try {
            const response = await fetch('/upload', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (response.ok) {
                status.textContent = 'File processed successfully!';
                result.innerHTML = `
                    <h2>Summary</h2>
                    <p>${data.summary}</p>
                    <h2>Chapter Summary</h2>
                    <p>${data.chapter_summary}</p>
                    <h2>Chapters</h2>
                    <ul>
                        ${data.chapters.map(chapter => `
                            <li>
                                <h3>${chapter.title}</h3>
                                <p>${chapter.summary}</p>
                            </li>
                        `).join('')}
                    </ul>
                    <h2>Full Transcription</h2>
                    <p>${data.transcription}</p>
                    <h2>Blog Post</h2>
                    <p><a href="${data.post_url}" target="_blank">View the created blog post</a></p>
                `;
            } else {
                throw new Error(data.error || 'An error occurred');
            }
        } catch (error) {
            status.textContent = `Error: ${error.message}`;
        }
    });
});
