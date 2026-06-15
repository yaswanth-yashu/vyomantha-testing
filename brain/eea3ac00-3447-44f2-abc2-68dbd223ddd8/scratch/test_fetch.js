async function run() {
  try {
    const res = await fetch("http://localhost:8080/api/resource/LMS Course/a-guide-to-frappe-learning");
    const data = await res.json();
    console.log("STATUS:", res.status);
    console.log("DATA:", JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("ERROR:", err);
  }
}

run();
