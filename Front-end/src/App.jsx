import { useCallback, useEffect, useState } from "react";
import "./App.css";

const API_URL = "";
const MIN_APPOINTMENT_DATE = new Date(Date.now() + 60000)
  .toISOString()
  .slice(0, 16);

const EMPTY_REGISTER_DATA = {
  name: "",
  email: "",
  phone: "",
  gender: "",
  password: "",
  role: "patient",
  specialization: "",
};

function getSavedUser() {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
}

function App() {
  const [page, setPage] = useState("home");

  const [registerData, setRegisterData] = useState({
    ...EMPTY_REGISTER_DATA,
  });

  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  const [message, setMessage] = useState("");
  const [token, setToken] = useState(
    () => localStorage.getItem("token") || ""
  );
  const [user, setUser] = useState(getSavedUser);

  const [doctors, setDoctors] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(false);

  const [appointmentData, setAppointmentData] = useState({
    doctor: "",
    date: "",
  });

  const [appointments, setAppointments] = useState([]);
  const [loadingAppointments, setLoadingAppointments] = useState(false);

  // Registration form
  const handleRegisterChange = (event) => {
    const { name, value } = event.target;

    setRegisterData((previous) => ({
      ...previous,
      [name]: value,
      ...(name === "role" && value === "patient"
        ? { specialization: "" }
        : {}),
    }));
  };

  // Login form
  const handleLoginChange = (event) => {
    const { name, value } = event.target;

    setLoginData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // Appointment booking form
  const handleAppointmentChange = (event) => {
    const { name, value } = event.target;

    setAppointmentData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // Register a patient or doctor
  const handleRegister = async (event) => {
    event.preventDefault();
    setMessage("");

    try {
      const payload = {
        ...registerData,
        name: registerData.name.trim(),
        email: registerData.email.trim().toLowerCase(),
        phone: registerData.phone.trim(),
      };

      if (!/^[0-9]{10}$/.test(payload.phone)) {
        throw new Error("Enter a valid 10-digit phone number.");
      }

      if (payload.password.length < 6) {
        throw new Error("Password must contain at least 6 characters.");
      }

      if (
        payload.role === "doctor" &&
        !payload.specialization.trim()
      ) {
        throw new Error("Please select a specialization.");
      }

      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed.");
      }

      setMessage("Registration successful. You can now log in.");
      setRegisterData({ ...EMPTY_REGISTER_DATA });
      setPage("login");
    } catch (error) {
      setMessage(error.message || "Registration failed.");
    }
  };

  // Login and save the user's role
  const handleLogin = async (event) => {
    event.preventDefault();
    setMessage("");

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: loginData.email.trim().toLowerCase(),
          password: loginData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed.");
      }

      if (!data.user || !data.user.role) {
        throw new Error(
          "Login response is missing user details. Check your backend login controller."
        );
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      setToken(data.token);
      setUser(data.user);
      setLoginData({ email: "", password: "" });
      setMessage(`Login successful. Welcome, ${data.user.name}!`);
      setPage("home");
    } catch (error) {
      setMessage(error.message || "Login failed.");
    }
  };

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setToken("");
    setUser(null);
    setAppointments([]);
    setAppointmentData({ doctor: "", date: "" });
    setMessage("Logged out successfully.");
    setPage("home");
  };

  // Load available doctors
  const fetchDoctors = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/api/doctors`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch doctors.");
      }

      setDoctors(Array.isArray(data) ? data : []);
    } catch (error) {
      setMessage(error.message || "Failed to fetch doctors.");
    } finally {
      setLoadingDoctors(false);
    }
  }, []);

  // Backend filters appointments according to the logged-in user's role
  const fetchAppointments = useCallback(async () => {
    if (!token) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/appointments`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch appointments.");
      }

      setAppointments(Array.isArray(data) ? data : []);
    } catch (error) {
      setMessage(error.message || "Failed to fetch appointments.");
    } finally {
      setLoadingAppointments(false);
    }
  }, [token]);

  // Patients book appointments with a selected doctor
  const handleCreateAppointment = async (event) => {
    event.preventDefault();

    if (!token || user?.role !== "patient") {
      setMessage("Please log in as a patient to book an appointment.");
      return;
    }

    if (!appointmentData.doctor) {
      setMessage("Please select a doctor.");
      return;
    }

    if (!appointmentData.date) {
      setMessage("Please select an appointment date.");
      return;
    }

    const selectedDate = new Date(appointmentData.date);

    if (
      Number.isNaN(selectedDate.getTime()) ||
      selectedDate <= new Date()
    ) {
      setMessage("Please select a valid future appointment date.");
      return;
    }

    setMessage("");

    try {
      const response = await fetch(`${API_URL}/api/appointments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          doctor: appointmentData.doctor,
          date: selectedDate.toISOString(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create appointment.");
      }

      setMessage("Appointment booked successfully!");
      setAppointmentData({ doctor: "", date: "" });

      await fetchAppointments();
    } catch (error) {
      setMessage(error.message || "Failed to create appointment.");
    }
  };

  // Doctors can update the status of their own appointments
  const handleAppointmentStatus = async (appointmentId, status) => {
    setMessage("");

    try {
      const response = await fetch(
        `${API_URL}/api/appointments/${appointmentId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Could not update appointment status."
        );
      }

      setMessage("Appointment status updated successfully.");
      await fetchAppointments();
    } catch (error) {
      setMessage(
        error.message || "Could not update appointment status."
      );
    }
  };

  // Load data when opening the relevant page.
  // Defer the requests to a microtask so the effect does not trigger
  // state updates synchronously during the effect itself.
  useEffect(() => {
    let cancelled = false;

    Promise.resolve().then(() => {
      if (cancelled) return;

      if (page === "doctors" || page === "appointments") {
        void fetchDoctors();
      }

      if (page === "appointments" && token) {
        void fetchAppointments();
      }
    });

    return () => {
      cancelled = true;
    };
  }, [page, token, fetchDoctors, fetchAppointments]);

  return (
    <div className="app">
      <header>
        <h1>MediCare Healthcare System</h1>
        <p>
          Auto-Scaling and Load-Balanced Healthcare Application
        </p>
        {user && (
          <p>
            Logged in as: <strong>{user.name}</strong> (
            {user.role})
          </p>
        )}
      </header>

      <nav>
        <button onClick={() => setPage("home")}>Home</button>

        {(!user || user.role === "patient") && (
          <button onClick={() => setPage("doctors")}>
            Doctors
          </button>
        )}

        {user?.role === "patient" && (
          <button onClick={() => setPage("appointments")}>
            Book / My Appointments
          </button>
        )}

        {user?.role === "doctor" && (
          <button onClick={() => setPage("appointments")}>
            My Patient Appointments
          </button>
        )}

        {!token && (
          <>
            <button onClick={() => setPage("register")}>
              Register
            </button>
            <button onClick={() => setPage("login")}>
              Login
            </button>
          </>
        )}

        {token && (
          <button onClick={handleLogout}>Logout</button>
        )}
      </nav>

      {message && (
        <p className="message" role="status">
          {message}
        </p>
      )}

      <main>
        {/* Home */}
        {page === "home" && (
          <section>
            <h2>Welcome to MediCare</h2>
            <p>
              A healthcare management application built using the
              MERN stack.
            </p>

            {user ? (
              <>
                <p>
                  Hello, {user.name}. Your account role is{" "}
                  <strong>{user.role}</strong>.
                </p>

                {user.role === "patient" && (
                  <button onClick={() => setPage("doctors")}>
                    Explore Doctors
                  </button>
                )}

                {user.role === "doctor" && (
                  <button onClick={() => setPage("appointments")}>
                    View Patient Appointments
                  </button>
                )}
              </>
            ) : (
              <>
                <p>Please register or log in to continue.</p>
                <button onClick={() => setPage("register")}>
                  Create Account
                </button>
              </>
            )}
          </section>
        )}

        {/* Registration */}
        {page === "register" && (
          <section>
            <h2>Create Your MediCare Account</h2>

            <form onSubmit={handleRegister}>
              <div>
                <label htmlFor="register-role">Register as:</label>
                <select
                  id="register-role"
                  name="role"
                  value={registerData.role}
                  onChange={handleRegisterChange}
                  required
                >
                  <option value="patient">Patient</option>
                  <option value="doctor">Doctor</option>
                </select>
              </div>

              <div>
                <label htmlFor="register-name">Full Name:</label>
                <input
                  id="register-name"
                  type="text"
                  name="name"
                  value={registerData.name}
                  onChange={handleRegisterChange}
                  autoComplete="name"
                  required
                />
              </div>

              <div>
                <label htmlFor="register-email">Email:</label>
                <input
                  id="register-email"
                  type="email"
                  name="email"
                  value={registerData.email}
                  onChange={handleRegisterChange}
                  autoComplete="email"
                  required
                />
              </div>

              <div>
                <label htmlFor="register-phone">Phone Number:</label>
                <input
                  id="register-phone"
                  type="tel"
                  name="phone"
                  value={registerData.phone}
                  onChange={handleRegisterChange}
                  pattern="[0-9]{10}"
                  maxLength={10}
                  minLength={10}
                  placeholder="10-digit phone number"
                  autoComplete="tel-national"
                  required
                />
              </div>

              <div>
                <label htmlFor="register-gender">Gender:</label>
                <select
                  id="register-gender"
                  name="gender"
                  value={registerData.gender}
                  onChange={handleRegisterChange}
                  required
                >
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>

              {registerData.role === "doctor" && (
                <div>
                  <label htmlFor="register-specialization">
                    Specialization:
                  </label>
                  <select
                    id="register-specialization"
                    name="specialization"
                    value={registerData.specialization}
                    onChange={handleRegisterChange}
                    required
                  >
                    <option value="">Select specialization</option>
                    <option value="Cardiology">Cardiology</option>
                    <option value="Dermatology">Dermatology</option>
                    <option value="General Medicine">
                      General Medicine
                    </option>
                    <option value="Neurology">Neurology</option>
                    <option value="Pediatrics">Pediatrics</option>
                    <option value="Orthopedics">Orthopedics</option>
                  </select>
                </div>
              )}

              <div>
                <label htmlFor="register-password">Password:</label>
                <input
                  id="register-password"
                  type="password"
                  name="password"
                  value={registerData.password}
                  onChange={handleRegisterChange}
                  minLength={6}
                  autoComplete="new-password"
                  required
                />
              </div>

              <button type="submit">Register</button>
            </form>
          </section>
        )}

        {/* Login */}
        {page === "login" && (
          <section>
            <h2>Login</h2>

            <form onSubmit={handleLogin}>
              <div>
                <label htmlFor="login-email">Email:</label>
                <input
                  id="login-email"
                  type="email"
                  name="email"
                  value={loginData.email}
                  onChange={handleLoginChange}
                  autoComplete="email"
                  required
                />
              </div>

              <div>
                <label htmlFor="login-password">Password:</label>
                <input
                  id="login-password"
                  type="password"
                  name="password"
                  value={loginData.password}
                  onChange={handleLoginChange}
                  autoComplete="current-password"
                  required
                />
              </div>

              <button type="submit">Login</button>
            </form>
          </section>
        )}

        {/* Doctor directory: patient view */}
        {page === "doctors" && (
          <section>
            <h2>Our Doctors</h2>

            {loadingDoctors && <p>Loading doctors...</p>}

            {!loadingDoctors && doctors.length === 0 && (
              <p>No doctors found.</p>
            )}

            <div className="doctor-list">
              {doctors.map((doctor) => (
                <article className="doctor-card" key={doctor._id}>
                  <h3>{doctor.name}</h3>
                  <p>
                    <strong>Email:</strong> {doctor.email}
                  </p>

                  {doctor.phone && (
                    <p>
                      <strong>Phone:</strong> {doctor.phone}
                    </p>
                  )}

                  {doctor.specialization && (
                    <p>
                      <strong>Specialization:</strong>{" "}
                      {doctor.specialization}
                    </p>
                  )}

                  {user?.role === "patient" && (
                    <button
                      onClick={() => {
                        setAppointmentData((previous) => ({
                          ...previous,
                          doctor: doctor._id,
                        }));
                        setPage("appointments");
                      }}
                    >
                      Book with this doctor
                    </button>
                  )}
                </article>
              ))}
            </div>
          </section>
        )}

        {/* Patient and doctor appointment views */}
        {page === "appointments" && (
          <section>
            {!token ? (
              <>
                <h2>Login Required</h2>
                <p>Please log in to view appointments.</p>
                <button onClick={() => setPage("login")}>
                  Go to Login
                </button>
              </>
            ) : user?.role === "patient" ? (
              <>
                <h2>Book an Appointment</h2>

                <form onSubmit={handleCreateAppointment}>
                  <div>
                    <label htmlFor="appointment-doctor">
                      Select Doctor:
                    </label>
                    <select
                      id="appointment-doctor"
                      name="doctor"
                      value={appointmentData.doctor}
                      onChange={handleAppointmentChange}
                      required
                    >
                      <option value="">Choose a doctor</option>
                      {doctors.map((doctor) => (
                        <option
                          key={doctor._id}
                          value={doctor._id}
                        >
                          {doctor.name}
                          {doctor.specialization
                            ? ` — ${doctor.specialization}`
                            : ""}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="appointment-date">
                      Appointment Date:
                    </label>
                    <input
                      id="appointment-date"
                      type="datetime-local"
                      name="date"
                      value={appointmentData.date}
                      onChange={handleAppointmentChange}
                      min={MIN_APPOINTMENT_DATE}
                      required
                    />
                  </div>

                  <button type="submit">
                    Book Appointment
                  </button>
                </form>

                <hr />

                <h2>My Appointments</h2>

                {loadingAppointments && (
                  <p>Loading your appointments...</p>
                )}

                {!loadingAppointments &&
                  appointments.length === 0 && (
                    <p>You have no appointments yet.</p>
                  )}

                {appointments.map((appointment) => (
                  <article key={appointment._id}>
                    <h3>
                      Dr. {appointment.doctor?.name || "Unknown"}
                    </h3>

                    {appointment.doctor?.specialization && (
                      <p>
                        <strong>Specialization:</strong>{" "}
                        {appointment.doctor.specialization}
                      </p>
                    )}

                    <p>
                      <strong>Appointment Date:</strong>{" "}
                      {new Date(appointment.date).toLocaleString()}
                    </p>

                    <p>
                      <strong>Status:</strong> {appointment.status}
                    </p>

                    <hr />
                  </article>
                ))}
              </>
            ) : user?.role === "doctor" ? (
              <>
                <h2>My Patient Appointments</h2>
                <p>
                  Patients who have booked appointments with you
                  appear here.
                </p>

                {loadingAppointments && (
                  <p>Loading patient appointments...</p>
                )}

                {!loadingAppointments &&
                  appointments.length === 0 && (
                    <p>
                      No patients have booked appointments with you
                      yet.
                    </p>
                  )}

                {appointments.map((appointment) => (
                  <article
                    className="doctor-card"
                    key={appointment._id}
                  >
                    <h3>
                      Patient:{" "}
                      {appointment.patient?.name || "Unknown"}
                    </h3>

                    <p>
                      <strong>Email:</strong>{" "}
                      {appointment.patient?.email || "Not available"}
                    </p>

                    {appointment.patient?.phone && (
                      <p>
                        <strong>Phone:</strong>{" "}
                        {appointment.patient.phone}
                      </p>
                    )}

                    {appointment.patient?.gender && (
                      <p>
                        <strong>Gender:</strong>{" "}
                        {appointment.patient.gender}
                      </p>
                    )}

                    <p>
                      <strong>Appointment Date:</strong>{" "}
                      {new Date(appointment.date).toLocaleString()}
                    </p>

                    <p>
                      <strong>Status:</strong> {appointment.status}
                    </p>

                    {appointment.status === "Scheduled" && (
                      <div>
                        <button
                          onClick={() =>
                            handleAppointmentStatus(
                              appointment._id,
                              "Completed"
                            )
                          }
                        >
                          Mark Completed
                        </button>

                        <button
                          onClick={() =>
                            handleAppointmentStatus(
                              appointment._id,
                              "Cancelled"
                            )
                          }
                        >
                          Cancel Appointment
                        </button>
                      </div>
                    )}

                    <hr />
                  </article>
                ))}
              </>
            ) : (
              <>
                <h2>Unsupported Account Role</h2>
                <p>
                  This page is available to patient and doctor
                  accounts.
                </p>
              </>
            )}
          </section>
        )}
      </main>
    </div>
  );
}

export default App;
