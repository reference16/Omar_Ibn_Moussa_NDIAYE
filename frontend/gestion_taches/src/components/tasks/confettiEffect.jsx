import React, { useEffect, useState } from 'react';

const ConfettiEffect = ({ active }) => {
  const [confettiPieces, setConfettiPieces] = useState([]);

  useEffect(() => {
    if (active) {
      // Générer beaucoup plus de pièces de confettis pour un effet plus impressionnant
      const newPieces = Array.from({ length: 200 }).map((_, index) => ({
        id: index,
        x: Math.random() * 100, // position horizontale en pourcentage
        y: Math.random() * 20 - 10, // position verticale initiale légèrement aléatoire
        size: Math.random() * 12 + 8, // taille entre 8 et 20px (plus grand)
        color: getRandomColor(),
        fallDuration: Math.random() * 3 + 2, // durée de chute entre 2 et 5 secondes
        swayDuration: Math.random() * 2 + 1, // durée d'oscillation entre 1 et 3 secondes
        swayAmount: Math.random() * 15 + 10, // amplitude d'oscillation entre 10 et 25px
        rotationSpeed: Math.random() * 360, // vitesse de rotation aléatoire
        shape: Math.random() > 0.7 ? 'square' : Math.random() > 0.5 ? 'circle' : 'triangle', // variété de formes
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
  
  // Couleurs vives pour les confettis avec plus de variété et d'éclat
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
      '#FF5722', // orange foncé
      '#FF1744', // rouge accent
      '#F50057', // rose accent
      '#D500F9', // violet accent
      '#651FFF', // violet foncé accent
      '#3D5AFE', // indigo accent
      '#00B0FF', // bleu accent
      '#1DE9B6', // teal accent
      '#00E676', // vert accent
      '#FFEA00', // jaune accent
      '#FFC400', // ambre accent
      '#FF9100', // orange accent
      '#FF3D00'  // orange foncé accent
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };
  
  const getShapeStyle = (piece) => {
    const baseStyle = {
      left: `${piece.x}%`,
      top: `${piece.y}%`,
      width: `${piece.size}px`,
      height: `${piece.size}px`,
      backgroundColor: piece.color,
      position: 'absolute',
      opacity: 1,
      zIndex: 60,
      boxShadow: `0 0 6px ${piece.color}`, // ajout d'une lueur
      animation: `
        confetti-fall-${piece.id} ${piece.fallDuration}s cubic-bezier(0.250, 0.460, 0.450, 0.940) forwards,
        confetti-sway-${piece.id} ${piece.swayDuration}s ease-in-out alternate infinite,
        confetti-rotate-${piece.id} ${piece.fallDuration * 0.5}s linear infinite
      `
    };

    // Styles spécifiques selon la forme
    if (piece.shape === 'circle') {
      return {
        ...baseStyle,
        borderRadius: '50%',
      };
    } else if (piece.shape === 'triangle') {
      return {
        ...baseStyle,
        backgroundColor: 'transparent',
        width: 0,
        height: 0,
        borderLeft: `${piece.size / 2}px solid transparent`,
        borderRight: `${piece.size / 2}px solid transparent`,
        borderBottom: `${piece.size}px solid ${piece.color}`,
      };
    }
    // Default is square
    return {
      ...baseStyle,
      borderRadius: `${Math.random() * 30}%`,
    };
  };
  
  if (confettiPieces.length === 0) return null;
  
  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {confettiPieces.map(piece => (
        <div
          key={piece.id}
          style={getShapeStyle(piece)}
        />
      ))}
      
      <style jsx global>{`
        ${confettiPieces.map(piece => `
          @keyframes confetti-fall-${piece.id} {
            0% {
              transform: translateY(-10px);
              opacity: 1;
            }
            80% {
              opacity: 0.8;
            }
            100% {
              transform: translateY(105vh);
              opacity: 0;
            }
          }
          
          @keyframes confetti-sway-${piece.id} {
            0% {
              transform: translateX(-${piece.swayAmount}px);
            }
            100% {
              transform: translateX(${piece.swayAmount}px);
            }
          }
          
          @keyframes confetti-rotate-${piece.id} {
            0% {
              transform: rotate(0deg);
            }
            100% {
              transform: rotate(${piece.rotationSpeed}deg);
            }
          }
        `).join('\n')}
      `}</style>
    </div>
  );
};

export default ConfettiEffect;