
import React from 'react';

interface CharacterProps {
  health: number;
  activeOutfitId: string | null;
}

const Character: React.FC<CharacterProps> = ({ health, activeOutfitId }) => {
  const isHappy = health >= 80;
  const isNeutral = health >= 50 && health < 80;
  const isWorried = health >= 20 && health < 50;
  const isSick = health < 20;

  // Colors
  const starfishColor = isSick ? '#a1a1aa' : '#B22222'; // Firebrick
  const pulseScale = isHappy ? 'animate-pulse' : '';

  return (
    <div className="flex flex-col items-center justify-center p-8 relative">
      <svg width="220" height="220" viewBox="0 0 200 200" className={`transition-all duration-500 transform hover:scale-105 ${pulseScale}`}>
        {/* Shadow */}
        <ellipse cx="100" cy="185" rx="70" ry="12" fill="rgba(0,0,0,0.08)" />
        
        {/* Starfish Body (5 points) */}
        <path
          d="M100,20 L120,75 L180,85 L135,125 L150,185 L100,155 L50,185 L65,125 L20,85 L80,75 Z"
          fill={starfishColor}
          stroke={isSick ? '#71717a' : '#8B0000'}
          strokeWidth="4"
          strokeLinejoin="round"
          className="transition-colors duration-500"
        />

        {/* Texture Dots */}
        {!isSick && (
          <g opacity="0.3">
            <circle cx="100" cy="60" r="3" fill="white" />
            <circle cx="140" cy="95" r="3" fill="white" />
            <circle cx="125" cy="140" r="3" fill="white" />
            <circle cx="75" cy="140" r="3" fill="white" />
            <circle cx="60" cy="95" r="3" fill="white" />
          </g>
        )}

        {/* Eyes */}
        <g transform="translate(0, 10)">
          {isHappy && (
            <g>
              <circle cx="85" cy="95" r="7" fill="white" />
              <circle cx="85" cy="95" r="4" fill="black" />
              <circle cx="115" cy="95" r="7" fill="white" />
              <circle cx="115" cy="95" r="4" fill="black" />
            </g>
          )}
          {isNeutral && (
            <g>
              <circle cx="85" cy="95" r="5" fill="black" />
              <circle cx="115" cy="95" r="5" fill="black" />
            </g>
          )}
          {isWorried && (
            <g>
               <path d="M78,100 Q85,90 92,100" stroke="black" strokeWidth="2.5" fill="none" />
               <path d="M108,100 Q115,90 122,100" stroke="black" strokeWidth="2.5" fill="none" />
            </g>
          )}
          {isSick && (
            <g transform="translate(0,-5)">
              <path d="M80,95 L90,105 M90,95 L80,105" stroke="#4b5563" strokeWidth="3" />
              <path d="M110,95 L120,105 M120,95 L110,105" stroke="#4b5563" strokeWidth="3" />
            </g>
          )}
        </g>

        {/* Mouth */}
        <g transform="translate(0, 10)">
          {isHappy && <path d="M90,115 Q100,125 110,115" stroke="black" strokeWidth="3" fill="none" strokeLinecap="round" />}
          {isNeutral && <line x1="90" y1="118" x2="110" y2="118" stroke="black" strokeWidth="3" strokeLinecap="round" />}
          {isWorried && <path d="M92,122 Q100,115 108,122" stroke="black" strokeWidth="2" fill="none" strokeLinecap="round" />}
          {isSick && <path d="M92,125 Q100,118 108,125" stroke="#4b5563" strokeWidth="3" fill="none" strokeLinecap="round" />}
        </g>

        {/* OUTFITS */}
        {activeOutfitId === 'sunglasses' && (
          <g transform="translate(0, 8)">
             <rect x="70" y="85" width="25" height="15" rx="4" fill="black" />
             <rect x="105" y="85" width="25" height="15" rx="4" fill="black" />
             <line x1="95" y1="92" x2="105" y2="92" stroke="black" strokeWidth="3" />
          </g>
        )}
        
        {activeOutfitId === 'partyhat' && (
          <g transform="translate(100, 35)">
            <path d="M-20,0 L20,0 L0,-40 Z" fill="#FFD700" stroke="orange" strokeWidth="2" />
            <circle cx="0" cy="-40" r="5" fill="#FF4500" />
            <circle cx="-5" cy="-10" r="2" fill="white" opacity="0.5" />
            <circle cx="8" cy="-20" r="2" fill="white" opacity="0.5" />
          </g>
        )}

        {activeOutfitId === 'bowtie' && (
          <g transform="translate(100, 140)">
            <path d="M-15,-8 L15,8 L15,-8 L-15,8 Z" fill="#4B0082" />
            <circle cx="0" cy="0" r="4" fill="#6A5ACD" />
          </g>
        )}

        {activeOutfitId === 'crown' && (
          <g transform="translate(100, 38)">
            <path d="M-25,0 L25,0 L25,-20 L15,-10 L0,-25 L-15,-10 L-25,-20 Z" fill="#FFD700" stroke="#DAA520" strokeWidth="2" />
            <circle cx="0" cy="-5" r="3" fill="#FF0000" />
          </g>
        )}

        {activeOutfitId === 'monocle' && (
          <g transform="translate(115, 105)">
            <circle cx="0" cy="0" r="10" stroke="#FFD700" strokeWidth="2" fill="rgba(255,255,255,0.2)" />
            <line x1="10" y1="0" x2="25" y2="20" stroke="#FFD700" strokeWidth="1" />
          </g>
        )}
      </svg>
      
      <div className={`mt-4 px-6 py-2 rounded-2xl text-white font-bold text-center shadow-lg transition-all duration-500 transform ${isSick ? 'bg-gray-400' : 'bg-[#B22222]'} hover:scale-110`}>
        {isHappy && "STARRY & BRIGHT!"}
        {isNeutral && "JUST FLOATING"}
        {isWorried && "TIRED STAR..."}
        {isSick && "DRYING OUT..."}
      </div>
    </div>
  );
};

export default Character;
