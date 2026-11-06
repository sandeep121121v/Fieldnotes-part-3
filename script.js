const searchForm = document.getElementById("search-form");
const searchInput = document.getElementById("search-input");
const results = document.getElementById("results");
const resultCount = document.querySelector(".result-count");
const emptyState = document.querySelector(".empty-state");
const searchMessage = document.getElementById("search-message");

searchForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const query = searchInput.value.trim();
  if (!query) return;

  results.innerHTML = "";
  emptyState.hidden = true;
  searchMessage.hidden = false;
  searchMessage.className = "search-message is-loading";
  searchMessage.textContent = `Searching for “${query}”…`;
  resultCount.textContent = `Searching for “${query}”…`;

  const url = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(query)}&gsrnamespace=6&gsrlimit=12&prop=imageinfo&iiprop=url&iiurlwidth=700&format=json&origin=*`;
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Image search failed with status ${response.status}`);

    const data = await response.json();
    const pages = Object.values(data.query?.pages ?? {});

    if (pages.length === 0) {
      searchMessage.className = "search-message is-empty";
      searchMessage.textContent = `No images found for “${query}”. Try another search.`;
      resultCount.textContent = `0 images for “${query}”`;
      return;
    }

    for (const page of pages) {
      const image = page.imageinfo?.[0];
      const imageUrl = image?.thumburl ?? image?.url;
      if (!imageUrl) continue;

      const title = page.title.replace(/^File:/, "").replaceAll("_", " ");
      const card = document.createElement("article");
      card.className = "result-card";

      const link = document.createElement("a");
      link.className = "result-card-link";
      link.href = image.url ?? imageUrl;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.setAttribute("aria-label", `Open full image: ${title}`);

      const img = document.createElement("img");
      img.className = "result-image";
      img.src = imageUrl;
      img.alt = title;
      img.loading = "lazy";

      const caption = document.createElement("p");
      caption.className = "result-caption";
      caption.textContent = title;

      link.appendChild(img);
      card.appendChild(link);
      card.appendChild(caption);
      results.appendChild(card);
    }

    if (results.children.length === 0) {
      searchMessage.className = "search-message is-empty";
      searchMessage.textContent = `No images found for “${query}”. Try another search.`;
      resultCount.textContent = `0 images for “${query}”`;
      return;
    }

    searchMessage.hidden = true;
    resultCount.textContent = `Showing ${results.children.length} images for “${query}”`;
  } catch (error) {
    results.innerHTML = "";
    searchMessage.className = "search-message is-error";
    searchMessage.textContent = "Something went wrong. Please try again.";
    resultCount.textContent = "Search unavailable";
  }
});
