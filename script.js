const menuButton = document.querySelector(".menuToggle");
const navigation = document.querySelector("#main-navigation");
const businessNavigation = document.querySelector(".navBusiness");
const businessButton = document.querySelector(".businessToggle");

const closeBusinessMenu = () => {
  if (!businessNavigation || !businessButton) return;
  businessNavigation.classList.remove("isOpen");
  businessButton.setAttribute("aria-expanded", "false");
};

const closeNavigation = () => {
  if (!menuButton || !navigation) return;
  menuButton.setAttribute("aria-expanded", "false");
  menuButton.setAttribute("aria-label", "Open navigation");
  navigation.classList.remove("isOpen");
  closeBusinessMenu();
};

if (menuButton && navigation) {
  menuButton.addEventListener("click", () => {
    const isOpen = menuButton.getAttribute("aria-expanded") === "true";
    menuButton.setAttribute("aria-expanded", String(!isOpen));
    menuButton.setAttribute("aria-label", isOpen ? "Open navigation" : "Close navigation");
    navigation.classList.toggle("isOpen", !isOpen);
    if (isOpen) closeBusinessMenu();
  });

  navigation.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeNavigation);
  });
}

if (businessNavigation && businessButton) {
  businessButton.addEventListener("click", (event) => {
    event.stopPropagation();
    const isOpen = businessButton.getAttribute("aria-expanded") === "true";
    businessNavigation.classList.toggle("isOpen", !isOpen);
    businessButton.setAttribute("aria-expanded", String(!isOpen));
  });
}

document.addEventListener("click", (event) => {
  if (businessNavigation && !businessNavigation.contains(event.target)) closeBusinessMenu();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeNavigation();
});

window.addEventListener("resize", () => {
  if (window.innerWidth > 820 && navigation?.classList.contains("isOpen")) closeNavigation();
});

const newsList = document.querySelector("#news-list");
const previousButton = document.querySelector(".carouselPrevious");
const nextButton = document.querySelector(".carouselNext");
const statusNumbers = document.querySelectorAll(".carouselStatus span");

if (newsList && previousButton && nextButton) {
  let newsItems = [];
  let activeIndex = 0;
  let touchStartX = 0;

  const createNewsSlide = (item) => {
    const article = document.createElement("article");
    article.className = "newsSlide";

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
    link.className = "showMore";
    link.href = item.url;
    const arrow = document.createElement("span");
    arrow.setAttribute("aria-hidden", "true");
    arrow.textContent = "›";
    link.append(arrow, " Show More");

    copy.append(meta, heading, summary, link);

    const visual = document.createElement("div");
    visual.className = "newsVisual";
    const image = document.createElement("img");
    image.src = item.cover;
    image.alt = item.title;
    image.loading = "lazy";
    image.decoding = "async";
    visual.append(image);

    article.append(copy, visual);
    return article;
  };

  const renderNews = () => {
    if (newsItems.length === 0) return;
    newsList.replaceChildren(createNewsSlide(newsItems[activeIndex]));
    previousButton.disabled = newsItems.length < 2;
    nextButton.disabled = newsItems.length < 2;
    if (statusNumbers.length === 2) {
      statusNumbers[0].textContent = String(activeIndex + 1);
      statusNumbers[1].textContent = String(newsItems.length);
    }
  };

  const moveNews = (direction) => {
    if (newsItems.length < 2) return;
    activeIndex = (activeIndex + direction + newsItems.length) % newsItems.length;
    renderNews();
  };

  previousButton.addEventListener("click", () => moveNews(-1));
  nextButton.addEventListener("click", () => moveNews(1));
  newsList.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") moveNews(-1);
    if (event.key === "ArrowRight") moveNews(1);
  });
  newsList.addEventListener("touchstart", (event) => {
    touchStartX = event.changedTouches[0].clientX;
  }, { passive: true });
  newsList.addEventListener("touchend", (event) => {
    const distance = event.changedTouches[0].clientX - touchStartX;
    if (Math.abs(distance) > 45) moveNews(distance > 0 ? -1 : 1);
  }, { passive: true });

  const fallbackSlide = newsList.querySelector(".newsSlide");
  if (fallbackSlide) {
    previousButton.disabled = true;
    nextButton.disabled = true;
  }

  if (window.location.protocol !== "file:") {
    fetch("./news/index.json", { cache: "no-cache" })
      .then((response) => {
        if (!response.ok) throw new Error(`News index request failed: ${response.status}`);
        return response.json();
      })
      .then((items) => {
        newsItems = items
          .filter((item) => item.title && item.date && item.url && item.cover)
          .sort((left, right) => right.date.localeCompare(left.date));
        activeIndex = 0;
        renderNews();
      })
      .catch(() => {
        newsList.dataset.newsState = "fallback";
      });
  }
}
