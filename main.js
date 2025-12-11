// ===============================
// MOOD PLAYLIST HANDLER
// ===============================
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

    if (!res.ok) {
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
      .join("");

  } catch (err) {
    console.error(err);
    playlistContainer.innerHTML = '<p>Failed to load playlist 🙃</p>';
  }
});


// ===============================
// SWITCH BETWEEN MODES (Artist / Mood)
// ===============================
const searchTypeSelect = document.getElementById("searchType");
const artistSection = document.getElementById("artist-section");
const moodSection = document.getElementById("mood-section");
const playlistSection = document.getElementById("playlist-preview");

searchTypeSelect.addEventListener("change", () => {
  const mode = searchTypeSelect.value;

  if (mode === "artist") {
    artistSection.style.display = "block";
    moodSection.style.display = "none";
    playlistSection.style.display = "none";
  } else {
    artistSection.style.display = "none";
    moodSection.style.display = "block";
    playlistSection.style.display = "block";
  }
});


// ===============================
// ARTIST SEARCH HANDLER
// ===============================
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

              <button class="view-albums" data-id="${a.id}">
                View Albums
              </button>

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



const albumsContainer = document.getElementById("albums-container");

artistResults.addEventListener("click", async (e) => {
  if (!e.target.classList.contains("view-albums")) return;

  const artistId = e.target.dataset.id;

  albumsContainer.innerHTML = "<p>Loading albums...</p>";
  document.getElementById("artist-albums").style.display = "block";


  try {
    const res = await fetch("/.netlify/functions/getArtistAlbums", {
      method: "POST",
      body: JSON.stringify({ id: artistId }),
    });

    const data = await res.json();
    const albums = data?.items || [];

    if (albums.length === 0) {
      albumsContainer.innerHTML = "<p>No albums found.</p>";
      return;
    }

    albumsContainer.innerHTML = albums
      .map((album) => `
        <div class="album-card">
          <img src="${album.images[0]?.url || "https://via.placeholder.com/150"}">
          <p><strong>${album.name}</strong></p>
          <p>${album.release_date.slice(0, 4)}</p>
        </div>
      `)
      .join("");

  } catch (err) {
    console.error("Album fetch error:", err);
    albumsContainer.innerHTML = "<p>Error loading albums.</p>";
  }
});
