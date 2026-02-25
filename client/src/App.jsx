import { useState } from "react";
import axios from "axios";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useAuth } from "./context/AuthContext";
import AuthPage from "./pages/AuthPage";
import { LogOut, User as UserIcon } from "lucide-react";

// Fix default marker icons broken by webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Custom icons
const evIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/2554/2554940.png",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

const startIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
  iconSize: [36, 36],
  iconAnchor: [18, 36],
  popupAnchor: [0, -36],
});

const endIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
  iconSize: [36, 36],
  iconAnchor: [18, 36],
  popupAnchor: [0, -36],
});

// Component to auto-fit map bounds to route
function FitBounds({ routeCoords }) {
  const map = useMap();
  if (routeCoords && routeCoords.length > 0) {
    const bounds = L.latLngBounds(routeCoords);
    map.fitBounds(bounds, { padding: [40, 40] });
  }
  return null;
}

export default function App() {
  const { user, token, logout, loading: authLoading } = useAuth();
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [stations, setStations] = useState([]);
  const [warnings, setWarnings] = useState([]);
  const [routeCoords, setRouteCoords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);

  if (authLoading) return <div style={styles.loader}>⚡ Loading...</div>;

  if (!token) return <AuthPage />;

  const fetchRoute = async () => {
    if (!start.trim() || !end.trim()) {
      setError("Please enter both start and end locations.");
      return;
    }
    setLoading(true);
    setError("");
    setStations([]);
    setWarnings([]);
    setRouteCoords([]);
    setSearched(false);

    try {
      const res = await axios.get(
        `http://localhost:5000/api/route?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`
      );

      console.log("API Response:", res.data);
      setStations(res.data.stations || []);
      setWarnings(res.data.warnings || []);
      setRouteCoords(res.data.routeCoords || []);
      setSearched(true);
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") fetchRoute();
  };

  const startStation = stations[0];
  const endStation = stations[stations.length - 1];
  const midStations = stations.slice(1, -1);

  return (
    <div style={styles.container}>
      <div style={styles.navbar}>
        <div style={styles.userInfo}>
          <UserIcon size={18} />
          <span>{user?.name}</span>
        </div>
        <button onClick={logout} style={styles.logoutBtn}>
          <LogOut size={18} />
          Logout
        </button>
      </div>

      <div style={styles.contentWrapper}>
        <div style={styles.header}>
          <h1 style={styles.title}>⚡ EV Route Planner</h1>
          <p style={styles.subtitle}>Find charging stations along your route</p>
        </div>

        {error && <div style={styles.error}>⚠ {error}</div>}

        {searched && (
          <div style={styles.stats}>
            ✅ Found <strong>{midStations.length}</strong> station(s)
          </div>
        )}

        {/* Warnings overlay */}
        {warnings && warnings.length > 0 && (
          <div style={styles.warningsBox}>
            <h3 style={styles.warningsHeader}>🚨 Critical Range Warnings</h3>
            <p style={styles.warningsSub}>Limited charging options ahead.</p>
            {warnings.map((w, i) => (
              <div key={i} style={w.distanceKm > 200 ? styles.criticalWarningItem : styles.warningItem}>
                <div style={styles.warningIcon}>{w.distanceKm > 200 ? "🧨" : "⚠"}</div>
                <div>
                  <strong>{w.distanceKm} km</strong> gap: <em>{w.from}</em> → <em>{w.to}</em>
                  <br />
                  <span style={{ color: "#431407", fontSize: 11 }}>
                    💡 Suggested: <strong>{w.suggestedChargeTime}</strong> charge.
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={styles.mapWrapper}>
          <MapContainer center={[20.5937, 78.9629]} zoom={5} style={{ height: "100%", width: "100%" }}>
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a>'
            />

            {routeCoords.length > 0 && (
              <>
                <Polyline
                  positions={routeCoords}
                  pathOptions={{ color: "#4f46e5", weight: 5, opacity: 0.8 }}
                />
                <FitBounds routeCoords={routeCoords} />
              </>
            )}

            {startStation && (
              <Marker position={[startStation.lat, startStation.lon]} icon={startIcon}>
                <Popup><strong>🟢 {startStation.tags?.name || "Start"}</strong></Popup>
              </Marker>
            )}

            {endStation && stations.length > 1 && (
              <Marker position={[endStation.lat, endStation.lon]} icon={endIcon}>
                <Popup><strong>🔴 {endStation.tags?.name || "Destination"}</strong></Popup>
              </Marker>
            )}

            {midStations.map((s, i) => (
              <Marker key={s.id || i} position={[s.lat, s.lon]} icon={evIcon}>
                <Popup>
                  <strong>⚡ {s.tags?.name || "EV Charging Station"}</strong>
                  {s.tags?.operator && <><br />🏢 {s.tags.operator}</>}
                  {s.tags?.["socket:type2"] && <><br />🔌 Type 2: {s.tags["socket:type2"]} port(s)</>}
                  {s.tags?.fee && <><br />💰 Fee: {s.tags.fee}</>}
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        <div style={styles.searchBox}>
          <input
            style={styles.input}
            placeholder="📍 Start (e.g. Bangalore)"
            value={start}
            onChange={(e) => setStart(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <input
            style={styles.input}
            placeholder="🏁 End (e.g. Mumbai)"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button style={styles.button} onClick={fetchRoute} disabled={loading}>
            {loading ? "🔄 Searching..." : "🔍 Find Stations"}
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    fontFamily: "'Segoe UI', sans-serif",
    display: "flex",
    flexDirection: "column",
    height: "100vh",
    width: "100vw",
    background: "#f0f4ff",
    overflow: "hidden", // Prevent double scrollbars
  },
  navbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 20px",
    background: "#fff",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
    zIndex: 1000,
  },
  userInfo: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    color: "#4f46e5",
    fontWeight: 600,
  },
  logoutBtn: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: "6px 12px",
    background: "#fee2e2",
    color: "#dc2626",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 600,
  },
  loader: {
    display: "flex",
    height: "100vh",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 24,
    fontWeight: 700,
    color: "#4f46e5",
    background: "#f0f4ff",
  },
  contentWrapper: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    position: "relative",
  },
  header: {
    textAlign: "center",
    padding: "10px",
    background: "rgba(255, 255, 255, 0.9)",
    backdropFilter: "blur(4px)",
    position: "absolute",
    top: 20,
    left: "50%",
    transform: "translateX(-50%)",
    zIndex: 1000,
    borderRadius: 16,
    boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
    border: "1px solid #c7d2fe",
    minWidth: 300,
  },
  title: {
    fontSize: 20,
    color: "#4f46e5",
    margin: 0,
  },
  subtitle: {
    color: "#666",
    margin: 2,
    fontSize: 12,
  },
  searchBox: {
    display: "flex",
    gap: 10,
    padding: "12px",
    background: "rgba(255, 255, 255, 0.9)",
    backdropFilter: "blur(4px)",
    position: "absolute",
    bottom: 30,
    left: "50%",
    transform: "translateX(-50%)",
    zIndex: 1000,
    borderRadius: 16,
    boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
    border: "1px solid #c7d2fe",
    width: "90%",
    maxWidth: 800,
  },
  input: {
    flex: 1,
    minWidth: 150,
    padding: "10px 14px",
    borderRadius: 10,
    border: "1px solid #c7d2fe",
    fontSize: 14,
    outline: "none",
    background: "#fff",
    color: "#111",
  },
  button: {
    padding: "10px 22px",
    background: "#4f46e5",
    color: "#fff",
    border: "none",
    borderRadius: 10,
    fontSize: 14,
    cursor: "pointer",
    fontWeight: 600,
    whiteSpace: "nowrap",
  },
  error: {
    color: "#dc2626",
    background: "#fee2e2",
    padding: "10px 14px",
    borderRadius: 12,
    position: "absolute",
    top: 100,
    left: "50%",
    transform: "translateX(-50%)",
    zIndex: 1000,
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
  },
  stats: {
    color: "#166534",
    background: "#dcfce7",
    padding: "8px 14px",
    borderRadius: 10,
    position: "absolute",
    bottom: 110,
    left: "50%",
    transform: "translateX(-50%)",
    zIndex: 1000,
    fontSize: 14,
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
  },
  mapWrapper: {
    flex: 1,
    width: "100%",
    position: "relative",
  },
  warningsBox: {
    position: "absolute",
    top: 20,
    right: 20,
    width: 320,
    maxHeight: "60vh",
    overflowY: "auto",
    background: "rgba(255, 247, 237, 0.95)",
    backdropFilter: "blur(4px)",
    border: "2px solid #fed7aa",
    borderRadius: 16,
    padding: "16px",
    zIndex: 1000,
    boxShadow: "0 10px 25px rgba(251,146,60,0.2)",
  },
  warningsHeader: {
    margin: "0 0 4px 0",
    color: "#7c2d12", // Slightly darker and richer
    fontSize: 16,
    fontWeight: "bold",
  },
  warningsSub: {
    margin: "0 0 12px 0",
    color: "#451a03", // Increased contrast
    fontSize: 12,
    opacity: 0.9,
  },
  warningItem: {
    marginBottom: 8,
    padding: "10px",
    background: "#ffedd5",
    borderLeft: "4px solid #f97316",
    borderRadius: 8,
    fontSize: 13,
    display: "flex",
    gap: 8,
    color: "#451a03", // Explicit dark color for text
  },
  criticalWarningItem: {
    marginBottom: 8,
    padding: "10px",
    background: "#fee2e2",
    borderLeft: "4px solid #ef4444",
    borderRadius: 8,
    fontSize: 13,
    display: "flex",
    gap: 8,
    color: "#450a0a", // Deep red for critical text
  },
  warningIcon: {
    fontSize: 16,
  },
};