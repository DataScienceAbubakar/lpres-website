import { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

export default function Lightbox({ images, startIndex, onClose }) {
  const [current, setCurrent] = useState(startIndex);

  const prev = () => setCurrent(c => (c - 1 + images.length) % images.length);
  const next = () => setCurrent(c => (c + 1) % images.length);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape')     onClose();
      if (e.key === 'ArrowLeft')  prev();
      if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className="lb-overlay" onClick={onClose}>
      <button className="lb-close" onClick={onClose}><X size={22} /></button>

      <div className="lb-stage" onClick={e => e.stopPropagation()}>
        {images.length > 1 && (
          <button className="lb-arrow lb-arrow--prev" onClick={prev}>
            <ChevronLeft size={30} />
          </button>
        )}

        <img src={images[current]} alt={`Photo ${current + 1}`} className="lb-img" />

        {images.length > 1 && (
          <button className="lb-arrow lb-arrow--next" onClick={next}>
            <ChevronRight size={30} />
          </button>
        )}
      </div>

      {images.length > 1 && (
        <div className="lb-counter">{current + 1} / {images.length}</div>
      )}
    </div>
  );
}
