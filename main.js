
document.getElementById('mood-form').addEventListener('submit', async (e) => {
    e.preventDefault();
  
    const mood = document.getElementById('mood').value;
    if (!mood) return alert('Please select a mood!');
  
    const playlistContainer = document.querySelector('.playlist');
    playlistContainer.innerHTML = '<p>Loading songs...</p>';
  
    try {
      const res = await fetch('/.netlify/functions/getTrack', {
        method: 'POST',
        body: JSON.stringify({ mood }),
      });
      if (!res.ok){
        const text = await res.text();
        console.error('Error response:', text);
        throw new Error('Network response was not ok');
      }
      const data = await res.json();
  
      if (data.error) throw new Error(data.error);
  
      playlistContainer.innerHTML = data.tracks
        .map(
          (t) => `
          <div class="song-card">
            <img src="${t.albumCover || 'https://via.placeholder.com/100'}" alt="Album cover">
            <p><strong>${t.name}</strong><br><span>${t.artist}</span></p>
            <a href="${t.url}" target="_blank">Open in Spotify</a>
          </div>`
        )
        .join('');
    } catch (err) {
      console.error(err);
      playlistContainer.innerHTML = '<p>Failed to load playlist 🙃</p>';
    }
  });
  
//This function is to switch from creating the playlist to look for an artist


const searchTypeSelect = document.getElementById("searchType");
const artistSection = document.getElementById("artist-section");
const moodSection = document.getElementById("mood-section");
const playlistSection = document.getElementById("playlist-preview")


searchTypeSelect.addEventListener("change", () => {
  const mode = searchTypeSelect.value;
  console.log(mode)

  if (mode === "artist"){
    artistSection.style.display = "block";
    moodSection.style.display = "none";
    playlistSection.style.display = "none";
  }else {
    artistSection.style.display = "none";
    moodSection.style.display = "block"
    playlistSection.style.display = "block";
  }
})

//  ARTIST SEARCH HANDLER
const artistForm = document.getElementById("artist-form");
const artistInput = document.getElementById("artist-input");
const artistResults = document.getElementById("artist-results");

if (artistForm) {
  artistForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const query = artistInput.value.trim();
    if (!query) return;

    artistResults.innerHTML = "<p>Searching...</p>";

    try {
      const res = await fetch(`/.netlify/functions/searchArtist?name=${encodeURIComponent(query)}`);
      const data = await res.json();

      console.log("Backend response:", data); // debug

      // FIX: backend returns { artists: [...] }
      const artists = data?.artists || [];

      if (artists.length === 0) {
        artistResults.innerHTML = `<p>No artist found.</p>`;
        return;
      }

      artistResults.innerHTML = artists
        .map((a) => {
          const img = a.image || "https://via.placeholder.com/100";

          return `
            <div class="artist-card">
              <img src="${img}" alt="${a.name}">
              <p><strong>${a.name}</strong></p>
              <p>${a.followers.toLocaleString()} followers</p>
              <a href="${a.url}" target="_blank">Open in Spotify</a>
            </div>
          `;
        })
        .join("");

    } catch (err) {
      console.error("Artist search error:", err);
      artistResults.innerHTML = "<p>Error searching artist.</p>";
    }
  });
}
