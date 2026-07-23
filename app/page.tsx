export default function Home() {
  return (
    <main className="home">
      <div className="glow glowOne" aria-hidden="true" />
      <div className="glow glowTwo" aria-hidden="true" />

      <section className="hero" aria-labelledby="hello-world">
        <p className="eyebrow">Freyr AI</p>
        <h1 id="hello-world">Hello, world.</h1>
        <p className="intro">
          We&apos;re building thoughtful AI experiences for a brighter future.
        </p>
        <div className="status">
          <span className="statusDot" aria-hidden="true" />
          The journey starts here
        </div>
      </section>
    </main>
  );
}
