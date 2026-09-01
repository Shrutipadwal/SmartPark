import { useEffect, useMemo, useState } from "react";
import {
  BrowserRouter,
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";
import {
  ArrowRight,
  Check,
  ChevronDown,
  MapPin,
  Menu,
  Navigation,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  X,
  Zap,
} from "lucide-react";
import "./App.css";
import "./BookingStyles.css";
import {
  createBooking,
  cancelBooking,
  createPaymentOrder,
  verifyPayment,
  fetchAdminDashboard,
  fetchAdminParking,
  fetchAdminBookings,
  fetchMyBookings,
  fetchMyProfile,
  fetchParking,
  createAdminParking,
  deleteAdminParking,
  createOwnerRequest,
  fetchOwnerRequests,
  reviewOwnerRequest,
  updateAdminAvailability,
  updateAdminParking,
  checkIn,
  checkOut,
} from "./services/parkingApi";
import {
  getCurrentUserToken,
  signInWithGoogle,
  signOutUser,
  watchAuthState,
} from "./services/authService";
import {
  CircleMarker,
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { io } from "socket.io-client";
import QRCode from "qrcode";
import CheckInPage from "./pages/CheckInPage";
import BookingCard from "./components/BookingCard";
import BookingDetailModal from "./components/BookingDetailModal";

let razorpayScriptPromise;
function loadRazorpay() {
  if (window.Razorpay) return Promise.resolve();
  if (!razorpayScriptPromise) {
    razorpayScriptPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = resolve;
      script.onerror = () =>
        reject(new Error("Razorpay checkout could not load."));
      document.body.appendChild(script);
    });
  }
  return razorpayScriptPromise;
}

function getStatus(available, capacity) {
  if (available === 0) return { label: "Full", tone: "full" };
  if (available / capacity <= 0.3) return { label: "Limited", tone: "limited" };
  return { label: "Available", tone: "available" };
}

function formatBookingDate(value) {
  return new Date(`${value}T00:00:00`).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatBookingDateTime(value) {
  if (!value) return "Time unavailable";
  return new Date(value).toLocaleString(undefined, {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}

function SmartParkApp() {
  const location = useLocation();
  const navigate = useNavigate();
  const isHomePage = ["/", "/find", "/how-it-works", "/about"].includes(
    location.pathname,
  );
  const isPartnerPage = location.pathname === "/partner";
  const isDashboardPage = location.pathname === "/dashboard";
  const isCheckInPage = location.pathname === "/checkin";
  const bookingMatch = location.pathname.match(/^\/booking\/([^/]+)$/);
  const [query, setQuery] = useState("");
  const [parkingLots, setParkingLots] = useState([]);
  const [vehicle, setVehicle] = useState("car");
  const [sortBy, setSortBy] = useState("distance");
  const [selectedLot, setSelectedLot] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [bookingComplete, setBookingComplete] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [locationMessage, setLocationMessage] = useState("");
  const [authUser, setAuthUser] = useState(null);
  const [authMessage, setAuthMessage] = useState("");
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [pendingLot, setPendingLot] = useState(null);
  const [profile, setProfile] = useState(null);
  const [myBookings, setMyBookings] = useState([]);
  const [adminStats, setAdminStats] = useState(null);
  const [adminParking, setAdminParking] = useState([]);
  const [adminBookings, setAdminBookings] = useState([]);
  const [adminNotice, setAdminNotice] = useState("");
  const [adminFormOpen, setAdminFormOpen] = useState(false);
  const [adminEditingLot, setAdminEditingLot] = useState(null);
  const [adminMessage, setAdminMessage] = useState("");
  const [ownerRequests, setOwnerRequests] = useState([]);
  const [partnerFormOpen, setPartnerFormOpen] = useState(false);
  const [partnerLoginIntent, setPartnerLoginIntent] = useState(false);
  const [bookingDate, setBookingDate] = useState(() =>
    new Date(Date.now() + 86400000).toISOString().slice(0, 10),
  );
  const [bookingStart, setBookingStart] = useState("10:00");
  const [bookingDuration, setBookingDuration] = useState(2);
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [paymentBooking, setPaymentBooking] = useState(null);
  const [confirmedBooking, setConfirmedBooking] = useState(null);
  const [selectedBookingDetail, setSelectedBookingDetail] = useState(null);

  useEffect(() => watchAuthState(setAuthUser), []);

  useEffect(() => {
    let active = true;
    async function loadAccount() {
      if (!authUser) {
        setProfile(null);
        setMyBookings([]);
        setAdminStats(null);
        return;
      }
      try {
        const token = await getCurrentUserToken(authUser);
        const userProfile = await fetchMyProfile(token);
        if (!active) return;
        setProfile(userProfile);
        setMyBookings(await fetchMyBookings(token));
        if (userProfile.role === "ADMIN") {
          setAdminStats(await fetchAdminDashboard(token));
          setAdminParking(await fetchAdminParking(token));
          const bookings = await fetchAdminBookings(token);
          setAdminBookings(bookings);
          setOwnerRequests(await fetchOwnerRequests(token));
        }
      } catch (error) {
        if (active)
          setAuthMessage(error.response?.data?.message || error.message);
      }
    }
    loadAccount();
    return () => {
      active = false;
    };
  }, [authUser]);

  useEffect(() => {
    if (!authUser || profile?.role !== "ADMIN") return undefined;
    let socket;
    let active = true;
    getCurrentUserToken(authUser).then((token) => {
      if (!active || !token) return;
      const apiUrl = (
        import.meta.env.VITE_API_URL || "http://localhost:5000/api"
      ).replace(/\/api\/?$/, "");
      socket = io(apiUrl, { auth: { token } });
      socket.on("reservation-created", (booking) => {
        setAdminBookings((current) => [booking, ...current]);
        setAdminNotice("New reservation received.");
      });
    });
    return () => {
      active = false;
      socket?.disconnect();
    };
  }, [authUser, profile]);

  useEffect(() => {
    if (!partnerLoginIntent || !authUser || !profile) return;
    setPartnerLoginIntent(false);
    if (profile.role === "ADMIN") navigate("/dashboard");
    else setPartnerFormOpen(true);
  }, [authUser, partnerLoginIntent, profile, navigate]);

  useEffect(() => {
    // The local seed keeps the UI usable when the API is not running yet.
    fetchParking({ search: "", vehicle, sort: "distance" })
      .then(setParkingLots)
      .catch(() => setParkingLots([]));
  }, [vehicle]);

  const visibleLots = useMemo(() => {
    const filtered = parkingLots.filter((lot) =>
      `${lot.name} ${lot.address}`.toLowerCase().includes(query.toLowerCase()),
    );
    return [...filtered].sort((first, second) => {
      if (sortBy === "price")
        return (
          first[vehicle === "car" ? "carPrice" : "bikePrice"] -
          second[vehicle === "car" ? "carPrice" : "bikePrice"]
        );
      if (sortBy === "availability")
        return (
          second[vehicle === "car" ? "carAvailable" : "bikeAvailable"] -
          first[vehicle === "car" ? "carAvailable" : "bikeAvailable"]
        );
      return first.distance - second.distance;
    });
  }, [parkingLots, query, sortBy, vehicle]);

  async function confirmBooking() {
    try {
      const token = await getCurrentUserToken(authUser);
      const booking = await createBooking({
        parkingId: selectedLot.id,
        vehicleType: vehicle,
        vehicleNumber,
        startTime: `${bookingDate}T${bookingStart}:00`,
        durationHours: Number(bookingDuration),
        token,
      });
      setMyBookings(await fetchMyBookings(token));
      setParkingLots(
        await fetchParking({ search: "", vehicle, sort: "distance" }),
      );
      setPaymentBooking(booking);
    } catch (error) {
      setAuthMessage(error.response?.data?.message || error.message);
    }
  }

  async function completePayment(paymentResult) {
    try {
      const token = await getCurrentUserToken(authUser, true);
      const paidBooking = await verifyPayment(token, paymentResult);
      const qrDataUrl = await QRCode.toDataURL(paidBooking.qrCodeData);
      setConfirmedBooking({ ...paidBooking, qrDataUrl });
      setPaymentBooking(null);
      setBookingComplete(true);
      setMyBookings(await fetchMyBookings(token));
    } catch (error) {
      setAuthMessage(error.response?.data?.message || error.message);
    }
  }

  async function handleCancelBooking(booking) {
    if (!window.confirm("Cancel this booking?")) return;
    try {
      const token = await getCurrentUserToken(authUser);
      await cancelBooking(token, booking._id);
      setMyBookings(await fetchMyBookings(token));
      setParkingLots(
        await fetchParking({ search: "", vehicle, sort: "distance" }),
      );
    } catch (error) {
      setAuthMessage(error.response?.data?.message || error.message);
    }
  }

  function startBooking(lot) {
    if (!authUser) {
      setPendingLot(lot);
      setAuthMessage("");
      setLoginModalOpen(true);
      return;
    }
    setSelectedLot(lot);
    setBookingComplete(false);
    setVehicleNumber("");
  }

  function useMyLocation() {
    if (!navigator.geolocation) {
      setLocationMessage("Location is not supported by this browser.");
      return;
    }

    setLocationMessage("Finding your location...");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCurrentLocation([
          position.coords.latitude,
          position.coords.longitude,
        ]);
        setLocationMessage("Location found.");
      },
      () => {
        setLocationMessage(
          "Location permission was blocked. Allow it in your browser and try again.",
        );
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    );
  }

  async function handleSignIn() {
    setAuthMessage("");
    try {
      await signInWithGoogle();
      if (pendingLot) {
        setSelectedLot(pendingLot);
        setPendingLot(null);
        setBookingComplete(false);
      }
      setLoginModalOpen(false);
    } catch (error) {
      setAuthMessage(error.message);
    }
  }

  function openDashboard() {
    navigate("/dashboard");
  }

  function openPartnerPage() {
    navigate("/partner");
  }

  function continuePartnerFlow() {
    if (!authUser) {
      setAuthMessage("");
      setPartnerLoginIntent(true);
      setLoginModalOpen(true);
      return;
    }
    if (profile?.role === "ADMIN") openDashboard();
    else setPartnerFormOpen(true);
  }

  function openAdminForm(lot = null) {
    setAdminEditingLot(lot);
    setAdminMessage("");
    setAdminFormOpen(true);
  }

  async function saveAdminParking(formData) {
    try {
      const token = await getCurrentUserToken(authUser);
      const savedLot = adminEditingLot
        ? await updateAdminParking(token, adminEditingLot.id, formData)
        : await createAdminParking(token, formData);
      setAdminParking((current) =>
        adminEditingLot
          ? current.map((lot) => (lot.id === savedLot.id ? savedLot : lot))
          : [savedLot, ...current],
      );
      setParkingLots((current) => {
        const mapped = current.map((lot) =>
          lot.id === savedLot.id ? savedLot : lot,
        );
        return current.some((lot) => lot.id === savedLot.id)
          ? mapped
          : [savedLot, ...current];
      });
      setAdminFormOpen(false);
      setAdminMessage(adminEditingLot ? "Parking updated." : "Parking added.");
    } catch (error) {
      setAdminMessage(error.response?.data?.message || error.message);
      throw error;
    }
  }

  async function saveAvailability(lot, values) {
    try {
      const token = await getCurrentUserToken(authUser);
      const updatedLot = await updateAdminAvailability(token, lot.id, values);
      setAdminParking((current) =>
        current.map((item) => (item.id === updatedLot.id ? updatedLot : item)),
      );
      setParkingLots((current) =>
        current.map((item) => (item.id === updatedLot.id ? updatedLot : item)),
      );
      setAdminMessage("Availability updated.");
    } catch (error) {
      setAdminMessage(error.response?.data?.message || error.message);
    }
  }

  async function removeParking(lot) {
    if (!window.confirm(`Delete ${lot.name}?`)) return;
    try {
      const token = await getCurrentUserToken(authUser);
      await deleteAdminParking(token, lot.id);
      setAdminParking((current) =>
        current.filter((item) => item.id !== lot.id),
      );
      setParkingLots((current) => current.filter((item) => item.id !== lot.id));
      setAdminMessage("Parking deleted.");
    } catch (error) {
      setAdminMessage(error.response?.data?.message || error.message);
    }
  }

  async function submitOwnerRequest(requestData) {
    try {
      const token = await getCurrentUserToken(authUser);
      await createOwnerRequest(token, requestData);
      const updatedProfile = await fetchMyProfile(token);
      setProfile(updatedProfile);
      setAuthMessage("Request submitted. An admin will review it.");
      return true;
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message);
    }
  }

  async function decideOwnerRequest(ownerRequest, decision) {
    try {
      const token = await getCurrentUserToken(authUser);
      await reviewOwnerRequest(token, ownerRequest._id, decision);
      setOwnerRequests((current) =>
        current.map((item) =>
          item._id === ownerRequest._id ? { ...item, status: decision } : item,
        ),
      );
      setAdminMessage(`Request ${decision.toLowerCase()}.`);
    } catch (error) {
      setAdminMessage(error.response?.data?.message || error.message);
    }
  }

  return (
    <div className="app-shell">
      <header className="navbar">
        <Link className="brand" to="/" aria-label="SmartPark home">
          <span className="brand-mark">
            <MapPin size={19} />
          </span>
          Smart<span>Park</span>
        </Link>
        <button
          className="icon-button mobile-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle navigation"
        >
          <Menu size={22} />
        </button>
        <nav className={mobileMenuOpen ? "nav-links open" : "nav-links"}>
          <Link to="/find">Find parking</Link>
          <Link to="/checkin">Check-in</Link>
          <Link to="/how-it-works">How it works</Link>
          <Link to="/about">About</Link>
          {authMessage && <span className="auth-message">{authMessage}</span>}
          {authUser ? (
            <>
              <button
                className={`nav-tab ${profile?.role === "ADMIN" ? "admin-tab" : ""}`}
                onClick={openDashboard}
              >
                {profile?.role === "ADMIN" ? "Admin panel" : "My bookings"}{" "}
                <ArrowRight size={16} />
              </button>
              <button className="sign-in" onClick={signOutUser}>
                Sign out
              </button>
            </>
          ) : (
            <button className="sign-in" onClick={handleSignIn}>
              Sign in with Google <ArrowRight size={16} />
            </button>
          )}
        </nav>
      </header>
      <main id="top">
        {!isHomePage &&
          !isPartnerPage &&
          !isDashboardPage &&
          !isCheckInPage &&
          !bookingMatch && <NotFoundPage />}
        {isCheckInPage && (
          <CheckInPage
            bookings={myBookings}
            onCheckIn={async (bookingId) => {
              try {
                const token = await getCurrentUserToken(authUser);
                await checkIn(token, bookingId);
                setMyBookings(await fetchMyBookings(token));
              } catch (error) {
                throw new Error(error.response?.data?.message || error.message);
              }
            }}
            onCheckOut={async (bookingId) => {
              try {
                const token = await getCurrentUserToken(authUser);
                await checkOut(token, bookingId);
                setMyBookings(await fetchMyBookings(token));
              } catch (error) {
                throw new Error(error.response?.data?.message || error.message);
              }
            }}
          />
        )}
        {isPartnerPage && (
          <PartnerPage
            authUser={authUser}
            profile={profile}
            onBack={() => navigate("/")}
            onContinue={continuePartnerFlow}
          />
        )}
        {isDashboardPage && authUser && (
          <AccountDashboard
            profile={profile}
            bookings={myBookings}
            adminStats={adminStats}
            adminParking={adminParking}
            adminBookings={adminBookings}
            adminNotice={adminNotice}
            ownerRequests={ownerRequests}
            onAdd={openAdminForm}
            onEdit={openAdminForm}
            onDelete={removeParking}
            onAvailability={saveAvailability}
            onPartner={() => setPartnerFormOpen(true)}
            onDecision={decideOwnerRequest}
            onCancel={handleCancelBooking}
            message={adminMessage}
            selectedBookingDetail={selectedBookingDetail}
            onSelectBookingDetail={setSelectedBookingDetail}
          />
        )}
        {isDashboardPage && !authUser && (
          <section className="standalone-page">
            <p className="eyebrow">Private area</p>
            <h2>Sign in to view your dashboard.</h2>
            <button className="primary-button" onClick={handleSignIn}>
              Sign in with Google <ArrowRight size={17} />
            </button>
          </section>
        )}
        {bookingMatch && (
          <BookingPage
            lot={parkingLots.find((lot) => String(lot.id) === bookingMatch[1])}
            authUser={authUser}
            onLogin={() => setLoginModalOpen(true)}
            onBack={() => navigate("/find")}
          />
        )}
        {isHomePage && (
          <>
            <section className="hero-section">
              <div className="hero-copy">
                <p className="eyebrow">
                  <Zap size={15} /> Parking, made predictable
                </p>
                <h1>
                  Find. Book.
                  <br />
                  <em>Park.</em>
                </h1>
                <p className="hero-description">
                  Skip the circling. Discover nearby parking, see real-time
                  availability, and reserve your spot before you arrive.
                </p>
                <div className="hero-actions">
                  <a className="primary-button" href="#find">
                    Find parking <ArrowRight size={17} />
                  </a>
                  <a className="text-button" href="#how-it-works">
                    See how it works <ArrowRight size={16} />
                  </a>
                  <button className="partner-link" onClick={openPartnerPage}>
                    Partner with us <ArrowRight size={15} />
                  </button>
                </div>
                <div className="trust-row">
                  <div className="avatar-stack">
                    <span>R</span>
                    <span>A</span>
                    <span>V</span>
                  </div>
                  <span>Trusted by 2,000+ city drivers</span>
                </div>
              </div>
              <div
                className="hero-visual"
                aria-label="Stylized live parking map"
              >
                <div className="map-label">
                  <span className="live-dot"></span> Live availability
                </div>
                <div className="map-road road-one"></div>
                <div className="map-road road-two"></div>
                <div className="map-road road-three"></div>
                <div className="map-block block-one"></div>
                <div className="map-block block-two"></div>
                <div className="map-block block-three"></div>
                <div className="map-pin pin-main">
                  <MapPin size={23} fill="currentColor" />
                  <span>24</span>
                </div>
                <div className="map-pin pin-two">
                  <MapPin size={19} fill="currentColor" />
                  <span>46</span>
                </div>
                <div className="map-pin pin-three">
                  <MapPin size={19} fill="currentColor" />
                  <span>8</span>
                </div>
                <div className="map-card">
                  <div className="mini-icon">
                    <Navigation size={15} />
                  </div>
                  <div>
                    <strong>Riverside Market</strong>
                    <small>0.3 km away</small>
                  </div>
                  <span className="available-pill">24 open</span>
                </div>
              </div>
            </section>
            <section className="stats-strip">
              <div>
                <strong>3.2k+</strong>
                <span>parking spaces</span>
              </div>
              <div>
                <strong>18 min</strong>
                <span>average saved</span>
              </div>
              <div>
                <strong>4.9/5</strong>
                <span>driver rating</span>
              </div>
              <div>
                <strong>24/7</strong>
                <span>real-time updates</span>
              </div>
            </section>
            <section className="find-section" id="find">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">Your next stop</p>
                  <h2>Parking near you</h2>
                </div>
                <button className="filter-button">
                  <SlidersHorizontal size={16} /> Filters
                </button>
              </div>
              <div className="search-row">
                <div className="search-input">
                  <Search size={19} />
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search a destination or neighborhood"
                  />
                  <button
                    aria-label="Use current location"
                    onClick={useMyLocation}
                  >
                    <Navigation size={17} /> Use my location
                  </button>
                </div>
                {locationMessage && (
                  <p className="location-message">{locationMessage}</p>
                )}
                <div className="vehicle-toggle">
                  <button
                    className={vehicle === "bike" ? "selected" : ""}
                    onClick={() => setVehicle("bike")}
                  >
                    Bike
                  </button>
                  <button
                    className={vehicle === "car" ? "selected" : ""}
                    onClick={() => setVehicle("car")}
                  >
                    Car
                  </button>
                </div>
              </div>
              <div className="results-layout">
                <div className="parking-list">
                  <div className="list-toolbar">
                    <span>{visibleLots.length} nearby locations</span>
                    <label>
                      Sort by{" "}
                      <select
                        value={sortBy}
                        onChange={(event) => setSortBy(event.target.value)}
                      >
                        <option value="distance">Nearest</option>
                        <option value="price">Lowest price</option>
                        <option value="availability">Most spaces</option>
                      </select>
                      <ChevronDown size={14} />
                    </label>
                  </div>
                  {visibleLots.map((lot) => (
                    <ParkingCard
                      key={lot.id}
                      lot={lot}
                      vehicle={vehicle}
                      onBook={() => startBooking(lot)}
                    />
                  ))}
                  {visibleLots.length === 0 && (
                    <div className="empty-state">
                      No parking found nearby. Try another destination.
                    </div>
                  )}
                </div>
                <ParkingMap
                  lots={visibleLots}
                  vehicle={vehicle}
                  onSelect={startBooking}
                  currentLocation={currentLocation}
                />
              </div>
            </section>
            <section className="how-section" id="how-it-works">
              <div>
                <p className="eyebrow">Four easy steps</p>
                <h2>
                  Leave parking
                  <br />
                  <em>behind you.</em>
                </h2>
              </div>
              <div className="steps">
                <Step
                  number="01"
                  title="Search"
                  text="Tell us where you're headed."
                />
                <Step
                  number="02"
                  title="Compare"
                  text="See price, distance and spaces."
                />
                <Step
                  number="03"
                  title="Reserve"
                  text="Choose a vehicle and time."
                />
                <Step number="04" title="Arrive" text="Your spot is waiting." />
              </div>
            </section>
          </>
        )}
      </main>
      <footer id="about">
        <a className="brand" href="#top">
          <span className="brand-mark">
            <MapPin size={19} />
          </span>
          Smart<span>Park</span>
        </a>
        <p>More time for the things that matter.</p>
        <span className="footer-note">© 2026 SmartPark</span>
      </footer>
      {selectedBookingDetail && (
        <BookingDetailModal
          booking={selectedBookingDetail}
          onClose={() => setSelectedBookingDetail(null)}
        />
      )}
      {selectedLot && (
        <div className="modal-backdrop" onClick={() => setSelectedLot(null)}>
          <div
            className="booking-modal"
            onClick={(event) => event.stopPropagation()}
          >
            {paymentBooking ? (
              <PaymentStep
                booking={paymentBooking}
                authUser={authUser}
                onPaid={completePayment}
              />
            ) : bookingComplete ? (
              <div className="booking-success">
                <div className="success-icon">
                  <Check size={28} />
                </div>
                <p className="eyebrow">Reservation ready</p>
                <h2>You're all set.</h2>
                <p>
                  Your spot at <strong>{selectedLot.name}</strong> is reserved
                  for {formatBookingDate(bookingDate)} at {bookingStart}.
                </p>
                {confirmedBooking?.qrDataUrl && (
                  <img
                    className="booking-qr"
                    src={confirmedBooking.qrDataUrl}
                    alt="Booking QR code"
                  />
                )}
                {confirmedBooking?.bookingId && (
                  <p className="booking-id">
                    Booking ID: {confirmedBooking.bookingId}
                  </p>
                )}
                <button
                  className="primary-button"
                  onClick={() => setSelectedLot(null)}
                >
                  Done <ArrowRight size={17} />
                </button>
              </div>
            ) : (
              <>
                <button
                  className="close-modal"
                  onClick={() => setSelectedLot(null)}
                  aria-label="Close booking"
                >
                  <X size={20} />
                </button>
                <p className="eyebrow">Reserve your spot</p>
                <h2>{selectedLot.name}</h2>
                <p className="modal-address">
                  <MapPin size={15} /> {selectedLot.address}
                </p>
                <div className="booking-fields">
                  <label>
                    Vehicle number
                    <input
                      value={vehicleNumber}
                      onChange={(event) => setVehicleNumber(event.target.value)}
                      placeholder={
                        vehicle === "car"
                          ? "Example: MH12AB1234"
                          : "Example: MH12AB1234"
                      }
                    />
                  </label>
                  <div className="booking-field-row">
                    <label>
                      Date
                      <input
                        type="date"
                        min={new Date().toISOString().slice(0, 10)}
                        value={bookingDate}
                        onChange={(event) => setBookingDate(event.target.value)}
                      />
                    </label>
                    <label>
                      Start time
                      <input
                        type="time"
                        value={bookingStart}
                        onChange={(event) =>
                          setBookingStart(event.target.value)
                        }
                      />
                    </label>
                  </div>
                  <label>
                    Duration
                    <select
                      value={bookingDuration}
                      onChange={(event) =>
                        setBookingDuration(event.target.value)
                      }
                    >
                      <option value="1">1 hour</option>
                      <option value="2">2 hours</option>
                      <option value="3">3 hours</option>
                      <option value="4">4 hours</option>
                    </select>
                  </label>
                </div>
                <div className="booking-summary">
                  <div>
                    <span>Vehicle</span>
                    <strong>
                      {vehicle === "car" ? "Four wheeler" : "Two wheeler"}
                    </strong>
                  </div>
                  <div>
                    <span>Duration</span>
                    <strong>
                      {bookingDuration} hour
                      {Number(bookingDuration) === 1 ? "" : "s"}
                    </strong>
                  </div>
                  <div>
                    <span>Arrival</span>
                    <strong>
                      {formatBookingDate(bookingDate)} at {bookingStart}
                    </strong>
                  </div>
                  <div>
                    <span>Total</span>
                    <strong>
                      ₹
                      {(vehicle === "car"
                        ? selectedLot.carPrice
                        : selectedLot.bikePrice) * Number(bookingDuration)}
                    </strong>
                  </div>
                </div>
                <button
                  className="primary-button full-width"
                  onClick={confirmBooking}
                >
                  Continue to payment <ArrowRight size={17} />
                </button>
                <p className="secure-note">
                  <ShieldCheck size={14} /> Test payment only. No real money
                  charged.
                </p>
              </>
            )}
          </div>
        </div>
      )}
      {loginModalOpen && (
        <div
          className="modal-backdrop"
          onClick={() => setLoginModalOpen(false)}
        >
          <div
            className="login-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              className="close-modal"
              onClick={() => setLoginModalOpen(false)}
              aria-label="Close login"
            >
              <X size={20} />
            </button>
            <div className="login-mark">
              <MapPin size={24} />
            </div>
            <p className="eyebrow">One step before parking</p>
            <h2>Sign in to reserve</h2>
            <p className="login-copy">
              Your booking is linked to your account so you can view and manage
              it later.
            </p>
            <button className="google-button" onClick={handleSignIn}>
              <span className="google-letter">G</span>
              Continue with Google
              <ArrowRight size={17} />
            </button>
            {authMessage && <p className="login-error">{authMessage}</p>}
            <p className="secure-note">
              <ShieldCheck size={14} /> Secure authentication powered by
              Firebase
            </p>
          </div>
        </div>
      )}
      {adminFormOpen && (
        <AdminParkingForm
          lot={adminEditingLot}
          onClose={() => setAdminFormOpen(false)}
          onSave={saveAdminParking}
        />
      )}
      {partnerFormOpen && (
        <PartnerRequestForm
          onClose={() => setPartnerFormOpen(false)}
          onSave={submitOwnerRequest}
        />
      )}
    </div>
  );
}

function PaymentStep({ booking, authUser, onPaid }) {
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  async function submit(event) {
    event.preventDefault();
    setProcessing(true);
    setError("");
    try {
      const token = await getCurrentUserToken(authUser);
      const order = await createPaymentOrder(token, booking.bookingId);
      await loadRazorpay();
      const checkout = new window.Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: "SmartPark",
        description: `Parking reservation ${booking.bookingId}`,
        order_id: order.orderId,
        handler: (payment) => onPaid(payment),
        modal: { ondismiss: () => setProcessing(false) },
      });
      checkout.on("payment.failed", () => {
        setError("Payment failed. Please try again.");
        setProcessing(false);
      });
      checkout.open();
    } catch (paymentError) {
      setError(paymentError.response?.data?.message || paymentError.message);
      setProcessing(false);
    }
  }

  return (
    <form className="payment-step" onSubmit={submit}>
      <p className="eyebrow">Secure checkout</p>
      <h2>Complete payment</h2>
      <p className="login-copy">
        Pay ₹{booking.amount} securely with Razorpay test checkout.
      </p>
      {error && <p className="form-error">{error}</p>}
      <button className="primary-button full-width" disabled={processing}>
        {processing ? "Opening checkout..." : `Pay ₹${booking.amount}`}
      </button>
    </form>
  );
}

function ParkingCard({ lot, vehicle, onBook }) {
  const available = vehicle === "car" ? lot.carAvailable : lot.bikeAvailable;
  const capacity = vehicle === "car" ? lot.carCapacity : lot.bikeCapacity;
  const price = vehicle === "car" ? lot.carPrice : lot.bikePrice;
  const status = getStatus(available, capacity);
  return (
    <article className="parking-card">
      <div className={`card-accent ${lot.accent}`}></div>
      <div className="card-content">
        <div className="card-topline">
          <span className={`status-dot ${status.tone}`}></span>
          {status.label}
          <span className="distance">
            <MapPin size={13} /> {lot.distance} km
          </span>
        </div>
        <h3>{lot.name}</h3>
        <p className="address">{lot.address}</p>
        <div className="card-meta">
          <span>
            <strong>{available}</strong> {vehicle === "car" ? "car" : "bike"}{" "}
            spaces
          </span>
          <span>
            <strong>₹{price}</strong> / hour
          </span>
        </div>
        <button
          className="card-button"
          onClick={onBook}
          disabled={available === 0}
        >
          {available === 0 ? "Currently full" : "View & reserve"}{" "}
          <ArrowRight size={15} />
        </button>
      </div>
    </article>
  );
}

function PartnerPage({ authUser, profile, onBack, onContinue }) {
  const actionLabel = !authUser
    ? "Sign in to get started"
    : profile?.role === "ADMIN"
      ? "Open owner setup"
      : "Apply to become a partner";
  return (
    <section className="partner-page" id="partner">
      <button className="back-link" onClick={onBack}>
        <ArrowRight size={15} /> Back to SmartPark
      </button>
      <div className="partner-page-grid">
        <div>
          <p className="eyebrow">
            <MapPin size={14} /> Grow with SmartPark
          </p>
          <h2>
            Turn your empty spaces into <em>opportunity.</em>
          </h2>
          <p className="partner-lead">
            Have a private lot, shopfront, or spare parking area? List it on
            SmartPark and help drivers find a reliable spot while you manage
            your space in one place.
          </p>
          <button className="primary-button" onClick={onContinue}>
            {actionLabel} <ArrowRight size={17} />
          </button>
        </div>
        <div className="partner-benefits">
          <PartnerBenefit
            number="01"
            title="Get discovered"
            text="Put your location in front of drivers searching nearby."
          />
          <PartnerBenefit
            number="02"
            title="Stay in control"
            text="Update capacity, prices, and availability whenever you need."
          />
          <PartnerBenefit
            number="03"
            title="Build trust"
            text="Give drivers a clear, dependable place to park."
          />
        </div>
      </div>
    </section>
  );
}

function PartnerBenefit({ number, title, text }) {
  return (
    <div className="partner-benefit">
      <span>{number}</span>
      <div>
        <h3>{title}</h3>
        <p>{text}</p>
      </div>
    </div>
  );
}

function AccountDashboard({
  profile,
  bookings,
  adminStats,
  adminParking,
  adminBookings,
  adminNotice,
  ownerRequests,
  onAdd,
  onEdit,
  onDelete,
  onAvailability,
  onPartner,
  onDecision,
  onCancel,
  message,
  selectedBookingDetail,
  onSelectBookingDetail,
}) {
  const isAdmin = profile?.role === "ADMIN";
  const pendingRequestsCount = ownerRequests.filter(
    (item) => item.status === "PENDING",
  ).length;

  const getBookingStatusClass = (status) => {
    switch (status) {
      case "CONFIRMED":
        return "status-confirmed";
      case "CHECKED_IN":
        return "status-checkedin";
      case "COMPLETED":
        return "status-completed";
      case "CANCELLED":
        return "status-cancelled";
      case "PENDING":
        return "status-pending";
      default:
        return "status-neutral";
    }
  };

  return (
    <section className="dashboard-section" id="dashboard">
      <div className="section-heading">
        <div>
          <p className="eyebrow">{isAdmin ? "Operations" : "Your account"}</p>
          <h2>{isAdmin ? "Admin dashboard" : "My bookings"}</h2>
        </div>
        <span className="account-label">{profile?.email}</span>
      </div>
      {isAdmin && adminStats ? (
        <>
          {adminNotice && (
            <p className="dashboard-message" role="status">
              {adminNotice}
            </p>
          )}

          <div className="admin-overview-card">
            <div className="admin-overview-header">
              <div>
                <p className="eyebrow">Overview</p>
                <h3>Operations summary</h3>
              </div>
              <div className="admin-quick-actions">
                <button className="small-action" onClick={() => onAdd()}>
                  + Add parking
                </button>
                <button
                  className="small-action"
                  onClick={() =>
                    window.scrollTo({ top: 0, behavior: "smooth" })
                  }
                >
                  Pending requests ({pendingRequestsCount})
                </button>
              </div>
            </div>
          </div>

          <div className="dashboard-stats">
            <DashboardStat
              label="Parking lots"
              value={adminStats.totalParkingLots}
            />
            <DashboardStat
              label="Total bookings"
              value={adminStats.totalBookings}
            />
            <DashboardStat
              label="Active bookings"
              value={adminStats.activeBookings}
            />
            <DashboardStat
              label="Pending requests"
              value={pendingRequestsCount}
            />
          </div>

          <div className="dashboard-list">
            <div className="dashboard-list-header">
              <strong>Managed parking</strong>
              <button className="small-action" onClick={() => onAdd()}>
                + Add parking
              </button>
            </div>
            {message && <p className="dashboard-message">{message}</p>}
            {adminParking.map((lot) => (
              <AdminParkingRow
                key={lot.id}
                lot={lot}
                onEdit={onEdit}
                onDelete={onDelete}
                onAvailability={onAvailability}
              />
            ))}
          </div>

          <div className="dashboard-list">
            <div className="dashboard-list-header">
              <strong>Recent bookings</strong>
              <span>{adminBookings.length} bookings</span>
            </div>
            {adminBookings.length ? (
              adminBookings.map((booking) => (
                <div
                  className="dashboard-row customer-booking-row"
                  key={booking._id || booking.bookingId}
                >
                  <div className="customer-booking-details">
                    <strong>{booking.userId?.name || "User"}</strong>
                    <small>
                      {booking.userId?.email || "Email unavailable"}
                    </small>
                    <small>{booking.bookingId || "Reservation"}</small>
                    <span
                      className={`status-pill ${getBookingStatusClass(booking.bookingStatus)}`}
                    >
                      {booking.bookingStatus}
                    </span>
                  </div>
                  <div className="customer-booking-meta">
                    <span>
                      {booking.parkingId?.name || "Parking reservation"}
                    </span>
                    <span>
                      {booking.vehicleType} · {booking.vehicleNumber || "N/A"}
                    </span>
                    <span>
                      {formatBookingDateTime(booking.startTime)} to{" "}
                      {formatBookingDateTime(booking.endTime)}
                    </span>
                    <div className="booking-time-stack">
                      {booking.checkedInAt && (
                        <span className="time-tag">
                          Check-in: {formatBookingDateTime(booking.checkedInAt)}
                        </span>
                      )}
                      {booking.checkedOutAt && (
                        <span className="time-tag">
                          Check-out:{" "}
                          {formatBookingDateTime(booking.checkedOutAt)}
                        </span>
                      )}
                    </div>
                    <strong>₹{booking.amount}</strong>
                  </div>
                </div>
              ))
            ) : (
              <p className="dashboard-empty">No bookings yet.</p>
            )}
          </div>
        </>
      ) : (
        <>
          <div className="partner-banner">
            <div>
              <strong>Own a parking space?</strong>
              <span>List your location on SmartPark and manage bookings.</span>
            </div>
            <button className="small-action" onClick={onPartner}>
              Become a partner
            </button>
          </div>
          <div className="dashboard-list">
            <div className="dashboard-list-header">
              <strong>Recent reservations</strong>
              <span>{bookings.length} bookings</span>
            </div>
            <div className="bookings-grid">
              {bookings.length ? (
                bookings.map((booking) => (
                  <BookingCard
                    key={booking._id || booking.bookingId}
                    booking={booking}
                    onCancel={onCancel}
                    onViewDetails={onSelectBookingDetail}
                  />
                ))
              ) : (
                <p className="dashboard-empty">
                  Your confirmed bookings will appear here.
                </p>
              )}
            </div>
          </div>
        </>
      )}
      {isAdmin && (
        <div className="dashboard-list request-list">
          <div className="dashboard-list-header">
            <strong>Parking-owner requests</strong>
            <span>
              {ownerRequests.filter((item) => item.status === "PENDING").length}{" "}
              pending · {ownerRequests.length} total
            </span>
          </div>
          {ownerRequests.length ? (
            ownerRequests.map((item) => (
              <div className="dashboard-row" key={item._id}>
                <div>
                  <strong>{item.parkingName}</strong>
                  <small>
                    {item.requesterId?.name || item.requesterId?.email}
                  </small>
                </div>
                <span className="request-actions">
                  <strong
                    className={`request-status ${item.status.toLowerCase()}`}
                  >
                    {item.status}
                  </strong>
                  {item.status === "PENDING" && (
                    <>
                      <button
                        className="small-action"
                        onClick={() => onDecision(item, "APPROVED")}
                      >
                        Approve
                      </button>
                      <button
                        className="small-action danger-action"
                        onClick={() => onDecision(item, "REJECTED")}
                      >
                        Reject
                      </button>
                    </>
                  )}
                </span>
              </div>
            ))
          ) : (
            <p className="dashboard-empty">No owner requests yet.</p>
          )}
        </div>
      )}
    </section>
  );
}

function AdminParkingRow({ lot, onEdit, onDelete, onAvailability }) {
  const [bikeAvailable, setBikeAvailable] = useState(lot.bikeAvailable);
  const [carAvailable, setCarAvailable] = useState(lot.carAvailable);
  return (
    <div className="admin-parking-row">
      <div className="admin-parking-heading">
        <strong>{lot.name}</strong>
        <span>{lot.address}</span>
      </div>
      <div className="availability-controls">
        <label>
          Bike{" "}
          <input
            type="number"
            min="0"
            max={lot.bikeCapacity}
            value={bikeAvailable}
            onChange={(event) => setBikeAvailable(event.target.value)}
          />{" "}
          / {lot.bikeCapacity}
        </label>
        <label>
          Car{" "}
          <input
            type="number"
            min="0"
            max={lot.carCapacity}
            value={carAvailable}
            onChange={(event) => setCarAvailable(event.target.value)}
          />{" "}
          / {lot.carCapacity}
        </label>
        <button
          className="small-action"
          onClick={() =>
            onAvailability(lot, {
              bikeAvailable: Number(bikeAvailable),
              carAvailable: Number(carAvailable),
            })
          }
        >
          Save
        </button>
      </div>
      <div className="admin-row-actions">
        <button className="small-action" onClick={() => onEdit(lot)}>
          Edit details
        </button>
        <button
          className="small-action danger-action"
          onClick={() => onDelete(lot)}
        >
          Delete
        </button>
      </div>
    </div>
  );
}

function DashboardStat({ label, value }) {
  return (
    <div className="dashboard-stat">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function AdminParkingForm({ lot, onClose, onSave }) {
  const [form, setForm] = useState({
    name: lot?.name || "",
    address: lot?.address || "",
    latitude: lot?.latitude || "18.5204",
    longitude: lot?.longitude || "73.8567",
    bikeCapacity: lot?.bikeCapacity || 20,
    carCapacity: lot?.carCapacity || 10,
    bikePricePerHour: lot?.bikePrice || 15,
    carPricePerHour: lot?.carPrice || 50,
  });
  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);
  async function submit(event) {
    event.preventDefault();
    setSaving(true);
    setStatus("");
    try {
      await onSave(form);
      setStatus("Parking saved successfully.");
      window.setTimeout(onClose, 700);
    } catch (error) {
      setStatus(error.response?.data?.message || error.message);
    } finally {
      setSaving(false);
    }
  }
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <form
        className="admin-form"
        onClick={(event) => event.stopPropagation()}
        onSubmit={submit}
      >
        <button
          type="button"
          className="close-modal"
          onClick={onClose}
          aria-label="Close form"
        >
          <X size={20} />
        </button>
        <p className="eyebrow">Admin tools</p>
        <h2>{lot ? "Edit parking" : "Add parking"}</h2>
        <label>
          Parking name
          <input
            required
            value={form.name}
            onChange={(event) => update("name", event.target.value)}
          />
        </label>
        <label>
          Address
          <input
            required
            value={form.address}
            onChange={(event) => update("address", event.target.value)}
          />
        </label>
        <div className="form-grid">
          <label>
            Bike capacity
            <input
              required
              type="number"
              min="1"
              value={form.bikeCapacity}
              onChange={(event) => update("bikeCapacity", event.target.value)}
            />
          </label>
          <label>
            Car capacity
            <input
              required
              type="number"
              min="1"
              value={form.carCapacity}
              onChange={(event) => update("carCapacity", event.target.value)}
            />
          </label>
          <label>
            Bike price/hour
            <input
              required
              type="number"
              min="0"
              value={form.bikePricePerHour}
              onChange={(event) =>
                update("bikePricePerHour", event.target.value)
              }
            />
          </label>
          <label>
            Car price/hour
            <input
              required
              type="number"
              min="0"
              value={form.carPricePerHour}
              onChange={(event) =>
                update("carPricePerHour", event.target.value)
              }
            />
          </label>
        </div>
        {status && (
          <p
            className={
              status.includes("successfully") ? "form-success" : "form-error"
            }
          >
            {status}
          </p>
        )}
        <button
          className="primary-button full-width"
          type="submit"
          disabled={saving}
        >
          {saving ? "Saving..." : lot ? "Save changes" : "Add parking"}{" "}
          {!saving && <ArrowRight size={17} />}
        </button>
      </form>
    </div>
  );
}

function PartnerRequestForm({ onClose, onSave }) {
  const [parkingName, setParkingName] = useState("");
  const [address, setAddress] = useState("");
  const [message, setMessage] = useState("");
  const [latitude, setLatitude] = useState("18.5204");
  const [longitude, setLongitude] = useState("73.8567");
  const [bikeCapacity, setBikeCapacity] = useState(20);
  const [carCapacity, setCarCapacity] = useState(10);
  const [bikePricePerHour, setBikePricePerHour] = useState(15);
  const [carPricePerHour, setCarPricePerHour] = useState(50);
  const [status, setStatus] = useState("");
  const [submitting, setSubmitting] = useState(false);
  async function submit(event) {
    event.preventDefault();
    setSubmitting(true);
    setStatus("");
    try {
      await onSave({
        parkingName,
        address,
        message,
        latitude,
        longitude,
        bikeCapacity,
        carCapacity,
        bikePricePerHour,
        carPricePerHour,
      });
      setStatus("Request submitted successfully. An admin will review it.");
      window.setTimeout(onClose, 900);
    } catch (error) {
      setStatus(error.message);
    } finally {
      setSubmitting(false);
    }
  }
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <form
        className="admin-form"
        onClick={(event) => event.stopPropagation()}
        onSubmit={submit}
      >
        <button
          type="button"
          className="close-modal"
          onClick={onClose}
          aria-label="Close partner request"
        >
          <X size={20} />
        </button>
        <p className="eyebrow">Parking partner</p>
        <h2>List your parking</h2>
        <p className="login-copy">
          Submit your location for admin review. Approved partners can manage
          capacities and prices.
        </p>
        <label>
          Parking name
          <input
            required
            value={parkingName}
            onChange={(event) => setParkingName(event.target.value)}
            placeholder="Example: Market Street Parking"
          />
        </label>
        <label>
          Address
          <input
            required
            value={address}
            onChange={(event) => setAddress(event.target.value)}
            placeholder="Street, area, city"
          />
        </label>
        <div className="form-grid">
          <label>
            Bike capacity
            <input
              required
              type="number"
              min="1"
              value={bikeCapacity}
              onChange={(event) => setBikeCapacity(event.target.value)}
            />
          </label>
          <label>
            Car capacity
            <input
              required
              type="number"
              min="1"
              value={carCapacity}
              onChange={(event) => setCarCapacity(event.target.value)}
            />
          </label>
          <label>
            Bike price/hour
            <input
              required
              type="number"
              min="0"
              value={bikePricePerHour}
              onChange={(event) => setBikePricePerHour(event.target.value)}
            />
          </label>
          <label>
            Car price/hour
            <input
              required
              type="number"
              min="0"
              value={carPricePerHour}
              onChange={(event) => setCarPricePerHour(event.target.value)}
            />
          </label>
          <label>
            Latitude
            <input
              required
              type="number"
              step="any"
              value={latitude}
              onChange={(event) => setLatitude(event.target.value)}
            />
          </label>
          <label>
            Longitude
            <input
              required
              type="number"
              step="any"
              value={longitude}
              onChange={(event) => setLongitude(event.target.value)}
            />
          </label>
        </div>
        <label>
          Message{" "}
          <input
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Tell us about the space (optional)"
          />
        </label>
        {status && (
          <p
            className={
              status.includes("successfully") ? "form-success" : "form-error"
            }
          >
            {status}
          </p>
        )}
        <button
          className="primary-button full-width"
          type="submit"
          disabled={submitting}
        >
          {submitting ? "Submitting request..." : "Submit request"}{" "}
          {!submitting && <ArrowRight size={17} />}
        </button>
      </form>
    </div>
  );
}

function Step({ number, title, text }) {
  return (
    <div className="step">
      <span>{number}</span>
      <div>
        <h3>{title}</h3>
        <p>{text}</p>
      </div>
    </div>
  );
}

function ParkingMap({ lots, vehicle, onSelect, currentLocation }) {
  const defaultCenter = [18.5204, 73.8567];

  return (
    <div className="results-map">
      <MapContainer
        center={defaultCenter}
        zoom={13}
        scrollWheelZoom
        className="leaflet-map"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapViewport lots={lots} currentLocation={currentLocation} />
        {currentLocation && (
          <CircleMarker
            center={currentLocation}
            radius={8}
            pathOptions={{
              color: "#236b54",
              fillColor: "#4aad79",
              fillOpacity: 1,
            }}
          >
            <Popup>You are here</Popup>
          </CircleMarker>
        )}
        {lots.map((lot) => (
          <Marker key={lot.id} position={[lot.latitude, lot.longitude]}>
            <Popup>
              <strong>{lot.name}</strong>
              <br />
              {vehicle === "car" ? lot.carAvailable : lot.bikeAvailable} spaces
              available
              <br />
              <button className="popup-action" onClick={() => onSelect(lot)}>
                View and reserve
              </button>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      <div className="map-current">
        <span></span>Pune parking locations
      </div>
    </div>
  );
}

function BookingPage({ lot, authUser, onLogin, onBack }) {
  return (
    <section className="standalone-page">
      <button className="back-link" onClick={onBack}>
        <ArrowRight size={15} /> Back to parking
      </button>
      {lot ? (
        <>
          <p className="eyebrow">Booking</p>
          <h2>{lot.name}</h2>
          <p className="partner-lead">
            Select your vehicle, arrival time, and duration to continue with a
            secure reservation.
          </p>
          {authUser ? (
            <p className="form-success">
              You are signed in and ready to book this location.
            </p>
          ) : (
            <button className="primary-button" onClick={onLogin}>
              Sign in to continue <ArrowRight size={17} />
            </button>
          )}
        </>
      ) : (
        <NotFoundPage />
      )}
    </section>
  );
}

function NotFoundPage() {
  return (
    <section className="standalone-page">
      <p className="eyebrow">SmartPark</p>
      <h2>Page not found.</h2>
      <Link className="primary-button" to="/">
        Back home <ArrowRight size={17} />
      </Link>
    </section>
  );
}

function MapViewport({ lots, currentLocation }) {
  const map = useMap();

  useEffect(() => {
    const points = lots.map((lot) => [lot.latitude, lot.longitude]);
    if (currentLocation) points.push(currentLocation);
    if (points.length === 0) return;
    map.fitBounds(points, { padding: [30, 30] });
  }, [lots, currentLocation, map]);

  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <SmartParkApp />
    </BrowserRouter>
  );
}
