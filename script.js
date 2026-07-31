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
    meta.textContent = item.display_date;

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

const projectGallery = document.querySelector("#project-gallery");
const projectPageToggle = document.querySelector("#project-page-toggle");
const projectDialog = document.querySelector("#project-dialog");

if (projectGallery && projectPageToggle && projectDialog) {
  const projectImageBase = "../../public/design/projects/";
  const projects = [
    {
      name: "Freyr E-B1",
      location: "Thailand Bangkok",
      description: "This pilot deployment of NVIDIA B300 clusters at the Freyr E-B1 project establishes a strategic foothold for Freyr in Thailand. Leveraging Air-to-Liquid Cooling to manage high-density 30kW+ racks, this compact yet critical project supports Thailand’s AI ambitions while validating our liquid-cooling capabilities in the region.",
      status: "Operational",
      currentPower: "1.5MW",
      projectedPower: "5MW",
      hardware: "B300",
      cooling: "Air-to-Liquid Cooling",
      image: "Freyr_E_B1_07.jpg",
    },
    {
      name: "Freyr E-B2",
      location: "Thailand Bangkok",
      description: "With the successful establishment of our initial NVIDIA B300 foothold, the Freyr E-B2 project marks Freyr’s strategic leap into large-scale AI infrastructure. As a dedicated expansion site, it transitions from a compact pilot to a massive operational hub designed to support Thailand’s ambition of becoming a Southeast Asian AI digital center. Backed by a staggering projected IT power of 50MW, the project is engineered to deliver unprecedented high-density compute, solidifying Freyr’s role as a key enabler of the region’s AI revolution.",
      status: "Operational",
      currentPower: "5MW",
      projectedPower: "50MW",
      hardware: "GB300",
      cooling: "Liquid Cooling",
      image: "Freyr_E_B2_03.jpg",
    },
    {
      name: "Freyr A-B1",
      location: "Thailand Bangkok",
      description: "Freyr is set to launch a cutting-edge NVIDIA B300 cluster at the Freyr A-B1 project. Strategically housed within the Bangkok Neutral Internet Exchange (BKNIX) reference site, this deployment anchors Freyr’s high-density compute capabilities directly into the heart of ASEAN’s digital traffic. By integrating B300’s raw performance with resilient Tier III infrastructure and extensive subsea and terrestrial ecosystems, Freyr delivers ultra-low-latency AI inference and training across the region while ensuring data sovereignty within Thailand, empowering clients with mission-critical high-performance services.",
      status: "Operational",
      currentPower: "17.08MW",
      projectedPower: "N/A",
      hardware: "B300",
      cooling: "Air-to-Liquid Cooling & Liquid Cooling",
      image: "Freyr_A_B1_03.jpg",
    },
    {
      name: "Freyr N-B3",
      location: "Thailand Bangkok",
      description: "Freyr is set to launch a high-density NVIDIA Blackwell B300 GPU cluster at the Freyr N-B3 Data Center within the Amata Nakorn Industrial Estate in Chonburi, Thailand. Rather than operating as a traditional cloud provider, Freyr will monetize this capacity as a high-throughput AI token factory, delivering low-latency LLM inference and enterprise-grade token-generation services to businesses and AI labs across Southeast Asia. This deployment eliminates the need for local CAPEX on hardware, providing immediate, scalable access to frontier model performance through Freyr’s token-as-a-service model.",
      status: "Operational",
      currentPower: "6.38MW",
      projectedPower: "14MW",
      hardware: "B300",
      cooling: "Air-to-Liquid Cooling & Liquid Cooling",
      image: "Freyr_N_B3_03.jpg",
    },
    {
      name: "Freyr N-J3",
      location: "Indonesia",
      description: "Freyr is deploying a high-density NVIDIA Blackwell Ultra B300 (64 B300) GPU cluster at the Freyr N-J3 data center. This deployment serves as the foundational compute node for Freyr’s Southeast Asia AI infrastructure rollout. It gives Freyr a sovereign, carbon-efficient Blackwell Ultra foothold in Indonesia for LLM training, generative AI, and HPC workloads, extending the same B300 cluster experience the company has already shipped in Thailand.",
      status: "Operational",
      currentPower: "3.24MW",
      projectedPower: "45MW",
      hardware: "B300",
      cooling: "Air-to-Liquid Cooling",
      image: "Freyr_N_J3_03.jpg",
    },
    {
      name: "Freyr P-J1",
      location: "Indonesia",
      description: "The initiative centers on a next-generation AI infrastructure deployment featuring NVIDIA’s GB300 NVL72 (Blackwell Ultra) architecture. Designed for extreme computational density, the cluster operates at a hyper-spec level and requires advanced liquid-cooling solutions to manage the intense thermal load of high-performance GPUs.",
      status: "Operational",
      currentPower: "17MW",
      projectedPower: "20MW",
      hardware: "GB300",
      cooling: "Air-to-Liquid Cooling & Liquid Cooling",
      image: "Freyr_P_J1_03.jpg",
    },
    {
      name: "Freyr N-K1",
      location: "Malaysia",
      description: "Freyr is deploying an NVIDIA Blackwell Ultra GB300 NVL72 cluster at the Freyr N-K1 project in Kuala Lumpur, a leading Southeast Asian AI-ready data center. With Tier IV fault tolerance and high-density liquid-cooling infrastructure, this project provides an ideal environment for rack-scale AI factories such as the GB300 NVL72. The deployment anchors Freyr’s Malaysia leg within its multi-country Southeast Asian sovereign-AI strategy, complementing its broader GPU-as-a-Service rollout and regional infrastructure program alongside partners.",
      status: "Operational",
      currentPower: "2.4MW",
      projectedPower: "65MW",
      hardware: "GB300",
      cooling: "Liquid Cooling",
      image: "Freyr_N_K1_03.jpg",
    },
    {
      name: "Freyr C-V1",
      location: "Canada",
      description: "Freyr is set to launch its North American operations hub with the deployment of an advanced B300 GPU cluster for token-generation workloads at the Freyr C-V1 project. Capitalizing on Vancouver’s strategic role as a digital bridge between North America and the Asia-Pacific, the new node will deliver low-latency LLM inference and high-throughput token output to enterprises across both regions, underpinned by sovereign Canadian data residency and the data center’s carrier-dense, route-diverse fiber ecosystem—reinforcing Freyr’s commitment to scalable, high-performance global AI token infrastructure.",
      status: "Operational",
      currentPower: "4MW",
      projectedPower: "6.5MW",
      hardware: "B300",
      cooling: "Air-to-Liquid Cooling",
      image: "Freyr_C_V1_03.jpg",
    },
  ];

  const dialogTitle = projectDialog.querySelector("#project-dialog-title");
  const dialogLocation = projectDialog.querySelector(".projectDialogLocation");
  const dialogDescription = projectDialog.querySelector(".projectDialogDescription");
  const dialogImage = projectDialog.querySelector(".projectDialogImage");
  const dialogClose = projectDialog.querySelector(".projectDialogClose");
  let activeProjectPage = 0;
  let lastProjectTrigger = null;

  const createProjectCard = (project) => {
    const card = document.createElement("button");
    card.className = "projectCard";
    card.type = "button";
    card.setAttribute("aria-label", `View details for ${project.name}`);

    const image = document.createElement("img");
    image.src = `${projectImageBase}${project.image}`;
    image.alt = `${project.name}, ${project.location}`;
    image.loading = "lazy";
    image.decoding = "async";

    const overlay = document.createElement("span");
    overlay.className = "projectOverlay";

    const name = document.createElement("strong");
    name.textContent = project.name;

    const facts = document.createElement("span");
    facts.className = "projectOverlayFacts";
    [project.location, project.currentPower, project.hardware, project.cooling].forEach((value) => {
      const fact = document.createElement("span");
      fact.textContent = value;
      facts.append(fact);
    });

    overlay.append(name, facts);
    card.append(image, overlay);
    card.addEventListener("click", () => openProjectDialog(project, card));
    return card;
  };

  const renderProjectPage = () => {
    const firstIndex = activeProjectPage === 0 ? 0 : 6;
    const visibleProjects = projects.slice(firstIndex, activeProjectPage === 0 ? 6 : 8);
    projectGallery.replaceChildren(...visibleProjects.map(createProjectCard));
    projectGallery.classList.toggle("isSecondPage", activeProjectPage === 1);
    projectPageToggle.classList.toggle("isPrevious", activeProjectPage === 1);
    projectPageToggle.setAttribute(
      "aria-label",
      activeProjectPage === 0 ? "Show projects 7 and 8" : "Return to projects 1 through 6",
    );
  };

  const closeProjectDialog = () => {
    if (typeof projectDialog.close === "function" && projectDialog.open) projectDialog.close();
    else projectDialog.removeAttribute("open");
    document.body.classList.remove("hasOpenDialog");
  };

  const openProjectDialog = (project, trigger) => {
    lastProjectTrigger = trigger;
    dialogTitle.textContent = project.name;
    dialogLocation.textContent = project.location;
    dialogDescription.textContent = project.description;
    dialogImage.src = `${projectImageBase}${project.image}`;
    dialogImage.alt = `${project.name}, ${project.location}`;
    projectDialog.querySelectorAll("[data-project-fact]").forEach((fact) => {
      fact.textContent = project[fact.dataset.projectFact];
    });
    document.body.classList.add("hasOpenDialog");
    if (typeof projectDialog.showModal === "function") projectDialog.showModal();
    else projectDialog.setAttribute("open", "");
    dialogClose.focus();
  };

  projectPageToggle.addEventListener("click", () => {
    activeProjectPage = activeProjectPage === 0 ? 1 : 0;
    renderProjectPage();
    projectGallery.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
      block: "start",
    });
  });

  dialogClose.addEventListener("click", closeProjectDialog);
  projectDialog.addEventListener("click", (event) => {
    if (event.target === projectDialog) closeProjectDialog();
  });
  projectDialog.addEventListener("close", () => {
    document.body.classList.remove("hasOpenDialog");
    lastProjectTrigger?.focus();
  });

  renderProjectPage();
}
