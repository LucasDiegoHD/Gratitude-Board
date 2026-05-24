import Image from 'next/image';
import logoImg from '../logo-brasil.png';

export default function TeamBrShield({ size = 42 }) {
  // A nova logo é o mapa, proporção 1:1 funciona melhor
  const w = size;
  const h = size;

  return (
    <div style={{ width: w, height: h, position: 'relative' }} className="flex items-center justify-center">
      <Image
        src={logoImg}
        alt="Team Brazil Logo"
        fill
        sizes={`${size}px`}
        priority
        className="object-contain"
      />
    </div>
  );
}
