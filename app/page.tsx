import Image from "next/image";

const locations = [
  { name: "Canada", x: 17, y: 37 },
  { name: "Saudi Arabia", x: 51, y: 53 },
  { name: "Oman", x: 57, y: 48 },
  { name: "UAE", x: 57, y: 55 },
  { name: "Malaysia", x: 70, y: 61 },
  { name: "Thailand", x: 72, y: 53 },
  { name: "Singapore", x: 73, y: 64 },
  { name: "Indonesia", x: 78, y: 68 },
  { name: "Taiwan", x: 78, y: 45 },
  { name: "South Korea", x: 80, y: 36 },
  { name: "Japan", x: 85, y: 32 },
  { name: "Australia", x: 84, y: 82 },
];

const capabilities = [
  {
    icon: "↗",
    title: "NVIDIA REFERENCE ARCHITECTURE",
    copy: "Built on proven NVIDIA reference architecture for performance and scale.",
  },
  {
    icon: "◇",
    title: "FREYR REFERENCE DEPLOYMENT",
    copy: "Validated deployment model ensuring efficiency, reliability, and compliance.",
  },
  {
    icon: "☁",
    title: "STANDARD AND PLATFORM",
    copy: "Standardized infrastructure and platform enabling interoperability and scalability.",
  },
];

function Brand({ inverse = false }: { inverse?: boolean }) {
  return (
    <a className={`brand ${inverse ? "brandInverse" : ""}`} href="#top" aria-label="Freyr home">
      <Image src="/freyr-logo-reference.png" width={520} height={170} alt="Freyr" priority />
    </a>
  );
}

export default function Home() {
  return (
    <main id="top">
      <header className="siteHeader">
        <Brand />
        <nav aria-label="Main navigation">
          <a className="active" href="#top">Home</a>
          <a href="#business">Business</a>
          <a href="#news">News</a>
          <a href="#investors">For Investors</a>
          <a href="#news">Blog</a>
          <a href="#about">About Freyr</a>
        </nav>
        <a className="headerCta" href="#business">Explore</a>
      </header>

      <section className="hero" aria-labelledby="hero-title">
        <div className="heroCopy">
          <div className="partnerBadge">
            <strong>NVIDIA</strong>
            <span>PREFERRED<br />PARTNER</span>
          </div>
          <h1 id="hero-title">
            <span>TRANSFORM</span>
            <span>POWER INTO INTELLIGENCE:</span>
            <span>BUILD, FINANCE AND OPERATE</span>
          </h1>
          <div className="heroActions">
            <a className="button buttonPrimary" href="#business">Why Freyr</a>
            <a className="button buttonGhost" href="#news">Read the blog</a>
          </div>
        </div>
        <div className="rackScene" role="img" aria-label="High-performance data center infrastructure" />
      </section>

      <section className="stats" aria-label="Infrastructure scale">
        <div><strong>1536<sup>+</sup></strong><span>B300 GPUs</span></div>
        <div><strong>162<sup>+</sup></strong><span>Next-Gen GPUs (GB300+GB200)</span></div>
        <div><strong>770<sup>MW</sup></strong><span>VR72 Pipeline</span></div>
      </section>

      <section className="capabilities section" id="business" aria-labelledby="capabilities-title">
        <div className="sectionIntro">
          <p className="kicker">OUR FOUNDATION</p>
          <h2 id="capabilities-title">Infrastructure designed to perform.</h2>
        </div>
        <div className="capabilityGrid">
          {capabilities.map((item, index) => (
            <article className="capabilityCard" key={item.title}>
              <span className="cardNumber">0{index + 1}</span>
              <span className="capabilityIcon" aria-hidden="true">{item.icon}</span>
              <h3>{item.title}</h3>
              <p>{item.copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="locations section" aria-labelledby="locations-title">
        <div className="sectionIntro centered">
          <p className="kicker">GLOBAL PRESENCE</p>
          <h2 id="locations-title">FreyrAI Locations</h2>
        </div>
        <div className="map" role="img" aria-label="Freyr AI locations across North America, the Middle East, Asia, and Australia">
          <div className="worldShape" aria-hidden="true">
            <span className="continent northAmerica" />
            <span className="continent southAmerica" />
            <span className="continent europe" />
            <span className="continent africa" />
            <span className="continent asia" />
            <span className="continent australia" />
          </div>
          {locations.map((location) => (
            <span
              className="mapPoint"
              key={location.name}
              style={{ left: `${location.x}%`, top: `${location.y}%` }}
            >
              <i />{location.name}
            </span>
          ))}
        </div>
      </section>

      <section className="news section" id="news" aria-labelledby="news-title">
        <div className="sectionIntro centered">
          <p className="kicker">OUR LATEST NEWS</p>
          <h2 id="news-title">Building the future of accelerated compute.</h2>
        </div>
        <article className="newsFeature">
          <div className="newsCopy">
            <p className="newsDate">APRIL 15, 2026 · PARTNERSHIP</p>
            <h3>Freyr Technology AI Renews NVIDIA Preferred Cloud Partner Status</h3>
            <p>
              Freyr Technology AI has renewed its NVIDIA Preferred Cloud Partner —
              Compute competency status within the NVIDIA Partner Network.
            </p>
            <a className="textLink" href="#news">Show more <span>→</span></a>
          </div>
          <div className="newsVisual">
            <Brand inverse />
            <strong>Scalable Compute.<br />Instant Tokens.</strong>
            <div className="circuit" aria-hidden="true" />
            <span className="preferred">NVIDIA · PREFERRED PARTNER</span>
          </div>
        </article>
      </section>

      <footer id="about">
        <div className="footerLead">
          <Brand inverse />
          <p>Accelerating AI Infrastructure<br />with Standard and Platform.</p>
          <div><a href="mailto:contact@freyr-ai.com">Contact us</a><a href="#top">LinkedIn</a></div>
        </div>
        <div className="footerColumn">
          <h3>Business</h3>
          <a href="#business">GPUaaS</a>
          <a href="#business">Token Platform</a>
        </div>
        <div className="footerColumn">
          <h3>Company</h3>
          <a href="#about">About us</a>
          <a href="#news">Blog</a>
          <a href="#news">News</a>
          <a href="#about">Careers</a>
        </div>
        <div className="footerPartner" id="investors">
          <div><strong>NVIDIA</strong><span>PREFERRED<br />PARTNER</span></div>
          <p>Powering dependable, scalable AI infrastructure worldwide.</p>
        </div>
      </footer>
    </main>
  );
}
