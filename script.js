const menuButton = document.querySelector(".menuToggle");
const navigation = document.querySelector("#main-navigation");

if (menuButton && navigation) {
  const closeNavigation = () => {
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.setAttribute("aria-label", "Open navigation");
    navigation.classList.remove("isOpen");
  };

  menuButton.addEventListener("click", () => {
    const isOpen = menuButton.getAttribute("aria-expanded") === "true";
    menuButton.setAttribute("aria-expanded", String(!isOpen));
    menuButton.setAttribute("aria-label", isOpen ? "Open navigation" : "Close navigation");
    navigation.classList.toggle("isOpen", !isOpen);
  });

  navigation.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeNavigation);
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 1000) closeNavigation();
  });
}

const newsList = document.querySelector("#news-list");

if (newsList && window.location.protocol !== "file:") {
  const newsLimit = Number.parseInt(newsList.dataset.newsLimit || "3", 10);

  const createNewsFeature = (item, index) => {
    const article = document.createElement("article");
    article.className = index === 0 ? "newsFeature" : "newsFeature newsFeatureSecondary";

    const copy = document.createElement("div");
    copy.className = "newsCopy";

    const meta = document.createElement("p");
    meta.className = "newsDate";
    meta.textContent = `${item.display_date} · ${item.category}`;

    const heading = document.createElement("h3");
    heading.textContent = item.title;

    const summary = document.createElement("p");
    summary.textContent = item.summary;

    const link = document.createElement("a");
    link.className = "textLink";
    link.href = item.url;
    link.append("Show more ");
    const arrow = document.createElement("span");
    arrow.textContent = "→";
    link.append(arrow);

    copy.append(meta, heading, summary, link);

    const visual = document.createElement("div");
    visual.className = "newsVisual";
    const image = document.createElement("img");
    image.src = item.cover;
    image.alt = item.title;
    image.loading = "lazy";
    visual.append(image);

    article.append(copy, visual);
    return article;
  };

  fetch("./news/index.json", { cache: "no-cache" })
    .then((response) => {
      if (!response.ok) throw new Error(`News index request failed: ${response.status}`);
      return response.json();
    })
    .then((items) => {
      const sortedItems = items
        .filter((item) => item.title && item.date && item.url)
        .sort((left, right) => right.date.localeCompare(left.date))
        .slice(0, newsLimit);

      if (sortedItems.length > 0) {
        newsList.replaceChildren(
          ...sortedItems.map((item, index) => createNewsFeature(item, index)),
        );
        newsList.dataset.newsState = "loaded";
      }
    })
    .catch(() => {
      newsList.dataset.newsState = "fallback";
    });
}
