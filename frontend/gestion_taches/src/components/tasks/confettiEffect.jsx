import React, { useEffect, useState } from 'react';

const ConfettiEffect = ({ active }) => {
  const [confettiPieces, setConfettiPieces] = useState([]);

  useEffect(() => {
    if (active) {
      // Générer des pièces de confettis aléatoires
      const newPieces = Array.from({ length: 100 }).map((_, index) => ({
        id: index,
        x: Math.random() * 100, // position horizontale en pourcentage
        size: Math.random() * 10 + 5, // taille entre 5 et 15px
        color: getRandomColor(),
        fallDuration: Math.random() * 2 + 3, // durée de chute entre 3 et 5 secondes
        swayDuration: Math.random() * 1 + 1, // durée d'oscillation entre 1 et 2 secondes
      }));
      
      setConfettiPieces(newPieces);
      
      // Nettoyer après l'animation
      const timer = setTimeout(() => {
        setConfettiPieces([]);
      }, 5000);
      
      return () => clearTimeout(timer);
    } else {
      setConfettiPieces([]);
    }
  }, [active]);
  
  // Couleurs vives pour les confettis
  const getRandomColor = () => {
    const colors = [
      '#f44336', // rouge
      '#e91e63', // rose
      '#9c27b0', // violet
      '#673ab7', // violet foncé
      '#3f51b5', // indigo
      '#2196f3', // bleu
      '#03a9f4', // bleu clair
      '#00bcd4', // cyan
      '#009688', // teal
      '#4CAF50', // vert
      '#8BC34A', // vert clair
      '#CDDC39', // lime
      '#FFEB3B', // jaune
      '#FFC107', // ambre
      '#FF9800', // orange
      '#FF5722'  // orange foncé
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };
  
  if (confettiPieces.length === 0) return null;
  
  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {confettiPieces.map(piece => (
        <div
          key={piece.id}
          className="absolute"
          style={{
            left: `${piece.x}%`,
            top: '-10px',
            width: `${piece.size}px`,
            height: `${piece.size}px`,
            backgroundColor: piece.color,
            borderRadius: Math.random() > 0.5 ? '50%' : '0%', // cercles ou carrés
            transform: `rotate(${Math.random() * 360}deg)`,
            opacity: 1,
            animation: `
              confetti-fall ${piece.fallDuration}s linear forwards,
              confetti-shake ${piece.swayDuration}s ease-in-out alternate infinite
            `
          }}
        />
      ))}
      
      <style jsx>{`
        @keyframes confetti-fall {
          0% {
            transform: translateY(-10px) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
        
        @keyframes confetti-shake {
          0% {
            transform: translateX(0px);
          }
          100% {
            transform: translateX(25px);
          }
        }
      `}</style>
    </div>
  );
};

export default ConfettiEffect;