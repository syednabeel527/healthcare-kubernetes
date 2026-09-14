import { useEffect, useState } from "react";

function App() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


useEffect(() => {
  fetch("http://127.0.0.1:5000/api/doctors")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to fetch doctors");
      }

      return response.json();
    })
    .then((data) => {
      setDoctors(data);
      setLoading(false);
    })
    .catch((error) => {
      console.error(error);
      setError("Unable to connect to healthcare backend");
      setLoading(false);
    });
}, []);

  return (
    <div>
      <header>
        <h1>MediCare Healthcare System</h1>
        <p>Auto-Scaling and Load-Balanced Healthcare Application</p>
      </header>

      <nav>
        <button>Home</button>
        <button>Doctors</button>
        <button>Patients</button>
        <button>Appointments</button>
      </nav>

      <main>
        <section>
          <h2>Doctors</h2>

          {loading && <p>Loading doctors...</p>}

          {error && <p>{error}</p>}

          {!loading && !error && doctors.length === 0 && (
            <p>No doctors found.</p>
          )}

          {!loading &&
            !error &&
            doctors.map((doctor) => (
              <div key={doctor._id}>
                <h3>{doctor.name}</h3>
                <p>Email: {doctor.email}</p>
                <p>Role: {doctor.role}</p>
              </div>
            ))}
        </section>

        <section>
          <h2>Patients</h2>
          <p>Patient management will be connected next.</p>
        </section>

        <section>
          <h2>Appointments</h2>
          <p>Appointment management will be connected next.</p>
        </section>
      </main>
    </div>
  );
}

export default App;