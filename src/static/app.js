
document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const messageDiv = document.getElementById("message");

  // Muestra el formulario de registro en cada tarjeta
  function showRegisterForm(activityName) {
    const formDiv = document.createElement("div");
    formDiv.className = "register-form";
    formDiv.innerHTML = `
      <form class="student-register-form">
        <label for="email">Correo del estudiante:</label>
        <input type="email" name="email" required placeholder="tu-email@mergington.edu" />
        <button type="submit">Registrar</button>
      </form>
    `;
    formDiv.querySelector("form").addEventListener("submit", async (event) => {
      event.preventDefault();
      const email = formDiv.querySelector("input[name='email']").value;
      try {
        const response = await fetch(
          `/activities/${encodeURIComponent(activityName)}/signup?email=${encodeURIComponent(email)}`,
          {
            method: "POST",
          }
        );
        const result = await response.json();
        if (response.ok) {
          messageDiv.textContent = result.message;
          messageDiv.className = "success";
          fetchActivities();
        } else {
          messageDiv.textContent = result.detail || "Ocurrió un error";
          messageDiv.className = "error";
        }
        messageDiv.classList.remove("hidden");
        setTimeout(() => {
          messageDiv.classList.add("hidden");
        }, 5000);
      } catch (error) {
        messageDiv.textContent = "No se pudo registrar. Intenta de nuevo.";
        messageDiv.className = "error";
        messageDiv.classList.remove("hidden");
      }
    });
    return formDiv;
  }

  // Obtiene y muestra las actividades
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();
      activitiesList.innerHTML = "";
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";
        const spotsLeft = details.max_participants - details.participants.length;
        const participantsHTML =
          details.participants.length > 0
            ? `<div class="participants-section">
                <h5>Participantes:</h5>
                <ul class="participants-list">
                  ${details.participants
                    .map(
                      (email) =>
                        `<li><span class="participant-email">${email}</span><button class="delete-btn" data-activity="${name}" data-email="${email}">❌</button></li>`
                    )
                    .join("")}
                </ul>
              </div>`
            : `<p><em>No hay participantes aún</em></p>`;

        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p>${details.description}</p>
          <p><strong>Horario:</strong> ${details.schedule}</p>
          <p><strong>Disponibilidad:</strong> ${spotsLeft} lugares libres</p>
          <div class="participants-container">
            ${participantsHTML}
          </div>
        `;

        // Botón para mostrar el formulario de registro
        const registerBtn = document.createElement("button");
        registerBtn.textContent = "Registrar estudiante";
        registerBtn.className = "register-btn";
        registerBtn.addEventListener("click", () => {
          // Elimina cualquier formulario abierto
          document.querySelectorAll(".register-form").forEach((el) => el.remove());
          activityCard.appendChild(showRegisterForm(name));
        });
        activityCard.appendChild(registerBtn);

        activitiesList.appendChild(activityCard);

        // Eventos para eliminar participantes
        activityCard.querySelectorAll(".delete-btn").forEach((button) => {
          button.addEventListener("click", handleUnregister);
        });
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>No se pudieron cargar las actividades. Intenta más tarde.</p>";
    }
  }

  // Elimina participante
  async function handleUnregister(event) {
    const button = event.target;
    const activity = button.getAttribute("data-activity");
    const email = button.getAttribute("data-email");
    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/unregister?email=${encodeURIComponent(email)}`,
        {
          method: "DELETE",
        }
      );
      const result = await response.json();
      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        fetchActivities();
      } else {
        messageDiv.textContent = result.detail || "Ocurrió un error";
        messageDiv.className = "error";
      }
      messageDiv.classList.remove("hidden");
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "No se pudo eliminar. Intenta de nuevo.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
    }
  }

  // Inicializar app
  fetchActivities();
});
