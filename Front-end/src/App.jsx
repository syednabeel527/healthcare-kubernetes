import { useEffect, useState } from "react";

const API_URL = "http://localhost:5000";

function App() {
  const [page, setPage] = useState("home");

  const [registerData, setRegisterData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  const [message, setMessage] = useState("");
  const [token, setToken] = useState(localStorage.getItem("token") || "");

  const [doctors, setDoctors] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(false);

  const [appointmentData, setAppointmentData] = useState({
    doctor: "",
    date: "",
  });

  const [appointments, setAppointments] = useState([]);
  const [loadingAppointments, setLoadingAppointments] = useState(false);

  const handleRegisterChange = (event) => {
    setRegisterData({
      ...registerData,
      [event.target.name]: event.target.value,
    });
  };

  const handleLoginChange = (event) => {
    setLoginData({
      ...loginData,
      [event.target.name]: event.target.value,
    });
  };

  const handleAppointmentChange = (event) => {
    setAppointmentData({
      ...appointmentData,
      [event.target.name]: event.target.value,
    });
  };

  const handleRegister = async (event) => {
    event.preventDefault();
    setMessage("");

    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(registerData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }

      setMessage("Registration successful. You can now log in.");

      setRegisterData({
        name: "",
        email: "",
        password: "",
      });
    } catch (error) {
      setMessage(error.message);
    }
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    setMessage("");

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      localStorage.setItem("token", data.token);
      setToken(data.token);
      setMessage("Login successful.");

      setLoginData({
        email: "",
        password: "",
      });
    } catch (error) {
      setMessage(error.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken("");
    setMessage("Logged out successfully.");
    setPage("home");
  };

  const fetchDoctors = async () => {
    setLoadingDoctors(true);
    setMessage("");

    try {
      const response = await fetch(`${API_URL}/api/doctors`);

      if (!response.ok) {
        throw new Error("Failed to fetch doctors");
      }

      const data = await response.json();
      setDoctors(data);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoadingDoctors(false);
    }
  };

  const fetchAppointments = async () => {
    if (!token) {
      setMessage("Please log in first.");
      return;
    }

    setLoadingAppointments(true);
    setMessage("");

    try {
      const response = await fetch(`${API_URL}/api/appointments`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch appointments");
      }

      setAppointments(data);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoadingAppointments(false);
    }
  };

  const handleCreateAppointment = async (event) => {
    event.preventDefault();

    if (!token) {
      setMessage("Please log in before booking an appointment.");
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
          date: new Date(appointmentData.date).toISOString(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create appointment");
      }

      setMessage("Appointment created successfully.");

      setAppointmentData({
        doctor: "",
        date: "",
      });

      fetchAppointments();
    } catch (error) {
      setMessage(error.message);
    }
  };

  useEffect(() => {
    if (page === "doctors") {
      fetchDoctors();
    }

    if (page === "appointments") {
      fetchDoctors();
      fetchAppointments();
    }
  }, [page]);

  return (
    <div>
      <header>
        <h1>MediCare Healthcare System</h1>
        <p>Auto-Scaling and Load-Balanced Healthcare Application</p>
      </header>

      <nav>
        <button onClick={() => setPage("home")}>Home</button>

        <button onClick={() => setPage("doctors")}>Doctors</button>

        {token && (
          <button onClick={() => setPage("appointments")}>
            Appointments
          </button>
        )}

        <button onClick={() => setPage("register")}>Register</button>

        <button onClick={() => setPage("login")}>Login</button>

        {token && <button onClick={handleLogout}>Logout</button>}
      </nav>

      {message && <p>{message}</p>}

      <main>
        {page === "home" && (
          <section>
            <h2>Welcome to MediCare</h2>

            <p>
              Healthcare management application built using the MERN stack.
            </p>

            {token ? (
              <p>You are logged in.</p>
            ) : (
              <p>Please register or log in to continue.</p>
            )}
          </section>
        )}

        {page === "register" && (
          <section>
            <h2>Patient Registration</h2>

            <form onSubmit={handleRegister}>
              <div>
                <label>Name: </label>
                <input
                  type="text"
                  name="name"
                  value={registerData.name}
                  onChange={handleRegisterChange}
                  required
                />
              </div>

              <br />

              <div>
                <label>Email: </label>
                <input
                  type="email"
                  name="email"
                  value={registerData.email}
                  onChange={handleRegisterChange}
                  required
                />
              </div>

              <br />

              <div>
                <label>Password: </label>
                <input
                  type="password"
                  name="password"
                  value={registerData.password}
                  onChange={handleRegisterChange}
                  required
                />
              </div>

              <br />

              <button type="submit">Register</button>
            </form>
          </section>
        )}

        {page === "login" && (
          <section>
            <h2>Login</h2>

            <form onSubmit={handleLogin}>
              <div>
                <label>Email: </label>
                <input
                  type="email"
                  name="email"
                  value={loginData.email}
                  onChange={handleLoginChange}
                  required
                />
              </div>

              <br />

              <div>
                <label>Password: </label>
                <input
                  type="password"
                  name="password"
                  value={loginData.password}
                  onChange={handleLoginChange}
                  required
                />
              </div>

              <br />

              <button type="submit">Login</button>
            </form>
          </section>
        )}

        {page === "doctors" && (
          <section>
            <h2>Doctors</h2>

            {loadingDoctors && <p>Loading doctors...</p>}

            {!loadingDoctors && doctors.length === 0 && (
              <p>No doctors found.</p>
            )}

            {doctors.map((doctor) => (
              <div key={doctor._id}>
                <h3>{doctor.name}</h3>
                <p>Email: {doctor.email}</p>
                <p>Role: {doctor.role}</p>
                <hr />
              </div>
            ))}
          </section>
        )}

        {page === "appointments" && (
          <section>
            <h2>Book an Appointment</h2>

            <form onSubmit={handleCreateAppointment}>
              <div>
                <label>Select Doctor: </label>

                <select
                  name="doctor"
                  value={appointmentData.doctor}
                  onChange={handleAppointmentChange}
                  required
                >
                  <option value="">Choose a doctor</option>

                  {doctors.map((doctor) => (
                    <option key={doctor._id} value={doctor._id}>
                      {doctor.name}
                    </option>
                  ))}
                </select>
              </div>

              <br />

              <div>
                <label>Appointment Date: </label>

                <input
                  type="datetime-local"
                  name="date"
                  value={appointmentData.date}
                  onChange={handleAppointmentChange}
                  required
                />
              </div>

              <br />

              <button type="submit">Book Appointment</button>
            </form>

            <hr />

            <h2>My Appointments</h2>

            {loadingAppointments && <p>Loading appointments...</p>}

            {!loadingAppointments && appointments.length === 0 && (
              <p>No appointments found.</p>
            )}

            {appointments.map((appointment) => (
              <div key={appointment._id}>
                <p>
                  <strong>Doctor:</strong>{" "}
                  {appointment.doctor?.name || "Unknown"}
                </p>

                <p>
                  <strong>Date:</strong>{" "}
                  {new Date(appointment.date).toLocaleString()}
                </p>

                <p>
                  <strong>Status:</strong> {appointment.status}
                </p>

                <hr />
              </div>
            ))}
          </section>
        )}
      </main>
    </div>
  );
}

export default App;