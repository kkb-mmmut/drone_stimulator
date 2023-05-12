import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';    
import './styles/DroneMap.css'; 
mapboxgl.accessToken = 'pk.eyJ1IjoiY2hhcmxpZS1jaGFwbGluIiwiYSI6ImNsaGhkdjFmazFzZmgzbGsxcnh3eG9paTYifQ._kFROe3Sk2t2J0Kd76WCyA';
// mapboxgl.accessToken ="sk.eyJ1IjoiY2hhcmxpZS1jaGFwbGluIiwiYSI6ImNsaGhlN2hheTA0Z2EzZXFkZGpkbjhoMnkifQ.siHLOljAzsIZ_1V6RcCg_A"; 
const DroneMap = () => { 
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [lng, setLng] = useState(83.0013);
  const [lat, setLat] = useState(25.3315);
  const [zoom, setZoom] = useState(5.13); 
  const [distance, setDistance] = useState(null);
  const [init_loc,setInit]=useState({
    init_Latitude:83.0013,
    init_Longitude:25.3315,
    speed:3
  })
  const [fin_loc,setFinal]=useState({
    fin_Latitude:'',
    fin_Longitude:'',
    fin_speed:'3000'
  }) 
  const [pointCoordinates, setPointCoordinates] = useState(null);   
  const [popup, setPopup] = useState(null);  
  const handleSetiLoc = e => {
    const { name, value } = e.target;
    setInit(prevState => ({
        ...prevState,
        [name]: value
    }));
};

  const handleSetfLoc = e => {
    const { name, value } = e.target;
    setFinal(prevState => ({
        ...prevState,
        [name]: value
    }));
};
 

useEffect(() => {
  if (map && pointCoordinates) {  
    const marker = new mapboxgl.Marker({
      color:'red',
      draggable:false, 
    })
      .setLngLat(pointCoordinates) 
      .setPopup(popup)
      .addTo(map.current);
      setFinal(prevState => ({
        ...prevState,
        'fin_Latitude':pointCoordinates.lng.toFixed(4),
        'fin_Longitude':pointCoordinates.lat.toFixed(4),
        
    }));
    console.log(pointCoordinates);

    return () => marker.remove(); 
  }
}, [map, pointCoordinates,popup]);
 
const calculateDistance = () => {
  const lat1 = parseFloat(init_loc.init_Latitude);
  const lon1 = parseFloat(init_loc.init_Longitude);
  const lat2 = parseFloat(fin_loc.fin_Latitude);
  const lon2 = parseFloat(fin_loc.fin_Longitude);
   
  if (isNaN(lat1) || isNaN(lon1) || isNaN(lat2) || isNaN(lon2)) {
    // Input validation
    alert('Please enter valid latitude and longitude values');
    return;
  } 
 
  const lat = parseFloat(init_loc.init_Latitude);
  const lng = parseFloat(init_loc.init_Longitude); 
  if (isNaN(lat) || isNaN(lng)) {
    return;
  } 
   new mapboxgl.Marker({
    color:'green',
    draggable:false, 
  }).setLngLat([lat,lng]) 
    .setPopup(popup)
    .addTo(map.current)  
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180; // Latitude difference in radians
  const dLon = ((lon2 - lon1) * Math.PI) / 180; // Longitude difference in radians

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
  const distance = R * c; // Distance in kilometers 
  setDistance(distance.toFixed(2));
};
 
  useEffect(() => {
    if (map.current) return; // initialize map only once
    map.current = new mapboxgl.Map({
    container: mapContainer.current,
    style: 'mapbox://styles/mapbox/streets-v12',
    center: [lng, lat],
    zoom: zoom
    });
    map.current.on('click', (e) => { 
      setPointCoordinates(e.lngLat); 
    }); 
  }); 
 
   useEffect(() => {
      if (!map.current) return; // wait for map to initialize
      map.current.on('move', () => {
      setLng(map.current.getCenter().lng.toFixed(4));
      setLat(map.current.getCenter().lat.toFixed(4));
      setZoom(map.current.getZoom().toFixed(2));
      });
   })   
  return (
    <div  > 
      <div className="sidebar">
      Longitude: {lng} | Latitude: {lat} | Zoom: {zoom}
      </div> 
      <div ref={mapContainer} className="map-container" />   
      <div className="toolbar">
        <div className='input_form' > 
          <div className='init_point'>
            <label>Initial Loc.</label>
            <input className='loc_input' type='text' placeholder='Enter Latitude'name='init_Latitude' onChange={handleSetiLoc} value={init_loc.init_Latitude+" Lat."} disabled/>
            <input className='loc_input' type='text'placeholder='Enter Longitude' name='init_Longitude' onChange={handleSetiLoc} value={init_loc.init_Longitude+" Lon."} disabled/>
            <input className='loc_input'  type='text' placeholder='Speed' name='speed' onChange={handleSetiLoc} value={init_loc.speed+" seconds"}  disabled/>
          </div>
          <div className='end_point'>
            <label>Final Loc.</label>
            <input className='loc_input' type='text' placeholder='Enter Latitude' name='fin_Latitude'  onChange={handleSetfLoc} value={fin_loc.fin_Latitude}/>
            <input className='loc_input' type='text'placeholder='Enter Longitude' name='fin_Longitude' onChange={handleSetfLoc} value={fin_loc.fin_Longitude}/>
            <input className='loc_input'  type='text' placeholder='Speed'name='fin_speed' onChange={handleSetfLoc} value={fin_loc.fin_speed}/>
          </div> 
        </div> 
        <button className='btn-track' onClick={calculateDistance}>Simulate</button>
      </div>
      {distance && <div className='display_details'>
        <h3>Statistics</h3>
            <p>Distance to be covered :<span>{distance}</span> kms.</p>
            <p>Time of flight : <span>{(fin_loc.fin_speed/60).toFixed(2)}</span> mins.</p>
            <p>Average Velocity : <span>{((distance)/(fin_loc.fin_speed/3600)).toFixed(2)}</span> km/hr.</p>
      </div>}
    </div>
  );
};

export default DroneMap;
