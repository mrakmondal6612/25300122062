import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import MapLibreMap from "./MapLibreMap";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Loadere from "../../../components/loader/Loadere";
import dashpic from "../../../assets/dashboard.png";
import "./dhome.css";
// Google Chart import removed
const DHome = ({ userData }) => {
  const [hloader, setHLoader] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [refresh, setRefresh] = useState(true);
  const [total, setTotal] = useState("");
  const [geoDatas, setGeoDatas] = useState([]); // [['country', 'click'], ['Bangladesh', 10], ...]
  const [kdata, setKdata] = useState([]);
  useEffect(() => {
    const userId = {
      email: userData.email,
    };
    const getData = async () => {
      setHLoader(true);
      fetch(import.meta.env.VITE_DASHBOARD_HOME, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userId),
        credentials: "include",
      })
        .then((res) => {
          if (res.ok) {
            return res.json();
          } else {
            setHLoader(false);
            throw new Error("Network response was not ok");
          }
        })
        .then((rawData) => {
          const { total, geoData, lineData } = rawData;
          setTotal(total);
          setGeoDatas(geoData);
          setKdata(lineData);
          setHLoader(false);
        });
    };
    getData();
  }, [refresh]);

  // Helper: country name to lat/lng (minimal, demo; for real use, use a lookup or geocoding API)
  // For production, use a backend API or a geocoding service for all countries
  const countryCoords = {
    Bangladesh: [23.685, 90.3563],
    India: [20.5937, 78.9629],
    USA: [37.0902, -95.7129],
    Canada: [56.1304, -106.3468],
    UK: [55.3781, -3.4360],
    Germany: [51.1657, 10.4515],
    France: [46.6034, 1.8883],
    Australia: [-25.2744, 133.7751],
    // Add more as needed
  };

  // Prepare marker data for MapLibreMap from backend geoDatas
  const markers = Array.isArray(geoDatas) && geoDatas.length > 1
    ? geoDatas.slice(1).map(([country, click]) => {
        const coords = countryCoords[country];
        return coords ? { lng: coords[1], lat: coords[0], label: `<b>${country}</b><br/>Clicks: ${click}`, id: country } : null;
      }).filter(Boolean)
    : [];

  // Example: handle marker click (show alert or custom logic)
  const handleMarkerClick = ({ id, label }) => {
    alert(`Country: ${id}\n${label.replace(/<[^>]+>/g, '')}`);
  };

  // Line chart data and usage removed (Google Charts dependency removed)

  const handleRotation = () => {
    setRotation(rotation + 360);
  };

  return (
    <>
      {hloader ? (
        <div className="loadere-box" key={11}>
          <Loadere />
        </div>
      ) : total ? (
        <div className="dhome">
          <div className="box box-1">
            <div className="box-1-inner">
              <span className="box-title">Total Hyperlink Accessed </span>
              <span
                className="material-icons-outlined refs"
                onClick={() => {
                  setRefresh(!refresh);
                  handleRotation();
                }}
                style={{ transform: `rotate(${rotation}deg)` }}
              >
                refresh
              </span>
            </div>
            <span className="link-count">{total}</span>
          </div>
          <div className="box box-2">
            <span className="box-title">Weekly data</span>
            <div className="box-chart" style={{ height: 200, width: '100%' }}>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={kdata} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Line type="monotone" dataKey="click" stroke="#0276ff" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="box box-3">
            <span className="box-title">Geo data (MapLibre/OSM)</span>
            <div className="box-chart" style={{ height: 400, width: '100%' }}>
              <MapLibreMap markers={markers} markerColor="#0276ff" onMarkerClick={handleMarkerClick} />
            </div>
          </div>
        </div>
      ) : (
        <div className="dhome-no">
          <span className="no-title">
            Welcome to <span>Dashboard</span>
          </span>
          <div className="dhome-no-in">
            <span>
              Greetings <span>{userData.given_name}</span>
            </span>
            <span>Your presence lights up our dashboard.</span>
            <span>
              Let's get started with <span>shortenig links!</span>
            </span>
            <Link to={"newlink"} className="navi-link">
              Start
            </Link>
          </div>
          <div className="no-illus">
            <img src={dashpic} alt="" />
          </div>
        </div>
      )}
    </>
  );
};
export default DHome;
