export default function Footer() {
  return (
    <footer className="footer">
      <p>Developed By</p>
      <a
        href="https://www.bhagyamudgal.com"
        target="_blank"
        rel="noopener noreferrer"
      >
        Bhagya Mudgal
      </a>
      <p className="mx-2">|</p>
      <a href="http://solana.com" target="_blank" rel="noopener noreferrer">
        {/* eslint-disable-next-line */}
        <img
          src="/solana-crypto.png"
          alt="solana.com"
          className="w-5 hover:scale-125 transition-all duration-200 ease-in-out"
        />
      </a>
    </footer>
  );
}
