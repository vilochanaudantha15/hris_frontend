import React from 'react';
import '../scss/EplantSelection.scss';
import dmhpp from "../assets/DeduruOya.jpg";
import kmhpp from "../assets/kmhpp.jpg";
import bmhpp from "../assets/Biomed_6.jpeg";
import scalp from "../assets/1738579260314.png";
import solar from "../assets/1738579302101.png";
import sle from "../assets/DeduruOya.jpg";

const plants = [
  { name: 'SLE - Head Office', img: sle },
  { name: 'DMHPP', img: dmhpp },
  { name: 'KMHPP', img: kmhpp },
  { name: 'BMHPP', img: bmhpp },
  { name: 'SCALP', img: scalp },
  { name: 'Solar Development', img: solar },
  { name: 'MEMP', img: dmhpp },
];

const EPlantSelection = () => {
  return (
    <div className="plant-selection-wrapper">
      <h1 className="plant-title">Select Your Plant</h1>
      <p className="plant-subtitle">Choose a plant to mark the attendance.</p>

      <div className="plant-grid">
        {plants.map((plant, index) => (
          <div className="plant-tile" key={index}>
            <img src={plant.img} alt={plant.name} className="plant-image" />
            <h2 className="plant-name">{plant.name}</h2>
            <button className="plant-button">View Details</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EPlantSelection;
